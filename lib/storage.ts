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
