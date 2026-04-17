import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const AliceSelect: React.FC<SelectProps> = ({ options, value, onChange, placeholder, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl 
                    transition-all font-semibold text-gray-900 shadow-sm group
                    ${isOpen ? "ring-4 ring-alice-teal/10 border-alice-teal/30" : "hover:border-alice-teal/30"}
                `}
            >
                <span className={`text-sm tracking-tight ${!selectedOption ? "text-gray-300" : "text-gray-900"}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-alice-teal" : "text-gray-400"}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 pr-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center justify-between px-5 py-3 text-left transition-all
                                    ${value === opt.value 
                                        ? "bg-alice-teal text-white" 
                                        : "text-gray-600 hover:bg-gray-50 hover:text-alice-teal"}
                                `}
                            >
                                <span className="text-xs font-semibold">{opt.label}</span>
                                {value === opt.value && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AliceSelect;
