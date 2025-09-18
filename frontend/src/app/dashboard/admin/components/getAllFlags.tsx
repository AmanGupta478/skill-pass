"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Flag = {
    id: string;
    title: string;
    reason: string;
    reporter: string;
    status?: string;
};

export default function GetAllFlags() {
    const [flags, setFlags] = useState<Flag[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingIds, setResolvingIds] = useState<string[]>([]); // track resolving flags

    // Fetch flags
    const fetchFlags = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/flag/listflags`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch flags");

            const mappedFlags = data.map((flag: any) => ({
                id: flag.id,
                title: flag.entry.title,
                reason: flag.reason,
                reporter: flag.createdByUser.name || flag.createdByUser.email,
                status: flag.status || "Open",
            }));

            setFlags(mappedFlags);
        } catch (err) {
            console.error("Error fetching flags:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    // Resolve a flag
    const handleResolve = async (id: string) => {
        try {
            setResolvingIds((prev) => [...prev, id]); // mark as resolving

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/flag/resolve/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to resolve flag");

            // Update local state
            setFlags((prev) =>
                prev.map((flag) => (flag.id === id ? { ...flag, status: "Resolved" } : flag))
            );
        } catch (err: any) {
            console.error("Error resolving flag:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setResolvingIds((prev) => prev.filter((fid) => fid !== id));
        }
    };

    if (loading) return <p className="text-gray-500 p-4">Loading flags...</p>;
    if (!flags.length) return <p className="text-gray-500 p-4">No flags found.</p>;

    return (
        <Card className="shadow-sm">
            <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                        <tr>
                            <th className="py-3 px-4">Entry Title</th>
                            <th className="py-3 px-4">Reason</th>
                            <th className="py-3 px-4">Reporter</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flags.map((flag) => (
                            <tr key={flag.id} className="border-b last:border-0">
                                <td className="py-3 px-4 font-medium text-gray-900">{flag.title}</td>
                                <td className="py-3 px-4 text-gray-600">{flag.reason}</td>
                                <td className="py-3 px-4 text-gray-600">{flag.reporter}</td>
                                <td className="py-3 px-4">
                                    <Badge
                                        variant={flag.status === "Open" ? "secondary" : "outline"}
                                        className={
                                            flag.status === "Open"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                        }
                                    >
                                        {flag.status}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        disabled={flag.status === "Resolved" || resolvingIds.includes(flag.id)}
                                        onClick={() => handleResolve(flag.id)}
                                    >
                                        {resolvingIds.includes(flag.id)
                                            ? "Resolving..."
                                            : flag.status === "Resolved"
                                                ? "Resolved"
                                                : "Resolve"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
