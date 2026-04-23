import React, { useState } from "react";
import { Handshake, Zap, FileText } from "lucide-react";
import PromoCodes from "./PromoCodes";
import CollaborationSources from "./CollaborationSources";
import CollaborationDocuments from "./CollaborationDocuments";

const CollaborationContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"sources" | "promo" | "docs">("sources");

  const tabs = [
    { id: "sources" as const, label: "Sources", icon: Handshake },
    { id: "promo" as const, label: "Promo Codes", icon: Zap },
    { id: "docs" as const, label: "Documents", icon: FileText },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-alice-teal/10 rounded-xl">
            <Handshake className="w-6 h-6 text-alice-teal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Collaboration Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage partners, referral codes, and shared materials.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-full sm:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-white text-alice-teal shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <tab.icon
              className={`w-4 h-4 ${
                activeTab === tab.id ? "text-alice-teal" : "text-gray-400"
              }`}
            />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === "sources" && (
          <CollaborationSources/>
        )}
        {activeTab === "promo" && <PromoCodes />}
        {activeTab === "docs" && <CollaborationDocuments />}
      </div>
    </div>
  );
};

export default CollaborationContainer;