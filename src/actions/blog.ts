import { uploadImageToCloudinaryFromServer } from '@lib/cloudinary';
import { db } from '@lib/db';
import { blogTable, commentsTable, viewTable } from '@lib/db/schema';
import { z } from 'astro/zod';
import { ActionError, defineAction } from 'astro:actions';
import { and, eq, not } from 'drizzle-orm/sqlite-core/expressions';
import { getSession } from 'auth-astro/server';

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
    try {
      console.log('SUOP');

      const response = await uploadImageToCloudinaryFromServer(image as File, {});
      console.log(response);

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

      console.log(blogs);

      return {
        blogId: blogs[0].id,
      };
    } catch (error) {
      console.error(error);
    }
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
  accept: 'json',
  input: z.object({
    blogId: z.string(),
  }),
  handler: async ({ blogId }, context) => {
    const session = await getSession(context.request);
    console.log('Session', session);

    if (!session?.user?.id) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: 'must be signedIn to like a blog',
      });
    }

    const result = await db
      .update(viewTable)
      .set({
        liked: not(viewTable.liked),
      })
      .where(and(eq(viewTable.blogId, Number(blogId)), eq(viewTable.userId, session!.user!.id)))
      .returning({ liked: viewTable.liked });

    if (!result.length) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not update like',
      });
    }

    return { liked: result[0].liked };
  },
});

export const commentBlog = defineAction({
  accept: 'form',
  input: z.object({
    blogId: z.string(),
    content: z.string(),
  }),
  handler: async ({ blogId, content }, context) => {
    const session = await getSession(context.request);

    if (!session?.user?.id) {
      throw new ActionError({
        code: 'FORBIDDEN',
        message: 'must be signedIn to like a blog',
      });
    }

    const comments = await db
      .insert(commentsTable)
      .values({
        blogId: Number(blogId),
        content,
        userId: session!.user!.id!,
      })
      .returning({
        content: commentsTable.content,
        createdAt: commentsTable.createdAt,
      });

    if (!comments.length) {
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not add comment',
      });
    }

    // return { liked: result[0].liked };
    return { comment: comments[0] };
  },
});
