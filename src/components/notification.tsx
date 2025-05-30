import React, { useEffect, useState } from 'react';
import { ENotificationType } from '@/contexts/notifications';
import { AiOutlineCheckCircle, AiOutlineWarning, AiOutlineCloseCircle } from 'react-icons/ai';

interface NotificationProps {
  message: string;
  duration?: number;
  type: ENotificationType;
  onClose: () => void;
}

const getStyles = (type: ENotificationType) => {
  switch (type) {
    case ENotificationType.success:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <AiOutlineCheckCircle className="text-green-600 text-xl mt-1" />,
      };
    case ENotificationType.error:
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <AiOutlineCloseCircle className="text-red-600 text-xl mt-1" />,
      };
    case ENotificationType.warning:
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <AiOutlineWarning className="text-yellow-600 text-xl mt-1" />,
      };
    default:
      return {
        bg: 'bg-gray-200',
        text: 'text-gray-800',
        icon: null,
      };
  }
};

export default function Notification({ message, type, duration = 3000, onClose }: NotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { bg, text, icon } = getStyles(type);

  return (
    <div
      className={`w-72 p-4 flex gap-2 items-start rounded-xl shadow-lg transition-all duration-300 ease-in-out
        ${bg} ${text} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {icon}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
