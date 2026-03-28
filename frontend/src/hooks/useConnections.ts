// hooks/useConnections.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import type {
  Connection,
  PendingRequest,
  ConnectionSuggestion,
  ConnectionStats,
} from '../types/connections';

const useConnections = () => {
  // State declarations
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
  const [pendingSent, setPendingSent] = useState<PendingRequest[]>([]);
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 useConnections: State updated:', {
      connectionsCount: connections.length,
      pendingReceivedCount: pendingReceived.length,
      pendingSentCount: pendingSent.length,
      suggestionsCount: suggestions.length,
      loading,
      error,
    });
  }, [connections, pendingReceived, pendingSent, suggestions, loading, error]);

  // Main fetch function
  const fetchAll = useCallback(
    async (filters: {
      page: number;
      limit: number;
      role?: 'STUDENT' | 'ALUM' | 'ADMIN';
      search?: string;
    }) => {
      try {
        console.log(
          '🔄 useConnections: fetchAll called with filters:',
          filters
        );
        setLoading(true);
        setError(null);

        const [
          connectionsRes,
          pendingReceivedRes,
          pendingSentRes,
          suggestionsRes,
          statsRes,
        ] = await Promise.all([
          apiService.connections.getAll(filters),
          apiService.connections.getPendingReceived({ page: 1, limit: 10 }),
          apiService.connections.getPendingSent({ page: 1, limit: 10 }),
          apiService.connections.getSuggestions({ limit: filters.limit }),
          apiService.connections.getStats(),
        ]);

        console.log('📊 useConnections: API responses received:', {
          connections: connectionsRes.data?.connections?.length || 0,
          pendingReceived: pendingReceivedRes.data?.requests?.length || 0,
          pendingSent: pendingSentRes.data?.requests?.length || 0,
          suggestions: suggestionsRes.data?.suggestions?.length || 0,
          stats: statsRes.data ? 'Stats loaded' : 'No stats',
        });

        // Transform responses to match expected frontend structure
        setConnections(connectionsRes.data?.connections || []);
        setPendingReceived(pendingReceivedRes.data?.requests || []);
        setPendingSent(pendingSentRes.data?.requests || []);
        setSuggestions(suggestionsRes.data?.suggestions || []);
        setStats(statsRes.data || null);

        console.log('✅ useConnections: State updated successfully');
      } catch (err) {
        console.error('❌ useConnections: Error in fetchAll:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load connections'
        );
      } finally {
        setLoading(false);
        console.log('🏁 useConnections: fetchAll completed');
      }
    },
    []
  );

  // Individual action functions
  const sendRequest = async (userId: string) => {
    try {
      console.log('🔗 useConnections: sendRequest called for userId:', userId);
      const suggestedUser = suggestions.find((s) => s.user.id === userId)?.user;
      const response = await apiService.connections.send(userId);

      const responseConnection = response.data?.connection as
        | { id?: string; recipient?: PendingRequest['recipient'] }
        | undefined;
      const createdId =
        responseConnection?.id ||
        response.data?.connectionId ||
        `pending-${userId}-${Date.now()}`;
      const createdAtIso = new Date().toISOString();

      setSuggestions((prev) => prev.filter((s) => s.user.id !== userId));

      // Immediately move the user to Pending Sent for responsive UX on connect.
      if (suggestedUser) {
        setPendingSent((prev) => {
          const alreadyPresent = prev.some(
            (request) => request.recipient?.id === userId
          );

          if (alreadyPresent) {
            return prev;
          }

          return [
            {
              id: createdId,
              createdAt: createdAtIso,
              sentAt: createdAtIso,
              recipient: responseConnection?.recipient || suggestedUser,
            },
            ...prev,
          ];
        });
      }

      console.log('✅ useConnections: Connection request sent successfully');
      return true;
    } catch (err: unknown) {
      console.error('❌ useConnections: Error sending request:', err);
      // Extract error message from axios error response
      let errorMessage = 'Failed to send connection request';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw with proper message
    }
  };

  const respondToRequest = async (
    connectionId: string,
    status: 'ACCEPTED' | 'REJECTED' | 'BLOCKED'
  ) => {
    try {
      console.log(
        '🔄 useConnections: respondToRequest called for connectionId:',
        connectionId,
        'status:',
        status
      );
      await apiService.connections.updateStatus(connectionId, status);
      setPendingReceived((prev) => prev.filter((c) => c.id !== connectionId));
      if (status === 'ACCEPTED') {
        await fetchAll({ page: 1, limit: 20 }); // Refresh connections
      }
      console.log(
        '✅ useConnections: Response to request completed successfully'
      );
      return true;
    } catch (err) {
      console.error('❌ useConnections: Error responding to request:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to respond to request'
      );
      return false;
    }
  };

  return {
    // State
    connections,
    pendingReceived,
    pendingSent,
    suggestions,
    stats,
    loading,
    error,

    // State setters
    setConnections,
    setPendingReceived,
    setPendingSent,
    setSuggestions,
    setError,

    // Actions
    fetchAll,
    sendRequest,
    respondToRequest,

    // Basic actions
    cancelConnection: async (connectionId: string) => {
      try {
        console.log(
          '❌ useConnections: cancelConnection called for connectionId:',
          connectionId
        );
        await apiService.connections.cancel(connectionId);
        setPendingSent((prev) => prev.filter((c) => c.id !== connectionId));
        console.log('✅ useConnections: Connection cancelled successfully');
        return true;
      } catch (err) {
        console.error('❌ useConnections: Error cancelling connection:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to cancel connection'
        );
        return false;
      }
    },

    removeConnection: async (connectionId: string) => {
      try {
        console.log(
          '🗑️ useConnections: removeConnection called for connectionId:',
          connectionId
        );
        await apiService.connections.remove(connectionId);
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        console.log('✅ useConnections: Connection removed successfully');
        return true;
      } catch (err) {
        console.error('❌ useConnections: Error removing connection:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to remove connection'
        );
        return false;
      }
    },
  };
};

export default useConnections;
