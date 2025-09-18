// app/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import FlagButton from "./components/FlagButton";
import CreateEntryDialog from "./components/CreateEntryDialog";
import EditEntryDialog from "./components/EditEntryDialog";
// import VerificationInbox from "./components/VerificationInbox";
import { Pencil, Trash2, Plus, Flag } from "lucide-react";
import { toast } from "sonner";

type Entry = {
  id: number;
  title: string;
  type: string;
  status: "Verified" | "Published" | "Pending Verification" | "Draft";
};

type User = {
  name: string;
  role: string;
  avatar?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");


  const [user, setUser] = useState<User | null>(null);

  // 🔹 Fetch logged-in user + entries
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/me`, {
          method: "GET",
          credentials: "include", // important if using cookie-based auth
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // if using JWT
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

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

    // ✅ also fetch entries when dashboard loads
    const fetchEntries = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/entri/getentries`;
        console.log("📡 Fetching entries from:", url);

        const res = await fetch(url, {
          method: "GET",
          credentials: "include", // send cookies (JWT)
        });

        if (!res.ok) {
          // Try to capture backend error response
          const text = await res.text();
          console.error("❌ Backend returned error:", {
            status: res.status,
            statusText: res.statusText,
            body: text,
          });
          throw new Error(`Failed to fetch entries: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("✅ Entries fetched successfully:", data);
        setEntries(data);
      } catch (err: any) {
        // Catch network/CORS/other errors
        console.error("❌ fetchEntries network/parse error:", err);
        toast.error("Failed to load entries.");
      }
    };


    fetchUser();
    fetchEntries();
  }, []);

  // Inside your component
  const handleFlag = async (entryId: string) => {
    try {
      // Ask user for a reason
      const reason = prompt("Please enter the reason for reporting this entry:");
      if (!reason) return; // Cancel if user didn't enter anything

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/flag/createflag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth token if needed
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ entryId, reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to report entry");
      }

      toast.success("Entry reported successfully!"); // Success notification
      console.log("Flag response:", data);
    } catch (error: any) {
      console.error("Error reporting entry:", error);
      toast.error(`Error: ${error.message}`); // Error notification
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

  const handleDelete = async (id: number) => {
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
            <Button
              variant="secondary"
              className="w-full justify-start font-medium hover:translate-x-1 transition"
            >
              📊 Dashboard
            </Button>

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-blue-600">{user?.name || "Loading..."}</span> 👋
          </h2>
          <CreateEntryDialog
            onSuccess={(newEntry) => setEntries((prev) => [newEntry, ...prev])}
          />
        </div>

        {/* Profile Completion */}
        <Card className="mb-8 border border-blue-100 shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-700">
              🎯 Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="w-full h-3" />
            <p className="mt-2 text-sm text-muted-foreground">75% Complete</p>
          </CardContent>
        </Card>

        {/* My Entries */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              📁 My Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col justify-between border rounded-2xl p-5 bg-white shadow hover:shadow-lg transition"
                >
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {entry.title}
                    </p>
                    <p className="text-sm text-gray-500">{entry.type}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Badge
                      className={
                        entry.status === "Verified"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : entry.status === "Published"
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : entry.status === "Pending Verification"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-gray-100 text-gray-700 border border-gray-300"
                      }
                    >
                      {entry.status}
                    </Badge>

                    <div className="flex gap-2 items-center">
                      {/* Use FlagButton here */}
                      <FlagButton entryId={entry.id} />

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
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>

  );
}
