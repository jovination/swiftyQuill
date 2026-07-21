import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processAudioNoteInBackground } from "@/lib/audio-processor";
import { notesToResponse } from "@/lib/note-response";

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

    // Find all notes for user with audioKey but missing transcript or with placeholder content
    const pendingAudioNotes = await prisma.note.findMany({
      where: {
        userId: user.id,
        audioKey: { not: null },
        OR: [
          { transcript: null },
          { content: "Voice Memo audio attached." },
          { title: { startsWith: "Voice Memo" } },
        ],
      },
    });

    if (pendingAudioNotes.length === 0) {
      return NextResponse.json({ message: "No untranscribed audio notes found.", processedCount: 0 });
    }

    // Process notes in background
    let processedCount = 0;
    for (const note of pendingAudioNotes) {
      if (note.audioKey) {
        const success = await processAudioNoteInBackground(note.id, note.audioKey, user.id);
        if (success) processedCount++;
      }
    }

    // Fetch updated notes
    const updatedNotes = await prisma.note.findMany({
      where: { userId: user.id },
      include: { tags: { include: { tag: true } } },
      orderBy: { updatedAt: "desc" },
    });

    const response = await notesToResponse(updatedNotes);
    return NextResponse.json({
      message: `Successfully processed ${processedCount} audio notes`,
      notes: response,
      processedCount,
    });
  } catch (error) {
    console.error("Error in process-audio route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
