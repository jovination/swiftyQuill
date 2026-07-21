import { getPresignedUrl, getPresignedUrls } from "./r2";

/** Raw note shape from Prisma (has keys) */
interface RawNote {
  imageKeys?: string[];
  audioKey?: string | null;
  imageUrls?: string[];
  audioUrl?: string | null;
  [k: string]: unknown;
}

/** Note shape returned to the frontend (has presigned URLs or legacy URLs) */
export interface NoteResponse extends Omit<RawNote, "imageKeys" | "audioKey"> {
  imageUrls: string[];
  audioUrl: string | null;
}

export async function noteToResponse(note: RawNote): Promise<NoteResponse> {
  let imageUrls: string[] = Array.isArray(note.imageUrls) ? note.imageUrls : [];
  let audioUrl: string | null = typeof note.audioUrl === "string" ? note.audioUrl : null;

  // 1. Resolve image URLs: prefer R2 presigned URLs if imageKeys are present
  if (Array.isArray(note.imageKeys) && note.imageKeys.length > 0) {
    try {
      const presigned = await getPresignedUrls(note.imageKeys);
      if (presigned.length > 0) {
        imageUrls = presigned;
      }
    } catch (err) {
      console.error("Failed to generate presigned image URLs from R2:", err);
    }
  }

  // 2. Resolve audio URL: prefer R2 presigned URL if audioKey is present
  if (note.audioKey) {
    try {
      const presignedAudio = await getPresignedUrl(note.audioKey);
      if (presignedAudio) {
        audioUrl = presignedAudio;
      }
    } catch (err) {
      console.error("Failed to generate presigned audio URL from R2:", err);
    }
  }

  const { imageKeys: _ik, audioKey: _ak, ...rest } = note;
  return { ...rest, imageUrls, audioUrl };
}

export async function notesToResponse(
  notes: RawNote[]
): Promise<NoteResponse[]> {
  return Promise.all(notes.map(noteToResponse));
}
