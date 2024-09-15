import { db } from '@lib/db';
import { eventTable, teamTable, userTeamTable } from '@lib/db/schema';
import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { eq, sql } from 'drizzle-orm';

const confirmTeamZ = z.object({
  teamId: z.number(),
  userId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Extract input data from the request body
    const input = await request.json();

    // Validate input
    const parsedInput = confirmTeamZ.safeParse(input);

    if (!parsedInput.success) {
      return new Response(JSON.stringify({ error: parsedInput.error.message }), { status: 400 });
    }

    const { teamId, userId } = parsedInput.data;

    // Check if the team exists and fetch related details
    const team = await db
      .select({
        id: teamTable.id,
        isConfirmed: teamTable.isConfirmed,
        countMembers: sql`COUNT(${userTeamTable.userId})`.as('countMembers'),
        minTeamSize: eventTable.minTeamSize,
      })
      .from(teamTable)
      .innerJoin(eventTable, eq(teamTable.eventId, eventTable.id))
      .leftJoin(userTeamTable, eq(userTeamTable.teamId, teamTable.id))
      .where(eq(teamTable.id, teamId))
      .groupBy(teamTable.id, eventTable.minTeamSize)
      .limit(1)
      .execute();

    if (!team) {
      return new Response(JSON.stringify({ error: 'Team not found' }), { status: 400 });
    }

    if (Number(team[0].countMembers) < team[0].minTeamSize) {
      return new Response(JSON.stringify({ error: 'Team does not have enough members' }), { status: 400 });
    }

    // Confirm the team
    await db.update(teamTable).set({ isConfirmed: true }).where(eq(teamTable.id, teamId)).execute();

    return new Response(JSON.stringify({ message: 'Team confirmed successfully' }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
