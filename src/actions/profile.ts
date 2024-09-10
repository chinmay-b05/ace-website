import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:content';

export const editProfile = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
    email: z.string(),
  }),
  handler: async ({ name, email }) => {
    const userProfile = await db
      .update(userTable)
      .set({
        name: name,
        email: email,
      })
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
