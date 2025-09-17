import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate name
    if (!name || name.trim().length < 2) {
      return new NextResponse("Name must be at least 2 characters long", { status: 400 });
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new NextResponse("Invalid email address", { status: 400 });
    }

    // Validate password
    if (!password || password.length < 8) {
      return new NextResponse("Password must be at least 8 characters long", { status: 400 });
    }

    // 🚫 Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return new NextResponse("Email is already registered", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return new NextResponse("Something went wrong, please try again later", { status: 500 });
  }
}
