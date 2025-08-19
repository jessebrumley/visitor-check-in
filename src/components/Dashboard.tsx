// === Imports ===
import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, TrendingUp } from 'lucide-react';
import { supabase, type Visitor } from '../lib/supabase';
import ChangePinForm from './ChangePinForm';
import { SyncButton } from './SyncButton';
import { EntraSyncButton } from './EntraSyncButton';
import CreateDeleteBadges from './CreateDeleteBadges';
import AddRemoveEmployee from './AddRemoveEmployee';
import VisitorExport from './VisitorExport';

// === Component ===
export default function Dashboard() {
  // === State ===
  const [stats, setStats] = useState({
    totalToday: 0,
    currentlyCheckedIn: 0,
    averageVisitDuration: 0,
    totalThisWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // === Effects ===
  useEffect(() => {
    fetchStats();
  }, []);

  // === Fetch Stats ===
  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      // Fetch today's visitors
      const { data: todayVisitors } = await supabase
        .from("visitors")
        .select("*")
        .gte("checked_in_at", today.toISOString());

      // Fetch this week's visitors
      const { data: weekVisitors } = await supabase
        .from("visitors")
        .select("*")
        .gte("checked_in_at", weekAgo.toISOString());

      // Calculate stats
      const totalToday = todayVisitors?.length || 0;
      const currentlyCheckedIn =
        todayVisitors?.filter((v) => v.status === "checked_in").length || 0;
      const totalThisWeek = weekVisitors?.length || 0;

      // Calculate average visit duration for completed visits
      const completedVisits =
        todayVisitors?.filter((v) => v.checked_out_at) || [];
      let averageVisitDuration = 0;

      if (completedVisits.length > 0) {
        const totalDuration = completedVisits.reduce((sum, visitor) => {
          const checkIn = new Date(visitor.checked_in_at).getTime();
          const checkOut = new Date(visitor.checked_out_at!).getTime();
          return sum + (checkOut - checkIn);
        }, 0);
        averageVisitDuration = Math.round(
          totalDuration / completedVisits.length / (1000 * 60)
        ); // Convert to minutes
      }

      setStats({
        totalToday,
        currentlyCheckedIn,
        averageVisitDuration,
        totalThisWeek,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // === Stat Cards Data ===
  const statCards = [
    {
      title: "Today's Visitors",
      value: stats.totalToday,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Currently Checked In",
      value: stats.currentlyCheckedIn,
      icon: BarChart3,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg. Visit Duration",
      value: `${stats.averageVisitDuration}m`,
      icon: Clock,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "This Week",
      value: stats.totalThisWeek,
      icon: TrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  // === Loading State ===
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // === Render ===
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 ${card.bgColor} rounded-full`}
            >
              <card.icon
                className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`}
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {card.title}
            </p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
      <ChangePinForm />
      <CreateDeleteBadges />
      <AddRemoveEmployee />
      <SyncButton />
      <EntraSyncButton />
      <VisitorExport />
    </div>
  );
}
