import logo from "../../../assets/images/favicon.ico"
import Avatar from 'react-avatar';
import { useState , useEffect } from "react";

import {
Bell,      
} from "lucide-react";

export function Header() {
const [UserName, setUserName] = useState<string>()

 useEffect(()=>{
 const user = localStorage.getItem("auth_user");

    if (user) {
      const parsedUser = JSON.parse(user);
      setUserName(`${parsedUser.firstName} ${parsedUser.lastName}`)
    }
  },[])

  return (
    <header className="h-16 border-b border-alice-gray bg-alice-peach">
      <div className="flex items-center justify-between h-full px-4">
     {/* <div>
        <div className="font-bold text-xl sm:text-2xl text-emerald-950">A.L.I.C.E.</div>
        <div className="text-xs sm:text-sm font-semibold text-emerald-950">AI Learning, Insights & Childcare Expert</div>
      </div> */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Notification button with badge */}
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-[#d6f5f5]">
            <span className="absolute top-2 flex h-[25px] w-[25px] items-center justify-center rounded-full  text-black text-[30px] font-medium">
            <Bell />
            </span>
          </button>

          {/* User Avatar */}
          <div className="relative flex items-center space-x-2 p-1 h-8 rounded-full hover:bg-[#d6f5f5] cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-[#008080] text-white flex items-center justify-center text-sm font-medium">
              <Avatar name={UserName} size="33" round={true} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
