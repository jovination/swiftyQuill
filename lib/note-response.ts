import { getPresignedUrl, getPresignedUrls } from "./r2";

/** Raw note shape from Prisma (has keys) */
interface RawNote {
  imageKeys: string[];
  audioKey: string | null;
  [k: string]: unknown;
}

/** Note shape returned to the frontend (has presigned URLs) */
export interface NoteResponse extends Omit<RawNote, "imageKeys" | "audioKey"> {
  imageUrls: string[];
  audioUrl: string | null;
}

export async function noteToResponse(note: RawNote): Promise<NoteResponse> {
  const [imageUrls, audioUrl] = await Promise.all([
    getPresignedUrls(note.imageKeys),
    note.audioKey ? getPresignedUrl(note.audioKey) : Promise.resolve(null),
  ]);

  const { imageKeys: _ik, audioKey: _ak, ...rest } = note;
  return { ...rest, imageUrls, audioUrl };
}

export async function notesToResponse(
  notes: RawNote[]
): Promise<NoteResponse[]> {
  return Promise.all(notes.map(noteToResponse));
}
