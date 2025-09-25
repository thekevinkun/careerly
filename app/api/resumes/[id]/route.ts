import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resumeVersion.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.resumeVersion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete cover letter failed", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
