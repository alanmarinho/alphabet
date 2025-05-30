import { useEffect, useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { IoIosSend } from 'react-icons/io';

interface Props {
  verifyEmailTokenExpiresAt?: string;
  onClick: () => void;
  block: boolean;
}

export default function EmailButton({ verifyEmailTokenExpiresAt, onClick, block }: Props) {
  const [disabled, setDisabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!verifyEmailTokenExpiresAt) {
      setDisabled(false);
      setTimeLeft(0);
      return;
    }

    const expiryDate = new Date(verifyEmailTokenExpiresAt).getTime();
    const now = Date.now();
    if (expiryDate > now) {
      setDisabled(true);
      setTimeLeft(expiryDate - now);

      const interval = setInterval(() => {
        const diff = expiryDate - Date.now();
        if (diff <= 0) {
          setDisabled(false);
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setDisabled(false);
      setTimeLeft(0);
    }
  }, [verifyEmailTokenExpiresAt]);

  const formatTimeLeft = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <button
        onClick={onClick}
        disabled={disabled || block}
        title={
          disabled ? `Um email já foi enviado, aguarde para enviar um novo.` : block ? 'Processando' : 'Verificar email'
        }
        style={{ cursor: disabled || block ? 'not-allowed' : 'pointer' }}
        className="flex flex-col items-center justify-center"
      >
        <IoIosSend color={disabled || block ? 'gray' : '#7bd62b'} />
        {disabled && <small>{formatTimeLeft(timeLeft)}</small>}
      </button>
    </div>
  );
}
