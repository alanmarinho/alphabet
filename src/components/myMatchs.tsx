import { IRankingReturn, useAPI } from '@/contexts/api';
import { useEffect, useState } from 'react';
import { IoIosClose } from 'react-icons/io';
import ranking from './ranking';
import { FaSpinner } from 'react-icons/fa';

interface IMyMatchs {
  setMyMatchsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const mock = [
  {
    position: 1,
    username: 'alan',
    duration_ms: 10228,
    played_at: '2025-05-29T22:40:43.940Z',
  },
  {
    position: 3,
    username: 'alan',
    duration_ms: 12455,
    played_at: '2025-05-26T22:32:47.252Z',
  },
  {
    position: 4,
    username: 'alan',
    duration_ms: 12761,
    played_at: '2025-05-29T22:39:08.011Z',
  },
  {
    position: 5,
    username: 'alan',
    duration_ms: 14027,
    played_at: '2025-05-27T18:19:30.079Z',
  },
  {
    position: 1,
    username: 'alan',
    duration_ms: 10228,
    played_at: '2025-05-29T22:40:43.940Z',
  },
  {
    position: 3,
    username: 'alan',
    duration_ms: 12455,
    played_at: '2025-05-26T22:32:47.252Z',
  },
  {
    position: 4,
    username: 'alan',
    duration_ms: 12761,
    played_at: '2025-05-29T22:39:08.011Z',
  },
  {
    position: 5,
    username: 'alan',
    duration_ms: 14027,
    played_at: '2025-05-27T18:19:30.079Z',
  },
  {
    position: 1,
    username: 'alan',
    duration_ms: 10228,
    played_at: '2025-05-29T22:40:43.940Z',
  },
  {
    position: 3,
    username: 'alan',
    duration_ms: 12455,
    played_at: '2025-05-26T22:32:47.252Z',
  },
  {
    position: 4,
    username: 'alan',
    duration_ms: 12761,
    played_at: '2025-05-29T22:39:08.011Z',
  },
  {
    position: 5,
    username: 'alan',
    duration_ms: 14027,
    played_at: '2025-05-27T18:19:30.079Z',
  },
  {
    position: 1,
    username: 'alan',
    duration_ms: 10228,
    played_at: '2025-05-29T22:40:43.940Z',
  },
  {
    position: 3,
    username: 'alan',
    duration_ms: 12455,
    played_at: '2025-05-26T22:32:47.252Z',
  },
  {
    position: 4,
    username: 'alan',
    duration_ms: 12761,
    played_at: '2025-05-29T22:39:08.011Z',
  },
  {
    position: 5,
    username: 'alan',
    duration_ms: 14027,
    played_at: '2025-05-27T18:19:30.079Z',
  },
  {
    position: 1,
    username: 'alan',
    duration_ms: 10228,
    played_at: '2025-05-29T22:40:43.940Z',
  },
  {
    position: 3,
    username: 'alan',
    duration_ms: 12455,
    played_at: '2025-05-26T22:32:47.252Z',
  },
  {
    position: 4,
    username: 'alan',
    duration_ms: 12761,
    played_at: '2025-05-29T22:39:08.011Z',
  },
  {
    position: 5,
    username: 'alan',
    duration_ms: 14027,
    played_at: '2025-05-27T18:19:30.079Z',
  },
  {
    position: 1,
    username: 'alan',
    duration_ms: 10228,
    played_at: '2025-05-29T22:40:43.940Z',
  },
  {
    position: 3,
    username: 'alan',
    duration_ms: 12455,
    played_at: '2025-05-26T22:32:47.252Z',
  },
  {
    position: 4,
    username: 'alan',
    duration_ms: 12761,
    played_at: '2025-05-29T22:39:08.011Z',
  },
  {
    position: 5,
    username: 'alan',
    duration_ms: 14027,
    played_at: '2025-05-27T18:19:30.079Z',
  },
];
type IRanking = { username: string; time: number; date: string; position: number }[];

export function MyMatchs({ setMyMatchsModal }: IMyMatchs) {
  const [macths, setMacths] = useState<IRanking>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { getMatchs } = useAPI();

  function formatDate(isoDate: string): string {
    const date = new Date(isoDate);

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    const day = localDate.getDate().toString().padStart(2, '0');
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
    const year = localDate.getFullYear();

    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
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
  const items = Array.from({ length: macths.length }).map((_, i) => {
    const item = macths?.[i];
    return (
      <div className="flex items-center justify-between bg-white text-black p-2 w-full">
        <span>{item.position}º</span>

        <>
          <span>{item.username}</span>
          <span>{formatDuration(item.time)}</span>
          <span>{formatDate(item.date)}</span>
        </>
      </div>
    );
  });
  useEffect(() => {
    setLoading(true);
    getMatchs().then((response: IRankingReturn[] | null) => {
      if (response) {
        const mapped = response.map((item) => ({
          username: item.username,
          time: item.duration_ms,
          date: item.played_at,
          position: item.position,
        }));
        setMacths(mapped);
      } else {
        setMacths([]);
      }
    });
    // const mapped = mock.map((item) => ({
    //   username: item.username,
    //   time: item.duration_ms,
    //   date: item.played_at,
    //   position: item.position,
    // }));
    // setMacths(mapped);

    setLoading(false);
  }, [ranking]);
  return (
    <div className="bg-white w-96 h-3/4 flex flex-col p-4 rounded-md">
      <div className="relative text-center">
        <p className="text-2xl">Minhas partidas</p>
        <button
          onClick={() => setMyMatchsModal(false)}
          className="absolute bg-red-500 rounded-full right-0 top-1 text-gray-500 hover:text-black"
        >
          <IoIosClose color="#fff" size={24} />
        </button>
      </div>
      <div className="overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {loading ? (
          <FaSpinner className="animate-spin" />
        ) : macths ? (
          items
        ) : (
          <p>Você não tem partidas resgistradas no top 100.</p>
        )}
      </div>
    </div>
  );
}
