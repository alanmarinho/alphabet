import { IRankingReturn, useAPI } from '@/contexts/api';
import { useInfo } from '@/contexts/user';
import { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { FaInfoCircle, FaSpinner } from 'react-icons/fa';

type IRanking = { username: string; time: number; date: string; position: number }[];

export default function Ranking() {
  const { setRankingShow, rankingShow, userInfo } = useInfo();
  const { getRanking } = useAPI();
  const [ranking, setRanking] = useState<IRanking>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loadinfRanking, setLoadinfRanking] = useState(false);

  function formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const milliseconds = durationMs % 1000;

    const formattedSeconds = seconds.toString();
    const formattedMilliseconds = milliseconds.toString().padStart(3, '0');

    if (minutes === 0) {
      return `${formattedSeconds}.${formattedMilliseconds} s`;
    }

    return `${minutes}:${formattedSeconds.padStart(2, '0')}.${formattedMilliseconds} s`;
  }
  useEffect(() => {
    setLoadinfRanking(true);
    getRanking().then((response: IRankingReturn[] | null) => {
      if (response) {
        const mapped = response.map((item) => ({
          username: item.username,
          time: item.duration_ms,
          date: item.played_at,
          position: item.position,
        }));
        setRanking(mapped);
      } else {
        setRanking([]);
      }
    });
    setLoadinfRanking(false);
  }, [getRanking]);
  const items = Array.from({ length: 10 }).map((_, i) => {
    const item = ranking?.[i];
    const isCurrentUser = item?.username === userInfo.username;

    return (
      <div
        key={i}
        className={`flex items-center justify-between rounded-md p-2 w-full
        ${isCurrentUser ? 'bg-yellow-200 font-semibold' : 'bg-white text-black'}`}
      >
        <span>{i + 1}º</span>
        {item ? (
          <>
            <span>{item.username}</span>
            <span>{formatDuration(item.time)}</span>
          </>
        ) : (
          <span className="text-gray-400 italic">Vazio</span>
        )}
      </div>
    );
  });
  return (
    <div className="hidden md:flex p-5 flex-col bg-purple-500 rounded-md m-10 ml-0">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setShowInfoModal(true)} title="Info">
          <FaInfoCircle className="text-white" />
        </button>
        <h1 className="text-3xl mx-auto">Ranking</h1>
        <div
          onClick={() => {
            setRankingShow(!rankingShow);
          }}
          className="bg-red-500 flex items-center justify-center rounded-full w-6 h-6 cursor-pointer"
        >
          <IoClose color="#fff" />
        </div>
      </div>

      <div className="flex  flex-col gap-1">
        {loadinfRanking ? (
          <div className="flex items-center justify-center h-96">
            <FaSpinner color="#fff" className="animate-spin" />
          </div>
        ) : (
          items
        )}
      </div>
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6 text-center relative">
              <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-blue-200">
                <FaInfoCircle className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-black">Ranking</h2>

              <p className="text-gray-700 text-base">
                O ranking é ordenado pelo menor tempo contabilizado, com o top 10 se restringindo a mostrar o melhor
                tempo de cada usuário dentre os melhores top 100 tempos globais.
              </p>

              <p className="font-semibold text-gray-800">
                Para ver seus tempos registrados dentro do top 100, não somente o melhor, acesse "Minhas partidas" no
                menu da tela principal.
              </p>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="bg-green-500 min-w-24 p-3 flex items-center justify-center rounded-md"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
