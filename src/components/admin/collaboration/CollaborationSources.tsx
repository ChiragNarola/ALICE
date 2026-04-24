import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  BadgeCheck,
  Hourglass,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../ui/Button";
import { createPartner, getPartners, getPartnerStats } from "../../../api/api-services";
import { toast } from "react-toastify";

interface Source {
  id: number;
  name: string;
  referredCount: number;
  color: string;
  email: string;
  code: string;
}

interface PartnerDetails {
  partner_id: number;
  partner_name: string;
  user_limit: number;
  current_user_count: number;
  remaining_capacity: number;
  active_users: number;
  waitlist_count: number;
  total_codes: number;
  active_codes: number;
}

const PAGE_SIZE = 10;
const colors = ["rose", "amber", "sky", "violet"];

const CollaborationSources: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  const [newSource, setNewSource] = useState({
    name: "",
    website_url: "",
    description: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  // derived
  const hasNextPage = sources.length === PAGE_SIZE;
  const hasPrevPage = currentPage > 1;

  // ---------------- FETCH LIST ----------------
  const fetchSources = async (page: number) => {
    try {
      setInitialLoading(true);

      const res = await getPartners({
        active_only: true,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      });

      if (res?.IsSuccess) {
        const mapped: Source[] =
          (res.Data as any[])?.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.contact_email,
            referredCount: item.current_user_count ?? 0,
            code: item.code ?? "",
            color: `bg-${colors[Math.floor(Math.random() * colors.length)]}-500`,
          })) || [];

        setSources(mapped);
      } else {
        toast.error(res?.Message || "Failed to load partners");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Error fetching partners");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSources(currentPage);
  }, [currentPage]);

  // ---------------- PAGE CHANGE ----------------
  const handlePageChange = (page: number) => {
    if (page < 1) return;
    if (page > currentPage && !hasNextPage) return;
    setCurrentPage(page);
    setSelectedPartnerId(null);
    setPartnerDetails(null);
  };

  // ---------------- SELECT PARTNER ----------------
  const handleSelectPartner = async (id: number) => {
    setSelectedPartnerId(id);
    setPartnerDetails(null);
    setStatsLoading(true);

    try {
      const res = await getPartnerStats(id);

      if (res?.IsSuccess) {
        setPartnerDetails(res.Data);
      } else {
        toast.error(res?.Message || "Failed to load partner stats");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Error loading stats");
    } finally {
      setStatsLoading(false);
    }
  };

  // ---------------- CREATE PARTNER ----------------
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSource.name || !newSource.contact_email) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);

    try {
      const res = await createPartner(newSource);

      if (res?.IsSuccess) {
        toast.success("Partner created successfully");
        setCurrentPage(1);
        await fetchSources(1);
        setNewSource({
          name: "",
          website_url: "",
          description: "",
          contact_name: "",
          contact_email: "",
          contact_phone: "",
        });
        setIsAdding(false);
      } else {
        toast.error(res?.Message || "Failed to create partner");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const capacityUsed = partnerDetails
    ? Math.min(
        (partnerDetails.current_user_count / partnerDetails.user_limit) * 100,
        100
      )
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-[1600px] mx-auto">

      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Active Sources</h3>
            <p className="text-sm text-gray-400">Manage partners</p>
          </div>

          <button
            onClick={() => setIsAdding((prev) => !prev)}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center gap-2 text-alice-teal"
          >
            <Plus className="w-5 h-5" />
            Add source
          </button>
        </div>

        {/* FORM */}
        {isAdding && (
          <form
            onSubmit={handleAddSource}
            className="w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Name"
                className="p-2 border rounded"
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
              <input
                placeholder="Website URL"
                className="p-2 border rounded"
                value={newSource.website_url}
                onChange={(e) => setNewSource({ ...newSource, website_url: e.target.value })}
              />
              <input
                placeholder="Contact Name"
                className="p-2 border rounded"
                value={newSource.contact_name}
                onChange={(e) => setNewSource({ ...newSource, contact_name: e.target.value })}
              />
              <input
                placeholder="Contact Email"
                className="p-2 border rounded"
                value={newSource.contact_email}
                onChange={(e) => setNewSource({ ...newSource, contact_email: e.target.value })}
              />
              <input
                placeholder="Contact Phone"
                className="p-2 border rounded"
                value={newSource.contact_phone}
                onChange={(e) => setNewSource({ ...newSource, contact_phone: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="p-2 border rounded md:col-span-2"
                value={newSource.description}
                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-gray-100 px-6 py-2 rounded"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-alice-teal text-white px-6 py-2 rounded"
              >
                {loading ? "Creating..." : "Generate Source"}
              </Button>
            </div>
          </form>
        )}

        {/* LIST */}
        {initialLoading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : sources.length === 0 ? (
          <p className="text-gray-400 text-sm">No partners found.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  onClick={() => handleSelectPartner(source.id)}
                  className={`cursor-pointer w-full border rounded-xl p-4 flex items-center gap-4 transition-colors ${
                    selectedPartnerId === source.id
                      ? "border-alice-teal bg-alice-teal/5"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-2 h-10 rounded ${source.color}`} />
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold">{source.name}</span>
                      {source.code && (
                        <span className="text-xs bg-gray-100 px-2 rounded">
                          {source.code}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{source.referredCount} users</p>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {(hasPrevPage || hasNextPage) && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">Page {currentPage}</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  <span className="w-8 h-8 flex items-center justify-center rounded bg-alice-teal text-white text-sm font-medium">
                    {currentPage}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-sm hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Source Performance</h3>

        {statsLoading ? (
          <p className="text-gray-400 text-sm">Loading stats...</p>
        ) : !partnerDetails ? (
          <p className="text-gray-400 text-sm">Select a partner to view stats</p>
        ) : (
          <div className="bg-white border rounded-xl p-6 space-y-6">

            {/* Top Performer */}
            <div className="text-center bg-teal-50 p-4 rounded-lg">
              <p className="text-xs text-teal-600 mb-1">Top Performer</p>
              <p className="font-semibold text-teal-800">{partnerDetails.partner_name}</p>
            </div>

            {/* Total Users */}
            <div className="flex gap-3 items-center border-b pb-4">
              <Users className="text-gray-400 w-5 h-5" />
              <div>
                <p className="text-xs text-gray-400">Total Users</p>
                <h2 className="text-xl font-bold">{partnerDetails.current_user_count}</h2>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BadgeCheck className="w-4 h-4 text-green-500" />
                  Active Users
                </div>
                <span className="font-semibold">{partnerDetails.active_users}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Hourglass className="w-4 h-4 text-amber-500" />
                  Waitlist
                </div>
                <span className="font-semibold">{partnerDetails.waitlist_count}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4 text-sky-500" />
                  Active Codes
                </div>
                <span className="font-semibold">
                  {partnerDetails.active_codes}/{partnerDetails.total_codes}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationSources;