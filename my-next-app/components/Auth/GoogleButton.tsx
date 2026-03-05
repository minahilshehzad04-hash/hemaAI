interface GoogleButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export default function GoogleButton({ onClick, disabled, loading }: GoogleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg 
        hover:bg-gray-50 disabled:opacity-50 transition ${loading ? 'cursor-wait' : ''}`}
    >
      {loading ? (
        // Simple loading spinner
        <svg
          className="animate-spin h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
          ></path>
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5.3c1.6 0 3 .6 4.1 1.6l3-3C17.2 1.4 14.8.3 12 .3 7.6.3 3.9 2.9 2 6.4l3.5 2.7C6.6 6.5 9 5.3 12 5.3z"
          />
          <path
            fill="#34A853"
            d="M23.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6.6c-.3 1.6-1.3 3-2.7 3.9l4.2 3.2c2.4-2.2 3.8-5.4 3.8-9.1z"
          />
          <path
            fill="#4A90E2"
            d="M6.5 14.9c-.5-1.5-.5-3.1 0-4.6L2.9 7.6C1.3 10.4 1.3 13.6 2.9 16.4l3.6-1.5z"
          />
          <path
            fill="#FBBC05"
            d="M12 23.7c2.8 0 5.2-.9 7-2.5l-4.2-3.2c-1 .7-2.3 1.1-3.8 1.1-3 0-5.4-2.2-6.3-5.1L2 16.4C3.9 20 7.6 22.7 12 22.7z"
          />
        </svg>
      )}
      <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
    </button>
  )
}
