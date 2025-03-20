import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { username, password, confirmPassword } = await req.json();

    // Validation checks
    if (!username || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (username.length < 8) {
      return NextResponse.json({ error: "Username must be at least 8 characters long" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one uppercase, one lowercase, and one special character" }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { error: `Internal Server Error : ${error}` } }, { status: 500 });
  }
}
