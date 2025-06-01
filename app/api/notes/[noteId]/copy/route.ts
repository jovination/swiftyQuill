import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    context: { params: { noteId: string } }
) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { noteId } = context.params;

        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get the original note
        const originalNote = await prisma.note.findUnique({
            where: { id: noteId },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        if (!originalNote) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // Create a copy of the note
        const copiedNote = await prisma.note.create({
            data: {
                userId: user.id,
                title: `${originalNote.title} (Copy)`,
                content: originalNote.content,
                imageUrl: originalNote.imageUrl,
                tags: {
                    create: originalNote.tags.map(({ tag }) => ({
                        tag: {
                            connect: { id: tag.id }
                        }
                    }))
                }
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        return NextResponse.json(copiedNote);
    } catch (error) {
        console.error('Error copying note:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
