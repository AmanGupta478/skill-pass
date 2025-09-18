"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Flag } from "lucide-react";

type FlagButtonProps = {
    entryId: string | number;
};

export default function FlagButton({ entryId }: FlagButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason) {
            toast.error("Please enter a reason!");
            return;
        }

        setLoading(true);
        try {
            // Get token from localStorage (or cookies if you use cookies)
            const token = localStorage.getItem("token");
            console.log("JWT Token:", token); // Debug: check if token exists

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/flag/createflag`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // send cookies
                body: JSON.stringify({ entryId: entryId.toString(), reason }),
            });


            console.log("Response status:", res.status); // Debug: check status code

            const data = await res.json();
            console.log("Response body:", data); // Debug: check server response

            if (!res.ok) throw new Error(data.message || "Failed to report entry");

            toast.success("Entry reported successfully!");
            setTimeout(() => {
                setIsOpen(false);
                setReason("");
            }, 300);
        } catch (error: any) {
            console.error("Error reporting entry:", error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-50"
                onClick={() => setIsOpen(true)}
            >
                <Flag className="w-4 h-4 text-red-500" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Report Entry</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Input
                            placeholder="Enter reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <DialogFooter className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsOpen(false);
                                setReason("");
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Reporting..." : "Report"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
