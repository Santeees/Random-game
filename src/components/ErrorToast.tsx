import React, { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorToastProps {
  error: string | null;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ error, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [error]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible || !error) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`bg-red-500/90 backdrop-blur-lg border border-red-400/50 rounded-lg p-4 shadow-2xl max-w-sm transform transition-all duration-300 ${
          isAnimating 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white mb-1">
              Error de Conexión
            </h3>
            <p className="text-sm text-red-100 break-words">
              {error}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-red-200 hover:text-white transition-colors p-1 hover:bg-red-600/50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-red-600/30 rounded-full h-1">
          <div 
            className="bg-red-300 h-1 rounded-full transition-all duration-5000 ease-linear"
            style={{
              width: isAnimating ? '0%' : '100%',
              transition: isAnimating ? 'width 5s linear' : 'none'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;