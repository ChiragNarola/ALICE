interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "grey" | "darkGrey" | "teal" | "tealOutline";
}

export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) {
    const base = "px-4 py-2 rounded-lg font-medium focus:outline-none transition";

    const variants: Record<string, string> = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
        grey: "bg-gray-300 text-gray-800 hover:bg-gray-400",
        darkGrey: "bg-gray-700 text-white hover:bg-gray-600",
        teal: "bg-teal-800 text-white hover:bg-teal-900",
        tealOutline: "bg-transparent text-teal-800 border border-teal-800 hover:bg-teal-800 hover:text-white",
    };

    return (
        <button
            className={`${base} ${variants[variant] || ""} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
