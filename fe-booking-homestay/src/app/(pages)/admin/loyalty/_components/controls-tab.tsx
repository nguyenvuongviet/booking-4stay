"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function AdminControlsTab() {
  return (
    <Card className="p-6 bg-card border-border">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">
          Program Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-muted-foreground text-sm mb-1">Total Users</p>
            <p className="text-2xl font-bold text-primary">1,234</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-muted-foreground text-sm mb-1">Active Levels</p>
            <p className="text-2xl font-bold text-primary">4</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-muted-foreground text-sm mb-1">
              Total Points Issued
            </p>
            <p className="text-2xl font-bold text-primary">2.5M</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="text-muted-foreground text-sm mb-1">
              Avg Points/User
            </p>
            <p className="text-2xl font-bold text-primary">2,025</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
