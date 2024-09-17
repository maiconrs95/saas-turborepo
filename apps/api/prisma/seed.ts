import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const users = (passwordHash) => [
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
]

async function seed() {
  await prisma.member.deleteMany()
  await prisma.project.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hash('123456', 1)

  const [maico, jac, guga] = await prisma.user.createManyAndReturn({
    data: users(passwordHash),
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme_admin',
      avatarURL:
        'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',
      shouldAttachUsersByDomain: true,
      ownerId: maico.id,
      projects: {
        createMany: {
          data: [
            {
              name: 'Project 1',
              slug: 'admin_project_1',
              description: 'Project 1 description',
              avatarURL: '',
              ownerId: jac.id,
            },
          ],
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

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Member)',
      slug: 'acme_member',
      avatarURL:
        'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',
      ownerId: jac.id,
      projects: {
        createMany: {
          data: [
            {
              name: 'Project 1',
              slug: 'member_project_1',
              description: 'Project 1 description',
              avatarURL: '',
              ownerId: maico.id,
            },
            {
              name: 'Project 2',
              slug: 'member_project_2',
              description: 'Project 2 description',
              avatarURL: '',
              ownerId: guga.id,
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: maico.id,
              role: 'MEMBER',
            },
            {
              userId: jac.id,
              role: 'ADMIN',
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

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Member)',
      slug: 'acme_billing',
      avatarURL:
        'https://www.maiconsilva.com/static/c9c8709b70c68c3e35b5c4494216545c/b2712/profile.jpg',
      ownerId: guga.id,
      projects: {
        createMany: {
          data: [
            {
              name: 'Project 1',
              slug: 'billing_project_1',
              description: 'Project 1 description',
              avatarURL: '',
              ownerId: jac.id,
            },
            {
              name: 'Project 2',
              slug: 'billing_project_2',
              description: 'Project 2 description',
              avatarURL: '',
              ownerId: guga.id,
            },
            {
              name: 'Project 3',
              slug: 'billing_project_3',
              description: 'Project 2 description',
              avatarURL: '',
              ownerId: guga.id,
            },
          ],
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: maico.id,
              role: 'BILLING',
            },
            {
              userId: jac.id,
              role: 'MEMBER',
            },
            {
              userId: guga.id,
              role: 'ADMIN',
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
