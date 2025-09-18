import prisma from "../prismaClient.js";  // 


// Student requests verification for an entry
export const requestVerification = async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can request verification" });
    }

    const studentId = req.user.id;
    const { verifierId, entryId, entryTitle, type, submittedDate } = req.body;

    // Ensure entry exists
    const entry = await prisma.entry.findUnique({ where: { id: entryId } });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    // Ensure verifier exists
    const verifier = await prisma.user.findUnique({ where: { id: verifierId } });
    if (!verifier || verifier.role !== "VERIFIER") {
      return res.status(400).json({ message: "Invalid verifier ID" });
    }

    // Create verification
    const verification = await prisma.verification.create({
      data: {
        studentId,
        verifierId,
        entryId,
        entryTitle,
        type,
        submittedDate,
        status: "PENDING",
      },
    });

    return res.status(201).json(verification);
  } catch (err) {
    console.error("❌ Error requesting verification:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllVerifications = async (req, res) => {
  try {
    if (req.user.role !== "VERIFIER") {
      return res.status(403).json({ message: "Only verifiers can view verifications" });
    }

    const verifications = await prisma.verification.findMany({
      where: {
        verifierId: req.user.id, // ✅ only the logged-in verifier’s assigned ones
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        entry: {
          select: { id: true, title: true, type: true, description: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(verifications);
  } catch (err) {
    console.error("❌ Error fetching all verifications:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getVerification = async (req, res) => {
  try {
    if (req.user.role !== "VERIFIER") {
      return res.status(403).json({ message: "Only verifiers can view verifications" });
    }

    const { id } = req.params; // verificationId

    const verification = await prisma.verification.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        entry: { select: { id: true, title: true, type: true, description: true } },
      },
    });

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    if (verification.verifierId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this verification" });
    }

    return res.json(verification);
  } catch (err) {
    console.error("❌ Error fetching verification:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verifier reviews (approve/reject)
export const reviewVerification = async (req, res) => {
  try {
    if (req.user.role !== "VERIFIER") {
      return res.status(403).json({ message: "Only verifiers can review verifications" });
    }

    const { id } = req.params; // verificationId
    const { status, note } = req.body; // "APPROVED" | "REJECTED"

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const verification = await prisma.verification.findUnique({ where: { id } });

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    // Ensure only assigned verifier can act
    if (verification.verifierId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized for this verification" });
    }

    const updated = await prisma.verification.update({
      where: { id },
      data: { status, note },
    });

    return res.json(updated);
  } catch (err) {
    console.error("❌ Error reviewing verification:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Student fetches their verifications (Verification Index)
export const getMyVerifications = async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can view their verifications" });
    }

    const verifications = await prisma.verification.findMany({
      where: { studentId: req.user.id },
      include: {
        verifier: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(verifications);
  } catch (err) {
    console.error("❌ Error fetching verifications:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
