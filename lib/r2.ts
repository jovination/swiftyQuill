import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;
const PRESIGN_EXPIRES = 60 * 60 * 24 * 7; // 7 days

export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

export async function getPresignedUrl(key: string): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: PRESIGN_EXPIRES }
  );
}

export async function getPresignedUrls(keys: string[]): Promise<string[]> {
  return Promise.all(keys.filter(Boolean).map(getPresignedUrl));
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function deleteFilesFromR2(keys: string[]): Promise<void> {
  await Promise.all(keys.filter(Boolean).map(deleteFromR2));
}

export async function listUserR2Files(
  userId: string
): Promise<{ key: string; size: number }[]> {
  const files: { key: string; size: number }[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await r2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${userId}/`,
        ContinuationToken: continuationToken,
      })
    );

    for (const obj of res.Contents ?? []) {
      if (obj.Key && obj.Size != null) {
        files.push({ key: obj.Key, size: obj.Size });
      }
    }

    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return files;
}
