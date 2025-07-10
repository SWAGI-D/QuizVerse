import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colorMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
  className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-xl text-white shadow-lg transition-opacity duration-300 ${
    colorMap[type]
  }`}
  style={{ opacity: 1 }}
>
  {message}
</div>

  );
}
