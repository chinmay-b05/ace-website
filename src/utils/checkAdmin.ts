import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { eq } from 'drizzle-orm';

export const isAdmin = async (id: string | undefined) => {
  if (id === undefined) {
    return false;
  }
  const user = await db
    .select({
      id: userTable.id,
      roleType: userTable.role,
    })
    .from(userTable)
    .where(eq(userTable.role, 'ADMIN'));
  if (user.length === 0) {
    return false;
  } else {
    return true;
  }
};
