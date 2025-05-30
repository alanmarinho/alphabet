import { FaEye, FaRegUser } from 'react-icons/fa6';
import { CiSettings } from 'react-icons/ci';
import { MdOutlineHome } from 'react-icons/md';
import { IoIosClose } from 'react-icons/io';
import { useInfo } from '@/contexts/user';
import { EEmailStatus } from '@/contexts/user';
import { SiVerizon } from 'react-icons/si';
import { useRef, useState } from 'react';
import LoginForm from '@/components/loginForm';
import { useAPI } from '@/contexts/api';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { RegisterForm } from '@/components/registerForm';
import { RecoverPassword } from '@/components/recoverPasswordForm';
import { FiPlusCircle } from 'react-icons/fi';
import { AddEmailForm } from './addEmailForm';
import { IoIosSend } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';
import EmailButton from '@/components/emailBtn';
import EditPasswordForm from './editPasswordForm';
import { MyMatchs } from './myMatchs';
interface ISideBar {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ setShowSidebar }: ISideBar) => {
  const { isLoggedIn, userInfo } = useInfo();
  const { logout, startVerifyEmail, getUserData } = useAPI();
  const { setNotifications, generateId } = useNotification();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddEmailModal, setAddEmailModal] = useState(false);
  const [showMyMatchsModal, setShowMyMatchsModal] = useState(false);
  const [showAddEditPasswordModal, setShowAddEditPasswordModal] = useState(false);
  const [showRecoverPasswordModal, setShowRecoverPasswordModal] = useState(false);
  const [blockEmailSentBTN, setblockEmailSentBTN] = useState(false);

  const handleStartVerificateEmail = async () => {
    try {
      setblockEmailSentBTN(true);
      setTimeout(() => {
        setblockEmailSentBTN(false);
      }, 12000);
      const success = await startVerifyEmail();
      if (success) {
        setNotifications((prev) => [
          ...prev,
          { id: generateId(), message: 'Email de verificação enviado!', type: ENotificationType.success },
        ]);
        getUserData();
      } else {
        setNotifications((prev) => [
          ...prev,
          { id: generateId(), message: 'Erro ao verificar email, tente novamente.', type: ENotificationType.error },
        ]);
      }
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        {
          id: generateId(),
          message: 'Erro ao verificar email, tente novamente mais tarde.',
          type: ENotificationType.success,
        },
      ]);
    }
  };
  const handleLogout = async () => {
    try {
      const successLogout = await logout();
      if (successLogout) {
        setNotifications((prev) => [
          ...prev,
          { id: generateId(), message: 'Deslogado com sucesso', type: ENotificationType.success },
        ]);
        getUserData();
      } else {
        setNotifications((prev) => [
          ...prev,
          { id: generateId(), message: 'Erro ao deslogar.', type: ENotificationType.error },
        ]);
      }
    } catch (err) {
      setNotifications((prev) => [
        ...prev,
        { id: generateId(), message: 'Erro ao deslogar.', type: ENotificationType.success },
      ]);
    }
  };
  const renderEmailStatus = () => {
    if (!isLoggedIn) return <span className="text-gray-500">Não logado</span>;
    switch (userInfo.emailStatus) {
      case EEmailStatus.verified:
        return (
          <div className="flex items-center gap-3">
            <span className="text-green-500 text-xs">Email Validado</span>
            <SiVerizon className="text-green-500" />
            <button title="Editar" onClick={() => setAddEmailModal(true)}>
              <MdEdit className="text-red-500" />
            </button>
          </div>
        );
      case EEmailStatus.notSet:
        return (
          <div className="flex items-center gap-3">
            <span className="text-gray-500">Sem email</span>
            <button title="Adicionar email" onClick={() => setAddEmailModal(true)}>
              <FiPlusCircle className="text-green-500" />
            </button>
          </div>
        );
      case EEmailStatus.verificationPending:
        return (
          <div className="flex justify-center items-center gap-2">
            <span className="text-yellow-600 text-xs">Verificação pendente</span>
            <button title="Verificar email" onClick={handleStartVerificateEmail}>
              <EmailButton
                block={blockEmailSentBTN}
                verifyEmailTokenExpiresAt={userInfo.verifyEmailTokenExpiresAt}
                onClick={() => {}}
              />
            </button>
          </div>
        );
      case EEmailStatus.unknown:
        return <span className="text-red-500">Status desconhecido</span>;
      default:
        return <span className="text-gray-400">Status indefinido</span>;
    }
  };
  return (
    <div className="absolute h-screen w-60 bg-white text-black p-4 flex flex-col justify-between">
      <button
        onClick={() => setShowSidebar(false)}
        className="absolute right-4 top-4 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition cursor-pointer"
      >
        <IoIosClose size={24} />
      </button>
      <div>
        <div onClick={() => setShowSidebar(false)} className="flex p-4 mt-4 gap-5 cursor-pointer">
          <img src="https://raw.githubusercontent.com/alanmarinho/utils/main/icons/logo.svg" alt="logo" />
          <p className="text-black text-xl">Alphabet</p>
        </div>
        <nav className="space-y-2 mt-8">
          <p className="flex items-center space-x-2 p-2 rounded">
            <span>Logado: {isLoggedIn ? userInfo.username : 'Não'}</span>
          </p>
          {isLoggedIn && (
            <>
              <p className="flex items-center space-x-2 p-2 rounded">
                <span>Email:</span>
                {renderEmailStatus()}
              </p>
              <p className="flex items-center space-x-2 p-2 rounded">
                <span>Senha:</span>
                <button title="Editar" onClick={() => setShowAddEditPasswordModal(true)} className="">
                  <MdEdit className="text-red-500" />
                </button>
              </p>
              <p className="flex items-center space-x-2 p-2 rounded">
                <span>Minhas partidas:</span>
                <button onClick={() => setShowMyMatchsModal(true)} className="">
                  <FaEye className="text-green-500" />
                </button>
              </p>
            </>
          )}
        </nav>
      </div>
      <div className="p-4">
        {!isLoggedIn ? (
          <>
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              Login
            </button>
            <p className=" flex text-xs">
              Não possue conta?{' '}
              <p onClick={() => setShowRegisterModal(true)} className="text-blue-400 cursor-pointer">
                Registre-se
              </p>
            </p>
          </>
        ) : (
          <button onClick={() => handleLogout()} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
            Logout
          </button>
        )}
      </div>
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <LoginForm
            setRecoverPassword={setShowRecoverPasswordModal}
            setRegisterModal={setShowRegisterModal}
            setLoginModal={setShowLoginModal}
          />
        </div>
      )}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <RegisterForm setRegisterModal={setShowRegisterModal} setLoginModal={setShowLoginModal} />
        </div>
      )}
      {showAddEmailModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <AddEmailForm setAddEmailModal={setAddEmailModal} />
        </div>
      )}
      {showAddEditPasswordModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <EditPasswordForm setShowEditPasswordModal={setShowAddEditPasswordModal} />
        </div>
      )}
      {showMyMatchsModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <MyMatchs setMyMatchsModal={setShowMyMatchsModal} />
        </div>
      )}
      {showRecoverPasswordModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <RecoverPassword setLoginModal={setShowLoginModal} setRecoverPasswordModal={setShowRecoverPasswordModal} />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
