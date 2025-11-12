import { useEffect, useRef } from "react";

export function useAutoLock(
    lockCallBack: () => void , 
    timeout: number= 120000
){
    const timer = useRef<number | null>(null);

    const resetTimer = () => {
        if(timer.current){
            clearTimeout(timer.current)
        }
        timer.current=window.setTimeout(lockCallBack,timeout)
    };

    useEffect(() => {
        const events =["mousemove","scroll","keydown","click"];
        events.forEach((event)=>window.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            events.forEach((event)=> window.removeEventListener(event,resetTimer));
            if(timer.current) clearTimeout(timer.current);
        };
    }, [timeout, lockCallBack]

    );
    return null;
}