
import prisma  from "../prismaClient.js";

export const getAll = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        return res.json(users);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
}

// Get a single user by id
export const getById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "User id is required" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            })
        }
        return res.status(200).json({
            user,
            success: true
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching user" });
    }
}

export const update = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    if (!id) return res.status(400).json({ message: "User id is required" });

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role }),
                ...(password && { password }), // hash if needed
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return res.json(updatedUser);
    } catch (error) {
        console.error(error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).json({ message: error.message });
    }
};


export const changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "User id is required" });
        }
        const { role } = req.body;
        if (!["STUDENT", "VERIFIER", "ADMIN"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
                success: false
            });
        }
        const updated = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        return res.json({
            message: "Role updated",
            user: updated,
            success: true
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error changing role" });
    }
}

// Delete a user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "User id is required" });
        }

        await prisma.user.delete({
            where: { id },
        });

        return res.json({
            message: "User deleted successfully",
            success: true,
        });
    } catch (err) {
        // Handle "record not found" (Prisma error P2025)
        if (err.code === "P2025") {
            return res.status(404).json({ message: "User not found" });
        }

        console.error("Error deleting user:", err);
        return res.status(500).json({ message: "Error deleting user" });
    }
};


