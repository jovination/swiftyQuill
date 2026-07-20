import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2, deleteFilesFromR2 } from "@/lib/r2";
import { noteToResponse } from "@/lib/note-response";

// GET specific note by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const response = await noteToResponse(note);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update note (multipart/form-data with files)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingNote = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const color = (formData.get("color") as string) || null;
    const isStarred = formData.get("isStarred") === "true";
    const isShared = formData.get("isShared") === "true";
    const incomingImageKeys = JSON.parse(
      (formData.get("imageKeys") as string) || "[]"
    ) as string[];
    const incomingAudioKey =
      (formData.get("audioKey") as string) || null;

    // Diff: find removed keys
    const removedImageKeys = existingNote.imageKeys.filter(
      (k) => !incomingImageKeys.includes(k)
    );
    const removedAudioKeys: string[] = [];
    if (
      existingNote.audioKey &&
      incomingAudioKey !== existingNote.audioKey
    ) {
      removedAudioKeys.push(existingNote.audioKey);
    }

    // Delete removed files from R2 (fire-and-forget)
    const keysToDelete = [...removedImageKeys, ...removedAudioKeys];
    if (keysToDelete.length > 0) {
      deleteFilesFromR2(keysToDelete).catch((err) =>
        console.error("Failed to delete old files from R2:", err)
      );
    }

    // Upload new image files to R2
    const imageFiles = formData.getAll("images") as File[];
    const newImageKeys = await Promise.all(
      imageFiles
        .filter((f) => f.size > 0)
        .map(async (file) => {
          const ext = file.name.split(".").pop() || "jpg";
          const key = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadToR2(key, buffer, file.type);
        })
    );

    // Upload new audio file to R2
    const audioFile = formData.get("audio") as File | null;
    let finalAudioKey = incomingAudioKey;
    if (audioFile && audioFile.size > 0) {
      const ext = audioFile.name.split(".").pop() || "webm";
      finalAudioKey = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      await uploadToR2(finalAudioKey, buffer, audioFile.type);
    }

    const allImageKeys = [...incomingImageKeys, ...newImageKeys];

    const note = await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        imageKeys: allImageKeys,
        audioKey: finalAudioKey,
        isStarred,
        isShared,
        color,
        updatedAt: new Date(),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    const response = await noteToResponse(note);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE note + clean up all files from R2
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingNote = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete all files from R2 using stored keys
    const keysToDelete = [
      ...existingNote.imageKeys,
      ...(existingNote.audioKey ? [existingNote.audioKey] : []),
    ];
    if (keysToDelete.length > 0) {
      deleteFilesFromR2(keysToDelete).catch((err) =>
        console.error("Failed to delete files from R2:", err)
      );
    }

    await prisma.note.delete({ where: { id: noteId } });

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
