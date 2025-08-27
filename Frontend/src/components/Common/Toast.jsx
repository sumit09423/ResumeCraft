import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    const baseStyles = "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
    
    if (!isVisible) {
      return `${baseStyles} transform translate-x-full opacity-0 transition-all duration-300 ease-in-out`
    }

    return `${baseStyles} transform translate-x-0 opacity-100 transition-all duration-300 ease-in-out`
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />
    }
  }

  const getIconBackground = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50'
      case 'error':
        return 'bg-red-50'
      case 'warning':
        return 'bg-yellow-50'
      default:
        return 'bg-blue-50'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      default:
        return 'text-blue-800'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-400 hover:text-green-500'
      case 'error':
        return 'text-red-400 hover:text-red-500'
      case 'warning':
        return 'text-yellow-400 hover:text-yellow-500'
      default:
        return 'text-blue-400 hover:text-blue-500'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className={`inline-flex rounded-md bg-white ${getButtonColor()} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onClose(), 300)
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toast
