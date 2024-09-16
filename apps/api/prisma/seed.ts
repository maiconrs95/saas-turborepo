import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('123456', 1)

  const [maico, jac, guga] = await prisma.user.createMany({
    data: [
      {
        name: 'Maico Silva',
        email: 'maico@acme.com',
        avatarURL:
          'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',

        passwordHash,
      },
      {
        name: 'Jac Silva',
        email: 'jac@acme.com',
        avatarURL:
          'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',

        passwordHash,
      },
      {
        name: 'Guga Silva',
        email: 'guga@acme.com',
        avatarURL:
          'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',

        passwordHash,
      },
    ],
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme_admin',
      avatarURL:
        'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',
      shouldAttachUsersByDomain: true,
      owner: maico.id,
      projects: {
        createMany: {
          data: [],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: maico.id,
              role: 'ADMIN',
            },
            {
              userId: jac.id,
              role: 'MEMBER',
            },
            {
              userId: guga.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })
}

seed()
  .then(() => console.log('Seeding complete!'))
  .finally(async () => await prisma.$disconnect())
