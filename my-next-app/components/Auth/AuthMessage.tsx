interface AuthMessageProps {
  message: string
}

export default function AuthMessage({ message }: AuthMessageProps) {
  const color =
    message.startsWith('✅')
      ? 'bg-green-50 text-green-700 border border-green-300'
      : message.startsWith('❌')
      ? 'bg-red-50 text-red-700 border border-red-300'
      : 'bg-yellow-50 text-yellow-700 border border-yellow-300'

  return <div className={`p-3 rounded mb-4 text-sm text-center ${color}`}>{message}</div>
}
