'use client';
import React, { useState, useEffect } from "react";
import { Clock, Droplet, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import DonorProfile from "./DonorProfile";
import { DashboardLayout, DashboardLoading } from "@/components/Dashboard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { createClient } from "@/lib/supabase/client";

interface DonorStats {
  totalDonations: number;
  lastDonationDate: string | null;
  nextEligibleDate: string | null;
  daysUntilEligible: number | null;
  bloodGroup: string;
  isActive: boolean;
}

const DONATION_GAP_DAYS = 56; // 8 weeks standard gap

function computeStats(profile: any): DonorStats {
  const lastDate = profile?.last_donation_date ?? null;
  let nextEligible: string | null = null;
  let daysUntil: number | null = null;

  if (lastDate) {
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(next.getDate() + DONATION_GAP_DAYS);
    nextEligible = next.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) daysUntil = 0;
  }

  return {
    totalDonations: profile?.total_donations ?? 0,
    lastDonationDate: lastDate
      ? new Date(lastDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
      : null,
    nextEligibleDate: nextEligible,
    daysUntilEligible: daysUntil,
    bloodGroup: profile?.blood_group ?? "—",
    isActive: profile?.is_active ?? true,
  };
}

interface DonationRecord {
  id: string;
  donation_date: string;
  location: string | null;
  blood_units: number | null;
  status: string | null;
  notes: string | null;
}

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);

  const {
    user,
    userProfile,
    loading,
    userId,
    profileImageError,
    setProfileImageError,
    fetchData,
    setUserId,
    subscribeToNotifications,
    cleanup
  } = useDashboardData("donor");

  // Initialize dashboard
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
          window.location.href = '/login';
          return;
        }

        if (isMounted) {
          setUserId(authUser.id);
          await fetchData(authUser.id);
          subscribeToNotifications(authUser.id);
        }
      } catch (error) {
        console.error("Error initializing donor dashboard:", error);
      }
    };

    init();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [fetchData, setUserId, subscribeToNotifications, cleanup]);

  // Compute stats when profile loads
  useEffect(() => {
    if (userProfile) {
      setStats(computeStats(userProfile));
    }
  }, [userProfile]);

  // Fetch donation records when My Donations tab is opened
  useEffect(() => {
    if (activeTab !== "donations" || !userId) return;

    const fetchDonations = async () => {
      setDonationsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("donation_records")
          .select("*")
          .eq("user_id", userId)
          .order("donation_date", { ascending: false });

        if (!error && data) {
          setDonations(data);
        }
      } catch (err) {
        console.error("Failed to fetch donation records:", err);
      } finally {
        setDonationsLoading(false);
      }
    };

    fetchDonations();
  }, [activeTab, userId]);

  if (loading) {
    return <DashboardLoading userType="donor" />;
  }

  const canDonateNow = stats && (stats.daysUntilEligible === 0 || stats.lastDonationDate === null);

  return (
    <DashboardLayout
      userType="donor"
      user={user}
      userProfile={userProfile}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
      }}
      userId={userId}
      profileImageError={profileImageError}
      onProfileImageError={() => setProfileImageError(true)}
    >
      {/* Profile Tab */}
      {activeTab === "profile" && <DonorProfile />}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Eligibility Banner */}
          {stats && (
            <div className={`rounded-2xl p-4 flex items-center gap-4 border ${
              canDonateNow
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}>
              {canDonateNow
                ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                : <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
              }
              <div>
                <p className="font-semibold text-sm">
                  {canDonateNow
                    ? "You are eligible to donate blood today!"
                    : `You can donate again in ${stats.daysUntilEligible} day${stats.daysUntilEligible === 1 ? "" : "s"}`
                  }
                </p>
                {!canDonateNow && stats.nextEligibleDate && (
                  <p className="text-xs mt-0.5 opacity-75">Next eligible date: {stats.nextEligibleDate}</p>
                )}
              </div>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blood Group */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Droplet className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Blood Group</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.bloodGroup ?? "—"}</p>
              </div>
            </div>

            {/* Last Donation */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Last Donation</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats?.lastDonationDate ?? "No record yet"}
                </p>
              </div>
            </div>

            {/* Next Eligible */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Clock className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Next Eligible</p>
                <p className="text-lg font-bold text-gray-900">
                  {canDonateNow
                    ? "Eligible Now ✓"
                    : stats?.nextEligibleDate ?? "Set last donation date"}
                </p>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Stay Eligible — Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Drink plenty of water before and after donating</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Eat iron-rich foods (spinach, lentils, red meat)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Wait at least 56 days (8 weeks) between donations</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Keep your profile active so patients can find you</li>
            </ul>
          </div>
        </div>
      )}

      {/* My Donations Tab */}
      {activeTab === "donations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Donations</h2>
          </div>

          {donationsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : donations.length === 0 ? (
            // Empty state
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Droplet className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Donations Yet</h3>
              <p className="text-gray-500 max-w-sm text-sm">
                Your donation history will appear here once records are added.
                Update your <strong>Last Donation Date</strong> in your Profile to track eligibility.
              </p>
              <button
                onClick={() => setActiveTab("profile")}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Go to Profile
              </button>
            </div>
          ) : (
            // Donations table
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Location</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Units</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {new Date(d.donation_date).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{d.location ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{d.blood_units ?? "—"}</td>
                      <td className="px-6 py-4">
                        {d.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : d.status === "cancelled" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            {d.status ?? "Unknown"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{d.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DonorDashboard;
