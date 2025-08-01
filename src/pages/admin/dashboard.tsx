import React from "react";

const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Total Users</h3>
          <p className="text-2xl mt-2 text-gray-900">1,234</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Monthly Revenue</h3>
          <p className="text-2xl mt-2 text-green-600">$45,210</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">New Signups</h3>
          <p className="text-2xl mt-2 text-blue-600">89</p>
        </div>
      </div>

      {/* Chat Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Total Messages</h3>
          <p className="text-2xl mt-2 text-indigo-600">3,452</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Active Conversations</h3>
          <p className="text-2xl mt-2 text-purple-600">27</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Unread Messages</h3>
          <p className="text-2xl mt-2 text-red-600">102</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-600">Avg. Response Time</h3>
          <p className="text-2xl mt-2 text-yellow-600">5m 42s</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
