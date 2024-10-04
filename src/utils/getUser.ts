import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getUser(id: string) {
  return await db.query.userTable.findFirst({
    where: eq(userTable.id, id),
  });
}
