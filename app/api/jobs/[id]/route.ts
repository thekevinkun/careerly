import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/jobs/:id
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

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
              userId: body.userId,
            })),
          }
        : undefined,

      coverLetters: body.coverLetters
        ? {
            create: body.coverLetters.map((cl: any) => ({
              content: cl.content,
              isAiGenerated: cl.isAiGenerated ?? false,
              userId: body.userId,
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
  await prisma.jobApplication.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
