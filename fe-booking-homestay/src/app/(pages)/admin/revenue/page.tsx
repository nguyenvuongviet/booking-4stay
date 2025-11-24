"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
import { StatCard } from "../_components/stat-card";

const revenueData = [
  { month: "Jan", revenue: 12000, bookings: 40, guests: 85 },
  { month: "Feb", revenue: 15000, bookings: 35, guests: 72 },
  { month: "Mar", revenue: 18000, bookings: 50, guests: 95 },
  { month: "Apr", revenue: 16000, bookings: 45, guests: 88 },
  { month: "May", revenue: 22000, bookings: 60, guests: 110 },
  { month: "Jun", revenue: 25000, bookings: 55, guests: 105 },
];

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your income and performance metrics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value="$108,000"
          change="18% from last quarter"
          trend="up"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. Booking Value"
          value="$378"
          change="5% increase"
          trend="up"
        />
        <StatCard
          icon={Users}
          label="Total Guests"
          value="555"
          change="22% growth"
          trend="up"
        />
        <StatCard
          icon={Calendar}
          label="Occupancy Rate"
          value="78%"
          change="12% improvement"
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bookings & Guests */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Bookings & Guests</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="bookings"
                fill="var(--chart-2)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="guests"
                fill="var(--chart-3)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Revenue by Property</h2>
        <div className="space-y-4">
          {[
            { name: "Beach Villa", revenue: "$28,500", percentage: 26 },
            { name: "Mountain Cabin", revenue: "$22,000", percentage: 20 },
            { name: "City Apartment", revenue: "$31,200", percentage: 29 },
            { name: "Beachfront House", revenue: "$18,300", percentage: 17 },
            { name: "Forest Retreat", revenue: "$8,000", percentage: 8 },
          ].map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.name}</span>
                <span className="font-semibold">{item.revenue}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
