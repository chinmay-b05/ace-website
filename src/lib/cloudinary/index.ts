import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';

type UploadResponse = {
  secure_url: string;
};

cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const uploadStream = async (buffer: Uint8Array, options: UploadApiOptions) => {
  return new Promise<UploadResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      })
      .end(buffer);
  });
};

export const fileToBuffer = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export async function uploadImageToCloudinaryFromServer(file: File, options: UploadApiOptions) {
  const buffer = await fileToBuffer(file);
  return await uploadStream(buffer, options);
}

export async function getImages(assetFolder: string, nextCursor?: string, max_results: number = 100) {
  const images = await cloudinary.api.resources_by_asset_folder(assetFolder, {
    next_cursor: nextCursor,
    max_results: max_results,
    transformation: [{ quality: 'auto' }],
  });

  return {
    nextCursor: images.next_cursor,
    images: images.resources.map((image) => image.url),
  };
}
