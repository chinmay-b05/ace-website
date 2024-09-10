import { uploadImageToCloudinaryFromServer } from '@lib/cloudinary';
import { db } from '@lib/db';
import { blogTable } from '@lib/db/schema';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';
import { and, eq } from 'drizzle-orm/sqlite-core/expressions';

const MAX_FILE_SIZE = 5000000; //5mb
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const createBlog = defineAction({
  accept: 'form',
  input: z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
    image: z
      .any()
      .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported.',
      ),
    authorId: z.string(),
  }),
  handler: async ({ title, description, content, image, authorId }) => {
    const response = await uploadImageToCloudinaryFromServer(image as File, {});

    const blogs = await db
      .insert(blogTable)
      .values({
        title,
        description,
        content,
        image: response?.secure_url,
        authorId,
      })
      .returning({ id: blogTable.id });

    if (!blogs.length) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not create blog',
      });
    }
    return {
      blogId: blogs[0].id,
    };
  },
});

export const editBlog = defineAction({
  accept: 'form',
  input: z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
    image: z
      .any()
      .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported.',
      ),
    blogId: z.string(),
    authorId: z.string(),
  }),
  handler: async ({ title, description, content, image, authorId, blogId }) => {
    const response = await uploadImageToCloudinaryFromServer(image as File, {});

    const blogs = await db
      .update(blogTable)
      .set({
        title,
        description,
        content,
        image: response?.secure_url,
        authorId,
      })
      .where(and(eq(blogTable.id, Number(blogId)), eq(blogTable.authorId, authorId)))
      .returning({ id: blogTable.id });

    if (!blogs.length) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not update blog',
      });
    }
    return {
      blogId: blogs[0].id,
    };
  },
});

export const likeBlog = defineAction({
  accept: 'form',
  input: z.object({
    userId: z.string(),
  }),
  handler: async ({}) => {
    console.log('edit blog');
    return { success: true };
  },
});
