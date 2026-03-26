import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosState = vi.hoisted(() => {
  const requestUse = vi.fn();
  const responseUse = vi.fn();
  const post = vi.fn();
  const create = vi.fn();
  const axiosInstance = vi.fn();

  Object.assign(axiosInstance, {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  });

  create.mockImplementation(() => axiosInstance);

  return {
    requestUse,
    responseUse,
    post,
    create,
    axiosInstance,
  };
});

vi.mock('axios', () => {
  return {
    default: {
      create: axiosState.create,
      post: axiosState.post,
      isAxiosError: vi.fn((value: unknown) =>
        Boolean(
          value &&
            typeof value === 'object' &&
            (value as { isAxiosError?: boolean }).isAxiosError
        )
      ),
    },
  };
});

const make401Error = (opts?: { url?: string; retried?: boolean }) =>
  ({
    config: {
      url: opts?.url ?? '/users',
      method: 'get',
      headers: {},
      _retry: opts?.retried ?? false,
    },
    response: {
      status: 401,
      data: { message: 'Unauthorized' },
    },
  }) as unknown;

const getResponseErrorInterceptor = async () => {
  await import('@/services/api');
  return axiosState.responseUse.mock.calls[0][1] as (
    error: unknown
  ) => Promise<unknown>;
};

describe('api request interceptor', () => {
  beforeEach(() => {
    vi.resetModules();
    axiosState.requestUse.mockClear();
    axiosState.responseUse.mockClear();
    axiosState.create.mockClear();
    axiosState.post.mockReset();
    axiosState.axiosInstance.mockReset();
    localStorage.clear();
  });

  it('attaches bearer token and CSRF header', async () => {
    document.cookie = 'csrf-token=test-csrf-token';

    const { setApiAccessToken } = await import('@/services/api');
    const interceptor = axiosState.requestUse.mock.calls[0][0] as (config: {
      headers?: Record<string, string>;
    }) => { headers: Record<string, string> };

    setApiAccessToken('access-token-123');
    const config = interceptor({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer access-token-123');
    expect(config.headers['X-CSRF-Token']).toBe('test-csrf-token');
  });

  it('does not attach authorization header when token is missing', async () => {
    const { setApiAccessToken } = await import('@/services/api');
    const interceptor = axiosState.requestUse.mock.calls[0][0] as (config: {
      headers?: Record<string, string>;
    }) => { headers: Record<string, string> };

    setApiAccessToken(null);
    const config = interceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('refreshes once and retries the original request on 401', async () => {
    const { getApiAccessToken } = await import('@/services/api');
    const onRejected = await getResponseErrorInterceptor();

    axiosState.post.mockResolvedValue({
      data: { accessToken: 'new-access-token' },
    });
    axiosState.axiosInstance.mockResolvedValue({ data: { ok: true } });

    const result = await onRejected(make401Error());

    expect(axiosState.post).toHaveBeenCalledTimes(1);
    expect(axiosState.post).toHaveBeenCalledWith(
      '/auth/refresh',
      {},
      expect.objectContaining({ withCredentials: true })
    );
    expect(axiosState.axiosInstance).toHaveBeenCalledTimes(1);
    expect(getApiAccessToken()).toBe('new-access-token');
    expect(result).toEqual({ data: { ok: true } });
  });

  it('queues concurrent 401 requests during a single refresh call', async () => {
    const onRejected = await getResponseErrorInterceptor();

    let resolveRefresh: (value: {
      data: { accessToken: string };
    }) => void = () => {};
    axiosState.post.mockImplementation(
      () =>
        new Promise<{ data: { accessToken: string } }>((resolve) => {
          resolveRefresh = resolve;
        })
    );
    axiosState.axiosInstance
      .mockResolvedValueOnce({ data: { request: 1 } })
      .mockResolvedValueOnce({ data: { request: 2 } });

    const first = onRejected(make401Error({ url: '/users' }));
    const second = onRejected(make401Error({ url: '/profile/123' }));

    expect(axiosState.post).toHaveBeenCalledTimes(1);

    resolveRefresh({ data: { accessToken: 'queued-access-token' } });

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(axiosState.post).toHaveBeenCalledTimes(1);
    expect(axiosState.axiosInstance).toHaveBeenCalledTimes(2);
    expect(firstResult).toEqual({ data: { request: 1 } });
    expect(secondResult).toEqual({ data: { request: 2 } });
  });

  it('invokes unauthorized handler when refresh fails', async () => {
    const { setUnauthorizedHandler } = await import('@/services/api');
    const onRejected = await getResponseErrorInterceptor();

    const unauthorizedSpy = vi.fn();
    setUnauthorizedHandler(unauthorizedSpy);
    localStorage.setItem('user', JSON.stringify({ id: 'u1' }));

    axiosState.post.mockRejectedValue(new Error('refresh failed'));

    await expect(onRejected(make401Error())).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(unauthorizedSpy).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('user')).toBeNull();
  });
});
