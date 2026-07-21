import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { notesToResponse } from "@/lib/note-response";

// GET all notes for the authenticated user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const response = await notesToResponse(notes);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new note (multipart/form-data with files)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const color = (formData.get("color") as string) || null;
    const existingImageKeys = JSON.parse(
      (formData.get("imageKeys") as string) || "[]"
    ) as string[];
    const existingAudioKey =
      (formData.get("audioKey") as string) || null;
    const tags = JSON.parse(
      (formData.get("tags") as string) || "[]"
    ) as string[];

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
    let audioKey = existingAudioKey;
    if (audioFile && audioFile.size > 0) {
      const ext = audioFile.name.split(".").pop() || "webm";
      audioKey = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      await uploadToR2(audioKey, buffer, audioFile.type);
    }

    const allImageKeys = [...existingImageKeys, ...newImageKeys];

    const note = await prisma.note.create({
      data: {
        title,
        content,
        imageKeys: allImageKeys,
        audioKey,
        color,
        userId: user.id,
        tags: {
          create: tags.map((tagId: string) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const response = await notesToResponse([note]);
    return NextResponse.json(response[0], { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
