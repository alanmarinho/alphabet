import { useAPI } from '@/contexts/api';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';

interface IRecoverPasswordForm {
  setLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRecoverPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function RecoverPassword({ setLoginModal, setRecoverPasswordModal }: IRecoverPasswordForm) {
  const { startRecoverPassword } = useAPI();
  const { setNotifications, generateId } = useNotification();
  const [identifier, setIdentifier] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [sending, setSending] = useState(false);

  const handleRecoverPassword = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSending(true);
      const errors: Record<string, string> = {};
      setFieldErrors({});
      if (!identifier) {
        errors.identifier = 'Campo vazio';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-z0-9]{1,15}$/;

        if (!emailRegex.test(identifier) && !usernameRegex.test(identifier)) {
          errors.identifier = 'Digite um email ou nome de usuário válido';
        }
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
      const response = await startRecoverPassword({ identifier: identifier });

      if (response == null) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Ocorreu um erro ao recuperar a senha, tente novamente.',
            type: ENotificationType.error,
          },
        ]);
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.fields) {
          const errorsByField: { [key: string]: string } = {};
          errorData.fields.forEach((fieldError: { field: string; message: string }) => {
            errorsByField[fieldError.field] = fieldError.message;
          });
          setFieldErrors(errorsByField);
        }
        return;
      } else {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Email de recuperação enviado.',
            type: ENotificationType.success,
          },
        ]);
        setRecoverPasswordModal(false);
      }
    } catch (err) {
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="flex z-40 p-5 flex-col rounded-md bg-white">
      <div className="relative text-center">
        <p className="text-2xl">Recuperar senha</p>
        <button
          onClick={() => setRecoverPasswordModal(false)}
          className="absolute bg-red-500 rounded-full right-0 top-1 text-gray-500 hover:text-black"
        >
          <IoIosClose color="#fff" size={24} />
        </button>
      </div>
      <form onSubmit={handleRecoverPassword} className="flex flex-col gap-4 p-6 rounded">
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Email ou username <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Email ou username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {fieldErrors.identifier && <p className="text-red-500 text-xs">{fieldErrors.identifier}</p>}
        </label>

        <button
          disabled={sending}
          type="submit"
          className="bg-green-500 flex items-center justify-center text-white p-2 rounded hover:opacity-90"
        >
          {sending ? <FaSpinner className="animate-spin" /> : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
