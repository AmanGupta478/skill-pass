"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateEntryDialog from "../components/CreateEntryDialog";
import EditEntryDialog from "@/app/dashboard/student/components/EditEntryDialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Entry {
  id: string;
  title: string;
  type: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

interface User {
  name: string;
  role: string;
  avatar?: string;
}

export default function MyEntriesPage() {

  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user + entries
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`, {
          method: "GET",
          credentials: "include",
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

    const fetchEntries = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/entri/getentries`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch entries");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          setEntries([]);
        }
      } catch (err) {
        console.error("Error fetching entries:", err);
        toast.error("Failed to load entries.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchEntries();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Logout failed");
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Logout failed. Please try again.");
    }
  };

  // Delete Entry
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/entri/delelaentries/${id}`,
        {
          method: "DELETE",
          credentials: "include", // ensure cookies/JWT are sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete entry");
      }

      // ✅ Remove from local state after successful API call
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      toast.success("Entry deleted successfully!");
    } catch (err: any) {
      console.error("❌ Delete failed:", err);
      toast.error(err.message || "Failed to delete entry. Please try again.");
    }
  };


  const statusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Published":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Pending Verification":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "Draft":
        return "bg-gray-200 text-gray-700 border border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  if (loading) return <p className="p-10">Loading entries...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-md flex flex-col justify-between sticky top-0 h-screen border-r">
        {/* Top Section */}
        <div className="p-6">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SkillPass
          </h1>

          {/* Navigation */}
          <nav className="mt-8 flex flex-col gap-2">
            <Link href="/dashboard/student">
              <Button
                variant="secondary"
                className="w-full justify-start font-medium hover:translate-x-1 transition"
              >
                📊 Dashboard
              </Button>
            </Link>

            <Link href="/dashboard/student/my-entries">
              <Button
                variant="ghost"
                className="w-full justify-start font-medium hover:bg-blue-50 hover:text-blue-600 transition"
              >
                📁 My Entries
              </Button>
            </Link>

            <Link href="/dashboard/student/VerificationInbox">
              <Button
                variant="ghost"
                className="w-full justify-start font-medium hover:bg-blue-50 hover:text-blue-600 transition"
              >
                📬 Verification Inbox
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-start font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >
              ⚙️ Profile Settings
            </Button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-6 border-t space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://i.pravatar.cc/50"}
              alt="avatar"
              className="w-12 h-12 rounded-full border shadow-sm"
            />
            <div>
              <p className="font-semibold">{user?.name || "Loading..."}</p>
              <p className="text-sm text-muted-foreground">{user?.role}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-50 transition"
            onClick={handleLogout}
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📁 My Entries</h1>
          <CreateEntryDialog
            onSuccess={(newEntry) => setEntries((prev) => [...prev, newEntry])}
          />
        </div>

        <Card className="overflow-hidden shadow-sm border border-gray-100">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">TITLE</th>
                <th className="px-6 py-3 text-left font-semibold">TYPE</th>
                <th className="px-6 py-3 text-left font-semibold">DATE RANGE</th>
                <th className="px-6 py-3 text-left font-semibold">STATUS</th>
                <th className="px-6 py-3 text-left font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{entry.title}</td>
                  <td className="px-6 py-4 text-gray-700">{entry.type}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {entry.startDate
                      ? `${new Date(entry.startDate).toLocaleDateString()} - ${entry.endDate ? new Date(entry.endDate).toLocaleDateString() : "Present"
                      }`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={statusColor(entry.status)}>{entry.status}</Badge>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <EditEntryDialog
                      entry={entry}
                      onSuccess={(updatedEntry) =>
                        setEntries((prev) =>
                          prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
                        )
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-red-50"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
