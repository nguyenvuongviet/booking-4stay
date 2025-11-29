"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserLoyaltyForm from "./user-loyalty-form";
import { useToast } from "@/components/ui/use-toast";
import { User, UserLoyaltyFormData } from "@/types/user";
import { getAllUsers } from "@/services/admin/usersApi";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function UserLoyaltyTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
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

  const editingUser = users.find((u) => u.id === editingId);
  const filteredUsers = users.filter(
    (u) =>
      u.lastName!.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (data: UserLoyaltyFormData) => {
    if (editingId) {
      setUsers(users.map((u) => (u.id === editingId ? { ...u, ...data } : u)));
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleRowClick = (id: number) => {
    router.push(`/admin/loyalty/${id}`);
  };
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2 w-4 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                User ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                Points
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                Level
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">
                Join Date
              </th>
              {/* <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                // onClick={() => handleRowClick(user.id)}
                className="border-b border-border hover:bg-card/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-foreground font-mono">
                  {user.id}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-primary font-semibold">
                  {user.loyalty_program.totalPoint.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.loyalty_program.levels.name === "GOLD"
                        ? "bg-yellow-100 text-yellow-800"
                        : user.loyalty_program.levels.name === "BRONZE"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {user.loyalty_program.levels.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), "dd/MM/yyyy")}
                </td>
                {/* <td className="px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(user.id)
                      setShowForm(true)
                    }}
                    className="border-border hover:bg-card"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit User Loyalty
            </DialogTitle>
            <DialogDescription>
              Update loyalty information for {editingUser?.firstName}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserLoyaltyForm
              initialData={editingUser}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
