import { v2 as cloudinary, type UploadApiOptions, type ResourceApiResponse } from 'cloudinary';

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

function svgStringToUint8Array(svgString: string) {
  // Convert the SVG string to a Buffer
  const buffer = Buffer.from(svgString, 'utf-8');
  // Create a Uint8Array from the Buffer
  const uint8Array = new Uint8Array(buffer);
  return uint8Array;
}

export async function getImages(asset_folder: string, nextCursor?: string) {
  return cloudinary.api.resources_by_asset_folder(asset_folder, {
    max_results: 20,
    next_cursor: nextCursor,
    transformation: [{ quality: 'q_auto' }],
  });
}
