//I have this api which get all user `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/get` 
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2 ,Inbox} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import GetAllFlags from "./components/getAllFlags";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type CurrentUser = {
  name: string;
  role: string;
  avatar?: string;
};

type AdminUser = {
  id: string;            // keep the id for delete/edit
  name: string;
  email: string;
  role: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  // ---------- 1) Logged-in user ----------
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser({
          name: data?.name || "Guest",
          role: data?.role || "User",
          avatar: data?.avatar || "https://i.pravatar.cc/50",
        });
      } catch (err) {
        console.error("User fetch error:", err);
        toast.error("Failed to load user details.");
      }
    };

    fetchUser();
  }, []);

  // ---------- 2) All non-admin users ----------
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/get`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        const rawUsers = data?.users || data;

        // Map API -> AdminUser, keep id but don’t display it
        const mapped: AdminUser[] = rawUsers.map((u: any) => ({
          id: u.id || u._id,     // adapt to your backend
          name: u.name,
          email: u.email,
          role: u.role,
        }));

        // Remove admins
        const nonAdmins = mapped.filter(
          (u) => u.role?.toLowerCase() !== "admin"
        );

        setUsers(nonAdmins);
      } catch (err) {
        console.error("Users fetch error:", err);
        toast.error("Unable to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete user");

      // Remove deleted user from local state
      setUsers((prev) => prev.filter((u) => u.id !== id));

      toast.success("User deleted successfully!");
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error("Could not delete user.");
    }
  };

  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    email: "",
    role: "STUDENT",
    password: "",
  });

  const openEditModal = (u: AdminUser) => {
    setEditData({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password: "",
    });
    setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/update/${editData.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name: editData.name,
            email: editData.email,
            role: editData.role,
            password: editData.password || undefined, // send only if filled
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to update user");
      }

      const updatedUser = await res.json(); // expect backend returns updated user

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updatedUser.id
            ? {
              ...u,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
            }
            : u
        )
      );

      toast.success("User updated successfully!");
      setOpenEdit(false);
    } catch (err: any) {
      console.error("Update user error:", err);
      toast.error(err.message || "Could not update user.");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Logout failed");
      }

      toast.success("Logged out successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Inbox className="h-6 w-6 text-blue-400" />
            <h1 className="text-lg font-bold text-gray-800">SkillPass</h1>
          </div>
          <nav>
            <button className="w-full text-left px-3 py-2 rounded-md bg-blue-50 text-blue-700 font-medium">
              Admin Panel
            </button>
          </nav>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.avatar || "/avatar.jpg"} alt={user?.name || "User"} />
              <AvatarFallback>
                {user?.name ? user.name[0].toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-xs text-gray-500">
                {user ? user.role : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-4 w-full justify-start text-red-500 hover:bg-red-50 transition"
            onClick={handleLogout}
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
        <Tabs defaultValue="flags" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="flags">Flags</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="flags">
            <GetAllFlags />
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardContent className="p-4 text-gray-500">Metrics content...</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="p-6 text-gray-500">Loading users...</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((u, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                            <td className="py-3 px-4 text-gray-600">{u.email}</td>
                            <td className="py-3 px-4 text-gray-600">{u.role}</td>
                            <td className="py-3 px-4 text-right space-x-3">
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Edit user"
                                onClick={() => openEditModal(u)}
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Delete user"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>

                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </main>
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={editData.role} onValueChange={(v) => setEditData({ ...editData, role: v })}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="VERIFIER">Verifier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="New password"
                value={editData.password}
                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
