import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../lib/r2";

const prisma = new PrismaClient();

/**
 * Lazy Background Migration Script
 * Converts legacy Base64 images & audio stored in PostgreSQL to Cloudflare R2 object storage.
 * 
 * Usage: npx tsx prisma/migrate-legacy-media.ts
 */
async function migrateLegacyMedia() {
  console.log("🚀 Starting background lazy migration for legacy media...");

  const notes = await prisma.note.findMany({
    where: {
      OR: [
        { imageUrls: { isEmpty: false } },
        { audioUrl: { not: null } }
      ]
    }
  });

  console.log(`Found ${notes.length} notes with legacy media candidate for migration.`);

  let migratedCount = 0;

  for (const note of notes) {
    const newImageKeys: string[] = [...note.imageKeys];
    let newAudioKey = note.audioKey;
    let modified = false;

    // 1. Process legacy Base64 images
    if (Array.isArray(note.imageUrls) && note.imageUrls.length > 0) {
      for (let i = 0; i < note.imageUrls.length; i++) {
        const imgUrl = note.imageUrls[i];
        if (imgUrl.startsWith("data:image/")) {
          try {
            const matches = imgUrl.match(/^data:(image\/(\w+));base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const ext = matches[2] || "png";
              const base64Data = matches[3];
              const buffer = Buffer.from(base64Data, "base64");

              const key = `${note.userId}/migrated-${Date.now()}-${i}.${ext}`;
              await uploadToR2(key, buffer, mimeType);
              newImageKeys.push(key);
              modified = true;
            }
          } catch (err) {
            console.error(`Failed to migrate image for note ${note.id}:`, err);
          }
        }
      }
    }

    // 2. Process legacy Base64 audio
    if (note.audioUrl && note.audioUrl.startsWith("data:audio/") && !note.audioKey) {
      try {
        const matches = note.audioUrl.match(/^data:(audio\/(\w+));base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const ext = matches[2] || "webm";
          const base64Data = matches[3];
          const buffer = Buffer.from(base64Data, "base64");

          const key = `${note.userId}/migrated-${Date.now()}-audio.${ext}`;
          await uploadToR2(key, buffer, mimeType);
          newAudioKey = key;
          modified = true;
        }
      } catch (err) {
        console.error(`Failed to migrate audio for note ${note.id}:`, err);
      }
    }

    // 3. Update database record if migrated
    if (modified) {
      await prisma.note.update({
        where: { id: note.id },
        data: {
          imageKeys: newImageKeys,
          audioKey: newAudioKey,
        }
      });
      migratedCount++;
      console.log(`[✓] Migrated media for note: "${note.title}" (${note.id})`);
    }
  }

  console.log(`🎉 Migration complete! Total notes updated: ${migratedCount}`);
}

migrateLegacyMedia()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
