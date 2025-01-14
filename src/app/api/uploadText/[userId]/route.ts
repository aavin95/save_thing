import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import clientPromise from "@/lib/mongodb";

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// POST: Upload text
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("save_thing");
    const collection = db.collection("text_uploads");

    const { userId } = await params;
    const { text } = await req.json();

    if (!text || !userId) {
      return NextResponse.json(
        { success: false, error: "Text or userId missing" },
        { status: 400 }
      );
    }

    // Upload text to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `${userId}/text-${Date.now()}.txt`, // Unique file path in S3
      Body: text,
      ContentType: "text/plain",
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Save text metadata in MongoDB
    const result = await collection.insertOne({
      userId,
      text,
      storageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${
        process.env.AWS_REGION
      }.amazonaws.com/${userId}/text-${Date.now()}.txt`, // Construct S3 URL manually
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      storageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${
        process.env.AWS_REGION
      }.amazonaws.com/${userId}/text-${Date.now()}.txt`,
    });
  } catch (error) {
    console.error("Error uploading text:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
