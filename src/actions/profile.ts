import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { eq } from 'drizzle-orm';

export const editProfile = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
    email: z.string(),
    instagram: z.string().optional(),
    github: z.string().optional(),
    linkedIn: z.string().optional(),
  }),
  handler: async ({ name, email, instagram, github, linkedIn }) => {
    console.log(name, email, github);

    const userProfile = await db
      .update(userTable)
      .set({
        name,
        email,
        instagram,
        linkedIn,
        github,
      })
      .where(eq(userTable.email, email))
      .returning({ id: userTable.id });

    if (!userProfile.length) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not create blog',
      });
    }
    return {
      user_id: userProfile[0].id,
    };
  },
});
