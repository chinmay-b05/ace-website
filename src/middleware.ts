import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';
import { eq } from 'drizzle-orm';
import { toast } from 'sonner';
import { decrypt, encrypt } from 'utils/crypto';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, locals } = context;
  const session = await getSession(request);

  if (session?.user) {
    locals.name = session.user.name;
    locals.email = session.user.email;
    locals.id = session.user.id;

    const encryptedRole = cookies.get('userRole')?.value;
    let userRole;
    if (encryptedRole) {
      try {
        userRole = decrypt(encryptedRole);
      } catch (error) {
        console.log(error);
      }

      if (userRole) {
        locals.role = userRole;
      }
    }

    // if (context.url.pathname.includes('admin')) {
    //   if (user) {
    //     return redirect('/');
    //   }
    //   return next();
    // }

    if (!userRole) {
      const res = await db.query.userTable.findFirst({
        where: eq(userTable.email, session.user.email as string),
      });

      if (res) {
        const encryptedRole = encrypt(res?.role as string);
        cookies.set('userRole', encryptedRole as string, {
          path: '/',
          secure: true,
          httpOnly: true,
        });
        locals.role = res?.role as string;
      }
    }
  }
  console.log(locals.role);

  if (context.url.pathname.includes('admin')) {
    console.log('Hi');

    if (!session?.user) {
      console.log('no user');
      return context.redirect('/');
    } else if (session?.user && locals.role !== 'ADMIN') {
      {
        console.log('no admin');
        return context.redirect('/');
      }
    }
  }

  return next();
});
