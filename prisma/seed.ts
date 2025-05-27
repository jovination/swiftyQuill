import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default tags
  const defaultTags = ['All', 'Shared', 'Starred']
  
  for (const tagName of defaultTags) {
    await prisma.tag.upsert({
      where: { 
        name_userId: {
          name: tagName,
          userId: null
        }
      },
      update: {
        isDefault: true
      },
      create: { 
        name: tagName,
        isDefault: true
      }
    })
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