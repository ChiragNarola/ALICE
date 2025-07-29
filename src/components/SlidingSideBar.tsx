
interface SlidingSideBarProps {
    onSlide: boolean;
    onToggle?: () => void; // Optional callback to notify parent of toggle
}

const chatSections = [
    "GRPC SERVER",
    "TypeScript zod Validation",
    "Trello SMS Service",
    "Async Validation Fix",
    "Call Stack in Compilers",
    "Trailing Zeroes Optimization",
    "Zendesk gRPC Integration",
    "Winners Logic",
    "Meaning of Indelibly",
    "Raffle Goal Not Met",
    "Unix Timestamp Conversion",  
    "Async Validation Fix",
    "Call Stack in Compilers",
    "Trailing Zeroes Optimization",
    "Zendesk gRPC Integration",
    "Winners Logic",
    "Meaning of Indelibly",
    "Raffle Goal Not Met",
    "Unix Timestamp Conversion", 
    "TypeScript zod Validation",
    "Trello SMS Service",
    "Async Validation Fix",
    "Call Stack in Compilers",
    "Trailing Zeroes Optimization",
    "Zendesk gRPC Integration",
    "Winners Logic",
    "Meaning of Indelibly",
    "Raffle Goal Not Met",
    "Unix Timestamp Conversion",
    "Async Validation Fix",
    "Call Stack in Compilers",
    "Trailing Zeroes Optimization",
    "Zendesk gRPC Integration",
    "Winners Logic",
    "Meaning of Indelibly",
    "Raffle Goal Not Met"
];

const SlidingSideBar = ({ onSlide, onToggle }: SlidingSideBarProps) => {
    return (
        <main
            className={`
                ${onSlide ? 'w-[100%]' : 'w-0'}
                overflow-hidden h-full bg-teal-50
                transition-all duration-700 ease-in-out relative z-50
            `}
        >
            <div className="flex w-full mt-2 px-1 font-extrabold text-emerald-950 justify-between">
                <div>A.L.I.C.E</div>
                <span
                    onClick={onToggle}
                    className="material-symbols-outlined text-gray-700 cursor-pointer font-bold"
                >
                    menu
                </span>
            </div>

            <div className="mt-2 px-3 py-[12px] text-sm font-semibold tracking-wide">
                Chats
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto h-[66vh] px-2">
                {chatSections.map((title, idx) => (
                    <div
                        key={idx}
                        className="px-3 py-3  rounded hover:bg-[#343541] hover:text-teal-200  cursor-pointer text-sm"
                    >
                        {title}
                    </div>
                ))}
            </div>
        </main>
    );
};

export default SlidingSideBar;
