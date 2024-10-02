import { db } from '@lib/db';
import { teamTable, userTeamTable } from '@lib/db/schema';
import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { and, eq } from 'drizzle-orm';

const createTeamZ = z.object({
  eventId: z.number(),
  teamName: z.string().min(1),
  userId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  // Add logic to get userId

  try {
    console.log('Request:', request);

    const data = await request.json();
    const { eventId, teamName, userId } = createTeamZ.parse(data);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 201 });
    }
    const existingTeam = await db
      .select()
      .from(userTeamTable)
      .leftJoin(teamTable, eq(userTeamTable.teamId, teamTable.id))
      .where(and(eq(teamTable.eventId, eventId), eq(userTeamTable.userId, userId)))
      .execute();

    if (existingTeam.length > 0) {
      console.log('User already part of a team');

      return new Response(JSON.stringify({ error: 'User already part of a team' }), { status: 200 });
    }

    const newTeam = await db
      .insert(teamTable)
      .values({
        name: teamName,
        eventId: eventId,
      })
      .returning()
      .execute();

    if (!newTeam || newTeam.length === 0) {
      console.error('Team creation failed');
      return new Response(JSON.stringify({ error: 'Team creation failed' }), { status: 200 });
    }

    console.log('NOt done yet');

    // Add the user as a member of the newly created team
    const res = await db
      .insert(userTeamTable)
      .values({
        userId,
        teamId: newTeam[0].id,
        teamLeader: true, // Use the ID of the newly created team
      })
      .returning()
      .execute();

    console.log('Res', res);

    if (!res) {
      console.error('Failed to insert user into the team');
      return new Response(JSON.stringify({ error: 'Failed to add user to team' }), { status: 200 });
    }

    console.log('new team created');
    return new Response(JSON.stringify({ success: true, team: newTeam }), { status: 200 });
  } catch (error) {
    console.log('Error:', error);

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 200,
    });
  }
};
