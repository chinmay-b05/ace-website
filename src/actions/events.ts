import { db } from '@lib/db';
import { eventTable, teamTable, userTeamTable } from '@lib/db/schema';
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions';
import { z } from 'astro/zod';
import { eq } from 'drizzle-orm';
import { getSession } from 'auth-astro/server';

export const getAllEventsForProfile = defineAction({
  accept: 'json',
  input: z.object({
    email: z.string(),
  }),
  handler: async ({ email }, context) => {
    console.log('HIIIII 2222');

    try {
      const session = await getSession(context.request);
      console.log('hii');

      console.log('Session:', session);

      if (!session?.user?.id) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'must be signedIn to like a blog',
        });
      }

      const events = await db
        .select({
          event: eventTable,
        })
        .from(userTeamTable)
        .innerJoin(teamTable, eq(teamTable.id, userTeamTable.teamId))
        .innerJoin(eventTable, eq(eventTable.id, teamTable.eventId))
        .where(eq(userTeamTable.userId, session.user.id));
      console.log('Events', events);
      return events;
    } catch (error) {
      console.error(error);
    }
  },
});
