import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const job = await prisma.jobApplication.findUnique({
    where: { id: params.jobId, userId: session.user.id },
    include: { notes: true },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const prompt = `You are an expert career assistant. 
Return JSON with one field: "coverLetter".

Context:
- Job Title: "${job.title}"
- Company: "${job.company}"
- Job Description: """${job.description || "N/A"}"""
- My Notes: """${job.notes?.map((n) => n.note).join("\n") || "N/A"}"""

Instructions:
- "coverLetter": a short professional draft cover letter (3-4 paragraphs).`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      ...parsed,
      isAiGenerated: true,
    });
  } catch (error) {
    console.error("AI error → using fallback:", error);

    return NextResponse.json({
      coverLetter: `Dear Hiring Manager,

I am excited to apply for the ${job.title} position at ${job.company}. My background and skills align well with the responsibilities outlined in the job description, and I am confident in my ability to contribute effectively to your team.

In my past experiences, I have demonstrated adaptability, problem-solving, and strong collaboration. I am eager to bring the same dedication and results-driven mindset to ${job.company}.

I would welcome the opportunity to discuss how I can add value to your organization.

Sincerely,  
[Your Name]`,
      isAiGenerated: false,
    });
  }
}
