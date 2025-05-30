import { useInfo } from '@/contexts/user';
import { IoMdMenu } from 'react-icons/io';
import { PiRanking } from 'react-icons/pi';
interface IHeader {
  showLogo: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ showLogo, setShowSidebar }: IHeader) {
  const { userInfo, isLoggedIn, rankingShow, setRankingShow } = useInfo();

  return (
    <header className="w-fullpx-10 py-10 px-10">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        {!showLogo ? (
          <div className="flex p-4 gap-5 bg-white rounded hover:cursor-default">
            <img src="https://raw.githubusercontent.com/alanmarinho/utils/main/icons/logo.svg" alt="logo" />
            <p className="text-black text-xl">Alphabet</p>
          </div>
        ) : (
          <div></div>
        )}
        <div className="flex gap-5">
          <div className="hidden md:flex p-2 gap-5 hover:cursor-default bg-white rounded">
            {isLoggedIn ? (
              <div className="flex gap-3 items-center justify-center">
                <p className="text-black text-xl">{userInfo.username}</p>
                <div className="bg-slate-100 p-2 rounded-full">
                  <img className="w-7 h-7" src="/alien.svg" alt="profile" />
                </div>
              </div>
            ) : (
              <>
                <p className="text-black text-md">Para participar do ranking é necessário login.</p>
              </>
            )}
          </div>

          <div onClick={() => setShowSidebar(true)} className="flex md:hidden p-4 gap-5 bg-white rounded">
            <IoMdMenu size={20} />
          </div>
          {!rankingShow ? (
            <div
              onClick={() => {
                setRankingShow(!rankingShow);
              }}
              className="hidden md:flex bg-purple-500 cursor-pointer p-2 justify-center items-center rounded-md"
            >
              <PiRanking color="#fff" size={30} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
