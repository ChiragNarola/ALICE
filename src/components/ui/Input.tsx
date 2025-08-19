interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export default function SearchInput({ className = "", ...props }: SearchInputProps) {
    return (
        <div className="relative w-full max-w-sm">
            <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm ${className}`}
                {...props}
            />
        </div>
    );
}
