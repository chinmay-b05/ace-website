import { db } from '@lib/db';
import { teamTable, userTeamTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { and, eq } from 'drizzle-orm';

export const createTeam = defineAction({
  accept: 'form',
  input: z.object({
    eventId: z.string(),
    teamName: z.string(),
    id: z.string(),
  }),
  handler: async ({ eventId, teamName, id }) => {
    const inTeam = await db
      .select({ userId: userTeamTable.userId })
      .from(userTeamTable)
      .innerJoin(teamTable, eq(teamTable.id, userTeamTable.teamId))
      .where(and(eq(teamTable.eventId, parseInt(eventId)), eq(userTeamTable.userId, id)))
      .get();

    if (inTeam) {
      throw new ActionError({
        code: 'BAD_REQUEST',
        message: 'Already in a team for this event',
      });
    }

    const result = await db
      .transaction(async (tx) => {
        const insertedTeam = await tx
          .insert(teamTable)
          .values({
            name: teamName,
            eventId: parseInt(eventId),
          })
          .returning();

        const userTeam = await tx.insert(userTeamTable).values({
          userId: id,
          teamId: insertedTeam[0].id,
        });

        return {
          teamId: insertedTeam[0].id,
          eventId: eventId,
          teamName: insertedTeam[0].name, // Make sure 'name' is returned
        };
      })
      .then(
        (data) => {
          return {
            success: true,
          };
        },
        (reason) => {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: reason || 'Could not create team',
          });
        },
      );

    return result; // Return the final result
  },
});
