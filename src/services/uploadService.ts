import apiClient from '../apiClient';

export interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    url: string;
    secure_url?: string;
    public_id?: string;
    format?: string;
    [key: string]: any;
  };
}

/**
 * Uploads an image or video file directly to the backend Cloudinary upload endpoint.
 * POST /api/v1/admin/upload
 * Accepts multipart/form-data with field name 'file' or 'image'
 */
export async function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('You must be logged in as an administrator to upload files.');
  }

  // Basic size guard (e.g. 25MB max)
  const maxSizeBytes = 25 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 25MB.`);
  }

  const formData = new FormData();
  // Provide both 'file' and 'image' keys so whichever field the backend multer middleware expects works
  formData.append('file', file);
  formData.append('image', file);

  try {
    const response = await apiClient.post<UploadResponse>('/v1/admin/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    const url = response.data?.data?.url || response.data?.data?.secure_url;
    if (!url) {
      throw new Error('Upload succeeded, but no URL was returned by the server.');
    }
    return url;
  } catch (error: any) {
    // If Axios fails or returns a specific error message
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
      throw new Error(serverMessage);
    }
    throw new Error(error?.message || 'Failed to upload file to the server. Please try again.');
  }
}
