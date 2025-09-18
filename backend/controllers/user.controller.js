import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// import { Request, Response } from "express";
import prisma from "../prismaClient.js";
import { Role } from "@prisma/client";

dotenv.config();


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = ["STUDENT", "ADMIN", "VERIFIER"];
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing",
        success: false,
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles: STUDENT, ADMIN, VERIFIER",
        success: false,
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create User + Profile in one go
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role[role],
        profile: {
          create: {
            slug: email.split("@")[0], // simple slug
            bio: "",
            headline: "",
            isPublic: false,
          },
        },
      },
      include: { profile: true },
    });

    return res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check input
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    // 2️⃣ Find user + include profile
    const user = await prisma.user.findUnique({
      where: { email },
      // include: { profile: true }, // ✅ fetch profile too
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    // 5️⃣ Send response
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      id: user.id,
      email: user.email,
      name: user.name,   // ✅ add name here
      role: user.role,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ------------------ LOGOUT ------------------
export const logout = async (_req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0, httpOnly: true, sameSite: 'strict' }).json({
      message: "Logged out successfully.",
      success: true
    });
  } catch (error) {
    console.log(error);
  }
}

// ------------------ CURRENT USER ------------------
export const me = async (req, res) => {
  try {
    // req.user is set in middleware
    return res.json({
      id: req.user.id,
      name: req.user.name,   // 👈 include name
      email: req.user.email,
      role: req.user.role,   // 👈 include role
      avatar: req.user.avatar || null, // if you store it
    });
  } catch (err) {
    console.error("Fetch user error:", err.message);
    return res.status(500).json({ message: "Failed to fetch user info" });
  }
};


