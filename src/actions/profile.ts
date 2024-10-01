import { uploadImageToCloudinaryFromServer } from '@lib/cloudinary';
import { db } from '@lib/db';
import { userTable } from '@lib/db/schema';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:content';
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
    image: z
      .instanceof(File)
      .optional()
      .refine((file) => {
        return !file || file?.size <= MAX_FILE_SIZE;
      }, `Max image size is 5MB.`)
      .refine((file) => {
        return file?.size == 0 || ACCEPTED_IMAGE_TYPES.includes(file?.type!);
      }, 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
  }),
  handler: async ({ name, email, instagram, github, linkedIn, image }) => {
    console.log(name, email, github);

    try {
      if (image && image.size > 0) {
        const response = await uploadImageToCloudinaryFromServer(image as File, {});
        const userProfile = await db
          .update(userTable)
          .set({
            name,
            email,
            instagram,
            linkedIn,
            github,
            image: response?.secure_url,
          })
          .where(eq(userTable.email, email))
          .returning({ id: userTable.id });

        console.log(userProfile);

        if (!userProfile.length) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not create blog',
          });
        }
        return {
          user_id: userProfile[0].id,
        };
      }

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
      console.log(userProfile);

      if (!userProfile.length) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not create blog',
        });
      }
      return {
        user_id: userProfile[0].id,
      };
    } catch (error) {
      console.error(error);
    }
  },
});
