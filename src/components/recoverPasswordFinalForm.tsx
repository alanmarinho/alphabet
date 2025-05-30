import { useAPI } from '@/contexts/api';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';

interface IRecoverPasswordForm {
  setRecoverPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
  token: string;
}
export function RecoverPasswordFinal({ setRecoverPasswordModal, token }: IRecoverPasswordForm) {
  const { finishRecoverPassword } = useAPI();
  const { setNotifications, generateId } = useNotification();
  const [repeatPassword, setRepeatPassword] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [sending, setSending] = useState(false);

  const handleRecoverPassword = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSending(true);
      const errors: Record<string, string> = {};
      setFieldErrors({});
      if (!password) errors.password = 'Campo vazio';
      if (!repeatPassword) errors.repeatPassword = 'Campo vazio';
      if (password.length < 6) {
        errors.password = 'Senha deve ter pelo menos 6 caracteres.';
      } else if (password !== repeatPassword) {
        errors.repeatPassword = 'As senhas não coincidem.';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
      const response = await finishRecoverPassword({ password: password, token: token });

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
      if (response == null) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Ocorreu um erro ao recupara a senha, tente novamente mais tarde.',
            type: ENotificationType.error,
          },
        ]);
        return;
      }
      if (!response) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Ocorreu um erro ao recupara a senha, token expirado, solicite um novo.',
            type: ENotificationType.error,
          },
        ]);
        return;
      } else {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Senha recuperada, faça login.',
            type: ENotificationType.success,
          },
        ]);
        setRecoverPasswordModal(false);
      }
    } catch (err) {
    } finally {
      const baseUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', baseUrl);
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
            Senha <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Email ou username"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <p className="text-red-500 text-xs">{fieldErrors.password}</p>}
        </label>
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Repita a senha <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Email ou username"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          {fieldErrors.repeatPassword && <p className="text-red-500 text-xs">{fieldErrors.repeatPassword}</p>}
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
