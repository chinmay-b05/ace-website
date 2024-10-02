import { db } from '@lib/db';
import { eventTable, teamTable, userTeamTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { eq } from 'drizzle-orm';
import { getSession } from 'auth-astro/server';
import { uploadImageToCloudinaryFromServer } from '@lib/cloudinary';
const MAX_FILE_SIZE = 5000000; //5mb
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const getAllEventsForProfile = defineAction({
  accept: 'json',
  input: z.object({
    email: z.string(),
  }),
  handler: async (input,context) => {
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

export const createEvent = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
    description: z.string(),
    image: z
      .any()
      .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported.',
      ),
    deadline: z.string(),
    fromDate: z.string(),
    toDate: z.string(),
    venue: z.string(),
    amount: z.number(),

    category: z.enum(['WORKSHOP', 'HACKATHON', 'COMPETITION', 'SPECIAL']),
    state: z.enum(['DRAFT', 'PUBLISHED', 'LIVE', 'COMPLETED']),
    maxTeams: z.number(),
    maxTeamSize: z.number(),
    minTeamSize: z.number(),
  }),
  handler: async ({
    name,
    description,
    image,
    category,
    state,
    deadline,
    fromDate,
    toDate,
    amount,
    maxTeams,
    maxTeamSize,
    minTeamSize,
    venue,
  }) => {
    const response = await uploadImageToCloudinaryFromServer(image as File, {});

    const event = await db
      .insert(eventTable)
      .values({
        name,
        description,
        image: response?.secure_url,
        category,
        state,
        deadline: deadline,
        fromDate: fromDate,
        toDate: toDate,
        amount,
        maxTeams,
        maxTeamSize,
        minTeamSize,
        venue,
      })
      .returning({ id: eventTable.id });

    if (!event.length) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not create event',
      });
    }
    return {
      eventId: event[0].id,
    };
  },
});
