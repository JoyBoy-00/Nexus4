import { FC } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 40,
}) => {
  return (
    <div className="flex justify-center items-center h-screen flex-col gap-2">
      {/* Native SVG spinner (replaces MUI CircularProgress) */}
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          color: 'currentColor',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.25"
        />
        <path
          d="M22 12a10 10 0 01-15.657 8.657"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
      {/* Native text (replaces MUI Typography) */}
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
