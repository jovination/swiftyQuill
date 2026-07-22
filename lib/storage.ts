import { listUserR2Files } from "./r2";
import { prisma } from "./prisma";

export async function getUserStorageBytes(userId: string): Promise<number> {
  const files = await listUserR2Files(userId);
  return files.reduce((sum, f) => sum + f.size, 0);
}

export async function getAllUserStorageBytes(): Promise<Map<string, number>> {
  const storageMap = new Map<string, number>();

  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    const bytes = await getUserStorageBytes(user.id);
    if (bytes > 0) {
      storageMap.set(user.id, bytes);
    }
  }

  return storageMap;
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "ico"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "webm", "m4a", "aac", "flac", "opus"]);

function categorizeFile(key: string): "image" | "audio" | "other" {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (AUDIO_EXTENSIONS.has(ext)) return "audio";
  return "other";
}

export interface StorageBreakdown {
  image: { bytes: number; count: number };
  audio: { bytes: number; count: number };
  other: { bytes: number; count: number };
  total: number;
}

export async function getStorageBreakdown(): Promise<StorageBreakdown> {
  const breakdown: StorageBreakdown = {
    image: { bytes: 0, count: 0 },
    audio: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
    total: 0,
  };

  const users = await prisma.user.findMany({ select: { id: true } });

  for (const user of users) {
    const files = await listUserR2Files(user.id);
    for (const file of files) {
      const category = categorizeFile(file.key);
      breakdown[category].bytes += file.size;
      breakdown[category].count += 1;
      breakdown.total += file.size;
    }
  }

  return breakdown;
}
