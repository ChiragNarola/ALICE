import React, { useState } from "react";
import { Zap } from "lucide-react";
import Button from "../../ui/Button";
import { Table, Th, Td } from "../../ui/Table";

import AliceSelect from "../../ui/AliceSelect";

interface PromoCode {
    id: number;
    code: string;
    source: string;
    discount: number;
    used: number;
    max: number;
    expiry: string;
    status: "Active" | "Expired";
}

const PromoCodes: React.FC = () => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
        { id: 1, code: "WELCOME20", source: "Direct", discount: 20, used: 45, max: 100, expiry: "2026-12-31", status: "Active" },
        { id: 2, code: "NUURI50", source: "NUURI", discount: 50, used: 10, max: 50, expiry: "2026-06-30", status: "Active" },
    ]);

    const [form, setForm] = useState({
        code: "",
        discount: "",
        source: "Direct",
        expiry: "",
        maxUses: "",
        appliesTo: "All plans",
    });

    const sourceOptions = [
        { label: "Direct", value: "Direct" },
        { label: "NUURI", value: "NUURI" },
        { label: "ABC Nursery", value: "ABC Nursery" }
    ];

    const targetOptions = [
        { label: "All plans", value: "All plans" },
        { label: "Parent plan", value: "Parent plan" },
        { label: "Staff plan", value: "Staff plan" }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPromo: PromoCode = {
            id: Date.now(),
            code: form.code,
            source: form.source,
            discount: Number(form.discount),
            used: 0,
            max: Number(form.maxUses),
            expiry: form.expiry,
            status: "Active",
        };
        setPromoCodes([newPromo, ...promoCodes]);
        setForm({ code: "", discount: "", source: "Direct", expiry: "", maxUses: "", appliesTo: "All plans" });
    };

    return (
        <div className="p-4 md:p-10 space-y-8 md:space-y-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Promo Code Form */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-2xl shadow-alice-teal/5">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 md:p-4 bg-alice-teal text-white rounded-xl md:rounded-[1.25rem] shadow-2xl shadow-alice-teal/40 ring-4 md:ring-8 ring-alice-teal/5">
                        <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Create Promo Code</h3>
                        <p className="text-sm text-gray-500 mt-1">Setup new automated distribution rules.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Code Name</label>
                        <input 
                            required
                            placeholder="e.g. SUMMER50"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-900 placeholder:text-gray-300"
                            value={form.code}
                            onChange={e => setForm({...form, code: e.target.value})}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Discount (%)</label>
                        <div className="relative">
                            <input 
                                required
                                type="number"
                                placeholder="0"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-900"
                                value={form.discount}
                                onChange={e => setForm({...form, discount: e.target.value})}
                            />
                            <span className="absolute right-5 top-4 font-semibold text-gray-300">%</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Source Partner</label>
                        <AliceSelect 
                            value={form.source}
                            onChange={val => setForm({...form, source: val})}
                            options={sourceOptions}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Expiry Date</label>
                        <div className="relative">
                            <input 
                                required
                                type="date"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-700"
                                value={form.expiry}
                                onChange={e => setForm({...form, expiry: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Max Uses</label>
                        <input 
                            required
                            type="number"
                            placeholder="Unlimited"
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-900"
                            value={form.maxUses}
                            onChange={e => setForm({...form, maxUses: e.target.value})}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Target Group</label>
                        <AliceSelect 
                            value={form.appliesTo}
                            onChange={val => setForm({...form, appliesTo: val})}
                            options={targetOptions}
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end pt-6">
                        <Button type="submit" className="bg-alice-teal text-white w-full md:w-auto px-12 py-5 rounded-2xl shadow-2xl shadow-alice-teal/30 hover:bg-teal-700 hover:-translate-y-1 transition-all font-semibold text-base ring-4 ring-alice-teal/5">
                            Activate Promo Code
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-2xl shadow-alice-teal/5">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h3 className="text-lg md:text-2xl font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-1.5 h-6 md:w-2 md:h-8 bg-alice-teal rounded-full" />
                        Manage Existing Codes
                    </h3>
                </div>
                <div className="overflow-x-auto bg-gray-50/30 rounded-2xl border border-gray-100">
                    <Table>
                        <thead>
                            <tr className="bg-gray-100/50 border-none">
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</Th>
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</Th>
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</Th>
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilization</Th>
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry</Th>
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</Th>
                                <Th className="py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoCodes.map((pc) => (
                                <tr key={pc.id} className="hover:bg-white transition-all duration-300 group border-b border-gray-100 last:border-none">
                                    <Td className="py-5">
                                        <span className="px-4 py-1.5 bg-alice-teal/10 text-alice-teal font-semibold rounded-lg text-xs tracking-wider">
                                            {pc.code}
                                        </span>
                                    </Td>
                                    <Td className="py-5">
                                        <span className="text-sm font-medium text-gray-600">{pc.source}</span>
                                    </Td>
                                    <Td className="py-5">
                                        <span className="text-xl font-semibold text-gray-900 group-hover:text-alice-teal transition-colors">{pc.discount}%</span>
                                    </Td>
                                    <Td className="py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                                <span>{pc.used} USED</span>
                                                <span>{pc.max} LIMIT</span>
                                            </div>
                                            <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden ring-1 ring-black/5 shadow-inner">
                                                <div 
                                                    className="h-full bg-alice-teal rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-1000" 
                                                    style={{ width: `${(pc.used/pc.max)*100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Td>
                                    <Td className="py-4 md:py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800">{new Date(pc.expiry).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-[10px] font-semibold text-gray-300">UTP+0 TIMEZONE</span>
                                        </div>
                                    </Td>
                                    <Td className="py-4 md:py-5">
                                        <span className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm ring-1 flex items-center gap-2 w-fit ${
                                            pc.status === 'Active' 
                                            ? 'bg-emerald-50 text-emerald-600 ring-emerald-100 shadow-emerald-100/50' 
                                            : 'bg-rose-50 text-rose-600 ring-rose-100 shadow-rose-100/50'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${pc.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {pc.status}
                                        </span>
                                    </Td>
                                    <Td className="py-4 md:py-5 text-right pr-6 md:pr-10 min-w-[140px]">
                                        <div className="flex gap-3 justify-end items-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <button className="px-5 py-2.5 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-alice-teal transition-all shadow-xl hover:shadow-alice-teal/30 hover:-translate-y-0.5">
                                                {pc.status === 'Active' ? 'Revoke' : 'Renew'}
                                            </button>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default PromoCodes;
