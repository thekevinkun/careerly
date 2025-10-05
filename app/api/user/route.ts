import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Json = Record<string, any>;

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      jobTitle: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // fetch connected providers (DO NOT select tokens)
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    select: { provider: true },
  });

  const connectedProviders = accounts.map((a) => a.provider);

  return NextResponse.json({ ...user, connectedProviders });
}

export async function PATCH(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as Json;

  // Only allow specific updatable fields
  const allowed = ["name", "phone", "jobTitle", "image"];
  const data: Json = {};

  for (const key of allowed) {
    if (key in body && typeof body[key] === "string") {
      data[key] = body[key].trim();
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        jobTitle: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true },
    });
    const connectedProviders = accounts.map((a) => a.provider);

    return NextResponse.json({ ...updated, connectedProviders });
  } catch (err: any) {
    console.error("PATCH /api/user error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { password } = body;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user has a password, verify it
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 401 }
        );
      }
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/user/delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
