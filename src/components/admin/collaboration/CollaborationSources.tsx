import React, { useState } from "react";
import { Plus, Users, BadgeCheck, Hourglass, Activity, Mail } from "lucide-react";
import Button from "../../ui/Button";

interface Source {
    id: number;
    name: string;
    referredCount: number;
    color: string;
    email: string;
    code: string;
}

const CollaborationSources: React.FC = () => {
    const [sources, setSources] = useState<Source[]>([
        { id: 1, name: "NUURI", referredCount: 124, color: "bg-emerald-500", email: "contact@nuuri.com", code: "NUURI78" },
        { id: 2, name: "ABC Nursery", referredCount: 56, color: "bg-indigo-500", email: "info@abcnursery.co.uk", code: "ABC99" },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newSource, setNewSource] = useState({ name: "", email: "" });

    const handleAddSource = (e: React.FormEvent) => {
        e.preventDefault();
        const code = (newSource.name.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900));
        const added: Source = {
            id: Date.now(),
            name: newSource.name,
            referredCount: 0,
            color: `bg-${["rose", "amber", "sky", "violet"][Math.floor(Math.random() * 4)]}-500`,
            email: newSource.email,
            code: code,
        };
        setSources([...sources, added]);
        setNewSource({ name: "", email: "" });
        setIsAdding(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 p-4 md:p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Sources List & Form (Left 2 columns) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 px-1">Active Sources</h3>
                        <p className="text-sm text-gray-400 px-1">Manage active partnerships and referral links.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`
                            border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center space-x-3 md:space-x-4 
                            text-alice-teal hover:border-alice-teal hover:bg-alice-teal/5 hover:shadow-lg transition-all duration-300
                            ${isAdding ? "border-alice-teal bg-alice-teal/5" : ""}
                        `}
                    >
                        <div className="p-1.5 md:p-2 bg-alice-teal/10 rounded-lg md:rounded-xl">
                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <span className="font-semibold text-xs md:text-sm tracking-wide text-alice-teal whitespace-nowrap">Add source</span>
                    </button>
                </div>

                {/* Sources Chips */}
                <div className="flex flex-wrap gap-4">
                    {sources.map((source) => (
                        <div 
                            key={source.id} 
                            className="w-full bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default"
                        >
                            <div className={`w-2.5 h-10 rounded-full ${source.color} shadow-sm group-hover:scale-110 transition-transform`} />
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-gray-900 text-base">{source.name}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded uppercase tracking-wider">
                                        {source.code}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-semibold mt-0.5 uppercase tracking-wider">{source.referredCount} Users Referred</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inline Form */}
                {isAdding && (
                    <form 
                        onSubmit={handleAddSource}
                        className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-4 animate-in zoom-in-95 duration-300"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Source Name</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input 
                                        required
                                        placeholder="e.g. Wonderland Nursery"
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-alice-teal focus:outline-none text-sm"
                                        value={newSource.name}
                                        onChange={e => setNewSource({...newSource, name: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 ml-1">Contact Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input 
                                        required
                                        type="email"
                                        placeholder="partner@example.com"
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-alice-teal focus:outline-none text-sm"
                                        value={newSource.email}
                                        onChange={e => setNewSource({...newSource, email: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="bg-alice-teal text-white px-10 py-3 rounded-xl shadow-lg shadow-alice-teal/20 hover:-translate-y-0.5 transition-all">
                                Generate Source
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Stats Panel (Right Column) */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 px-1">Source Performance</h3>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-alice-teal text-white rounded-xl shadow-lg shadow-alice-teal/20">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner Hub</p>
                                <h4 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">1,248</h4>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-alice-teal/5 rounded-2xl border border-alice-teal/10 text-center group hover:scale-[1.02] transition-transform shadow-sm">
                        <p className="text-[10px] text-alice-teal uppercase font-semibold tracking-widest mb-1 opacity-80">Top Performer</p>
                        <p className="text-lg font-semibold text-gray-900 leading-tight">NUURI Kindergarten</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { label: "Approved Users", val: "842", icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                            { label: "Pending Review", val: "156", icon: Hourglass, color: "text-amber-600", bg: "bg-amber-50/50" },
                            { label: "Active Partners", val: "12", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50/50" },
                        ].map((stat, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 ${stat.bg} rounded-2xl border border-gray-100 shadow-sm hover:scale-[1.02] transition-transform group`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-white ${stat.color} shadow-sm group-hover:rotate-6 transition-transform`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <span className="text-xl font-semibold text-gray-900">{stat.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollaborationSources;
