const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const notes = await prisma.note.findMany()
  console.log(notes.map(n => n.imageUrls))
}
main()
