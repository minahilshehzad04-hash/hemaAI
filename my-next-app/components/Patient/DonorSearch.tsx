"use client";

import { useState, useCallback } from "react";
import { Search, MapPin, Droplet, User, Phone, CheckCircle, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";


const supabase = createClient();

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface DonorResult {
  id: string;
  user_id: string;
  blood_group: string;
  city: string;
  availability: string | null;
  contact_number: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  profile?: {
    full_name: string;
  };
}

export default function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [results, setResults] = useState<DonorResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!bloodGroup && !city) {
      toast.error("Please enter a blood group or city to search.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      // 1. Base Query — include rows where is_active is true OR null (never explicitly set)
      let query = supabase
        .from("donor_profiles")
        .select("id, user_id, blood_group, city, availability, contact_number, profile_picture_url, is_active")
        .or("is_active.eq.true,is_active.is.null");

      // 2. Apply filters safely
      if (bloodGroup) {
        query = query.eq("blood_group", bloodGroup);
      }

      if (city) {
        // use ilike for case-insensitive partial matching
        query = query.ilike("city", `%${city}%`);
      }

      // Order by newest active
      query = query.order("updated_at", { ascending: false }).limit(50);

      const { data: donorsData, error: donorsError } = await query;

      if (donorsError) {
        throw donorsError;
      }

      // If no donors found
      if (!donorsData || donorsData.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      // 3. Fetch Full Names from the public profiles table using the linked user_ids
      const userIds = [...new Set(donorsData.map((d) => d.user_id).filter(Boolean))];

      let profilesMap = new Map();

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (!profilesError && profilesData) {
          profilesMap = new Map(profilesData.map((p) => [p.id, p]));
        }
      }

      // 4. Combine Donor Data with Profiles
      const combinedResults = donorsData.map((donor) => ({
        ...donor,
        profile: profilesMap.get(donor.user_id) || { full_name: "Anonymous User" },
      }));

      setResults(combinedResults);

    } catch (error) {
      console.error("Error searching donors:", error);
      toast.error("Failed to fetch donor data.");
    } finally {
      setLoading(false);
    }
  }, [bloodGroup, city]);

  // Handle avatar rendering safely
  const getAvatarUrl = (url: string | null) => {
    if (!url) return "/images/avatar.jpg";
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    try {
      const { data } = supabase.storage.from("avatars").getPublicUrl(url);
      return data.publicUrl;
    } catch {
      return "/images/avatar.jpg";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header Configurator */}
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/60 p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-600" />
            Find Blood Donors
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Search for compatible and available blood donors in your area.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Blood Group
            </label>
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="">Any Blood Group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City / Location
            </label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="e.g. Lahore, Karachi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-6 md:mt-0 px-8 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Donors
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-1">
            {results.length > 0
              ? `Found ${results.length} active donor${results.length === 1 ? '' : 's'}`
              : 'No Donors Found'}
          </h3>

          {!loading && results.length === 0 && (
            <div className="bg-white/50 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active donors matched your search</h3>
              <p className="text-gray-500 max-w-md">
                Try widening your search criteria by changing the blood group or trying a different location.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((donor) => (
                <div
                  key={donor.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all hover:-translate-y-1 overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={getAvatarUrl(donor.profile_picture_url)}
                          alt="Donor Avatar"
                          className="w-14 h-14 rounded-full object-cover border-2 border-red-50"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 line-clamp-1">
                            {donor.profile?.full_name}
                          </h4>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium mt-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active Donor
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                          <Droplet className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Blood Group</p>
                          <p className="text-sm font-bold text-red-600">
                            {donor.blood_group || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Location</p>
                          <p className="text-sm font-medium text-gray-900">
                            {donor.city || 'Location not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Availability</p>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {donor.availability || 'Reach out to verify schedule'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                    {donor.contact_number ? (
                      <a
                        href={`tel:${donor.contact_number}`}
                        className="w-full py-2.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Contact: {donor.contact_number}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <Phone className="w-4 h-4" />
                        No Phone Provided
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
