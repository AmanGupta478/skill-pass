
import prisma  from "../prismaClient.js";


const ALLOWED_TYPES = ["PROJECT", "INTERNSHIP", "CERT"];
const ALLOWED_STATUSES = ["DRAFT", "PUBLISHED"];

export const createEntry = async (req, res) => {
    try {
        // console.log("📥 Incoming body:", req.body);
        // console.log("📎 Incoming file:", req.file);

        const userId = req.user.id;
        const profile = await prisma.profile.findUnique({ where: { userId } });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found — create one first." });
        }

        let { title, type, description, startDate, endDate, tags, status } = req.body;

        // ✅ Normalize + validate values
        type = (type || "PROJECT").toUpperCase();
        status = (status || "DRAFT").toUpperCase();

        if (!ALLOWED_TYPES.includes(type)) {
            return res.status(400).json({ message: `Invalid type: ${type}` });
        }
        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({ message: `Invalid status: ${status}` });
        }

        // ✅ Parse tags flexibly
        let parsedTags = [];
        if (tags) {
            if (Array.isArray(tags)) {
                parsedTags = tags.map((t) => t.trim());
            } else if (typeof tags === "string") {
                try {
                    const json = JSON.parse(tags);
                    if (Array.isArray(json)) {
                        parsedTags = json.map((t) => t.trim());
                    } else {
                        parsedTags = tags.split(",").map((t) => t.trim());
                    }
                } catch {
                    parsedTags = tags.split(",").map((t) => t.trim());
                }
            }
        }

        // ✅ File handling
        let fileData, fileName, fileType;
        if (req.file) {
            fileData = req.file.buffer;
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
        }

        const entry = await prisma.entry.create({
            data: {
                profileId: profile.id,
                title,
                type,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                tags: parsedTags,
                status,
                fileName,
                fileType,
                fileData,
            },
        });

        return res.status(201).json(entry);
    } catch (err) {
        console.error("❌ createEntry error:", err);
        return res.status(500).json({
            message: "Server error while creating entry",
            error: err.message,
        });
    }
};

// ✅ LIST ENTRIES
export const listEntries = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await prisma.profile.findUnique({
            where: { userId: req.user.id },
        });
        if (!profile) return res.status(404).json({ message: "Profile not found" });

        const entries = await prisma.entry.findMany({
            where: { profileId: profile.id, isDeleted: false },
            include: { assets: true },
            orderBy: { createdAt: "desc" },
        });

        res.json(entries);
    } catch (err) {
        console.error("listEntries error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getEntries = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find profile for logged-in user
        const profile = await prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Fetch entries for this profile
        const entries = await prisma.entry.findMany({
            where: { profileId: profile.id, isDeleted: false },
            orderBy: { createdAt: "desc" },
        });

        res.json(entries);
    } catch (err) {
        console.error("❌ getEntries error:", err);
        res.status(500).json({ message: "Server error while fetching entries" });
    }
};

// ✅ GET ENTRY BY ID
export const getEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const entry = await prisma.entry.findUnique({
            where: { id },
            include: { assets: true, verifications: true },
        });

        if (!entry || entry.isDeleted) {
            return res.status(404).json({ message: "Entry not found" });
        }

        res.json(entry);
    } catch (err) {
        console.error("getEntryById error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ UPDATE ENTRY
export const updateEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, type, description, startDate, endDate, tags, status } = req.body;

        const entry = await prisma.entry.findUnique({ where: { id } });
        if (!entry) return res.status(404).json({ message: "Entry not found" });

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (entry.profileId !== profile.id) {
            return res.status(403).json({ message: "Not your entry" });
        }

        const updated = await prisma.entry.update({
            where: { id },
            data: {
                title: title ?? entry.title,
                type: type ?? entry.type,
                description: description ?? entry.description,
                startDate: startDate ? new Date(startDate) : entry.startDate,
                endDate: endDate ? new Date(endDate) : entry.endDate,
                tags: tags
                    ? Array.isArray(tags)
                        ? tags
                        : tags.split(",").map((t) => t.trim())
                    : entry.tags,
                status: status ?? entry.status,
            },
        });

        res.json({ success: true, entry: updated });
    } catch (err) {
        console.error("updateEntry error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ DELETE ENTRY (Soft Delete)
export const softDeleteEntry = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const entry = await prisma.entry.findUnique({ where: { id } });
        if (!entry) return res.status(404).json({ message: "Entry not found" });

        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (entry.profileId !== profile.id) {
            return res.status(403).json({ message: "Not your entry" });
        }

        await prisma.entry.update({
            where: { id },
            data: { isDeleted: true },
        });

        res.json({ message: "Entry deleted successfully" });
    } catch (err) {
        console.error("softDeleteEntry error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
