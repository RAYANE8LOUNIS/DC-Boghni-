import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient() {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) return null;
  return new S3Client({ region: process.env.S3_REGION || "auto", endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: Boolean(process.env.S3_ENDPOINT), credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } });
}

export async function createUploadUrl(key: string, contentType: string) {
  const client = getClient();
  if (!client || !process.env.S3_BUCKET) return null;
  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(client, command, { expiresIn: 300 });
}

export async function deleteStoredObject(key: string) {
  const client = getClient();
  if (!client || !process.env.S3_BUCKET) return false;
  await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  return true;
}

export function publicStorageUrl(key: string) { return process.env.S3_PUBLIC_BASE_URL ? `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}` : key; }
