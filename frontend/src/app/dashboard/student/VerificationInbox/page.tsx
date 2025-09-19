"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
    name: string;
    role: string;
    avatar?: string;
}

interface VerificationRequest {
    id: string;
    entryTitle?: string;
    status: "REQUESTED" | "APPROVED" | "REJECTED";
    verifier?: string;
    entry?: {
        title: string;
        type: string;
    };
}

export default function VerificationInbox() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const getVerifierName = (verifier: any) => {
        if (!verifier) return "Unknown";
        if (typeof verifier === "string") return verifier;
        if (typeof verifier === "object" && "name" in verifier) return verifier.name;
        return "Unknown";
    };
    // Fetch user
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

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/varifire/mine`, {
                    method: "GET",
                    credentials: "include",
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.message || "Failed to fetch inbox");
                setRequests(data || []);
            } catch (err: any) {
                console.error("Inbox fetch error:", err);
                toast.error(err.message || "Failed to load inbox.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
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
                <h2 className="text-3xl font-bold text-gray-800 mb-8">📬 Verification Inbox</h2>

                <Card className="mb-8 border border-yellow-100 shadow-sm hover:shadow-md transition">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-yellow-700">
                            Incoming Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-gray-500">Loading requests...</p>
                        ) : requests.length === 0 ? (
                            <p className="text-gray-500">No verification requests found.</p>
                        ) : (
                            requests.map((req) => (
                                <div
                                    key={req.id}
                                    className="flex items-center justify-between border rounded-xl p-4 mb-3 bg-white shadow-sm hover:shadow transition"
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            {req.entry?.title || req.entryTitle || "Untitled Entry"}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Verifier: {getVerifierName(req.verifier)}
                                        </p>
                                    </div>
                                    <Badge
                                        className={
                                            req.status === "APPROVED"
                                                ? "bg-green-100 text-green-700 border border-green-300"
                                                : req.status === "REQUESTED"
                                                    ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                                    : "bg-red-100 text-red-700 border border-red-300"
                                        }
                                    >
                                        {req.status}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
