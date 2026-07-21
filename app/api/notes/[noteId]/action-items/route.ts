import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noteToResponse } from "@/lib/note-response";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;
    const { itemId, completed } = await req.json();

    if (!itemId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "itemId and completed boolean status are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: user.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const existingItems = Array.isArray(note.actionItems) ? (note.actionItems as any[]) : [];
    const updatedItems = existingItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, completed };
      }
      return item;
    });

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        actionItems: updatedItems,
        updatedAt: new Date(),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    const response = await noteToResponse(updatedNote);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating action item status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
