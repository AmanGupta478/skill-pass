"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Inbox, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Entry = {
  id: string;
  entry: {
    id: string;
    title: string;
    type: string;
    description: string;
    createdAt: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  status?: "REQUESTED" | "APPROVED" | "REJECTED";
};

type CurrentUser = {
  name: string;
  role: string;
  avatar?: string;
};

export default function VerifDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const router = useRouter();

  // ---------- 1) Fetch Logged-in user ----------
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

  // ---------- 2) Fetch verification queue ----------
  const fetchVerificationById = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/varifire/review/${id}`, // ✅ fixed typo "varifire"
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch verification");
      }

      return await res.json();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Verification fetch error:", err.message);
        throw err;
      }
      throw new Error("Unexpected error fetching verification");
    }
  };

  const fetchAllVerifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/varifire/review`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 👈 ensure cookie token is sent
      });

      const data = await res.json(); // 👈 parse once

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}: ${data.message || "Unknown error"}`);
      }

      setEntries(data || []); 
    } catch (err) {
      console.error("Queue fetch error:", err);
      toast.error("Failed to load verification queue.");
    }
  };

  useEffect(() => {
    fetchAllVerifications();
  }, []);


  // ---------- 3) Logout ----------
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

      if (!res.ok) throw new Error(data?.message || "Logout failed");

      toast.success("Logged out successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Logout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-gray-100 flex flex-col justify-between">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2 mb-10">
            <Inbox className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">SkillPass</h1>
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 bg-slate-800 text-blue-400 hover:bg-slate-700"
            >
              Verification Queue
            </Button>
          </nav>
        </div>

        <div className="px-5 py-5 border-t border-slate-700">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.avatar || "/avatar.jpg"} alt={user?.name || "User"} />
              <AvatarFallback>
                {user?.name ? user.name[0].toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-xs text-white">
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

      {/* Main */}
      <main className="flex-1 p-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Verification Queue</h2>

        <Card className="rounded-xl shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-6 items-center gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <div className="col-span-2">Entry Title</div>
            <div>Student</div>
            <div>Type</div>
            <div>Date Submitted</div>
            <div className="text-right">Action</div>
          </div>

          {/* Body rows */}
          <div className="divide-y divide-gray-100">
            {entries.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center px-6 py-3 hover:bg-gray-50 transition"
              >
                <div className="md:col-span-2 text-sm font-medium text-gray-800">
                  {e.entry.title}
                </div>
                <div className="text-sm text-gray-700">{e.student.name}</div>
                <div className="text-sm text-gray-700">{e.entry.type}</div>
                <div className="text-sm text-gray-700">
                  {new Date(e.entry.createdAt).toLocaleDateString()}
                </div>

                <div className="flex justify-end items-center gap-2">
                  {e.status && (
                    <Badge
                      variant="outline"
                      className={`capitalize px-2 py-0.5 text-xs rounded ${e.status === "REQUESTED"
                        ? "border-blue-200 text-blue-600"
                        : e.status === "APPROVED"
                          ? "border-green-200 text-green-600"
                          : "border-red-200 text-red-600"
                        }`}
                    >
                      {e.status.toLowerCase()}
                    </Badge>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className="px-2 py-1 h-7 text-xs font-medium flex items-center gap-1"
                  >
                    <Link href={`/dashboard/verifier/review?id=${e.id}`}>
                      Review <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="text-center py-14 text-gray-500 text-sm">
                <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
                No verifications in the queue
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
