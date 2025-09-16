import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PATCH /api/jobs/:id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Ensure user owns this job
  const job = await prisma.jobApplication.findUnique({
    where: { id: params.id },
  });

  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedJob = await prisma.jobApplication.update({
    where: { id: params.id },
    data: {
      title: body.title,
      company: body.company,
      jobLink: body.jobLink,
      description: body.description,
      status: body.status,

      notes: body.notes
        ? { create: body.notes.map((note: string) => ({ note })) }
        : undefined,

      resumes: body.resumes
        ? {
            create: body.resumes.map((resume: any) => ({
              content: resume.content,
              isAiGenerated: resume.isAiGenerated ?? false,
              userId: session.user.id,
            })),
          }
        : undefined,

      coverLetters: body.coverLetters
        ? {
            create: body.coverLetters.map((cl: any) => ({
              content: cl.content,
              isAiGenerated: cl.isAiGenerated ?? false,
              userId: session.user.id,
            })),
          }
        : undefined,
    },
    include: {
      notes: true,
      resumes: true,
      coverLetters: true,
    },
  });

  return NextResponse.json(updatedJob);
}


// DELETE /api/jobs/:id
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ownership first
  const job = await prisma.jobApplication.findUnique({
    where: { id: params.id },
  });

  if (!job || job.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  await prisma.jobApplication.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
