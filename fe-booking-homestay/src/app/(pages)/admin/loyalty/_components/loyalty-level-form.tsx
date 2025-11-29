"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoyaltyLevel } from "@/types/loyal"

interface Props {
  initialData?: LoyaltyLevel
  onSave: (data: Omit<LoyaltyLevel, "id">) => void
  onCancel: () => void
}

export default function LoyaltyLevelForm({ initialData, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    minPoints: initialData?.minPoints || 0,
    description: initialData?.description || "",
    isActive: initialData?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-foreground">
          Level Name
        </Label>
        <Input
          id="name"
          placeholder="e.g., Silver, Gold, Platinum"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minPoints" className="text-foreground">
            Minimum Points
          </Label>
          <Input
            id="minPoints"
            type="number"
            value={formData.minPoints}
            onChange={(e) => setFormData({ ...formData, minPoints: Number.parseInt(e.target.value) || 0 })}
            className="mt-2 bg-input border-border text-foreground"
            required
          />
        </div>
        <div>
          <Label htmlFor="description" className="text-foreground">
            Description
          </Label>
          <Input
            id="description"
            type="number"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-2 bg-input border-border text-foreground"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4 rounded border-border bg-input"
        />
        <Label htmlFor="active" className="text-foreground">
          Active
        </Label>
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
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Level
        </Button>
      </div>
    </form>
  )
}
