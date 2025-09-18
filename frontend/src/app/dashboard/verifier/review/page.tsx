"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReviewPage() {
    const params = useSearchParams();
    const router = useRouter();
    const id = params.get("id");

    const [entry, setEntry] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // ✅ fetch verification details
    useEffect(() => {
        if (!id) return;
        const fetchVerification = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/v1/varifire/review/${id}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load");

                setEntry(data);
            } catch (err: any) {
                toast.error(err.message || "Failed to load verification");
            } finally {
                setLoading(false);
            }
        };
        fetchVerification();
    }, [id]);

    const handleReview = async (status: "APPROVED" | "REJECTED") => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/varifire/review/${id}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");

            toast.success(`Verification ${status.toLowerCase()}`);
            router.push("/dashboard/verifier"); // 👈 back to queue
        } catch (err: any) {
            toast.error(err.message || "Review failed");
        }
    };

    if (loading) {
        return <div className="p-10 text-gray-600">Loading verification...</div>;
    }

    if (!entry) {
        return <div className="p-10 text-gray-600">No verification entry found.</div>;
    }

    // ✅ safe values
    const title = entry.entry?.title || entry.entryTitle || "Untitled";
    const description = entry.entry?.description || "No description provided";
    const type = entry.entry?.type || entry.type || "Unknown";
    const submittedDate = entry.submittedDate || entry.entry?.createdAt || entry.createdAt;
    const studentName = entry.student?.name || "Unknown Student";

    return (
        <div className="p-8 max-w-2xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center mb-6">
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mr-4 ring-2 ring-blue-200">
                    <span className="text-blue-600 font-bold text-xl">✔</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 leading-snug">
                        {title} by {studentName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Verified achievement record</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-8 text-base leading-relaxed">
                {description}
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                <div className="flex flex-col bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition hover:shadow-md">
                    <span className="font-medium text-gray-500 mb-1 uppercase tracking-wide text-xs">
                        Type
                    </span>
                    <span className="text-gray-800 font-semibold text-base">{type}</span>
                </div>
                <div className="flex flex-col bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition hover:shadow-md">
                    <span className="font-medium text-gray-500 mb-1 uppercase tracking-wide text-xs">
                        Submitted
                    </span>
                    <span className="text-gray-800 font-semibold text-base">
                        {submittedDate ? new Date(submittedDate).toLocaleDateString() : "N/A"}
                    </span>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-end gap-3">
                <button
                    onClick={() => router.push("/dashboard/verifier")}
                    className="px-5 py-2.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow-sm transition"
                >
                    Close
                </button>
                <button
                    onClick={() => handleReview("REJECTED")}
                    className="px-5 py-2.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-md transition"
                >
                    Reject
                </button>
                <button
                    onClick={() => handleReview("APPROVED")}
                    className="px-5 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium shadow-md transition"
                >
                    Approve & Finalize
                </button>
            </div>
        </div>
    );
}
