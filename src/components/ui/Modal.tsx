interface ModalProps {
    title: string;
    children: any;
    onClose: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
