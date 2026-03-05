export default function AuthContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-[#1976D2] text-3xl font-bold text-center mb-6">{title}</h2>
        {children}
      </div>
    </div>
  )
}
