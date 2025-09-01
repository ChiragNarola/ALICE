import React, { useState, useEffect } from "react";
import {
  getChildDetailsForLoginUser,
  area_of_interests,
  area_of_concerns,
} from "../api/api-services";
import Tippy from "@tippyjs/react";

const ChatChildInfo: React.FC = () => {
  const [childrens, setChildrens] = useState<any[]>([]);
  const [TOPICS, setTOPICS] = useState<any[]>([]);
  const [CONCERNS, setCONCERNS] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // start as true

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch topics
        const interestList = await area_of_interests();
        if (interestList.IsSuccess) setTOPICS(interestList.Data);

        // fetch concerns
        const concernList = await area_of_concerns();
        if (concernList.IsSuccess) setCONCERNS(concernList.Data);

        // fetch children after topics & concerns are ready
        const response = await getChildDetailsForLoginUser();
        if (response.IsSuccess && Array.isArray(response.Data)) {
          const mappedChildren = response.Data
            .filter((child) => !child.is_deleted)
            .map((child) => {
              const nameParts = (child.name || "").trim().split(" ");

              const topicNames =
                (child.area_of_interest || [])
                  .map((a: any) => {
                    const topicObj = (interestList.Data || []).find((t: any) => t.id === a.id);
                    return topicObj ? topicObj.interest : null;
                  })
                  .filter(Boolean);

              const concernNames =
                (child.concerns || [])
                  .map((a: any) => {
                    const concernObj = (concernList.Data || []).find((c: any) => c.id === a.id);
                    return concernObj ? concernObj.concern : null;
                  })
                  .filter(Boolean);

              return {
                id: child.id,
                firstName: nameParts[0] || "",
                middleName:
                  nameParts.length > 2
                    ? nameParts.slice(1, -1).join(" ")
                    : nameParts[1] || "",
                lastName:
                  nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
                gender: child.gender as "Boy" | "Girl" | "Prefer not to say",
                dob: child.date_of_birth,
                topics: topicNames,
                concerns: concernNames,
              };
            });

          setChildrens(mappedChildren);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // hide loader when all is done
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white w-full max-w-[22rem] mx-auto max-h-[80vh] overflow-hidden border border-gray-200/50 shadow-xl rounded-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700 px-4 py-3 rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white drop-shadow-sm">Child Profiles</h1>
            <p className="text-teal-100 text-xs font-medium">
              {childrens.length} child{childrens.length !== 1 ? 'ren' : ''} registered
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-3 max-h-[calc(80vh-80px)] overflow-y-auto custom-scrollbar">
          {childrens.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-bold text-gray-800 mb-2">No children registered</h3>
              <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">Add a child to get started with personalized guidance and support.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {childrens.map((child) => (
                <div
                  key={child.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Profile Section */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                        {child.firstName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* User Info & Actions */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <Tippy content={[child.firstName, child.middleName, child.lastName]
                          .filter(Boolean)
                          .join(" ")} placement="bottom">
                          <h2 className="text-base font-bold text-gray-900 truncate">
                            {[child.firstName, child.middleName, child.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </h2>
                        </Tippy>
                      </div>

                      {/* Stats */}
                      <div className="flex gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          <span className="text-gray-600">{child.dob}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-gray-600">
                            {(() => {
                              const birthDate = new Date(child.dob);
                              const today = new Date();

                              let years = today.getFullYear() - birthDate.getFullYear();
                              let months = today.getMonth() - birthDate.getMonth();
                              const days = today.getDate() - birthDate.getDate();

                              // Adjust if current month/day is before birth month/day
                              if (days < 0) {
                                months--; // not completed current month
                              }
                              if (months < 0) {
                                years--;
                                months += 12;
                              }

                              // Handle different formats
                              if (years > 0 && months > 0) {
                                return `${years} years ${months} months old`;
                              } else if (years > 0) {
                                return `${years} years old`;
                              } else if (months > 0) {
                                return `${months} months old`;
                              } else {
                                return "Less than a month old";
                              }
                            })()}
                          </span>

                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="py-2" />
                  {/* Topics of Interest */}
                  {child.topics.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          AREAS OF INTEREST
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {child.topics.map((topic: any, i: any) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concerns */}
                  {child.concerns.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          AREAS OF CONCERN
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {child.concerns.map((concern: any, i: any) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatChildInfo;

