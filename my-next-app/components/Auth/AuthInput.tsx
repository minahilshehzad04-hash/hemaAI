interface AuthInputProps {
  value: string
  name: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  type?: string
  placeholder?: string
}

export default function AuthInput({ value, name, onChange, disabled, type = 'text', placeholder }: AuthInputProps) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}   // ✅ must pass onChange
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${disabled ? 'bg-gray-100' : 'bg-white'}`}
    />
  )
}
