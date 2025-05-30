import { createContext, useContext, useState } from 'react';
import { IApiUserReturn } from '@/contexts/user';
import { useInfo } from '@/contexts/user';
import { ENotificationType, useNotification } from './notifications';
interface ILoginData {
  username: string;
  password: string;
}
interface IRegisterData {
  username: string;
  password: string;
  email?: string;
}
export interface IStartGame {
  matchToken: string;
  expireIn: string;
}
export interface IInput {
  key: string;
  time: number;
}
interface IFinishGameReturn {
  position: string;
  time: number;
}

export interface IRankingReturn {
  position: number;
  username: string;
  duration_ms: number;
  played_at: string;
}

interface IFinishGame {
  token: string;
  input: IInput[];
}
interface IFinishRecoverPassword {
  token: string;
  password: string;
}
interface ISetEmail {
  email: string;
}
interface IVerifyEmail {
  token: string;
}
interface IEditPassword {
  password: string;
}
interface IStartRecoverPassword {
  identifier: string;
}
interface contextData {
  getUserData: () => Promise<void | null>;
  login: (data: ILoginData) => Promise<Response | null>;
  register: (data: IRegisterData) => Promise<Response | null>;
  startRecoverPassword: (data: IStartRecoverPassword) => Promise<Response | null>;
  editPassword: (data: IEditPassword) => Promise<Response | null>;
  verifyEmail: (data: IVerifyEmail) => Promise<boolean>;
  finishRecoverPassword: (data: IFinishRecoverPassword) => Promise<boolean>;
  logout: () => Promise<boolean>;
  startVerifyEmail: () => Promise<boolean>;
  setEmail: (data: ISetEmail) => Promise<Response | null>;
  getRanking: () => Promise<IRankingReturn[] | null>;
  getMatchs: () => Promise<IRankingReturn[] | null>;
  startGame: () => Promise<IStartGame | null>;
  finishGame: (data: IFinishGame) => Promise<IFinishGameReturn | null>;
}
const BASE_URL = 'https://alphabet-api.onrender.com';

export const apiContext = createContext<contextData>({} as contextData);
export const useAPI = () => {
  return useContext(apiContext);
};
export const ApiContext = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, setUserInfo, setIsLoggedIn } = useInfo();
  const { setNotifications, generateId } = useNotification();
  const getUserData = async (): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) return;
      const data = await response.json();
      setUserInfo({
        emailStatus: data.data.emailStatus,
        username: data.data.username,
        verifyEmailTokenExpiresAt: data.data.verifyEmailTokenExpiresAt,
      });
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      setIsLoggedIn(false);
    }
  };
  const login = async ({ password, username }: ILoginData): Promise<Response | null> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        await getUserData();
      }
      return response;
    } catch (err) {
      return null;
    }
  };
  const register = async ({ password, username, email }: IRegisterData): Promise<Response | null> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      return response;
    } catch (err) {
      return null;
    }
  };
  const logout = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) return false;
      setIsLoggedIn(false);
      return true;
    } catch (err) {
      return false;
    }
  };
  const startGame = async (): Promise<IStartGame | null> => {
    try {
      const response = await fetch(`${BASE_URL}/game/start`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    } catch (err) {
      return null;
    }
  };
  // revisar
  const finishGame = async ({ input, token }: IFinishGame): Promise<IFinishGameReturn | null> => {
    try {
      const response = await fetch(`${BASE_URL}/game/finish`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchToken: token, input: input }),
      });
      if (!response.ok) {
        let errorBody;
        try {
          errorBody = await response.json(); // aqui, esse retorno está estranho
        } catch (e) {
          console.error('Erro ao ler o corpo da resposta:', e);
        }
        console.error('Erro na API:', response.status, errorBody);
        return null;
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      return null;
    }
  };
  const getRanking = async (): Promise<IRankingReturn[] | null> => {
    try {
      const response = await fetch(`${BASE_URL}/game/ranking`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      const returnData = data.data as IRankingReturn[];
      if (!returnData) return null;
      return returnData;
    } catch (err) {
      return null;
    }
  };

  const setEmail = async ({ email }: ISetEmail): Promise<Response | null> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/addemail`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      return response;
    } catch (err) {
      return null;
    }
  };

  const startVerifyEmail = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/startvalidadeemail`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return true;
      } else {
        const errorBody = await response.json();
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const verifyEmail = async ({ token }: IVerifyEmail): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/validadeemail`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      });

      if (response.ok) {
        return true;
      } else {
        let errorBody = await response.json();
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const editPassword = async ({ password }: IEditPassword): Promise<Response | null> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/editpassword`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password }),
      });
      return response;
    } catch (err) {
      return null;
    }
  };

  const getMatchs = async (): Promise<IRankingReturn[] | null> => {
    try {
      const response = await fetch(`${BASE_URL}/game/mymatchs`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      const returnData = data.data as IRankingReturn[];
      if (!returnData) return null;
      return returnData;
    } catch (err) {
      return null;
    }
  };

  const startRecoverPassword = async ({ identifier }: IStartRecoverPassword): Promise<Response | null> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/startrecoverpassword`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier }),
      });
      return response;
    } catch (err) {
      return null;
    }
  };
  const finishRecoverPassword = async ({ password, token }: IFinishRecoverPassword): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/recoverpassword`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password, token: token }),
      });
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const value = {
    getUserData,
    login,
    startGame,
    finishGame,
    logout,
    register,
    getRanking,
    setEmail,
    verifyEmail,
    startVerifyEmail,
    editPassword,
    getMatchs,
    startRecoverPassword,
    finishRecoverPassword,
  };
  return <apiContext.Provider value={value}>{children}</apiContext.Provider>;
};
