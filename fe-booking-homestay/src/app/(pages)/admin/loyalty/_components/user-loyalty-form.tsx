"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UserLoyaltyFormData } from "@/types/user";

interface Props {
  initialData: User;
  onSave: (data:UserLoyaltyFormData) => void;
  onCancel: () => void;
}

export default function UserLoyaltyForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<UserLoyaltyFormData>({
    name: initialData.firstName + " " + initialData.lastName,
    email: initialData.email,
    points: initialData.loyalty_program.totalPoint,
    level: initialData.loyalty_program.levels.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-foreground">
          Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-2 bg-input border-border text-foreground"
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-2 bg-input border-border text-foreground"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="points" className="text-foreground">
            Points
          </Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) =>
              setFormData({
                ...formData,
                points: Number.parseInt(e.target.value) || 0,
              })
            }
            className="mt-2 bg-input border-border text-foreground"
            required
          />
        </div>
        <div>
          <Label htmlFor="level" className="text-foreground">
            Level
          </Label>
          <Input
            id="level"
            value={formData.level}
            onChange={(e) =>
              setFormData({ ...formData, level: e.target.value })
            }
            className="mt-2 bg-input border-border text-foreground"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border text-foreground hover:bg-card bg-transparent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Update User
        </Button>
      </div>
    </form>
  );
}
