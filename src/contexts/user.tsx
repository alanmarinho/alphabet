import { createContext, useContext, useState } from 'react';

export enum EEmailStatus {
  notSet = 'notSet',
  verificationPending = 'validationPending',
  verified = 'verified',
  unknown = 'unknown',
}

export interface IApiUserReturn {
  username: string;
  emailStatus: EEmailStatus;
  verifyEmailTokenExpiresAt?: string;
}

interface IUserInfo extends IApiUserReturn {}

interface contextData {
  isLoggedIn: boolean;
  rankingShow: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: IUserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<IUserInfo>>;
  setRankingShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export const infosContext = createContext<contextData>({} as contextData);
export const useInfo = () => {
  return useContext(infosContext);
};

export const InfoContext = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [rankingShow, setRankingShow] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<IUserInfo>({
    username: '',
    emailStatus: EEmailStatus.unknown,
  });

  const value = {
    userInfo: userInfo,
    setUserInfo: setUserInfo,
    isLoggedIn,
    setIsLoggedIn,
    rankingShow,
    setRankingShow,
  };
  return <infosContext.Provider value={value}>{children}</infosContext.Provider>;
};
