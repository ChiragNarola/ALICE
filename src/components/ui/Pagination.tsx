import Button from "./Button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalEntries: number;
    pageSize: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalEntries,
    pageSize,
    pageSizeOptions = [5, 10, 20, 50],
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const startEntry = (currentPage - 1) * pageSize + 1;
    const endEntry = Math.min(currentPage * pageSize, totalEntries);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    function getVisiblePages(current: number, total: number, maxVisible = 5) {
        const pages: (number | "...")[] = [];
        if (total <= maxVisible) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const left = Math.max(2, current - 1);
        const right = Math.min(total - 1, current + 1);

        pages.push(1);

        if (left > 2) {
            pages.push("...");
        }

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        if (right < total - 1) {
            pages.push("...");
        }

        pages.push(total);

        return pages;
    }


    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
            {/* Showing entries info */}
            <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium">{startEntry}</span> to{" "}
                <span className="font-medium">{endEntry}</span> of{" "}
                <span className="font-medium">{totalEntries}</span> entries
            </span>

            {/* Pagination buttons */}
            <nav aria-label="Page navigation">
                <ul className="flex flex-wrap items-center gap-2">
                    {/* Previous button */}
                    <li>
                        <Button
                            variant="tealOutline"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            {"<"}
                        </Button>
                    </li>

                    {/* Page numbers with ellipsis */}
                    {getVisiblePages(currentPage, totalPages).map((num, index) => (
                        <li key={index}>
                            {num === "..." ? (
                                <span className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                                <Button
                                    variant={num === currentPage ? "teal" : "tealOutline"}
                                    onClick={() => onPageChange(num as number)}
                                >
                                    {num}
                                </Button>
                            )}
                        </li>
                    ))}


                    {/* Next button */}
                    <li>
                        <Button
                            variant={currentPage === totalPages ? "grey" : "tealOutline"}
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            {">"}
                        </Button>
                    </li>
                </ul>
            </nav>

            {/* Rows per page dropdown */}
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                    Rows per page:
                </label>
                <select
                    className="text-sm border rounded-md px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
