import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import Button from "../../ui/Button";
import { Table, Th, Td } from "../../ui/Table";
import AliceSelect from "../../ui/AliceSelect";
import { toast } from "react-toastify";
import {
  getPartners,
  createAccessCode,
  listPartnerCodes,
  deactivateAccessCode,
  reactivateAccessCode,
} from "../../../api/api-services";

interface PartnerOption {
  label: string;
  value: string;   // string for AliceSelect compatibility
  id: number;      // actual numeric id for API calls
}

interface AccessCode {
  id: number;
  code: string;
  partner_id: number;
  max_uses: number;
  current_uses: number;
  valid_until: string;
  status: "active" | "inactive" | "expired";
  free_credit?: number;
  target_group?: string;
}

const targetOptions = [
  { label: "All plans", value: "All plans" },
  { label: "Parent plan", value: "Parent plan" },
  { label: "Staff plan", value: "Staff plan" },
];

const PromoCodes: React.FC = () => {
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [selectedPartnerValue, setSelectedPartnerValue] = useState<string>("");

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    code: "",
    discount: "",         // UI only — not sent to API yet (Stripe side)
    expiry: "",
    maxUses: "",
    appliesTo: "All plans",
  });

  // ---------------- FETCH PARTNERS FOR DROPDOWN ----------------
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await getPartners({ active_only: true, skip: 0, limit: 100 });
        if (res?.IsSuccess) {
          const mapped: PartnerOption[] = (res.Data as any[]).map((p) => ({
            label: p.name,
            value: String(p.id),   // AliceSelect needs string
            id: p.id,
          }));
          setPartners(mapped);

          // auto-select first partner
          if (mapped.length > 0) {
            setSelectedPartnerValue(mapped[0].value);
            setSelectedPartnerId(mapped[0].id);
          }
        } else {
          toast.error(res?.Message || "Failed to load partners");
        }
      } catch (err: any) {
        toast.error(err?.Message || "Error fetching partners");
      }
    };

    fetchPartners();
  }, []);

  // ---------------- FETCH CODES WHEN PARTNER CHANGES ----------------
  useEffect(() => {
    if (!selectedPartnerId) return;
    fetchCodes(selectedPartnerId);
  }, [selectedPartnerId]);

  const fetchCodes = async (partnerId: number) => {
    setCodesLoading(true);
    try {
      const res = await listPartnerCodes(partnerId, false); // false = show all, not just active
      if (res?.IsSuccess) {
        setCodes(res.Data as AccessCode[]);
      } else {
        toast.error(res?.Message || "Failed to load codes");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Error fetching codes");
    } finally {
      setCodesLoading(false);
    }
  };

  // ---------------- PARTNER DROPDOWN CHANGE ----------------
  const handlePartnerChange = (val: string) => {
    const found = partners.find((p) => p.value === val);
    if (!found) return;
    setSelectedPartnerValue(val);
    setSelectedPartnerId(found.id);
  };

  // ---------------- CREATE CODE ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartnerId) {
      toast.error("Please select a partner");
      return;
    }

    if (!form.code || !form.maxUses || !form.discount) {
      toast.error("Code name, max uses and discount are required");
      return;
    }

    setSubmitLoading(true);

    try {
      const res = await createAccessCode({
        code: form.code,
        partner_id: selectedPartnerId,
        max_uses: Number(form.maxUses),
        free_credit: Number(form.discount),
        valid_from: new Date().toISOString(),
        valid_until: form.expiry ? new Date(form.expiry).toISOString() : undefined,
        target_group: form.appliesTo,   // backend will accept once field is added
      });

      if (res?.IsSuccess) {
        toast.success("Access code created successfully");
        await fetchCodes(selectedPartnerId);
        setForm({
          code: "",
          discount: "",
          expiry: "",
          maxUses: "",
          appliesTo: "All plans",
        });
      } else {
        toast.error(res?.Message || "Failed to create code");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---------------- REVOKE / RENEW ----------------
  const handleToggleStatus = async (code: AccessCode) => {
    setActionLoadingId(code.id);
    try {
      const res =
        code.status === "active"
          ? await deactivateAccessCode(code.id)
          : await reactivateAccessCode(code.id);

      if (res?.IsSuccess) {
        toast.success(
          code.status === "active" ? "Code revoked" : "Code reactivated"
        );
        await fetchCodes(selectedPartnerId!);
      } else {
        toast.error(res?.Message || "Action failed");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Something went wrong");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ---------------- HELPERS ----------------
  const getStatusDisplay = (status: string): "Active" | "Expired" =>
    status === "active" ? "Active" : "Expired";

  const selectedPartnerName =
    partners.find((p) => p.id === selectedPartnerId)?.label ?? "—";

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-16 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* ── CREATE FORM ── */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-2xl shadow-alice-teal/5">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 md:p-4 bg-alice-teal text-white rounded-xl md:rounded-[1.25rem] shadow-2xl shadow-alice-teal/40 ring-4 md:ring-8 ring-alice-teal/5">
            <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Create Promo Code</h3>
            <p className="text-sm text-gray-500 mt-1">Setup new automated distribution rules.</p>
          </div>

          {/* SOURCE PARTNER DROPDOWN — now dynamic */}
          <div className="ml-auto space-y-3 items-end">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Source Partner
            </label>
            <AliceSelect
              value={selectedPartnerValue}
              onChange={handlePartnerChange}
              options={partners.map((p) => ({ label: p.label, value: p.value }))}
            />
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
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>

          {/* Discount — UI only for now, Stripe side not wired yet */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              Discount (%)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="0"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-900"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
              <span className="absolute right-5 top-4 font-semibold text-gray-300">%</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Expiry Date</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-alice-teal/10 transition-all font-semibold text-gray-700"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
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
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Target Group</label>
            <AliceSelect
              value={form.appliesTo}
              onChange={(val) => setForm({ ...form, appliesTo: val })}
              options={targetOptions}
            />
          </div>

          <div className="md:col-span-3 flex justify-end pt-6">
            <Button
              type="submit"
              disabled={submitLoading}
              className="bg-alice-teal text-white w-full md:w-auto px-12 py-5 rounded-2xl shadow-2xl shadow-alice-teal/30 hover:bg-teal-700 hover:-translate-y-1 transition-all font-semibold text-base ring-4 ring-alice-teal/5"
            >
              {submitLoading ? "Creating..." : "Activate Promo Code"}
            </Button>
          </div>
        </form>
      </div>

      {/* ── MANAGE EXISTING CODES ── */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-2xl shadow-alice-teal/5">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h3 className="text-lg md:text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-1.5 h-6 md:w-2 md:h-8 bg-alice-teal rounded-full" />
            Manage Existing Codes
            {selectedPartnerId && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                — {selectedPartnerName}
              </span>
            )}
          </h3>
        </div>

        {!selectedPartnerId ? (
          <p className="text-gray-400 text-sm">Select a partner above to view codes.</p>
        ) : codesLoading ? (
          <p className="text-gray-400 text-sm">Loading codes...</p>
        ) : codes.length === 0 ? (
          <p className="text-gray-400 text-sm">No codes found for this partner.</p>
        ) : (
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
                {codes.map((pc) => {
                  const displayStatus = getStatusDisplay(pc.status);
                  const isActionLoading = actionLoadingId === pc.id;
                  const usagePercent =
                    pc.max_uses && pc.max_uses > 0
                      ? Math.min((pc.current_uses / pc.max_uses) * 100, 100)
                      : 0;
                  return (
                    <tr key={pc.id} className="hover:bg-white transition-all duration-300 group border-b border-gray-100 last:border-none">
                      <Td className="py-5">
                        <span className="px-4 py-1.5 bg-alice-teal/10 text-alice-teal font-semibold rounded-lg text-xs tracking-wider">
                          {pc.code}
                        </span>
                      </Td>

                      <Td className="py-5">
                        <span className="text-sm font-medium text-gray-600">
                          {selectedPartnerName}
                        </span>
                      </Td>

                      {/* Value — free_credit if available, else dash until Stripe wired */}
                      <Td className="py-5">
  <span className="text-xl font-semibold text-gray-900 group-hover:text-alice-teal transition-colors">
    {usagePercent.toFixed(0)}%
  </span>
</Td>

                      {/* Utilization */}
                      <Td className="py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            <span>{pc.current_uses} USED</span>
                            <span>{pc.max_uses} LIMIT</span>
                          </div>
                          <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden ring-1 ring-black/5 shadow-inner">
                            <div
                              className="h-full bg-alice-teal rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)] transition-all duration-1000"
                              style={{
                                width: `${Math.min((pc.current_uses / pc.max_uses) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </Td>

                      <Td className="py-4 md:py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">
                            {new Date(pc.valid_until).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-300">UTC+0 TIMEZONE</span>
                        </div>
                      </Td>

                      <Td className="py-4 md:py-5">
                        <span className={`px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm ring-1 flex items-center gap-2 w-fit ${
                          displayStatus === "Active"
                            ? "bg-emerald-50 text-emerald-600 ring-emerald-100 shadow-emerald-100/50"
                            : "bg-rose-50 text-rose-600 ring-rose-100 shadow-rose-100/50"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            displayStatus === "Active" ? "bg-emerald-500" : "bg-rose-500"
                          }`} />
                          {displayStatus}
                        </span>
                      </Td>

                      <Td className="py-4 md:py-5 text-right pr-6 md:pr-10 min-w-[140px]">
                        <div className="flex gap-3 justify-end items-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                          <button
                            disabled={isActionLoading}
                            onClick={() => handleToggleStatus(pc)}
                            className="px-5 py-2.5 bg-gray-900 text-white text-[10px] font-black rounded-xl hover:bg-alice-teal transition-all shadow-xl hover:shadow-alice-teal/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isActionLoading
                              ? "..."
                              : displayStatus === "Active"
                              ? "Revoke"
                              : "Renew"}
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoCodes;