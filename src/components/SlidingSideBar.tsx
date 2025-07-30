import { useChatVisibility } from "../contexts/ChatVisibilityContext";

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
    useChatVisibility();
    return (
        <main
            className={`
                fixed top-0 left-0 h-full z-50
                bg-teal-50 shadow-lg
                transition-transform duration-700 ease-in-out
                ${onSlide ? 'translate-x-0' : '-translate-x-full'}
                w-64
                md:static md:translate-x-0 md:w-64
            `}
            style={{ maxWidth: '80vw' }} // Optional: limit width on mobile
        >
            {onSlide && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}
            <div className="flex w-full mt-2 px-1 font-extrabold text-emerald-950 justify-between">
                <div>Chats</div>
                <span
                    onClick={onToggle}
                    className="material-symbols-outlined text-gray-700 cursor-pointer font-bold"
                >
                    menu
                </span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto h-[calc(100vh-120px)] px-2">
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
