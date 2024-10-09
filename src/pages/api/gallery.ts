import { getImages } from '@lib/cloudinary';
import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

const galleryZ = z.object({
  nextCursor: z.string(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { nextCursor } = galleryZ.parse(data);
    const imageDetails = await getImages('gallery', nextCursor);
    
    return new Response(JSON.stringify(imageDetails), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Bad request' }), {
      status: 400,
    });
  }
};
