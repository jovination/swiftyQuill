import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { noteId } = await params;
        const body = await req.json();
        const { sharedWithEmail } = body;

        if (!sharedWithEmail) {
            return NextResponse.json(
                { error: 'Email of user to share with is required' },
                { status: 400 }
            );
        }

        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get the note
        const note = await prisma.note.findUnique({
            where: { id: noteId }
        });

        if (!note) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        // Get the user to share with
        const sharedWithUser = await prisma.user.findUnique({
            where: { email: sharedWithEmail }
        });

        if (!sharedWithUser) {
            return NextResponse.json(
                { error: 'User to share with not found' },
                { status: 404 }
            );
        }

        // Create the shared note record
        const sharedNote = await prisma.sharedNote.create({
            data: {
                noteId,
                sharedWithUserId: sharedWithUser.id
            }
        });

        // Update the note to mark it as shared
        await prisma.note.update({
            where: { id: noteId },
            data: { isShared: true }
        });

        return NextResponse.json(sharedNote);
    } catch (error) {
        console.error('Error sharing note:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 