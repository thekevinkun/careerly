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
Return JSON with one field: "resume".

Context:
- Job Title: "${job.title}"
- Company: "${job.company}"
- Job Description: """${job.description || "N/A"}"""
- My Notes: """${job.notes?.map((n) => n.note).join("\n") || "N/A"}"""

Instructions:
- "resume": 3-5 bullet points tailored for this job.`;

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
      resume: `- Highlight your skills relevant to "${job.title}" at ${
        job.company
      }.
- Showcase achievements related to "${
        job.description?.slice(0, 80) || "the role"
      }".
- Emphasize teamwork, adaptability, and problem-solving.
- Mention any tools or technologies that fit the position.
- Close with enthusiasm for contributing to ${job.company}.`,
      isAiGenerated: false,
    });
  }
}
