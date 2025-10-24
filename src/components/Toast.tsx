'use client';

import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

function Toast({ message, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 延迟显示动画
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 自动移除
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(message.id), 300);
    }, message.duration || 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message.id, message.duration, onRemove]);

  const getToastStyles = () => {
    const baseStyles = "border-l-4 shadow-lg";
    switch (message.type) {
      case 'success':
        return `${baseStyles} bg-green-900/90 border-green-500 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-900/90 border-red-500 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-900/90 border-yellow-500 text-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-900/90 border-blue-500 text-blue-100`;
      default:
        return `${baseStyles} bg-slate-900/90 border-slate-500 text-slate-100`;
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out backdrop-blur-md rounded-lg p-4 min-w-80 max-w-md
        ${getToastStyles()}
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-current text-slate-900 font-bold text-sm">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{message.title}</div>
          {message.message && (
            <div className="text-xs opacity-90 mt-1">{message.message}</div>
          )}
        </div>
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => onRemove(message.id), 300);
          }}
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-[100] space-y-3">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newMessage: ToastMessage = { ...toast, id };
    setMessages(prev => [...prev, newMessage]);
    return id;
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    return showToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    return showToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    return showToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    return showToast({ type: 'info', title, message, duration });
  };

  return {
    messages,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}