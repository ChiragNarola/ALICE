import React, { useState, useEffect } from "react";
import { getStaffDetailsForLoginUser } from "../api/api-services";

const StaffInfo: React.FC = () => {
  const [staffData, setStaffData] = useState({
    jobTitle: "",
    qualification: "",
    nurseryName:"",
    childAgeMin: 1,
    childAgeMax: 9,
  });
  const [loading, setLoading] = useState(true);

  // Fetch staff data from API
  useEffect(() => {
    const fetchStaffDetails = async () => {
      setLoading(true);

      try {
        const staff_response = await getStaffDetailsForLoginUser();
        console.log(staff_response);

        if (staff_response.IsSuccess && staff_response.Data) {
          const data = staff_response.Data;

          // Parse age group (e.g., "1-9" -> min: 1, max: 9)
          const ageRange = data.age_group ? data.age_group.split('-') : ['1', '9'];
          const minAge = parseInt(ageRange[0]) || 1;
          const maxAge = parseInt(ageRange[1]) || 9;
          
          const nurseryNames = Array.isArray(data.nursery_names) && data.nursery_names.length > 0
                ? data.nursery_names.join(", ")
                : "";
          
          setStaffData({
            jobTitle: data.role_in_organisation || "",
            qualification: data.qualification || "",
            nurseryName: nurseryNames,
            childAgeMin: minAge,
            childAgeMax: maxAge,
          });
        }
      } catch (error) {
        console.error("Error fetching staff details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, []);



  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white drop-shadow-sm">Staff Details</h1>
            <p className="text-teal-100 text-xs">Professional Information</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !staffData.jobTitle && !staffData.qualification ? (
        <div className="flex-1 text-center py-16 px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">No staff information available</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-6">
            Staff details are not yet configured. Kindly update your information.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            {/* Job Title */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-teal-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-800">Job Title</h3>
              </div>
              <p className="text-gray-800 font-medium text-lg">{staffData.jobTitle}</p>
            </div>

            {/* Qualification */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-teal-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-800">Qualification</h3>
              </div>
              <p className="text-gray-800 font-medium text-lg">{staffData.qualification}</p>
            </div>

            {/* Nursery Name */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-teal-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-800">Nursery Name</h3>
              </div>
              <p className="text-gray-800 font-medium text-lg">{staffData.nurseryName}</p>
            </div>

            {/* Child Age Range */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-teal-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-800">Child Age Range</h3>
              </div>

              {/* Age Range Display */}
              <div className="relative mb-4">
                <div className="relative h-3 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-sm"
                    style={{
                      left: `${((staffData.childAgeMin - 0) / (staffData.childAgeMax + 1)) * 100}%`,
                      width: `${((staffData.childAgeMax - staffData.childAgeMin) / (staffData.childAgeMax + 1)) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  {Array.from({ length: staffData.childAgeMax + 2 }, (_, i) => (
                    <span key={i} className="font-medium">{i}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Min: {staffData.childAgeMin} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Max: {staffData.childAgeMax} years</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StaffInfo;

