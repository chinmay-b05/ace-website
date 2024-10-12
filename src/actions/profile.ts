import { uploadImageToCloudinaryFromServer } from '@lib/cloudinary';
import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { getSession } from 'auth-astro/server';
import { eq } from 'drizzle-orm';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5000000;

export const editProfile = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
    email: z.string(),
    instagram: z.string().optional(),
    github: z.string().optional(),
    linkedIn: z.string().optional(),
  }),
  handler: async ({ name, email, instagram, github, linkedIn }) => {
    try {
      const userProfile = await db
        .update(userTable)
        .set({
          name,
          email,
          instagram,
          linkedIn,
          github,
        })
        .where(eq(userTable.email, email))
        .returning({ id: userTable.id });

      if (!userProfile.length) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not update profile info',
        });
      }
      return {
        user_id: userProfile[0].id,
      };
    } catch (error) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not update profile info',
      });
    }
  },
});

export const updateProfilePic = defineAction({
  accept: 'form',
  input: z.object({
    image: z
      .instanceof(File)
      .refine((file) => {
        return !file || file?.size <= MAX_FILE_SIZE;
      }, `Max image size is 5MB.`)
      .refine((file) => {
        return file?.size == 0 || ACCEPTED_IMAGE_TYPES.includes(file?.type!);
      }, 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
  }),
  handler: async ({ image }, context) => {
    const session = await getSession(context.request);

    if (!session?.user?.email) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: 'must have an account',
      });
    }

    try {
      if (image && image.size > 0) {
        const response = await uploadImageToCloudinaryFromServer(image as File, {});
        const userProfile = await db
          .update(userTable)
          .set({
            image: response?.secure_url,
          })
          .where(eq(userTable.email, session.user.email!))
          .returning({ id: userTable.id });

        if (!userProfile.length) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not update profile image',
          });
        }
      }
    } catch (error) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not update profile info',
      });
    }
  },
});
