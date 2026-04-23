import React, { useState } from "react";
import { FileText, Upload, Trash2, Download, Search, Info } from "lucide-react";
import Button from "../../ui/Button";

import AliceSelect from "../../ui/AliceSelect";

interface DocFile {
    id: number;
    name: string;
    source: string;
    type: string;
    size: string;
    date: string;
}

const CollaborationDocuments: React.FC = () => {
    const [docs] = useState<DocFile[]>([
        { id: 1, name: "Nuuri_Agreement_2024.pdf", source: "NUURI", type: "Agreement/MoU", size: "2.4 MB", date: "2024-03-15" },
        { id: 2, name: "Marketing_Kit_ABC.png", source: "ABC Nursery", type: "Marketing material", size: "1.1 MB", date: "2024-03-20" },
    ]);

    const [source, setSource] = useState("NUURI");
    const [category, setCategory] = useState("Agreement/MoU");
    const [dragActive, setDragActive] = useState(false);

    const sourceOptions = [
        { label: "NUURI", value: "NUURI" },
        { label: "ABC Nursery", value: "ABC Nursery" },
        { label: "General", value: "General" }
    ];

    const categoryOptions = [
        { label: "Agreement/MoU", value: "Agreement/MoU" },
        { label: "Onboarding kit", value: "Onboarding kit" },
        { label: "Marketing material", value: "Marketing material" },
        { label: "Other", value: "Other" }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 p-4 md:p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Upload Section */}
            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-alice-teal text-white rounded-xl md:rounded-[1.25rem] shadow-2xl shadow-alice-teal/40 ring-4 md:ring-8 ring-alice-teal/5">
                        <Upload className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Upload Asset</h3>
                        <p className="text-sm text-gray-500 mt-1">Expand partner library with new materials.</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Source Partner</label>
                            <AliceSelect 
                                value={source}
                                onChange={setSource}
                                options={sourceOptions}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Asset Category</label>
                            <AliceSelect 
                                value={category}
                                onChange={setCategory}
                                options={categoryOptions}
                            />
                        </div>
                    </div>

                    <div 
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                        className={`
                            relative border-4 border-dashed rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-16 transition-all duration-500 flex flex-col items-center justify-center text-center group
                            ${dragActive ? "border-alice-teal bg-alice-teal/5 scale-95" : "border-gray-100 hover:border-alice-teal/30 hover:bg-alice-teal/[0.02]"}
                        `}
                    >
                        <div className="p-4 md:p-6 bg-white text-alice-teal rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-2xl shadow-alice-teal/10 ring-4 md:ring-8 ring-alice-teal/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Upload className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                        <p className="text-base md:text-lg font-semibold text-gray-900 tracking-tight">Drop files here to upload</p>
                        <p className="text-[10px] md:text-xs text-gray-400 font-semibold mt-2 uppercase tracking-widest opacity-60 px-4">PDF, DOCX, PNG up to 10MB</p>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-alice-teal/[0.03] rounded-[1.5rem] border border-alice-teal/5 ring-4 ring-alice-teal/5">
                        <div className="p-2 bg-white rounded-xl shadow-sm text-alice-teal">
                            <Info className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-alice-teal leading-relaxed tracking-tight group">
                            Secure Cloud Sync: <span className="text-gray-500 font-semibold">New files are automatically mirrored to the partner's management portal.</span>
                        </p>
                    </div>

                    <Button className="w-full bg-alice-teal text-white rounded-2xl shadow-2xl shadow-alice-teal/20 py-5 font-semibold text-base hover:bg-teal-700 hover:-translate-y-1 transition-all ring-1 ring-white/20 active:scale-95 group/btn overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                        <span className="relative">Synchronize to Library</span>
                    </Button>
                </div>
            </div>

            {/* Document Library List */}
            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-gray-900 text-white rounded-xl md:rounded-[1.25rem] shadow-2xl shadow-black/30 ring-4 md:ring-8 ring-black/5">
                        <FileText className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Shared Assets</h3>
                        <p className="text-sm text-gray-500 mt-1">Master repository for all collaboration files.</p>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-6 top-5 h-5 w-5 text-gray-300 group-focus-within:text-alice-teal transition-colors" />
                    <input 
                        placeholder="Search assets by name or source..."
                        className="w-full pl-16 pr-8 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-alice-teal/10 focus:outline-none font-semibold text-gray-900 placeholder:text-gray-300 transition-all"
                    />
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-alice-teal/10 hover:scrollbar-thumb-alice-teal/20 transition-all">
                    {docs.map((doc) => (
                        <div 
                            key={doc.id}
                            className="group relative bg-white border border-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-2xl transition-all duration-500 flex items-center justify-between hover:-translate-y-1 ring-1 ring-black/[0.02]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-alice-teal text-white transition-all shadow-inner group-hover:shadow-2xl group-hover:shadow-alice-teal/30">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-alice-teal transition-colors truncate max-w-[200px] xl:max-w-xs">{doc.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded uppercase tracking-wider">{doc.type}</span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">{doc.source} Partner</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block min-w-[70px] pr-2">
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-alice-teal transition-colors">{doc.size}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">{new Date(doc.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                    <button className="p-2.5 md:p-3 bg-gray-50 text-gray-400 border border-gray-100 hover:text-white hover:bg-alice-teal hover:border-alice-teal rounded-xl md:rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-alice-teal/20 hover:-translate-y-0.5">
                                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                    <button className="p-2.5 md:p-3 bg-gray-50 text-gray-400 border border-gray-100 hover:text-white hover:bg-rose-500 hover:border-rose-500 rounded-xl md:rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-0.5">
                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CollaborationDocuments;
