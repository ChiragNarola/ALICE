import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  BadgeCheck,
  Hourglass,
  Activity,
} from "lucide-react";

import Button from "../../ui/Button";
import {
  createPartner,
  getPartners,
  getPartnerById,
} from "../../../api/api-services";

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
  total_users: number;
  approved_users: number;
  pending_users: number;
  active_partners: number;
  top_performer?: string;
}

const colors = ["rose", "amber", "sky", "violet"];

const CollaborationSources: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [newSource, setNewSource] = useState({
    name: "",
    website_url: "",
    description: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  // ---------------- FETCH LIST ----------------
  const fetchSources = async () => {
    try {
      setInitialLoading(true);

      const res = await getPartners();

      if (res?.IsSuccess) {
        const mapped: Source[] =
          res.Data?.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            referredCount: item.referred_count ?? 0,
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
    fetchSources();
  }, []);

  // ---------------- SELECT PARTNER ----------------
  const handleSelectPartner = async (id: number) => {
    setSelectedPartnerId(id);

    try {
      const res = await getPartnerById(id);

      if (res?.IsSuccess) {
        setPartnerDetails(res.Data);
      } else {
        toast.error(res?.Message || "Failed to load partner details");
      }
    } catch (err: any) {
      toast.error(err?.Message || "Error loading details");
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

        await fetchSources();

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-[1600px] mx-auto">

      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-8">

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

        {/* FORM (NOW ON TOP) */}
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
                onChange={(e) =>
                  setNewSource({ ...newSource, name: e.target.value })
                }
              />

              <input
                placeholder="Website URL"
                className="p-2 border rounded"
                value={newSource.website_url}
                onChange={(e) =>
                  setNewSource({ ...newSource, website_url: e.target.value })
                }
              />

              <input
                placeholder="Contact Name"
                className="p-2 border rounded"
                value={newSource.contact_name}
                onChange={(e) =>
                  setNewSource({ ...newSource, contact_name: e.target.value })
                }
              />

              <input
                placeholder="Contact Email"
                className="p-2 border rounded"
                value={newSource.contact_email}
                onChange={(e) =>
                  setNewSource({ ...newSource, contact_email: e.target.value })
                }
              />

              <input
                placeholder="Contact Phone"
                className="p-2 border rounded"
                value={newSource.contact_phone}
                onChange={(e) =>
                  setNewSource({ ...newSource, contact_phone: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="p-2 border rounded md:col-span-2"
                value={newSource.description}
                onChange={(e) =>
                  setNewSource({ ...newSource, description: e.target.value })
                }
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
          <p>Loading...</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {sources.map((source) => (
              <div
                key={source.id}
                onClick={() => handleSelectPartner(source.id)}
                className={`cursor-pointer w-full border rounded-xl p-4 flex items-center gap-4 ${
                  selectedPartnerId === source.id
                    ? "border-alice-teal bg-alice-teal/5"
                    : "bg-white"
                }`}
              >
                <div className={`w-2 h-10 rounded ${source.color}`} />

                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-semibold">{source.name}</span>
                    <span className="text-xs bg-gray-100 px-2 rounded">
                      {source.code}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {source.referredCount} users
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Source Performance</h3>

        {!partnerDetails ? (
          <p className="text-gray-400">Select a partner</p>
        ) : (
          <div className="bg-white border rounded-xl p-6 space-y-6">

            <div className="flex gap-3 items-center border-b pb-4">
              <Users />
              <div>
                <p className="text-xs text-gray-400">Partner Hub</p>
                <h2 className="text-xl font-bold">
                  {partnerDetails.total_users}
                </h2>
              </div>
            </div>

            <div className="text-center bg-teal-50 p-4 rounded">
              <p className="text-xs text-teal-600">Top Performer</p>
              <p className="font-semibold">
                {partnerDetails.top_performer ?? "N/A"}
              </p>
            </div>

            <div className="space-y-3">
              <p>Approved: {partnerDetails.approved_users}</p>
              <p>Pending: {partnerDetails.pending_users}</p>
              <p>Active: {partnerDetails.active_partners}</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationSources;