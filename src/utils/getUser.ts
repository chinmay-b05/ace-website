import { db } from "@lib/db";
import { userTable } from "@lib/db/schema";
import { eq } from 'drizzle-orm';

export async function getUser(id: string) {
    try {
      const user = await db.query.userTable.findFirst({
        where : eq(userTable.id , id as string)
      })
      return user
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }