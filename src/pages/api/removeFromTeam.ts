import { db } from '@lib/db';
import { eventTable, teamTable, userTeamTable } from '@lib/db/schema';
import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { and, eq } from 'drizzle-orm';

const removeFromTeamSchema = z.object({
  teamId: z.number(),
  userId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const input = await request.json();
    const { teamId, userId } = removeFromTeamSchema.parse(input);

    const team = await db
      .select({
        isConfirmed: teamTable.isConfirmed,
      })
      .from(teamTable)
      .innerJoin(eventTable, eq(eventTable.id, teamTable.eventId))
      .where(eq(teamTable.id, teamId))
      .limit(1)
      .execute();

    if (!team || team.length === 0) {
      return new Response(JSON.stringify({ message: 'Team not found' }), { status: 404 });
    }

    const { isConfirmed } = team[0];
    if (isConfirmed) {
      return new Response(
        JSON.stringify({
          message: 'You cannot leave this team anymore!',
        }),
        { status: 403 },
      );
    }

    await db
      .delete(userTeamTable)
      .where(and(eq(userTeamTable.teamId, teamId), eq(userTeamTable.userId, userId)))
      .execute();

    return new Response(JSON.stringify({ message: 'User removed from team successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
};
