import { useInfo } from '@/contexts/user';
import { useAPI, IStartGame, IInput } from '@/contexts/api';
import { useEffect, useRef, useState } from 'react';
import HiddenInput from './hiddenInput';
import AlphabetBoxes from './alphbetBoxes';
import { ENotificationType, useNotification } from '@/contexts/notifications';
import { FaSpinner } from 'react-icons/fa';

const expectedAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function GameField() {
  const { setNotifications, generateId } = useNotification();

  const { startGame, finishGame } = useAPI();
  const { isLoggedIn } = useInfo();
  const [matchData, setMatchData] = useState<IStartGame>({ expireIn: '', matchToken: '' });
  const [gameRunning, setGameRunning] = useState(false);
  const gameRunningRef = useRef(false);
  const [processingMatch, setProcessingMatch] = useState(false);

  const [inputs, setInputs] = useState<{ key: string; time: number }[]>([]);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();

  const [currentIndex, setCurrentIndex] = useState(0);
  const startTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusCheckInterval = useRef<NodeJS.Timeout>();

  const setGameStatus = (value: boolean) => {
    setGameRunning(value);
    gameRunningRef.current = value;
  };

  const resetInactivityTimer = () => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      if (gameRunningRef.current) {
        endGame('Você ficou mais de 5 segundos sem digitar. Tentativa inválida!', ENotificationType.warning);
        reset();
      }
    }, 5000);
  };

  const handleShowNotification = (message: string, type: ENotificationType) => {
    setNotifications((prev) => [...prev, { id: generateId(), message, type }]);
  };

  const reset = () => {
    setGameStatus(false);
    setInputs([]);
    setCurrentIndex(0);
  };

  function endGame(msg: string, type: ENotificationType) {
    handleShowNotification(msg, type);
    setGameStatus(false);
    clearInterval(focusCheckInterval.current);
    clearTimeout(inactivityTimeoutRef.current);
  }

  const handleStart = async () => {
    setGameStatus(true);
    startTime.current = performance.now();
    resetInactivityTimer();
    if (isLoggedIn) {
      const startData = await startGame();
      if (!startData) {
        setGameStatus(false);
        endGame('Ocorreu um erro ao computar sua partida, tente novamente.', ENotificationType.error);
      } else {
        setMatchData(startData);
      }
    }
  };

  async function handleKeyTyped(key: string) {
    resetInactivityTimer();
    if (!gameRunning) return;
    key = key.toLowerCase();
    if (!/^[a-z]$/.test(key)) {
      reset();
      return;
    }
    const expectedKey = expectedAlphabet[currentIndex];
    if (key !== expectedKey) {
      endGame(`Letra errada! Esperado: "${expectedKey}", recebido: "${key}"`, ENotificationType.error);
      reset();
      return;
    }
    const currentTime = performance.now();
    const time = Math.round(currentTime - startTime.current);
    const newInputs = [...inputs, { key, time }];
    setInputs(newInputs);
    setCurrentIndex((prev) => prev + 1);

    if (newInputs.length >= 26) {
      setGameStatus(false);
      setProcessingMatch(true);

      if (isLoggedIn) {
        const data = await finishGame({ token: matchData.matchToken, input: newInputs });

        if (data) {
          const ms = data.time;
          const minutes = Math.floor(ms / 60000);
          const seconds = Math.floor((ms % 60000) / 1000);
          const milliseconds = ms % 1000;
          const formatted =
            minutes > 0
              ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
                  milliseconds,
                ).padStart(3, '0')}`
              : `${seconds}.${String(milliseconds).padStart(3, '0')}`;
          endGame(`Partida validada, tempo contabilizado ${formatted}`, ENotificationType.success);
        }
      } else {
        const ms = newInputs[25].time;
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = ms % 1000;
        const formatted =
          minutes > 0
            ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(
                3,
                '0',
              )}`
            : `${seconds}.${String(milliseconds).padStart(3, '0')}`;
        endGame(`Seu tempo foi ${formatted}, faça login se quiser participar do ranking`, ENotificationType.success);
      }
      setProcessingMatch(false);
      reset();
    }
  }

  function handleBlur() {
    if (gameRunning) {
      endGame('Você perdeu o foco da digitação. Tentativa inválida!', ENotificationType.error);
      reset();
    }
  }

  useEffect(() => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const prevent = (e: Event) => e.preventDefault();

    ['paste', 'drop', 'contextmenu', 'copy', 'cut'].forEach((evt) => {
      input.addEventListener(evt, prevent);
    });

    return () => {
      ['paste', 'drop', 'contextmenu', 'copy', 'cut'].forEach((evt) => {
        input.removeEventListener(evt, prevent);
      });
      clearInterval(focusCheckInterval.current);
    };
  }, [gameRunning]);

  return (
    <div className="flex justify-center h-full w-full pt-0 pb-10  mb-auto px-10">
      <div className="flex items-center justify-center max-w-screen-lg p-10 bg-green-400 rounded-md h-full w-full">
        <HiddenInput inputRef={inputRef} onKeyTyped={handleKeyTyped} active={gameRunning} onBlur={handleBlur} />
        {gameRunning ? (
          <AlphabetBoxes inputs={inputs} />
        ) : (
          <button
            onClick={handleStart}
            disabled={processingMatch}
            className={`bg-yellow-300 p-3 rounded-md text-2xl flex items-center justify-center gap-2 transition-opacity duration-200 ${
              processingMatch ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            title="Iniciar"
          >
            {processingMatch ? (
              <>
                <FaSpinner className="animate-spin" />
                Processando...
              </>
            ) : (
              'Iniciar'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
