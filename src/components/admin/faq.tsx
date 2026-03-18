import { BadgeQuestionMark, Search } from "lucide-react"
import { useEffect, useState, useRef } from "react";
import type { FAQItem } from "../../routes/models/response/Response";
import { Table, Th, Td } from "../ui/Table";
import Pagination from "../ui/Pagination";
import { getFAQ, updateAliceAnswer, generateFAQ } from "../../api/api-services";
import { toast } from "react-toastify";
import type { UpdateFAQ } from "../../routes/models/response/Response";
import Button from "../ui/Button";


export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<{ [key: number]: string }>({});


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

  const cleanMarkdown = (text: string) => {
    if (!text) return "";
    return text
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
      .replace(/(\*|_)(.*?)\1/g, "$2")    // italic
      .replace(/###\s*(.*)/g, "$1")       // H3 headings
      .replace(/##\s*(.*)/g, "$1")        // H2 headings
      .replace(/#\s*(.*)/g, "$1")         // H1 headings
      .replace(/[-*]\s+/g, "")            // list markers
      .replace(/\n+/g, " ")               // newlines → space
      .trim();
  };


  const fetchFAQList = async () => {
    setLoading(true);
    try {
      const res = await getFAQ();
      if (res?.IsSuccess && Array.isArray(res.Data)) {
        const cleaned: FAQItem[] = res.Data.map((h: any) => ({
          id: h.id,
          question: h.questions,
          AI_answer: cleanMarkdown(h.ai_response),
          human_answer: h.alice_answer,
        }));
        setFaqs(cleaned);
      } else {
        toast.error(res?.Message || "Failed to load FAQ list")
      }
    } catch (err: any) {
      toast.error(err?.Message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQList();
  }, []);

  const saveTimeouts = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const handleAutoSave = (id: number, value: string) => {
    if (saveTimeouts.current[id]) clearTimeout(saveTimeouts.current[id]);

    saveTimeouts.current[id] = setTimeout(async () => {
      if (!value.trim()) return;

      try {
        const payload: UpdateFAQ = {
          id,
          alice_answer: value,
        };
        const res = await updateAliceAnswer(payload);
        if (res.IsSuccess) {
          setFaqs((prev) =>
            prev.map((faq) =>
              faq.id === id ? { ...faq, human_answer: value } : faq
            )
          );
          toast.success("Answer saved!");
          setEditedAnswers((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        } else {
          toast.error(res.Message || "Failed to save answer");
        }
      } catch (err: any) {
        toast.error(err?.Message || "Error saving answer");
      }
    }, 2000);
  };

  const handleGenerateFAQ = async () => {
    try {
      setLoading(true);
      const res = await generateFAQ();

      if (res?.IsSuccess && Array.isArray(res.Data)) {
        const cleaned: FAQItem[] = res.Data.map((h: any) => ({
          id: h.id,
          question: h.questions,
          AI_answer: cleanMarkdown(h.ai_response),
          human_answer: h.alice_answer,
        }));

        setFaqs(cleaned);
        toast.success("FAQ generated successfully!");
        await fetchFAQList();
      } else {
        toast.error(res?.Message || "Failed to generate FAQs");
      }

    } catch (err: any) {
      toast.error(err?.Message || "Error generating FAQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BadgeQuestionMark className="w-6 h-6 text-indigo-600" />
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

        {/* Generate FAQ Button */}
        <div className="ml-auto">
          <Button
            onClick={handleGenerateFAQ}
            variant="teal"
            className="h-10 rounded-lg shadow"
          >
            Generate FAQ
          </Button>
        </div>

      </div>


      {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table className="table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <Th>Sr.No</Th>
              <Th>Question</Th>
              <Th>AI Answer</Th>
              <Th>Alice Answer</Th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 px-1">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedFaq.length === 0 ? (
              <tr>
                <Td colSpan={5} className="text-center text-gray-500 py-4">
                  No questions found.
                </Td>
              </tr>
            ) : (
              paginatedFaq.map((faq, index) => (
                <tr key={faq.id} className="border-b">
                  {/* Sr.No  */}
                  <Td className="sticky left-0 bg-white z-10 w-16">
                    {(currentPage - 1) * pageSize + index + 1}
                  </Td>

                  {/* Question */}
                  <Td className="p-0 w-48">
                    <div className="h-20 overflow-auto px-2 py-1 whitespace-pre-wrap">
                      {faq.question}
                    </div>
                  </Td>

                  {/* AI Answer */}
                  <Td className="p-0 w-80">
                    <div className="h-20 overflow-auto px-2 py-1 whitespace-pre-wrap">
                      {faq.AI_answer}
                    </div>
                  </Td>

                  {/* Alice Answer */}
                  <Td className="p-0 w-80">
                    <textarea
                      className="
                w-full h-20 overflow-auto
                text-sm text-gray-900
                bg-transparent border-none outline-none resize-none
                px-2 py-1 whitespace-pre-wrap
              "
                      value={editedAnswers[faq.id] ?? faq.human_answer}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditedAnswers({ ...editedAnswers, [faq.id]: value });
                        handleAutoSave(faq.id, value);
                      }}
                    />

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