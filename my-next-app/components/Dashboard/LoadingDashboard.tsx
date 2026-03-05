'use client'

interface LoadingProps {
  title?: string
  subtitle?: string
  userType?: 'patient' | 'doctor'
}

export function DashboardLoading({ 
  title, 
  subtitle, 
  userType = 'patient' 
}: LoadingProps) {
  const defaultTitle = `Loading ${userType === 'doctor' ? 'Medical' : 'Patient'} Dashboard`
  const defaultSubtitle = userType === 'doctor' 
    ? 'Fetching your practice data...' 
    : 'Fetching your health data...'
  
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className={`w-16 h-16 border-4 ${userType === 'doctor' ? 'border-blue-600' : 'border-blue-600'} border-t-transparent rounded-full animate-spin mx-auto`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {userType === 'doctor' ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 font-semibold animate-pulse">
            {title || defaultTitle}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {subtitle || defaultSubtitle}
          </p>
        </div>
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}