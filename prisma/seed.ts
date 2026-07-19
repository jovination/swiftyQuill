import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

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

  // Create SUPER_ADMIN role if it doesn't exist
  let superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' }
  })

  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full access to the platform'
      }
    })
    console.log('SUPER_ADMIN role created')
  }

  // Create or update the admin user
  const adminEmail = 'admin@swiftyquill.com'
  const adminPassword = 'werT&nufyRTub#'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: 'swiftyadmin', // unique username
        email: adminEmail,
        password: hashedPassword,
        roleId: superAdminRole.id,
        emailVerified: new Date(),
        status: 'ACTIVE'
      }
    })
    console.log('Admin user created successfully')
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
        roleId: superAdminRole.id,
        status: 'ACTIVE'
      }
    })
    console.log('Admin user updated successfully')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 