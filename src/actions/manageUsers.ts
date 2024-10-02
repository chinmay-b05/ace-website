// get all users, changes roles, and deletes users

import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { z } from 'astro/zod';
import { defineAction } from 'astro:actions';
import { eq, inArray } from 'drizzle-orm';

export const removeUser = defineAction({
  input: z.object({
    id: z.array(z.string()),
  }),
  handler: async ({ id }, context) => {
    await db.delete(userTable).where(inArray(userTable.id, id));
    return {
      message: 'User deleted successfully',
    };
  },
});

export const changeRole = defineAction({
  input: z.object({
    id: z.string(),
    role: z.enum(['ADMIN', 'MEMBER', 'CORE']),
  }),
  handler: async ({ id, role }, context) => {
    await db.update(userTable).set({ role: role }).where(eq(userTable.id, id));
    return {
      message: 'Role changed successfully',
    };
  },
});
