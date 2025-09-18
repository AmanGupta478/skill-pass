// controllers/flagController.js
import prisma from "../prismaClient.js";

/**
 * @desc Create a new flag for an entry
 * @route POST /v1/flags
 * @access Authenticated (Student / Verifier / Admin)
 */
export const createFlag = async (req, res) => {
  try {
    const { entryId, reason } = req.body;

    if (!entryId || !reason) {
      return res.status(400).json({ message: "entryId and reason are required" });
    }

    // Optionally validate the entry exists
    const entry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const flag = await prisma.flag.create({
      data: {
        entryId,
        reason,
        createdByUserId: req.user.id, // set by your auth middleware
      },
    });

    return res.status(201).json(flag);
  } catch (error) {
    console.error("Error creating flag:", error);
    return res.status(500).json({ message: "Failed to create flag" });
  }
};

/**
 * @desc List all flags (admin only)
 * @route GET /v1/flags
 * @access Admin
 */
export const listFlags = async (req, res) => {
  try {
    const flags = await prisma.flag.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        entry: true,
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json(flags);
  } catch (error) {
    console.error("Error fetching flags:", error);
    return res.status(500).json({ message: "Failed to fetch flags" });
  }
};

/**
 * @desc Resolve a flag (set status = RESOLVED)
 * @route PATCH /v1/flags/:id/resolve
 * @access Admin
 */
export const resolveFlag = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.flag.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Flag not found" });
    }

    const updated = await prisma.flag.update({
      where: { id },
      data: { status: "RESOLVED" },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error resolving flag:", error);
    return res.status(500).json({ message: "Failed to resolve flag" });
  }
};
