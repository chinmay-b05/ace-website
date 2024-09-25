import { db } from '@lib/db';
import { eventTable, organiserTable, userTable } from '@lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function getAllEventsForUser() {
  try {
    const publishedEvents = await db.select().from(eventTable).where(eq(eventTable.state, 'PUBLISHED'));
    const completedEvents = await db.select().from(eventTable).where(eq(eventTable.state, 'COMPLETED'));

    const events = {
      published: publishedEvents,
      completed: completedEvents,
    };
    return events;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Error fetching user');
  }
}

export async function getEventById(id: number) {
  try {
    // Fetch event with its organisers and all required fields
    const eventWithOrganisers = await db
      .select({
        eventId: eventTable.id,
        eventName: eventTable.name,
        eventDescription: eventTable.description,
        eventToDate: eventTable.toDate,
        eventFromDate: eventTable.fromDate,
        eventState: eventTable.state,
        eventDeadline: eventTable.deadline,
        eventVenue: eventTable.venue,
        eventMaxTeamSize: eventTable.maxTeamSize,
        eventMinTeamSize: eventTable.minTeamSize,
        eventImage: eventTable.image,
        organiserId: organiserTable.userId, // Fetch organiser userId
        organiserName: userTable.name, // Fetch organiser's name (optional)
      })
      .from(eventTable)
      .leftJoin(organiserTable, eq(organiserTable.eventId, eventTable.id)) // Join organiserTable
      .leftJoin(userTable, eq(userTable.id, organiserTable.userId)) // Join userTable for organiser details
      .where(eq(eventTable.id, id));

    if (eventWithOrganisers.length === 0) {
      throw new Error('Event not found');
    }

    // Aggregate organisers into an array and build the event object
    const event = {
      id: eventWithOrganisers[0].eventId,
      name: eventWithOrganisers[0].eventName,
      description: eventWithOrganisers[0].eventDescription,
      toDate: eventWithOrganisers[0].eventToDate,
      fromDate: eventWithOrganisers[0].eventFromDate,
      state: eventWithOrganisers[0].eventState,
      deadline: eventWithOrganisers[0].eventDeadline,
      venue: eventWithOrganisers[0].eventVenue,
      maxTeamSize: eventWithOrganisers[0].eventMaxTeamSize,
      minTeamSize: eventWithOrganisers[0].eventMinTeamSize,
      image: eventWithOrganisers[0].eventImage,
      organisers: eventWithOrganisers
        .filter((row) => row.organiserId)
        .map((row) => ({
          userId: row.organiserId,

          name: row.organiserName,
        })),
    };

    return event;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Error fetching event');
  }
}
