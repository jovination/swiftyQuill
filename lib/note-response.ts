import { getPresignedUrl, getPresignedUrls } from "./r2";

/** Base note response interface */
export interface NoteResponse {
  imageUrls: string[];
  audioUrl: string | null;
  imageKeys: string[];
  audioKey: string | null;
  transcript?: string | null;
  summary?: string | null;
  actionItems?: any;
  keyInsights?: any;
  language?: string | null;
}

export async function noteToResponse<T extends Record<string, any>>(note: T): Promise<T & NoteResponse> {
  let imageUrls: string[] = Array.isArray(note.imageUrls) ? note.imageUrls : [];
  let audioUrl: string | null = typeof note.audioUrl === "string" ? note.audioUrl : null;
  const imageKeys: string[] = Array.isArray(note.imageKeys) ? note.imageKeys : [];
  const audioKey: string | null = typeof note.audioKey === "string" ? note.audioKey : null;

  // 1. Resolve image URLs: prefer R2 presigned URLs if imageKeys are present
  if (imageKeys.length > 0) {
    try {
      const presigned = await getPresignedUrls(imageKeys);
      if (presigned.length > 0) {
        imageUrls = presigned;
      }
    } catch (err) {
      console.error("Failed to generate presigned image URLs from R2:", err);
    }
  }

  // 2. Resolve audio URL: prefer R2 presigned URL if audioKey is present
  if (audioKey) {
    try {
      const presignedAudio = await getPresignedUrl(audioKey);
      if (presignedAudio) {
        audioUrl = presignedAudio;
      }
    } catch (err) {
      console.error("Failed to generate presigned audio URL from R2:", err);
    }
  }

  return {
    ...note,
    imageUrls,
    audioUrl,
    imageKeys,
    audioKey,
  };
}

export async function notesToResponse<T extends Record<string, any>>(
  notes: T[]
): Promise<(T & NoteResponse)[]> {
  return Promise.all(notes.map(noteToResponse));
}
