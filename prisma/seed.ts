import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default tags if they don't exist
  const defaultTags = ['All', 'Starred', 'Shared']
  
  for (const tagName of defaultTags) {
    // First try to find an existing default tag
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: tagName,
        isDefault: true,
        userId: null
      }
    })

    if (!existingTag) {
      // If no default tag exists, create one
      await prisma.tag.create({
        data: {
          name: tagName,
          isDefault: true,
          userId: null
        }
      })
    }
  }

  console.log('Default tags seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 