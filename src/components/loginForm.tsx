import { useState } from 'react';
import { useAPI } from '@/contexts/api';
import { useInfo } from '@/contexts/user';
import { IoIosClose } from 'react-icons/io';
import Notification from '@components/notification';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { FaSpinner } from 'react-icons/fa';

interface ILoginForm {
  setLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRegisterModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRecoverPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

function LoginForm({ setLoginModal, setRegisterModal, setRecoverPassword }: ILoginForm) {
  const { login } = useAPI();
  const { setNotifications, generateId } = useNotification();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [sending, setSending] = useState(false);

  const handleShowNotification = (message: string, type: ENotificationType) => {
    setNotifications((prev) => [...prev, { id: generateId(), message: message, type: type }]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFieldErrors({});

    try {
      const errors: Record<string, string> = {};

      if (!username) errors.username = 'Campo Vazio';
      if (!password) errors.password = 'Campo Vazio';

      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
      const response = await login({ password: password, username: username });
      if (response == null) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Ocorreu um erro ao logar, tente novamente.',
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
      }

      handleShowNotification('Login realizado!', ENotificationType.success);
      setLoginModal(false);
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        {
          id: generateId(),
          message: 'Ocorreu um erro ao logar, tente novamente mais tarde.',
          type: ENotificationType.error,
        },
      ]);
      return;
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex z-40 p-5 flex-col rounded-md bg-white">
      <div className="relative text-center">
        <p className="text-4xl">Login</p>
        <button
          onClick={() => setLoginModal(false)}
          className="absolute bg-red-500 rounded-full right-0 top-1 text-gray-500 hover:text-black"
        >
          <IoIosClose color="#fff" size={24} />
        </button>
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 p-6 rounded">
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Username <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {fieldErrors.username && <p className="text-red-500 text-xs">{fieldErrors.username}</p>}
        </label>
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Senha <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <p className="text-red-500 text-xs">{fieldErrors.password}</p>}
        </label>
        <div className="flex justify-end">
          <span className="text-xs">
            Esqueceu a senha?{' '}
            <span
              onClick={() => {
                setLoginModal(false), setRecoverPassword(true);
              }}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              Recuperar
            </span>
          </span>
        </div>
        <button
          disabled={sending}
          type="submit"
          className="bg-green-500 flex items-center justify-center text-white p-2 rounded hover:opacity-90"
        >
          {sending ? <FaSpinner className="animate-spin" /> : 'Entrar'}
        </button>
      </form>
      <div className="flex justify-center text-center">
        <p className="text-xs flex gap-1">
          Não possue conta?{' '}
          <p
            onClick={() => {
              setLoginModal(false), setRegisterModal(true);
            }}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Registre-se
          </p>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
