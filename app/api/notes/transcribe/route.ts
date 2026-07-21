import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { noteToResponse } from "@/lib/note-response";
import { transcribeAudioWithGroq, structureTranscriptWithGroq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("file") as File | null || formData.get("audio") as File | null;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: "No audio file provided for transcription." },
        { status: 400 }
      );
    }

    // 1. Upload audio to Cloudflare R2 object storage
    const ext = audioFile.name.split(".").pop() || "webm";
    const audioKey = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      await uploadToR2(audioKey, buffer, audioFile.type || "audio/webm");
    } catch (r2Error) {
      console.error("Failed to upload audio to R2 during transcription:", r2Error);
    }

    // 2. Transcribe audio with Groq Whisper (whisper-large-v3)
    let transcriptText = "";
    try {
      transcriptText = await transcribeAudioWithGroq(
        buffer,
        audioFile.name || "recording.webm",
        audioFile.type || "audio/webm"
      );
    } catch (sttError) {
      console.error("Groq STT transcription error:", sttError);
      return NextResponse.json(
        { error: sttError instanceof Error ? sttError.message : "Failed to transcribe audio." },
        { status: 500 }
      );
    }

    // 3. Structure transcript with Groq LLM (llama-3.3-70b-versatile)
    const structured = await structureTranscriptWithGroq(transcriptText);

    // 4. Resolve tags: find or create default tags
    const tagConnects: { tag: { connect: { id: string } } }[] = [];
    if (Array.isArray(structured.tags) && structured.tags.length > 0) {
      for (const tagName of structured.tags) {
        if (!tagName || typeof tagName !== "string") continue;
        const cleanName = tagName.trim();
        if (!cleanName) continue;

        // Try to find tag for user or default tag
        let tagRecord = await prisma.tag.findFirst({
          where: {
            name: { equals: cleanName, mode: "insensitive" },
            OR: [{ userId: user.id }, { isDefault: true }],
          },
        });

        if (!tagRecord) {
          try {
            tagRecord = await prisma.tag.create({
              data: {
                name: cleanName,
                userId: user.id,
                isDefault: false,
              },
            });
          } catch (err) {
            // Ignored if race condition or tag exists
          }
        }

        if (tagRecord) {
          tagConnects.push({
            tag: { connect: { id: tagRecord.id } },
          });
        }
      }
    }

    // 5. Save Structured Note to PostgreSQL database via Prisma
    const note = await prisma.note.create({
      data: {
        userId: user.id,
        title: structured.title,
        content: structured.summary || structured.transcript,
        transcript: structured.transcript,
        summary: structured.summary,
        actionItems: structured.actionItems as any,
        keyInsights: structured.keyInsights as any,
        language: structured.language,
        audioKey: audioKey,
        tags: {
          create: tagConnects,
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const response = await noteToResponse(note);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Transcription API Error:", error);
    return NextResponse.json(
      { error: "Internal server error during voice transcription." },
      { status: 500 }
    );
  }
}
