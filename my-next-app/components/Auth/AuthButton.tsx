interface AuthButtonProps {
  text: string
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function AuthButton({ text, loading, onClick, type = 'button', disabled }: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full bg-[#1976D2] text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition flex items-center justify-center"
    >
      {loading ? (
        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        text
      )}
    </button>
  )
}
