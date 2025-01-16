// src/types/types.ts
export interface File {
  _id?: string; // Optional, as some files might not have an ID
  name: string; // File name
  type: string; // MIME type of the file (e.g., "image/png")
  title: string;
  storageUrl?: string; // URL where the file is stored (e.g., on S3)
  content?: string; // Fallback for file content (e.g., base64 or other inline representation)
  text?: string;
}
