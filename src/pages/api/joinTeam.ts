import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { db } from '@lib/db';
import { eventTable, teamTable, userTeamTable } from '@lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';

// Define Zod validation schema for input
const joinTeamZ = z.object({
  eventId: z.number(),
  teamId: z.number(),
  userId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  console.log('Hi');

  try {
    const input = await request.json();
    console.log(input);

    // Validate input using Zod
    const parsedInput = joinTeamZ.safeParse(input);
    console.log(parsedInput);

    if (!parsedInput.success) {
      return new Response(
        JSON.stringify({
          message: 'Invalid Input',
        }),
        {
          status: 400,
        },
      );
    }

    const { eventId, teamId, userId } = parsedInput.data;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 201 });
    }

    console.log('Wroks');

    const existingTeam = await db
      .select()
      .from(userTeamTable)
      .leftJoin(teamTable, eq(userTeamTable.teamId, teamTable.id))
      .where(and(eq(userTeamTable.userId, userId), eq(teamTable.eventId, eventId)))
      .execute();

    if (existingTeam.length > 0) {
      console.log('Already in team');

      return new Response(
        JSON.stringify({
          error: 'Already in the team',
        }),
        { status: 200 },
      );
    }

    console.log('Not in team proceed');

    const team = await db
      .select({
        id: teamTable.id,
        memberCount: sql`COUNT(${userTeamTable.userId})`.as('memberCount'), // Counting user IDs
        maxTeamSize: eventTable.maxTeamSize,
      })
      .from(teamTable)
      .innerJoin(eventTable, eq(eventTable.id, teamTable.eventId))
      .leftJoin(userTeamTable, eq(userTeamTable.teamId, teamTable.id)) // Join to count members
      .where(and(eq(teamTable.id, teamId), eq(teamTable.eventId, eventId)))
      .groupBy(teamTable.id, eventTable.maxTeamSize) // Ensure groupBy matches selected columns
      .limit(1)
      .execute();

    if (team.length === 0) {
      console.log('Team not found');

      return new Response(
        JSON.stringify({
          error: 'Team not found',
        }),
        { status: 200 },
      );
    }

    const teamData = team[0];

    console.log('Team found');

    // Ensure team is associated with the correct event

    // Check if team is full
    if ((teamData.memberCount as number) >= teamData.maxTeamSize) {
      console.log('COunt exceeded');

      return new Response(
        JSON.stringify({
          error: 'Team is full',
        }),
        { status: 200 },
      );
    }

    console.log('Updating');

    // Add the user to the team
    const res = await db
      .insert(userTeamTable)
      .values({
        userId,
        teamId, // Use the ID of the newly created team
      })
      .returning()
      .execute();

    if (res.length > 0) {
      console.log('Team joined successfully');

      return new Response(
        JSON.stringify({
          message: 'Joined team successfully',
        }),
        { status: 200 },
      );
    }

    console.log('Couldnt join team');

    return new Response(
      JSON.stringify({
        error: 'Couldnt join team',
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Internal Server Error',
      }),
      { status: 500 },
    );
  }
};
