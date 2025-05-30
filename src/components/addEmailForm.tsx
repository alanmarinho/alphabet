import { useAPI } from '@/contexts/api';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { useInfo } from '@/contexts/user';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';

interface IAddEmailForm {
  setAddEmailModal: React.Dispatch<React.SetStateAction<boolean>>;
}
export function AddEmailForm({ setAddEmailModal }: IAddEmailForm) {
  const { setNotifications, generateId } = useNotification();
  const { getUserData } = useAPI();
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const { setEmail } = useAPI();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const errors: Record<string, string> = {};

      if (!newEmail) errors.email = 'Campo Vazio';

      if (newEmail && !validateEmail(newEmail)) {
        errors.email = 'Formato de e-mail inválido.';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...errors }));
        return;
      }

      const response = await setEmail({ email: newEmail });

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
      if (response.ok) {
        setNotifications((prev) => [
          ...prev,
          {
            id: generateId(),
            message: 'Email adicionado, verifique sua caixa de entrada para confirmar.',
            type: ENotificationType.success,
          },
        ]);
        getUserData();
        setAddEmailModal(false);
        return;
      } else {
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
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        {
          id: generateId(),
          message: 'Ocorreu um erro ao adicionar email, tente novamente mais tarde.',
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
        <p className="text-2xl">Adicionar email</p>
        <button
          onClick={() => setAddEmailModal(false)}
          className="absolute bg-red-500 rounded-full right-0 top-1 text-gray-500 hover:text-black"
        >
          <IoIosClose color="#fff" size={24} />
        </button>
      </div>
      <form onSubmit={handleAddEmail} className="flex flex-col gap-4 p-6 rounded">
        <label className="flex flex-col text-sm font-medium">
          <span className="flex gap-2">
            Email <span className="text-red-500">*</span>
          </span>
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          {fieldErrors.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
        </label>

        <button
          disabled={sending}
          type="submit"
          className="bg-green-500 flex items-center justify-center text-white p-2 rounded hover:opacity-90"
        >
          {sending ? <FaSpinner className="animate-spin" /> : 'Adicionar'}
        </button>
      </form>
    </div>
  );
}
