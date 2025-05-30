import { IoIosClose } from 'react-icons/io';
import { useAPI } from '@/contexts/api';
import { useRef, useState } from 'react';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { FaSpinner } from 'react-icons/fa';
interface IRegisterForm {
  setLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
  setRegisterModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function RegisterForm({ setLoginModal, setRegisterModal }: IRegisterForm) {
  const { register } = useAPI();
  const { generateId, setNotifications } = useNotification();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const ignoreEmailRef = useRef(false);
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    processRegister();
  };

  const processRegister = () => {
    setFieldErrors({});
    const errors: Record<string, string> = {};

    if (!username) errors.username = 'Campo Vazio';
    if (!password) errors.password = 'Campo Vazio';
    if (!repeatPassword) errors.repeatPassword = 'Campo Vazio';

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return;
    }
    let localError = '';
    const usernameRegex = /^[a-z0-9]{1,15}$/;

    if (!username || !password || !repeatPassword) {
      localError = 'Preencha todos os campos obrigatórios.';
    } else if (username.length < 1) {
      errors.username = 'Nome de usuário deve ter pelo menos 1 caracteres.';
    } else if (!usernameRegex.test(username)) {
      errors.username = 'Nome de usuário deve ser válido 1-15 caracteres a-z0-9';
    } else if (password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres.';
    } else if (password !== repeatPassword) {
      errors.repeatPassword = 'As senhas não coincidem.';
    } else if (email && !validateEmail(email)) {
      errors.email = 'Formato de e-mail inválido.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    if (!email && ignoreEmailRef.current == false) {
      setEmailWarning(true);
      return;
    }
    finishRegister({ username, password, email });
  };

  const finishRegister = async (data: { username: string; password: string; email?: string }) => {
    try {
      setSending(true);
      const cleanData = { ...data };
      if (!cleanData.email) {
        delete cleanData.email;
      }
      const response = await register(cleanData);
      if (response === null) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Ocorreu um erro ao se registar',
            type: ENotificationType.error,
          },
        ]);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Registrado com sucesso, faça login.',
            type: ENotificationType.success,
          },
        ]);
        if (data.actions.validateEmail === true) {
          setTimeout(() => {
            setNotifications((prev) => [
              ...prev,
              {
                id: generateId(),
                message: 'Um email de verificação foi enviado.',
                type: ENotificationType.success,
              },
            ]);
          }, 100);
        }
        setRegisterModal(false);
        setLoginModal(true);
      } else {
        const errorData = await response.json();

        if (errorData.fields) {
          const errorsByField: { [key: string]: string } = {};
          errorData.fields.forEach((fieldError: { field: string; message: string }) => {
            errorsByField[fieldError.field] = fieldError.message;
          });
          setFieldErrors(errorsByField);
        }
      }
    } catch (err: any) {
      try {
        const errorData = (await err.response?.json?.()) || err;

        if (errorData.fields) {
          const errorsByField: { [key: string]: string } = {};
          errorData.fields.forEach((f: { field: string; message: string }) => {
            errorsByField[f.field] = f.message;
          });
          setFieldErrors(errorsByField);
        }

        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: errorData.msg || 'Erro ao registrar',
            type: ENotificationType.error,
          },
        ]);
      } catch {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Erro inesperado ao registrar',
            type: ENotificationType.error,
          },
        ]);
      }
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="flex z-40 p-5 flex-col rounded-md bg-white">
      <div className="relative text-center">
        <p className="text-4xl">Registro</p>
        <button
          onClick={() => setRegisterModal(false)}
          className="absolute bg-red-500 rounded-full right-0 top-1 text-gray-500 hover:text-black"
        >
          <IoIosClose color="#fff" size={24} />
        </button>
      </div>
      <form onSubmit={handleRegister} className="flex flex-col gap-4 p-6 rounded">
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Username <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded mt-1"
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
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Repetir senha <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Repita a Senha"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          {fieldErrors.repeatPassword && <p className="text-red-500 text-xs">{fieldErrors.repeatPassword}</p>}
        </label>
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">Email</span>
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
        </label>
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
          Já possue conta?{' '}
          <p
            onClick={() => {
              setLoginModal(true), setRegisterModal(false);
            }}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login
          </p>
        </p>
      </div>
      {emailWarning ? (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6 text-center relative">
            <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M12 4.5a7.5 7.5 0 110 15 7.5 7.5 0 010-15z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-700">Atenção</h2>

            <p className="text-gray-700 text-base">
              Adicionar um email não é obrigatório, porém, em caso de esquecimento de senha, sem um email registrado,
              não será possível recuperar sua conta.
            </p>

            <p className="font-semibold text-gray-800">Deseja prosseguir sem um email?</p>

            <div className="flex justify-center gap-4 pt-3">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-md transition duration-150"
                onClick={() => {
                  ignoreEmailRef.current = true;
                  setEmailWarning(false);
                  processRegister();
                }}
              >
                Sim
              </button>
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-5 py-2 rounded-md transition duration-150"
                onClick={() => setEmailWarning(false)}
              >
                Não, vou adicionar um
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
