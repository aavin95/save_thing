import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
    const collection = db.collection("uploads");

    const { userId } = await params;
    const { text, id } = await req.json();

    if (!text || !userId) {
      return NextResponse.json(
        { success: false, error: "Text or userId missing" },
        { status: 400 }
      );
    }

    let storageUrl;
    let result;
    if (id) {
      // Update existing text
      const objectId = new ObjectId(id); // Convert id to ObjectId
      const existingDocument = await collection.findOne({
        _id: objectId,
        userId,
      });

      if (!existingDocument) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      // Update text in S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: existingDocument.storageUrl.split(".com/")[1],
        Body: text,
        ContentType: "text/plain",
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Update text metadata in MongoDB
      await collection.updateOne(
        { _id: objectId },
        {
          $set: {
            text,
            title: text.slice(0, 10),
            name: text.slice(0, 10),
            uploadedAt: new Date(),
          },
        }
      );

      storageUrl = existingDocument.storageUrl;
    } else {
      // Upload new text to S3
      const newKey = `${userId}/text-${Date.now()}.txt`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: newKey,
        Body: text,
        ContentType: "text/plain",
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // Save new text metadata in MongoDB
      result = await collection.insertOne({
        userId,
        title: text.slice(0, 10),
        name: text.slice(0, 10),
        type: "text/plain",
        text,
        storageUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`,
        uploadedAt: new Date(),
      });

      storageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;
    }

    return NextResponse.json({
      success: true,
      id: id || result?.insertedId,
      storageUrl,
      text,
      name: text.slice(0, 10),
      title: text.slice(0, 10),
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
