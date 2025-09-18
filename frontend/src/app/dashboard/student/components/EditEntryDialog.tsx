// app/dashboard/components/EditEntryDialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


type EditEntryDialogProps = {
    entry: any;
    onSuccess: (updatedEntry: any) => void;
};

export default function EditEntryDialog({ entry, onSuccess }: EditEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        title: entry.title,
        type: entry.type,
        description: entry.description || "",
        startDate: entry.startDate ? entry.startDate.split("T")[0] : "",
        endDate: entry.endDate ? entry.endDate.split("T")[0] : "",
        tags: entry.tags?.join(", ") || "",
        status: entry.status,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/entri/updateentries/${entry.id}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                }
            );

            const data = await res.json();

            if (!res.ok) throw new Error(data?.message || "Failed to update entry");

            onSuccess(data.entry);
            toast.success("Entry updated successfully!");
            setOpen(false);
        } catch (err: any) {
            console.error("❌ Edit failed:", err);
            toast.error(err.message || "Failed to edit entry.");
        }
    };

    return (
        <>
            <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
                ✏️
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Entry</DialogTitle>
                    </DialogHeader>

                    {/* Title */}
                    <Input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Title"
                    />

                    {/* Type Dropdown */}
                    <Select
                        value={form.type}
                        onValueChange={(val) => setForm({ ...form, type: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PROJECT">PROJECT</SelectItem>
                            <SelectItem value="INTERNSHIP">INTERNSHIP</SelectItem>
                            <SelectItem value="CERT">CERTIFICATION</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Description */}
                    <Input
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Description"
                    />

                    {/* Dates */}
                    <Input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                    />
                    <Input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                    />

                    {/* Tags */}
                    <Input
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="Tags (comma separated)"
                    />

                    {/* Status Dropdown */}
                    <Select
                        value={form.status}
                        onValueChange={(val) => setForm({ ...form, status: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DRAFT">DRAFT</SelectItem>
                            <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                        </SelectContent>
                    </Select>

                    <DialogFooter>
                        <Button onClick={handleSubmit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}
