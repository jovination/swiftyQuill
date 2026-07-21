import { prisma } from "@/lib/prisma";
import { downloadFromR2 } from "@/lib/r2";
import { transcribeAudioWithGroq, structureTranscriptWithGroq } from "@/lib/groq";

/**
 * Background worker that transcribes and structures voice memo audio,
 * updating the note in PostgreSQL with AI-generated title, summary, actionItems, keyInsights, language, and tags.
 */
export async function processAudioNoteInBackground(
  noteId: string,
  audioKey: string,
  userId: string,
  audioBuffer?: Buffer
): Promise<boolean> {
  try {
    console.log(`[AudioProcessor] Starting background processing for note ${noteId}...`);

    let buffer = audioBuffer;
    if (!buffer) {
      try {
        buffer = await downloadFromR2(audioKey);
      } catch (err) {
        console.error(`[AudioProcessor] Failed to download audio from R2 for note ${noteId}:`, err);
        return false;
      }
    }

    if (!buffer || buffer.length === 0) {
      console.error(`[AudioProcessor] Audio buffer is empty for note ${noteId}`);
      return false;
    }

    // 1. Groq Speech-to-Text (Whisper)
    const ext = audioKey.split(".").pop() || "webm";
    const mimeType = ext === "mp3" ? "audio/mp3" : ext === "m4a" ? "audio/m4a" : "audio/webm";
    
    let transcriptText = "";
    try {
      transcriptText = await transcribeAudioWithGroq(
        buffer,
        `recording.${ext}`,
        mimeType
      );
    } catch (sttError) {
      console.error(`[AudioProcessor] Groq STT error for note ${noteId}:`, sttError);
      return false;
    }

    if (!transcriptText || transcriptText.trim().length === 0) {
      console.log(`[AudioProcessor] Empty transcript returned for note ${noteId}`);
      return false;
    }

    // 2. Groq LLM Structuring & Reasoning (Llama 3.3 70B JSON Structured Outputs)
    const structured = await structureTranscriptWithGroq(transcriptText);

    // 3. Resolve & Connect Tags
    const tagConnects: { tag: { connect: { id: string } } }[] = [];
    if (Array.isArray(structured.tags) && structured.tags.length > 0) {
      for (const tagName of structured.tags) {
        if (!tagName || typeof tagName !== "string") continue;
        const cleanName = tagName.trim();
        if (!cleanName) continue;

        let tagRecord = await prisma.tag.findFirst({
          where: {
            name: { equals: cleanName, mode: "insensitive" },
            OR: [{ userId: userId }, { isDefault: true }],
          },
        });

        if (!tagRecord) {
          try {
            tagRecord = await prisma.tag.create({
              data: {
                name: cleanName,
                userId: userId,
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

    // 4. Update PostgreSQL Note record with AI results
    await prisma.note.update({
      where: { id: noteId },
      data: {
        title: structured.title,
        content: structured.transcript || structured.summary,
        transcript: structured.transcript,
        summary: structured.summary,
        actionItems: structured.actionItems as any,
        keyInsights: structured.keyInsights as any,
        language: structured.language,
        tags: {
          create: tagConnects,
        },
        updatedAt: new Date(),
      },
    });

    console.log(`[AudioProcessor] Successfully processed and updated note ${noteId} ("${structured.title}")`);
    return true;
  } catch (error) {
    console.error(`[AudioProcessor] Error processing audio note ${noteId}:`, error);
    return false;
  }
}
