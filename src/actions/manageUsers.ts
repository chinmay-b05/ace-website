// get all users, changes roles, and deletes users

import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';
import { getSession } from 'auth-astro/server';
import { eq, inArray } from 'drizzle-orm';
import { isAdmin } from 'utils/checkAdmin';

export const getAllUsers = defineAction({
  handler: async (input, context) => {
    const users = await db.select().from(userTable).all();
    console.log(users);
    return users;
  },
});

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
