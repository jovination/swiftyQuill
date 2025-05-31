import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, content, imageUrl } = body;

        if (!title && !content) {
            return NextResponse.json(
                { error: 'Title or content is required' },
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

        // Create the note
        const note = await prisma.note.create({
            data: {
                userId: user.id,
                title,
                content,
                imageUrl,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get URL parameters
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');

        // Fetch notes with optional tag filtering
        const notes = await prisma.note.findMany({
            where: {
                userId: user.id,
                ...(tag && tag !== 'All' ? {
                    OR: [
                        {
                            tags: {
                                some: {
                                    tag: {
                                        name: tag,
                                        OR: [
                                            { isDefault: true },
                                            { userId: user.id }
                                        ]
                                    }
                                }
                            }
                        },
                        ...(tag === 'Starred' ? [{ isStarred: true }] : []),
                        ...(tag === 'Shared' ? [{ isShared: true }] : [])
                    ]
                } : {})
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 