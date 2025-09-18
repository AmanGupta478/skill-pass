"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

type FormValues = {
    title: string;
    type: "PROJECT" | "INTERNSHIP" | "CERT" | string;
    description: string;
    startDate: string;
    endDate?: string;
    tags?: string;
    file?: FileList;
};


export default function CreateEntryDialog({
    onSuccess,
}: {
    onSuccess?: (entry: any) => void;
}) {
    const [open, setOpen] = useState(false);

    const { register, handleSubmit, control, reset } = useForm<FormValues>({
        defaultValues: { type: "PROJECT" }, // ensure a default
    });

    const onSubmit = async (data: FormValues, status: "DRAFT" | "PUBLISHED") => {
        try {
            // Ensure type present (extra safety)
            const type = (data.type || "PROJECT").toString();

            let res;
            if (data.file && data.file.length > 0) {
                const formData = new FormData();
                formData.append("title", data.title);
                formData.append("type", type);
                formData.append("description", data.description);
                formData.append("startDate", new Date(data.startDate).toISOString());
                if (data.endDate) formData.append("endDate", data.endDate);
                formData.append("tags", data.tags?.split(",").map(t => t.trim()).join(",") || "");
                formData.append("status", status);
                formData.append("file", data.file[0]);

                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/entri/entries`, {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
            } else {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/entri/entries`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: data.title,
                        type,
                        description: data.description,
                        startDate: data.startDate,
                        endDate: data.endDate || null,
                        tags: data.tags || "",
                        status,
                    }),
                });
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to create entry");
            }

            const entry = await res.json();
            onSuccess?.(entry);

            reset();
            setOpen(false);

            return entry; // ✅ return created entry
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Create entry failed:", err);
                toast.error(err.message || "Create entry failed");
            } else {
                console.error("Unknown create entry error:", err);
                toast.error("Create entry failed");
            }
            return null; // ✅ always return something
        }
    };

    const handleVerificationRequest = async (formData: FormValues) => {
        try {
            toast.info("Creating entry and sending verification request...");

            // 1️⃣ Create entry first
            const entry = await onSubmit(formData, "DRAFT");
            if (!entry || !entry.id) {
                throw new Error("Entry creation failed, cannot send verification request");
            }

            // 2️⃣ Send verification request with real verifierId
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/varifire/request`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    verifierId: "b2a44ff8-2938-4cc1-a0fb-a6622802054d", // ✅ your real verifier ID
                    entryId: entry.id,
                    entryTitle: entry.title,
                    type: entry.type,
                    submittedDate: new Date().toISOString(),
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Verification request failed");
            }

            const verification = await res.json();
            toast.success("Entry saved & verification request sent!");
            console.log("✅ Verification:", verification);
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
                console.error("❌ Verification error:", err);
            } else {
                toast.error("Unexpected error");
                console.error("❌ Unknown error:", err);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    ➕ Add New Event
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl rounded-2xl">
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-t-2xl">
                    <DialogTitle className="text-white">✨ Create New Entry</DialogTitle>
                </DialogHeader>

                <form className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Title</Label>
                            <Input {...register("title", { required: true })} className="mt-2" />
                        </div>

                        <div>
                            <Label>Type</Label>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="mt-2">
                                            {field.value
                                                ? { PROJECT: "📁 Project", INTERNSHIP: "💼 Internship", CERT: "📜 Certification" }[field.value]
                                                : "Select type..."}
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PROJECT">📁 Project</SelectItem>
                                            <SelectItem value="INTERNSHIP">💼 Internship</SelectItem>
                                            <SelectItem value="CERT">📜 Certification</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                        </div>

                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea {...register("description", { required: true })} rows={4} className="mt-2" />
                    </div>

                    <div>
                        <Label>Duration</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="p-3 border rounded-lg">
                                <Label className="text-sm">Start Date</Label>
                                <Input {...register("startDate", { required: true })} type="date" className="mt-1" />
                            </div>
                            <div className="p-3 border rounded-lg">
                                <Label className="text-sm">End Date</Label>
                                <Input {...register("endDate")} type="date" className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Tags</Label>
                        <Input {...register("tags")} placeholder="React, TypeScript" className="mt-2" />
                    </div>

                    <div>
                        <Label>File</Label>
                        <Input {...register("file")} type="file" accept=".png,.jpg,.jpeg,.pdf" className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">

                        <div className="flex justify-end gap-3">
                            {/* Save Draft */}
                            <Button
                                onClick={handleSubmit((d) => {
                                    toast.info("Saving draft...");
                                    onSubmit(d, "DRAFT")
                                        .then(() => toast.success("Draft saved successfully!"))
                                        .catch(() => toast.error("Failed to save draft."));
                                })}
                            >
                                Save Draft
                            </Button>

                            {/* Request Verification */}
                            <Button
                                onClick={handleSubmit((d) => handleVerificationRequest(d))}
                                className="bg-green-600 text-white"
                            >
                                Req Verification
                            </Button>

                            {/* Publish */}
                            <Button
                                onClick={handleSubmit((d) => {
                                    toast.info("Publishing entry...");
                                    onSubmit(d, "PUBLISHED")
                                        .then(() => toast.success("Entry published successfully!"))
                                        .catch(() => toast.error("Failed to publish entry."));
                                })}
                                className="bg-blue-600 text-white"
                            >
                                Publish
                            </Button>


                        </div>
                    </div>


                </form>
            </DialogContent>
        </Dialog>
    );
}
