import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Rate limiting: 5 uploads per hour per user
    const rateLimitResult = await rateLimit(
      `avatar-upload:${session.user.id}`,
      5,
      60 * 60 * 1000
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(
            rateLimitResult.remaining,
            rateLimitResult.resetTime
          ),
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPG, PNG, or WebP images." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Get current user to check for old avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
    if (currentUser?.image && currentUser.image.includes("cloudinary.com")) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = currentUser.image.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = `careerly/avatars/${filename.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Failed to delete old avatar:", deleteError);
        // Continue anyway - don't fail upload if old image deletion fails
      }
    }

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "careerly/avatars",
      public_id: `${session.user.id}-${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // Update user's image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: uploadResponse.secure_url },
    });

    // Just return success with the new image URL
    return NextResponse.json({
      success: true,
      imageUrl: uploadResponse.secure_url,
    });
  } catch (err: any) {
    console.error("Avatar upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove avatar
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete from Cloudinary if it's a Cloudinary URL
    if (currentUser?.image && currentUser.image.includes("cloudinary.com")) {
      try {
        const urlParts = currentUser.image.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = `careerly/avatars/${filename.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Failed to delete avatar from Cloudinary:", deleteError);
      }
    }

    // Set image to null
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Avatar delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}
