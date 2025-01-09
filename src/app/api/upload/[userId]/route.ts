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

// POST: Upload files or text
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("save_thing");
    const collection = db.collection("uploads");

    const { userId } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: "File or userId missing" },
        { status: 400 }
      );
    }

    // Convert File to Buffer (AWS SDK v3 requires this)
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload file to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `${userId}/${file.name}`, // File path in S3
      Body: fileBuffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Save file metadata in MongoDB
    const result = await collection.insertOne({
      userId,
      name: file.name,
      type: file.type,
      size: file.size,
      storageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${userId}/${file.name}`, // Construct S3 URL manually
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      storageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${userId}/${file.name}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
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

// GET: Fetch files associated with a user's account
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("save_thing");
    const collection = db.collection("uploads");

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId in request" },
        { status: 400 }
      );
    }

    // Fetch files associated with the user's account
    const files = await collection
      .find({ userId }) // Match documents by userId
      .toArray();

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error("Error fetching files:", error);
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
