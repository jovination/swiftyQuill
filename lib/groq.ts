export interface StructuredActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface StructuredGroqNote {
  title: string;
  summary: string;
  transcript: string;
  actionItems: StructuredActionItem[];
  tags: string[];
  language: string;
  keyInsights: string[];
}

const GROQ_API_URL = "https://api.groq.com/openai/v1";

/**
 * Transcribes an audio file buffer using Groq Whisper (whisper-large-v3)
 */
export async function transcribeAudioWithGroq(
  fileBuffer: Buffer,
  fileName: string = "audio.webm",
  mimeType: string = "audio/webm"
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const formData = new FormData();
  const fileBlob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType || "audio/webm" });
  formData.append("file", fileBlob, fileName || "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "verbose_json");
  formData.append("temperature", "0");

  const response = await fetch(`${GROQ_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq Whisper STT error:", errorText);
    throw new Error(`Groq Whisper transcription failed: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.text || (Array.isArray(data.segments) ? data.segments.map((s: any) => s.text).join(" ") : "");
  if (!text || !text.trim()) {
    throw new Error("No transcription text returned from Groq Whisper.");
  }

  return text.trim();
}

/**
 * Structures a verbatim transcript into a rich, organized note using Groq LLM (llama-3.3-70b-versatile)
 */
export async function structureTranscriptWithGroq(
  transcriptText: string
): Promise<StructuredGroqNote> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Graceful fallback if Groq API key is missing
    return createFallbackStructuredNote(transcriptText);
  }

  const systemPrompt = `You are an AI assistant helping a user structure their personal voice notes in SwiftyQuill.
Analyze the provided speech-to-text transcript and convert it into a structured note JSON object.

Return ONLY valid JSON matching this exact schema:
{
  "title": "Short descriptive title (max 8 words)",
  "summary": "Natural, personal 2-3 sentence executive summary of the note",
  "transcript": "Original transcript provided",
  "actionItems": [
    { "id": "action-1", "text": "Task description", "completed": false }
  ],
  "tags": ["Tag1", "Tag2"],
  "language": "Detected language",
  "keyInsights": ["Key decision, deadline, or notable detail"]
}

Rules:
1. Write the summary in a NATURAL, PERSONAL tone as if it was written by the user in their own notes.
   Examples:
   - "Key takeaway from the discussion..."
   - "Need to finish..."
   - "Notes from team sync..."
   - "Ideas for improving..."

2. NEVER use third-person or mechanical phrases such as:
   - "The speaker plans to..."
   - "The speaker discusses..."
   - "The user states..."
   - "The speaker mentions..."
   Write directly and personally.

3. Generate a short, clear, descriptive title.
   - Maximum 8 words.
   - Avoid generic titles like "Voice Note" or "Meeting Notes".

4. Do NOT add information that is not present in the transcript.
   - Do not guess names, dates, intentions, or missing context.

5. Extract action items when tasks are mentioned.
   - Write them as clear executable todos starting with an action verb (e.g. "Finish the landing page", "Call John about the proposal").

6. Generate relevant tags.
   - Keep tags short and capitalize them properly (e.g. Work, Personal, Ideas, Tasks, Meeting).`;

  try {
    const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcript to analyze:\n"${transcriptText}"` },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq LLM structuring error:", errorText);
      return createFallbackStructuredNote(transcriptText);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return createFallbackStructuredNote(transcriptText);
    }

    const parsed = JSON.parse(content);
    return {
      title: parsed.title || generateTitleFromTranscript(transcriptText),
      summary: parsed.summary || transcriptText.slice(0, 150),
      transcript: transcriptText,
      actionItems: Array.isArray(parsed.actionItems)
        ? parsed.actionItems.map((item: any, idx: number) => ({
            id: item.id || `action-${Date.now()}-${idx}`,
            text: typeof item === "string" ? item : item.text || "",
            completed: Boolean(item.completed),
          })).filter((i: StructuredActionItem) => i.text.length > 0)
        : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: any) => String(t)) : ["Voice Memo"],
      language: parsed.language || "English",
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights.map((k: any) => String(k)) : [],
    };
  } catch (err) {
    console.error("Failed to structure transcript with Groq LLM:", err);
    return createFallbackStructuredNote(transcriptText);
  }
}

/**
 * Fallback helper if LLM call fails or API key is not set
 */
function createFallbackStructuredNote(transcript: string): StructuredGroqNote {
  return {
    title: generateTitleFromTranscript(transcript),
    summary: transcript.length > 150 ? `${transcript.slice(0, 150)}...` : transcript,
    transcript,
    actionItems: [],
    tags: ["Voice Memo"],
    language: "English",
    keyInsights: [],
  };
}

function generateTitleFromTranscript(transcript: string): string {
  const words = transcript.trim().split(/\s+/).slice(0, 6);
  if (words.length === 0 || !words[0]) return "Voice Memo";
  const title = words.join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}
