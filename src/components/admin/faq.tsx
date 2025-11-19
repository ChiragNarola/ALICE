import { BadgeQuestionMark, Search, SaveIcon} from "lucide-react"
import { useEffect, useState } from "react";
import type { FAQItem } from "../../routes/models/response/Response";
import { Table, Th, Td } from "../ui/Table";
import Pagination from "../ui/Pagination";
import Button from "../ui/Button";




export default function FAQ(){
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [loading, setLoading] = useState(false);


    const filteredFaq = faqs.filter((faq) => {
    const matchesSearch =
            search.trim() === "" ||
            faq.question.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
        });

    const totalRecords = filteredFaq.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedFaq = filteredFaq.slice(start, start + pageSize);

    const handleSave = async (id:number) =>{

    }


    return (
        <div className="p-6 space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BadgeQuestionMark  className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">FAQ Management</h1>
            <p className="text-sm text-gray-500">View FAQ and AI answer</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 w-full mt-4">
        {/* Search */}
        <div className="flex w-72 flex-col">
          <label htmlFor="doc-search" className="mb-1 text-sm font-medium text-gray-700">
            Search by question
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="question-search"
              type="text"
              placeholder="Search question..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table>
            <thead className="bg-gray-100">
            <tr>
                <Th>Sr.No</Th>
                <Th>Question</Th>
                <Th>Alice Answer</Th>
                <Th>Actions</Th>
            </tr>
            </thead>

            <tbody>
            {loading ? (
                <tr>
                <td colSpan={4} className="text-center py-6">
                    <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 px-1">Loading...</span>
                    </div>
                </td>
                </tr>
            ) : paginatedFaq.length === 0 ? (
                <tr>
                <Td colSpan={4} className="text-center text-gray-500 py-4">
                    No questions found.
                </Td>
                </tr>
            ) : (
                paginatedFaq.map((faq, index) => (
                <tr
                    key={faq.id}
                    className="border-b hover:bg-gray-50 transition"
                >
                    <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                    <Td className="font-medium text-gray-900">{faq.question}</Td>
                    {/* add text box here */}
                    <Td>{faq.human_answer}</Td> 
                    <Td>
                    <div className="flex space-x-2">
                    <Button
                        onClick={() => handleSave(faq.id)}
                        title="Save Alice Answer"
                    >
                        <SaveIcon className="w-4 h-4" />
                    </Button>
                    </div>
                </Td>
                </tr>
                ))
            )}
            </tbody>
        </Table>
        </div>

        {/* Pagination */}
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalEntries={totalRecords}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      </div>
    )

}