import { db } from '@lib/db';
import { eventTable, teamTable, userTeamTable } from '@lib/db/schema';
import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { and, eq } from 'drizzle-orm';

const leaveTeamZ = z.object({
  teamId: z.number(),
  userId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Extract input data from the request body
    const input = await request.json();

    // Validate input
    const parsedInput = leaveTeamZ.safeParse(input);
    if (!parsedInput.success) {
      return new Response(JSON.stringify({ error: parsedInput.error.message }), { status: 400 });
    }

    // Assuming you have a way to get the user ID from the session/context
    const { teamId, userId } = parsedInput.data;

    // Check if the team exists and fetch related details
    const team = await db
      .select({
        isConfirmed: teamTable.isConfirmed,
        eventId: teamTable.eventId,
        event: {
          id: eventTable.id,
        },
      })
      .from(teamTable)
      .innerJoin(eventTable, eq(teamTable.eventId, eventTable.id))
      .where(eq(teamTable.id, teamId))
      .limit(1)
      .execute();

    if (team.length === 0) {
      return new Response(JSON.stringify({ error: 'Team not found' }), { status: 200 });
    }

    const teamDetails = team[0];

    if (teamDetails.isConfirmed) {
      return new Response(JSON.stringify({ error: 'You cannot leave this team anymore' }), { status: 200 });
    }

    await db
      .delete(userTeamTable)
      .where(and(eq(userTeamTable.userId, userId), eq(userTeamTable.teamId, teamId)))
      .execute();

    return new Response(JSON.stringify({ message: 'Left team successfully' }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
