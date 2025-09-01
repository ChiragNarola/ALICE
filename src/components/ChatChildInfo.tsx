import React, { useState, useEffect } from "react";
import {
  getChildDetailsForLoginUser,
  area_of_interests,
  area_of_concerns,
} from "../api/api-services";
import Tippy from "@tippyjs/react";
import { useNavigate } from "react-router-dom";

const ChatChildInfo: React.FC = () => {
  const [childrens, setChildrens] = useState<any[]>([]);
  const [TOPICS, setTOPICS] = useState<any[]>([]);
  const [CONCERNS, setCONCERNS] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // start as true
  const navigate = useNavigate();
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
    <div className="bg-white w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
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
          {childrens.length > 0 && (
            <button
              onClick={() => navigate("/child-basic-info")}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {childrens.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No children registered</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                Get started by adding your child's information to receive personalized guidance and support from A.L.I.C.E.
              </p>
              <button
                className="px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                onClick={() => navigate("/child-basic-info")}
              >
                Add Child Profile
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {childrens.map((child) => (
                <div
                  key={child.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-teal-200"
                >
                  {/* Profile Section */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg">
                        {child.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <Tippy content={[child.firstName, child.middleName, child.lastName]
                          .filter(Boolean)
                          .join(" ")} placement="bottom">
                          <h2 className="text-lg font-bold text-gray-900 truncate">
                            {[child.firstName, child.middleName, child.lastName]
                              .filter(Boolean)
                              .join(" ")}
                          </h2>
                        </Tippy>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-gray-600 font-medium">DOB: {child.dob}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-gray-600 font-medium">
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

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>
                  {/* Topics of Interest */}
                  {child.topics.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-bold text-gray-800">Areas of Interest</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {child.topics.map((topic: any, i: any) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
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
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-bold text-gray-800">Areas of Concern</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {child.concerns.map((concern: any, i: any) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
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

