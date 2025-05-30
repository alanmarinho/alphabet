import Header from '@components/header';
import { useEffect, useState } from 'react';
import { useAPI } from '@/contexts/api';
import { useInfo } from '@/contexts/user';
import GameField from '@components/gameField';
import Ranking from '@components/ranking';
import Sidebar from '@components/sideBar';
import { IoMdMenu } from 'react-icons/io';
import { ENotificationType, useNotification } from './contexts/notifications';
import Notification from '@/components/notification';
import { RecoverPasswordFinal } from '@components/recoverPasswordFinalForm';

function App() {
  const { notifications, setNotifications, generateId } = useNotification();
  const { getUserData, verifyEmail } = useAPI();
  const [showSideBar, setShowSideBar] = useState(false);
  const [recoverPasswordToken, setRecoverPasswordToken] = useState<string>('');
  const [showRecoverPasswordFormModal, setShowRecoverPasswordFormModal] = useState(false);
  const { rankingShow } = useInfo();

  useEffect(() => {
    const emailVerify = async ({ token }: { token: string }) => {
      const result = await verifyEmail({ token: token });
      if (result) {
        setNotifications((prev) => [
          ...prev,
          { id: generateId(), message: 'Email validado com sucesso.', type: ENotificationType.success },
        ]);
        getUserData();
      } else {
        setNotifications((prev) => [
          ...prev,
          { id: generateId(), message: 'Ocorreu um erro ao validar seu email.', type: ENotificationType.error },
        ]);
      }
      const baseUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', baseUrl);
    };
    const params = new URLSearchParams(window.location.search);
    const emailVerification = params.get('emailverification');
    const recoverpassword = params.get('recoverpassword');
    const token = params.get('token');

    if (emailVerification === 'true' && !!token) {
      emailVerify({ token: token });
    }
    if (recoverpassword === 'true' && !!token) {
      setRecoverPasswordToken(token);
      setShowRecoverPasswordFormModal(true);
    }
    getUserData();
  }, []);
  return (
    <div className="flex flex-col min-h-screen w-full bg-blue-400">
      <div className="flex flex-1 w-full">
        <div className="flex flex-col flex-1">
          <Header setShowSidebar={setShowSideBar} showLogo={showSideBar} />
          {showSideBar ? (
            <>
              <div className="fixed inset-0 bg-black/50  z-0" onClick={() => setShowSideBar(false)} />
              <Sidebar setShowSidebar={setShowSideBar} />
            </>
          ) : (
            <button
              className="fixed top-36 -left-4  bg-white text-black p-3 rounded-full shadow-lg hover:bg-gray-200 transition md:block hidden"
              onClick={() => setShowSideBar((prev) => !prev)}
            >
              <IoMdMenu size={24} />
            </button>
          )}
          <div className="flex-1 ">
            <GameField />
          </div>
        </div>

        {rankingShow && (
          <div className="hidden md:block w-1/4">
            <Ranking />
          </div>
        )}
      </div>
      <div className="fixed z-[20] top-12 right-4 space-y-2">
        {notifications().map((item) => (
          <div key={item.id} className="relative">
            <Notification
              message={item.message}
              type={item.type}
              onClose={() => {
                setNotifications((prev) => prev.filter((n) => n.id !== item.id));
              }}
            />
          </div>
        ))}
      </div>
      {showRecoverPasswordFormModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <RecoverPasswordFinal
            token={recoverPasswordToken}
            setRecoverPasswordModal={setShowRecoverPasswordFormModal}
          />
        </div>
      )}
    </div>
  );
}

export default App;
