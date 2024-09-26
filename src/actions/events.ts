import { db } from '@lib/db';
import { eventTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';

const getAllEventsForUser = defineAction({
  accept: 'json',
  input: z.undefined(),
  handler: async () => {
    console.log('HIIIII');

    const events = await db.select().from(eventTable).where(eq(eventTable.state, 'PUBLISHED'));
    console.log('Events', events);

    return events;
  },
});
