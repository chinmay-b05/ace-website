import { db } from '@lib/db';
import { eventTable, teamTable, userTable, userTeamTable } from '@lib/db/schema';
import type { APIRoute } from 'astro';
import { z } from 'astro:schema';
import { and, eq } from 'drizzle-orm';

const inATeamZ = z.object({
  eventId: z.number(),
  userId: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const input = await request.json();
    const parsedInput = inATeamZ.safeParse(input);
    console.log(parsedInput);

    if (!parsedInput.success) {
      console.log('Invalid Input');

      return new Response(
        JSON.stringify({
          message: 'Invalid Input',
        }),
        {
          status: 400,
        },
      );
    }

    const { userId, eventId } = parsedInput.data;

    if (!userId) {
      console.log('User not Authorized');

      return new Response(JSON.stringify({ message: 'User not Authorized' }), { status: 400 });
    }

    const userInTeamOfEvent = await db
      .select({
        teamId: userTeamTable.teamId,
      })
      .from(userTeamTable)
      .innerJoin(teamTable, eq(userTeamTable.teamId, teamTable.id)) // Join to check eventId from teamTable
      .where(and(eq(userTeamTable.userId, userId), eq(teamTable.eventId, eventId))) // Check both userId and eventId
      .limit(1)
      .execute();

    if (userInTeamOfEvent.length === 0) {
      console.log('User not in a team');

      return new Response(JSON.stringify(null), { status: 200 });
    }

    const teamId = userInTeamOfEvent[0].teamId;

    const teamDetailsRaw = await db
      .select({
        teamId: teamTable.id,
        teamName: teamTable.name,
        isConfirmed: teamTable.isConfirmed,
        createdAt: teamTable.createdAt,
        eventId: eventTable.id,
        eventName: eventTable.name,
        eventFrom: eventTable.fromDate,
        eventTo: eventTable.toDate,
        eventDescription: eventTable.description,
        eventVenue: eventTable.venue,
        userId: userTable.id,
        userName: userTable.name,
        maxTeamSize: eventTable.maxTeamSize,
        teamLeader: userTeamTable.teamLeader,
      })
      .from(teamTable)
      .innerJoin(eventTable, eq(teamTable.eventId, eventTable.id))
      .innerJoin(userTeamTable, eq(userTeamTable.teamId, teamTable.id))
      .innerJoin(userTable, eq(userTeamTable.userId, userTable.id))
      .where(eq(teamTable.id, teamId))
      .execute();

    if (teamDetailsRaw.length === 0) {
      console.log('Team not found');
      return new Response(JSON.stringify({ message: 'Team not found' }), { status: 200 });
    }

    const isTeamLeader = teamDetailsRaw.some((member) => {
      if (userId === member.userId && member.teamLeader) {
        return true;
      }
      return false;
    });

    const teamData = {
      teamId: teamDetailsRaw[0]?.teamId,
      teamName: teamDetailsRaw[0]?.teamName,
      isConfirmed: teamDetailsRaw[0]?.isConfirmed,
      createdAt: teamDetailsRaw[0]?.createdAt,
      teamLeader: isTeamLeader,
      event: {
        eventId: teamDetailsRaw[0]?.eventId,
        eventName: teamDetailsRaw[0]?.eventName,
        eventFrom: teamDetailsRaw[0]?.eventFrom,
        eventTo: teamDetailsRaw[0]?.eventTo,
        eventDescription: teamDetailsRaw[0]?.eventDescription,
        eventVenue: teamDetailsRaw[0]?.eventVenue,
        maxTeamSize: teamDetailsRaw[0]?.maxTeamSize,
      },
      members: teamDetailsRaw.map((member) => ({
        userId: member.userId,
        userName: member.userName,
      })),
    };

    console.log('Team Details:', teamData);

    return new Response(JSON.stringify(teamData), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error', error: error }), { status: 500 });
  }
};
