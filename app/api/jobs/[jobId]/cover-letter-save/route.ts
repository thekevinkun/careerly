import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await prisma.jobApplication.findUnique({
    where: { id: params.jobId, userId: session.user.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const body = await req.json();
  const { content, isAiGenerated } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Cover letter content is required" },
      { status: 400 }
    );
  }

  try {
    const coverLetter = await prisma.coverLetter.create({
      data: {
        content,
        isAiGenerated: isAiGenerated ?? true,
        userId: session.user.id,
        jobId: params.jobId,
      },
    });

    return NextResponse.json(coverLetter, { status: 201 });
  } catch (error) {
    console.error("Error saving cover letter:", error);
    return NextResponse.json(
      { error: "Failed to save cover letter" },
      { status: 500 }
    );
  }
}
