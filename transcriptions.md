# 🎙️ Groq Voice Transcription & Intelligence Architecture (`transcriptions.md`)

This document outlines the end-to-end technical implementation plan for integrating **Groq AI** into **SwiftyQuill**. It transforms simple voice recordings into structured, actionable, and rich notes using **Groq Whisper** (Speech-to-Text) and **Groq Llama 3.3** (Text Understanding & Structuring).

---

## 🏗️ 1. Architecture & Pipeline Overview

```text
User Records Voice (MediaRecorder)
        │
        ▼
Upload Audio File (.webm) to Cloudflare R2 Storage (lib/r2.ts)
        │
        ▼
Groq Speech-to-Text API (whisper-large-v3)
        │
        ▼
Verbatim Transcript
        │
        ▼
Groq LLM API (llama-3.3-70b-versatile)
        ├── Generate concise title (max 8 words)
        ├── Generate executive summary (2-3 sentences)
        ├── Extract action items / todos [{ text, completed }]
        ├── Generate relevant tags (max 5)
        ├── Detect primary language
        └── Identify key insights & decisions
        │
        ▼
Save Structured Note to PostgreSQL (Prisma)
        │
        ▼
Render Rich Interactive UI in SwiftyQuill
```

---

## 🗄️ 2. Database Schema Updates (`prisma/schema.prisma`)

```prisma
model Note {
  id          String       @id @default(cuid())
  userId      String
  title       String
  content     String       // Full formatted text / transcript
  transcript  String?      // Verbatim spoken transcript
  summary     String?      // AI-generated executive summary
  actionItems Json?        @default("[]") // Array of { id: string, text: string, completed: boolean }
  keyInsights Json?        @default("[]") // Array of extracted key decisions or people mentioned
  language    String?      // Detected language (e.g., "English", "Swahili")
  imageUrls   String[]     @default([])
  imageKeys   String[]     @default([])
  audioUrl    String?
  audioKey    String?
  color       String?
  isStarred   Boolean      @default(false)
  isShared    Boolean      @default(false)
  status      NoteStatus   @default(ACTIVE)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  tags        NoteTag[]
  sharedNotes SharedNote[]

  @@index([userId])
}
```

---

## 🧠 3. Groq AI Integration Strategy

We split the AI pipeline into two specialized Groq API calls:

### Step A: Speech-To-Text (Groq Whisper)
- **API Endpoint**: `https://api.groq.com/openai/v1/audio/transcriptions`
- **Model**: `whisper-large-v3`
- **Output**: Accurate, verbatim spoken text.

### Step B: Text Understanding & Structuring (Groq LLM)
- **API Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Model**: `llama-3.3-70b-versatile`
- **Response Format**: `json_object`

#### System Prompt
```text
You are an expert AI note assistant for SwiftyQuill.
Analyze the provided speech-to-text transcript and convert it into a structured note JSON object.

Return ONLY valid JSON matching this exact structure:
{
  "title": "Short descriptive title (max 8 words)",
  "summary": "Concise 2-3 sentence executive summary of what was discussed or recorded",
  "transcript": "Exact verbatim transcript provided",
  "actionItems": [
    { "text": "Extracted task or todo item", "completed": false }
  ],
  "tags": ["Tag1", "Tag2"],
  "language": "Detected language",
  "keyInsights": ["Key decision, deadline, or person mentioned"]
}

Rules:
1. Do NOT invent facts or details not mentioned in the transcript.
2. If action items exist, phrase them clearly as executable tasks.
3. Make the title concise, professional, and descriptive.
4. Capitalize tags cleanly (e.g., "Work", "Ideas", "Personal").
```

---

## 🛠️ 4. API Implementation Plan

1. **`lib/groq.ts`**: Helper utility handling calls to `whisper-large-v3` (audio transcription) and `llama-3.3-70b-versatile` (JSON structuring).
2. **`app/api/notes/transcribe/route.ts`**: Dedicated Next.js API route that:
   - Receives audio file via `FormData`.
   - Uploads audio to Cloudflare R2 bucket (`lib/r2.ts`).
   - Sends audio buffer to Groq Whisper API.
   - Sends transcript to Groq LLM API.
   - Creates `Note` record in PostgreSQL with transcript, summary, actionItems, audioKey, and tags.
   - Returns presigned `Note` object to the frontend.

---

## 🎨 5. Frontend & UI Enhancements

- **`TakingNotesButtons.tsx`**: Add multi-stage progress feedback during recording processing (*Uploading...* ➔ *Transcribing with Groq Whisper...* ➔ *Structuring note...*).
- **`NotePreviewDialog.tsx` & `NotesList.tsx`**:
  - **Audio Player**: Integrated audio controls.
  - **Executive Summary Card**: Styled AI summary banner.
  - **Interactive Action Items**: Checkbox list allowing users to check off extracted tasks directly inside notes.
  - **Collapsible Transcript**: Expandable verbatim speech-to-text display.

---

## 🧪 6. Environment Configuration

Add your Groq API key to `.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```
