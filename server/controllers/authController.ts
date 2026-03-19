import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "hotel-sai-development-secret";

function issueUserToken(user: { _id: mongoose.Types.ObjectId; email: string }) {
  return jwt.sign(
    { role: "user", userId: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function issueAdminToken(username: string) {
  return jwt.sign(
    { role: "admin", username },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error during registration" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    return res.json({
      success: true,
      token: issueUserToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, error: error.message || "Server error during login" });
  }
};

export const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === adminUsername && password === adminPassword) {
      return res.json({
        success: true,
        token: issueAdminToken(adminUsername),
      });
    }

    return res.status(401).json({ success: false, error: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const getCurrentUser = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Invalid session" });
    }

    const user = await User.findById(userId).select("name email");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({
      success: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error("Get profile error:", error?.message || error);
    return res.status(500).json({ success: false, error: "Failed to load profile" });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Invalid session" });
    }

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email is already in use" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("name email");

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({
      success: true,
      user: { id: updatedUser._id.toString(), name: updatedUser.name, email: updatedUser.email },
    });
  } catch (error: any) {
    console.error("Update profile error:", error?.message || error);
    return res.status(500).json({ success: false, error: "Failed to update profile" });
  }
};

export const changePassword = async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Invalid session" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Please provide both passwords" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Change password error:", error?.message || error);
    return res.status(500).json({ success: false, error: "Failed to change password" });
  }
};
