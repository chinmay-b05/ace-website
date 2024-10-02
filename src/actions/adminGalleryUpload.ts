import { uploadImageToCloudinaryFromServer } from '@lib/cloudinary';
import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';
import { eq } from 'drizzle-orm/sqlite-core/expressions';
import { getSession } from 'auth-astro/server';

const MAX_FILE_SIZE = 5000000; //5mb
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const uploadToGallery = defineAction({
  accept: 'form',
  input: z.object({
    image: z
      .any()
      .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported.',
      ),
  }),
  handler: async ({ image }, context) => {
    const user = await getSession(context.request);
    if (user === null) {
      throw new ActionError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }
    const id = user.user?.id;
    if (id !== null) {
      const user = await db
        .select({
          id: userTable.id,
          roleType: userTable.role,
        })
        .from(userTable)
        .where(eq(userTable.role, 'ADMIN'));
      if (user.length === 0) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'User not authorized',
        });
      } else {
        try {
          console.log('SUOP');

          const response = await uploadImageToCloudinaryFromServer(image as File, {folder: 'gallery'});
          console.log(response);
          return {
            message: 'Successfully uploaded images to gallery',
          };
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      throw new ActionError({
        code: 'UNAUTHORIZED',
        message: 'user ID not found',
      });
    }
  },
});

