'use client';
import React, { useState } from "react";
import { User, Bell, Calendar, BarChart3, Upload, Clock, Users, Settings } from "lucide-react";
import DonorProfile from "./DonorProfile"; // make sure path is correct

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Donor Dashboard</h1>
                <p className="text-gray-600">Welcome back</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Bell className="w-6 h-6 text-gray-600" />
              <User className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              {[
                { id: "overview", name: "Overview", icon: BarChart3 },
                { id: "profile", name: "Profile", icon: User },
                { id: "donations", name: "My Donations", icon: Clock },
                { id: "availability", name: "Availability", icon: Calendar },
                { id: "settings", name: "Settings", icon: Settings },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && <DonorProfile />}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-3">
                    <Clock className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-gray-600">Next Available Donation</p>
                      <p className="text-2xl font-bold text-gray-900">In 2 Weeks</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-gray-600">Total Donations</p>
                      <p className="text-2xl font-bold text-gray-900">5</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-gray-600">Blood Units Donated</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard;
