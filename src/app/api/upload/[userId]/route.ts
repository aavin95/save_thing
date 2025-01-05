import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Adjust the path to your MongoDB client

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
    console.log(userId);

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
    const body = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId in request" },
        { status: 400 }
      );
    }

    // Insert the data into the MongoDB collection
    const result = await collection.insertOne({ ...body, userId });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error uploading data:", error);
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
