import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb"; // Adjust the path to your MongoDB client

// POST: Upload files or text
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("save_thing");
    const collection = db.collection("uploads");

    // Parse the incoming request
    const body = await req.json();

    // Insert the data into the MongoDB collection
    const result = await collection.insertOne(body);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error uploading data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch files associated with a user's account
export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("save_thing");
    const collection = db.collection("uploads");

    // Extract the user ID from the request query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId in request query" },
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
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
