import React, { useState, useEffect } from "react";
import {
  getChildDetailsForLoginUser,
  area_of_interests,
  area_of_concerns,
} from "../api/api-services";

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
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-lg w-full max-w-[22rem] mx-auto max-h-[80vh] overflow-y-auto scrollbar-hide">
      {/* Sticky Heading */}
      <h1 className="sticky top-[-35px] pt-5 h-[70px] z-10 text-lg sm:text-xl font-extrabold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2 flex items-center gap-2 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        Children Information
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-alice-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {childrens.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                    {[child.firstName, child.middleName, child.lastName]
                      .filter(Boolean)
                      .join(" ")}
                  </h2>
                  <p className="text-[11px] text-gray-500">{child.dob}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 text-base leading-none">
                  ⋮
                </button>
              </div>

              {/* Topics of Interest */}
              {child.topics.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-xs font-medium text-gray-700 mb-1">
                    Interest
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {child.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-blue-50 text-alice-teal border border-blue-200"
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
                  <h3 className="text-xs font-medium text-gray-700 mb-1">
                    Concerns
                  </h3>
                  <ul className="space-y-0.5">
                    {child.concerns.map((concern, i) => (
                      <li
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-md"
                      >
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatChildInfo;

