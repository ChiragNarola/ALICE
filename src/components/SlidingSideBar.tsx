
interface SlidingSideBarProps {
    onSlide: boolean;
    onToggle?: () => void; // Optional callback to notify parent of toggle
}

const SlidingSideBar = ({ onSlide, onToggle }: SlidingSideBarProps) => {
    return (
        <main
            className={`
                ${onSlide ? 'w-[100%]' : 'w-0'}
                overflow-hidden h-full border-2 bg-gray-300
                transition-all duration-700 ease-in-out relative z-50
            `}
        >
            <div className="flex w-full mt-2 px-1 justify-between">
                <div>sideSlideBar</div>
                <span
                    onClick={onToggle}
                    className="material-symbols-outlined text-gray-700 cursor-pointer font-bold"
                >
                    menu
                </span>
            </div>
        </main>
    );
};

export default SlidingSideBar;
