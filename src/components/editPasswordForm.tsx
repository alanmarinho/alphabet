import { useAPI } from '@/contexts/api';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';

interface IeditPassword {
  setShowEditPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function EditPasswordForm({ setShowEditPasswordModal }: IeditPassword) {
  const [password, setPassword] = useState('');
  const { setNotifications, generateId } = useNotification();
  const { editPassword } = useAPI();
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [repeatPassword, setRepeatPassword] = useState('');

  const validade = (): boolean => {
    setFieldErrors({});
    const errors: Record<string, string> = {};
    if (!password) errors.password = 'Campo Vazio';
    if (!repeatPassword) errors.repeatPassword = 'Campo Vazio';
    if (password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres.';
    } else if (password !== repeatPassword) {
      errors.repeatPassword = 'As senhas não coincidem.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      if (!validade()) return;

      const response = await editPassword({ password: password });
      if (!response) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Ocorreu um erro ao adicionar email, tente novamente.',
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
            message: 'Senha alterada.',
            type: ENotificationType.success,
          },
        ]);
        setShowEditPasswordModal(false);
        return;
      }
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        {
          id: generateId(),
          message: 'Ocorreu um erro ao editar a senha, tente novamente mais tarde.',
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
        <p className="text-2xl">Editar senha</p>
        <button
          onClick={() => setShowEditPasswordModal(false)}
          className="absolute bg-red-500 rounded-full right-0 top-1 text-gray-500 hover:text-black"
        >
          <IoIosClose color="#fff" size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 rounded">
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Senha <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            type="password"
            placeholder="Senha"
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
