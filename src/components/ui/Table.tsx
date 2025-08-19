export function Table({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`overflow-x-auto bg-white rounded-xl shadow-sm ${className}`}
        >
            <table className="min-w-full border-collapse text-sm">{children}</table>
        </div>
    );
}

export function Th({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <th
            className={`px-6 py-3 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b ${className}`}
        >
            {children}
        </th>
    );
}

export function Td({
    children,
    className = "",
    colSpan = 1,
}: {
    children: React.ReactNode;
    className?: string;
    colSpan?: number;
}) {
    return (
        <td className={`px-6 py-4 text-gray-700 border-b ${className}`} colSpan={colSpan}>
            {children}
        </td>
    );
}

