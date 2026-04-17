import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    User, Mail, Calendar, ShieldCheck, 
    CreditCard, ArrowLeft, Zap, 
    LayoutGrid
} from "lucide-react";
import Button from "../../components/ui/Button";
import { Table, Th, Td } from "../../components/ui/Table";
import Avatar from "react-avatar";

const UserDetails: React.FC = () => {
    const { id } = useParams();
    console.log("Viewing user ID:", id);
    const navigate = useNavigate();
    const [subTab, setSubTab] = useState<"parent" | "staff">("parent");

    // Mock User Data
    const userData = {
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        source: "NUURI",
        status: "Approved",
        joinedDate: "2024-03-25",
        promoCode: "NUURI50",
        role: "Parent",
    };

    // Auto-generated description based on user data
    const generateDescription = () => {
        const sourceName = userData.source || "Direct";
        const statusType = userData.status.toLowerCase();
        return `Premium global educator from ${sourceName} partner network. Highly active ${userData.role.toLowerCase()} account currently in ${statusType} state.`;
    };

    // Mock Subscriptions
    const subscriptions = [
        { id: 1, plan: "Premium Monthly", start: "2024-03-25", discount: "NUURI50 (50%)", amount: "€14.99", status: "Active" },
        { id: 2, plan: "Standard Annual", start: "2023-03-25", discount: "-", amount: "€149.99", status: "Ended" },
    ];

    return (
        <div className="p-4 md:p-10 space-y-8 md:space-y-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Back Button */}
            <button 
                onClick={() => navigate("/admin/user")}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-alice-teal transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to User Management
            </button>

            {/* Profile Header Card */}
            <div className="relative bg-alice-teal/[0.04] border border-alice-teal/10 rounded-[2rem] p-6 md:p-10 overflow-hidden shadow-xl shadow-alice-teal/5 ring-4 md:ring-[12px] ring-alice-teal/[0.02] group shadow-inner">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-alice-teal/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group/avatar">
                        <Avatar name={userData.name} size="120" round="2.5rem" className="shadow-xl ring-4 ring-gray-50 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute -bottom-2 -right-2 p-2.5 md:p-4 bg-alice-teal text-white rounded-2xl shadow-xl shadow-alice-teal/20 ring-4 ring-white group-hover:rotate-12 transition-transform z-10">
                            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">{userData.name}</h1>
                                <div className="flex gap-2">
                                    <span className="px-4 py-1.5 bg-alice-teal text-white text-[9px] font-semibold uppercase tracking-widest rounded-full shadow-lg shadow-alice-teal/20">
                                        {userData.role}
                                    </span>
                                    <span className="px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-semibold uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                                        {userData.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs md:text-base font-medium text-gray-500 leading-relaxed max-w-2xl px-4 md:px-0 text-center md:text-left">{generateDescription()}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-100 w-full text-left">
                            {[
                                { label: "Email Node", val: userData.email, icon: Mail, isBadge: false },
                                { label: "Referral", val: userData.source, icon: LayoutGrid, isBadge: true },
                                { label: "Joined On", val: new Date(userData.joinedDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }), icon: Calendar, isBadge: false },
                                { label: "Promo Code", val: userData.promoCode, icon: Zap, isBadge: true },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-start gap-2 group/stat overflow-hidden min-w-0">
                                    <div className="flex items-center gap-2 opacity-50 group-hover/stat:opacity-100 transition-opacity">
                                        <item.icon className="w-3.5 h-3.5 text-alice-teal" />
                                        <p className="text-[9px] font-semibold text-alice-teal uppercase tracking-widest">{item.label}</p>
                                    </div>
                                    {item.isBadge ? (
                                        <span className="px-3 py-1 bg-gray-50 text-gray-700 text-[11px] font-medium rounded-lg ring-1 ring-gray-100 w-fit">
                                            {item.val}
                                        </span>
                                    ) : (
                                        <p className="text-gray-900 font-medium text-sm tracking-tight truncate w-full" title={item.val}>{item.val}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscriptions Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg ring-4 ring-indigo-500/5">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Subscription Management</h2>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden ring-4 md:ring-[10px] ring-black/[0.02]">
                    <div className="bg-alice-teal/[0.02] p-2 flex border-b border-gray-50 overflow-x-auto scollbar-hidden">
                        <button 
                            onClick={() => setSubTab("parent")}
                            className={`flex-1 flex items-center justify-center gap-3 md:gap-4 py-3 md:py-4 rounded-xl text-[10px] md:text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${subTab === 'parent' ? 'bg-white text-alice-teal shadow-lg border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <User className={`w-4 h-4 md:w-5 md:h-5 ${subTab === 'parent' ? 'text-alice-teal' : ''}`} />
                            Parent Tier
                        </button>
                        <button 
                            onClick={() => setSubTab("staff")}
                            className={`flex-1 flex items-center justify-center gap-3 md:gap-4 py-3 md:py-4 rounded-xl text-[10px] md:text-[11px] font-semibold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${subTab === 'staff' ? 'bg-white text-alice-teal shadow-lg border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid className={`w-4 h-4 md:w-5 md:h-5 ${subTab === 'staff' ? 'text-alice-teal' : ''}`} />
                            Staff Tier
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {subTab === "parent" ? (
                            <>
                                {/* Parent Stat Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                                    <div className="p-6 md:p-8 bg-alice-teal/[0.03] border border-alice-teal/10 rounded-2xl md:rounded-3xl flex items-center justify-between group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-alice-teal/5 rounded-full -mr-12 -mt-12" />
                                        <div className="relative">
                                            <p className="text-[10px] md:text-[11px] font-semibold text-alice-teal uppercase tracking-widest mb-1 md:mb-2 opacity-60">Active Offering</p>
                                            <p className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Premium Monthly</p>
                                        </div>
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm text-alice-teal flex items-center justify-center ring-1 ring-alice-teal/5 group-hover:scale-110 transition-transform">
                                            <LayoutGrid className="w-6 h-6 md:w-8 md:h-8" />
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl md:rounded-3xl flex items-center justify-between group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12" />
                                        <div className="relative">
                                            <p className="text-[10px] md:text-[11px] font-semibold text-indigo-600 uppercase tracking-widest mb-1 md:mb-2 opacity-60">Billing Cycle</p>
                                            <p className="text-xl md:text-2xl font-semibold text-indigo-900 tracking-tight">April 25, 2024</p>
                                        </div>
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm text-indigo-600 flex items-center justify-center ring-1 ring-indigo-500/5 group-hover:scale-110 transition-transform">
                                            <Calendar className="w-6 h-6 md:w-8 md:h-8" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                                        Master Transaction Log
                                    </h4>
                                    <div className="bg-gray-50/10 rounded-2xl border border-gray-100 overflow-x-auto">
                                        <Table>
                                            <thead>
                                                <tr className="bg-gray-50 border-none">
                                                    <Th className="py-4 font-semibold text-gray-500 uppercase tracking-widest text-[10px]">Product Plan</Th>
                                                    <Th className="py-4 font-semibold text-gray-500 uppercase tracking-widest text-[10px]">Activation Point</Th>
                                                    <Th className="py-4 font-semibold text-gray-500 uppercase tracking-widest text-[10px]">Promo Attribution</Th>
                                                    <Th className="py-4 font-semibold text-gray-500 uppercase tracking-widest text-[10px]">Gross Amount</Th>
                                                    <Th className="py-4 font-semibold text-gray-500 uppercase tracking-widest text-[10px] text-right pr-6 md:pr-10">Lifecycle Status</Th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subscriptions.map((sub) => (
                                                    <tr key={sub.id} className="hover:bg-white transition-all duration-300 group border-b border-gray-100 last:border-none">
                                                        <Td className="py-4"><span className="text-sm font-semibold text-gray-900 group-hover:text-alice-teal transition-colors">{sub.plan}</span></Td>
                                                        <Td className="py-4"><span className="text-xs font-medium text-gray-400">{new Date(sub.start).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span></Td>
                                                        <Td className="py-4">
                                                            {sub.discount !== '-' ? (
                                                                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-semibold uppercase tracking-wider rounded">
                                                                    {sub.discount}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-300 text-xs font-medium">None</span>
                                                            )}
                                                        </Td>
                                                        <Td className="py-4"><span className="text-sm font-semibold text-gray-900">{sub.amount}</span></Td>
                                                        <Td className="py-4 text-right pr-6 md:pr-10">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                                                sub.status === 'Active' 
                                                                ? 'bg-emerald-50 text-emerald-600' 
                                                                : 'bg-gray-50 text-gray-500'
                                                            }`}>
                                                                {sub.status}
                                                            </div>
                                                        </Td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button className="bg-alice-teal text-white w-full md:w-auto px-10 rounded-xl shadow-lg shadow-alice-teal/20 font-semibold uppercase tracking-wider py-4 transition-all hover:-translate-y-0.5">
                                        Add / Change Subscription
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-6 bg-gray-50 rounded-full text-gray-200">
                                    <LayoutGrid className="w-12 h-12" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-gray-900 tracking-tight">No Staff Subscription Found</h4>
                                    <p className="text-sm text-gray-400">This user is not currently enrolled in a staff-linked subscription plan.</p>
                                </div>
                                <Button className="bg-indigo-600 text-white px-10 rounded-xl shadow-lg shadow-indigo-600/20 font-bold uppercase tracking-wider py-4 transition-all hover:-translate-y-0.5">
                                    Add Staff Subscription
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
