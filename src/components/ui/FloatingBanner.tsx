import { useState } from "react";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";

interface FloatingAppBannerProps {
  excludedRoutes?: string[];
}

const FloatingAppBanner = ({ excludedRoutes = [] }: FloatingAppBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { pathname } = useLocation();

  const isHidden =
    dismissed ||
    excludedRoutes.some((route) => pathname.startsWith(route));

  if (isHidden) return null;

  if (dismissed) return null;


  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center group">
      {/* Expandable Panel */}
      <div className="flex items-center bg-white shadow-xl border border-alice-gray rounded-l-2xl overflow-hidden transition-all duration-300 ease-in-out w-[44px] group-hover:w-[200px]">
        
        {/* Tab handle (always visible) */}
        <div className="flex-shrink-0 w-[44px] bg-alice-teal flex flex-col items-center justify-center py-5 gap-3 cursor-pointer">
          <span className="text-white text-[10px] font-bold tracking-widest rotate-180"
            style={{ writingMode: "vertical-rl" }}>
            GET APP
          </span>
        </div>

        {/* Content (revealed on hover) */}
        <div className="flex flex-col items-start px-3 py-4 gap-3 min-w-[156px]">
          <div className="flex items-center justify-between w-full gap-2">
        <div>
        <p className="text-[9px] font-extrabold text-alice-teal uppercase tracking-wide">
            Download App!
        </p>
        </div>

        <button
        onClick={() => setDismissed(true)}
        className="rounded-full p-1 text-alice-darkgray hover:bg-gray-100 hover:text-red-500 transition-all"
        aria-label="Close"
        >
        <X size={14} />
        </button>
    </div>

          <a
            href="https://play.google.com/store/apps/details?id=com.aliceAi"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="h-[40px] w-auto"
            />
          </a>

          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105 active:scale-95"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-[45px] w-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FloatingAppBanner;