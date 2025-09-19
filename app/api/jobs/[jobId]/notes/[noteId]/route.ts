import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { jobId: string; noteId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ownership of job first
  const job = await prisma.jobApplication.findUnique({
    where: { id: params.jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete the note
  await prisma.applicationNote.delete({
    where: { id: params.noteId },
  });

  return NextResponse.json({ success: true });
}
