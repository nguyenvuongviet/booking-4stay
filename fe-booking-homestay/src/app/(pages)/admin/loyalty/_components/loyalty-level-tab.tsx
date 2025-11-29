"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Power } from "lucide-react";
import LoyaltyLevelForm from "./loyalty-level-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllLevels } from "@/services/admin/loyalApi";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/user";
import { format } from "date-fns";
import { LoyaltyLevel } from "@/types/loyal";

export default function LoyaltyLevelsTab() {
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingLevel = levels.find((l) => l.id === editingId);
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllLevels();
      setLevels(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách người dùng";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = (data: Omit<LoyaltyLevel, "id">) => {
    if (editingId) {
      setLevels(
        levels.map((l) => (l.id === editingId ? { ...l, ...data } : l))
      );
    } else {
      setLevels([...levels, { ...data, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleToggleActive = (id: string) => {
    setLevels(
      levels.map((l) => (l.id === id ? { ...l, active: !l.isActive } : l))
    );
  };

  const handleDelete = (id: string) => {
    setLevels(levels.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Level
        </Button>
      </div>

      <div className="grid gap-4">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`p-6 border rounded-lg transition-colors ${
              level.isActive
                ? "border-border bg-card"
                : "border-border/50 bg-card/50 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {level.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {level.description.toLocaleString()}
                </p>
                <div className="flex gap-4 mt-3">
                  <span className="text-sm">
                    <span
                      className={`font-medium ${
                        level.isActive
                          ? "text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {level.isActive ? "● Active" : "● Inactive"}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(level.id.toString())}
                  className="border-border hover:bg-card"
                >
                  <Power className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(level.id.toLocaleString());
                    setShowForm(true);
                  }}
                  className="border-border hover:bg-card"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(level.id.toLocaleString())}
                  className="border-border hover:bg-destructive/10 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingId ? "Edit Loyalty Level" : "Create New Level"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the loyalty level details"
                : "Add a new loyalty level to your program"}
            </DialogDescription>
          </DialogHeader>
          <LoyaltyLevelForm
            initialData={editingLevel}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
