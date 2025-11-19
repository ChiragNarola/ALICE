import { useState, useEffect } from "react";
import type { NurseryDTO, CreateNurseryDTO } from "../../../routes/models/response/Response"
import { toast } from "react-toastify"
import { createNursery, getNursery } from "../../../api/api-services"
import {School, Search} from "lucide-react"
import Button from "../../ui/Button";
import { Table, Th, Td } from "../../ui/Table";
import AddNurseryModal from "./AddNurseryModal";
import Pagination from "../../../components/ui/Pagination";


interface Nursery{
    nursery_name: string,
    description: string
}

export default function Nursery(){

    const[nursery,setNursery]=useState<NurseryDTO[]>([]);
    const[search,setSearch]= useState("");
    const[currentPage,setCurrentPage]=useState(1);
    const[loading,setLoading]=useState(false);
    const[pageSize,setPageSize]=useState(5);
    const[isModalOpen,setIsModalOpen]=useState(false);

    const handleAddNursery = async(nursery_name: string, description: string) =>{
        if(!nursery_name){
            toast.error("Nursery name cannot be empty");
            return;
        }
        try{
            const payload: CreateNurseryDTO = {nursery_name,description}
            const res= await createNursery(payload);
            if (res?.IsSuccess) {
                setNursery((prev) => [res.Data, ...prev]);
                toast.success("Nursery added successfully!");
                setIsModalOpen(false);
            } else {
                toast.error(res?.Message || "Failed to add nursery.");
            }
        }catch (error: any){
            console.error(error);
            toast.error(error?.Message || "Failed to add nursery.");
        }
    };

    const fetchNursery= async () => {
        setLoading(true);
        try {
          const res = await getNursery();
          if (res?.IsSuccess && Array.isArray(res.Data)) {
            const cleaned: NurseryDTO[] = res.Data.map((h: any) => ({
              id: h.id,
              nursery_name: h.nursery_name,
              description: h.description,
            }));
            setNursery(cleaned);
          } else {
            toast.error(res?.Message || "Failed to load nursery");
          }
        } catch (err: any) {
          toast.error(err?.Message || "Failed to load nursery");
        } finally {
          setLoading(false);
        }
      };
    
    useEffect(() => {
        fetchNursery();
        }, []);

    const filteredNursery = nursery.filter((nursery) => {
    const matchesSearch =
            search.trim() === "" ||
            nursery.nursery_name.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
        });

    const totalRecords = filteredNursery.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedNursery = filteredNursery.slice(start, start + pageSize);

    return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <School className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Nursery Management</h1>
            <p className="text-sm text-gray-500">View, search, and manage nursery in your system.</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 w-full mt-4">
        {/* Search */}
        <div className="flex w-72 flex-col">
          <label htmlFor="nursery-search" className="mb-1 text-sm font-medium text-gray-700">
            Search by nursery name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="nursery-search"
              type="text"
              placeholder="Search nursery..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Add Nursery Button */}
        <div className="ml-auto">
            <Button
            onClick={() => setIsModalOpen(true)}
            variant="teal"
            className="h-10 rounded-lg shadow"
            >
            + Add Nursery
            </Button>
        </div>
        </div>

        {/* Table */}
      <div className="overflow-hidden border rounded-lg shadow-sm mt-4">
        <Table>
            <thead className="bg-gray-100">
            <tr>
                <Th>Sr.No</Th>
                <Th>Nursery Name</Th>
                <Th>Description</Th>
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
            ) : paginatedNursery.length === 0 ? (
                <tr>
                <Td colSpan={4} className="text-center text-gray-500 py-4">
                    No nurseries found.
                </Td>
                </tr>
            ) : (
                paginatedNursery.map((nursery, index) => (
                <tr
                    key={nursery.id}
                    className="border-b hover:bg-gray-50 transition"
                >
                    <Td>{(currentPage - 1) * pageSize + index + 1}</Td>
                    <Td className="font-medium text-gray-900">{nursery.nursery_name}</Td>
                    <Td>{nursery.description}</Td>
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


        {/* modal */}
        <AddNurseryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddNursery}
        />

    </div>
    )

}