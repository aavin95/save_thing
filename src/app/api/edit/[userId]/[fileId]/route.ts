import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  req: Request,
  { params }: { params: { userId: string; fileId: string } }
) {
  const client = await clientPromise;
  const db = client.db("save_thing");
  const collection = db.collection("uploads");
  const { userId, fileId } = await params;

  if (!userId || !fileId) {
    return NextResponse.json(
      { success: false, error: "userId or fileId missing" },
      { status: 400 }
    );
  }

  const { title: newTitle } = await req.json();

  if (!newTitle) {
    return NextResponse.json(
      { success: false, error: "New title is required" },
      { status: 400 }
    );
  }

  const result = await collection.updateOne(
    { userId, _id: new ObjectId(fileId) },
    { $set: { title: newTitle } }
  );

  if (result.modifiedCount === 0) {
    return NextResponse.json(
      { success: false, error: "File not found or title not updated" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Title updated successfully",
  });
}
