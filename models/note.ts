import { prisma } from "@/lib/prisma";

export type NoteCreateInput = {
  userId: string;
  title: string;
  content: string;
  imageUrl?: string;
  isStarred?: boolean;
  isShared?: boolean;
  tags?: string[]; // Tag names
};

export type NoteUpdateInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
  isStarred?: boolean;
  isShared?: boolean;
  tags?: string[]; // Tag names to set (replaces existing tags)
};

export const noteModel = {
  async create(data: NoteCreateInput) {
    const { tags = [], ...noteData } = data;
    
    // Create the note
    const note = await prisma.note.create({
      data: {
        ...noteData,
        // Create or connect tags
        tags: {
          create: await Promise.all(tags.map(async (tagName) => {
            // Find or create tag
            const tag = await prisma.tag.upsert({
              where: { 
                name_userId: {
                  name: tagName,
                  userId: data.userId
                }
              },
              update: {},
              create: { 
                name: tagName,
                userId: data.userId
              },
            });
            
            return {
              tag: {
                connect: { id: tag.id },
              },
            };
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
    
    return note;
  },

  async findById(id: string) {
    return prisma.note.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.note.findMany({
      where: { userId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async update(id: string, data: NoteUpdateInput) {
    const { tags, ...updateData } = data;
    
    // If tags are provided, update them
    if (tags) {
      // Get the note to access userId
      const note = await prisma.note.findUnique({
        where: { id },
        select: { userId: true }
      });
      
      if (!note) {
        throw new Error('Note not found');
      }
      
      // Get all current tags for this note
      const currentNoteTags = await prisma.noteTag.findMany({
        where: { noteId: id },
      });
      
      // Delete all current tags
      await prisma.noteTag.deleteMany({
        where: { noteId: id },
      });
      
      // Create or connect new tags
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { 
            name_userId: {
              name: tagName,
              userId: note.userId
            }
          },
          update: {},
          create: { 
            name: tagName,
            userId: note.userId
          },
        });
        
        await prisma.noteTag.create({
          data: {
            noteId: id,
            tagId: tag.id,
          },
        });
      }
    }
    
    // Update the note
    return prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.note.delete({
      where: { id },
    });
  },
  
  async shareNote(noteId: string, sharedWithUserId: string) {
    // First, mark the note as shared
    await prisma.note.update({
      where: { id: noteId },
      data: { isShared: true },
    });
    
    // Then create the shared note record
    return prisma.sharedNote.create({
      data: {
        noteId,
        sharedWithUserId,
      },
    });
  },
  
  async getSharedNotes(userId: string) {
    return prisma.sharedNote.findMany({
      where: { sharedWithUserId: userId },
      include: {
        note: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });
  },
};