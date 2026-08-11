import { supabase } from "../lib/supabase";
import { File } from "expo-file-system";

type VideoFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

type UploadResult = {
  success: boolean;
  postId?: string;
  hasParts?: boolean;
  error?: string;
};

export async function uploadVideo(
  file: VideoFile,
  caption: string,
  topic: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  console.log("[UPLOAD SERVICE] Upload started");

  const session =
    await supabase.auth.getSession();

  const token =
    session.data.session?.access_token;

  if (!token) {
    throw new Error(
      "User is not authenticated"
    );
  }

  const backendUrl =
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    throw new Error(
      "Backend URL is not configured"
    );
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error(
      "Video must not exceed 50MB"
    );
  }

  console.log(
    "[UPLOAD SERVICE] Requesting signed URL"
  );

  const uploadRes = await fetch(
    `${backendUrl}/api/upload/signed-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileType: "video",
        caption,
        originalFileName: file.name,
      }),
    }
  );

  let uploadData: any = null;

  try {
    uploadData = await uploadRes.json();
  } catch {
    uploadData = null;
  }

  if (!uploadRes.ok) {
    console.error(
      "[UPLOAD SERVICE] Signed URL request failed:",
      uploadRes.status,
      uploadData
    );

    throw new Error(
      uploadData?.error ||
        uploadData?.message ||
        "Failed to create upload URL"
    );
  }

  if (!uploadData?.uploadUrl) {
    throw new Error(
      "Invalid upload URL"
    );
  }

  console.log(
    "[UPLOAD SERVICE] Signed URL received"
  );

  console.log(
    "[UPLOAD SERVICE] Reading local video:",
    file.uri
  );

  const localFile = new File(file.uri);

  console.log(
    "[UPLOAD SERVICE] Local file exists:",
    localFile.exists
  );

  console.log(
    "[UPLOAD SERVICE] Local file metadata:",
    {
      uri: localFile.uri,
      name: localFile.name,
      size: localFile.size,
      type: localFile.type,
      expectedSize: file.size,
      expectedType: file.type,
    }
  );

  if (!localFile.exists) {
    console.error(
      "[UPLOAD SERVICE] Local video file does not exist:",
      file.uri
    );

    throw new Error(
      "Selected video file does not exist"
    );
  }

  if (!localFile.size) {
    console.error(
      "[UPLOAD SERVICE] Selected video contains no data"
    );

    throw new Error(
      "Selected video contains no data"
    );
  }

  console.log(
    "[UPLOAD SERVICE] Local video ready for upload:",
    {
      size: localFile.size,
      type: localFile.type || file.type || "video/mp4",
    }
  );

  const videoBuffer = await localFile.arrayBuffer();

  console.log(
    "[UPLOAD SERVICE] Video loaded into memory:",
    {
      byteLength: videoBuffer.byteLength,
      expectedSize: file.size,
    }
  );

  if (!videoBuffer.byteLength) {
    console.error(
      "[UPLOAD SERVICE] Video buffer is empty"
    );

    throw new Error(
      "Selected video contains no data"
    );
  }

  await new Promise<void>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(
        "PUT",
        uploadData.uploadUrl
      );

      xhr.setRequestHeader(
        "Content-Type",
        localFile.type ||
          file.type ||
          "video/mp4"
      );

      xhr.upload.onprogress = (
        event
      ) => {
        if (event.lengthComputable) {
          const progress = Math.min(
            Math.floor(
              (event.loaded /
                event.total) *
                10
            ),
            9
          );

          onProgress?.(progress);

          console.log(
            "[UPLOAD SERVICE] Storage progress:",
            {
              loaded: event.loaded,
              total: event.total,
              progress,
            }
          );
        }
      };

      xhr.onload = () => {
        console.log(
          "[UPLOAD SERVICE] Storage response:",
          xhr.status
        );

        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          console.log(
            "[UPLOAD SERVICE] Video bytes uploaded successfully:",
            videoBuffer.byteLength
          );

          resolve();
        } else {
          console.error(
            "[UPLOAD SERVICE] Storage upload failed:",
            xhr.status,
            xhr.responseText
          );

          reject(
            new Error(
              "Storage upload failed"
            )
          );
        }
      };

      xhr.onerror = () => {
        console.error(
          "[UPLOAD SERVICE] Storage network error"
        );

        reject(
          new Error(
            "Network error during upload"
          )
        );
      };

      console.log(
        "[UPLOAD SERVICE] Sending video buffer to R2:",
        {
          size: videoBuffer.byteLength,
          type:
            localFile.type ||
            file.type ||
            "video/mp4",
        }
      );

      xhr.send(videoBuffer);
    }
  );

  onProgress?.(10);

  console.log(
    "[UPLOAD SERVICE] Storage upload completed"
  );

  console.log(
    "[UPLOAD SERVICE] Starting video processing"
  );

  const processRes = await fetch(
    `${backendUrl}/api/videos/process`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileKey:
          uploadData.fileKey,
        caption,
        topic,
      }),
    }
  );

  let data: any = null;

  try {
    data = await processRes.json();
  } catch {
    data = null;
  }

  console.log(
    "[UPLOAD SERVICE] Processing response:",
    processRes.status,
    data
  );

  if (!processRes.ok) {
    const errorMessage =
      data?.error ||
      data?.message ||
      "Video processing failed";

    console.error(
      "[UPLOAD SERVICE] Processing failed:",
      errorMessage
    );

    throw new Error(
      errorMessage
    );
  }

  if (!data?.success) {
    const errorMessage =
      data?.error ||
      data?.message ||
      "Post creation failed";

    console.error(
      "[UPLOAD SERVICE] Post creation failed:",
      errorMessage
    );

    throw new Error(
      errorMessage
    );
  }

  if (!data?.postId) {
    throw new Error(
      "Post ID was not returned"
    );
  }

  console.log(
    "[UPLOAD SERVICE] Post created:",
    data.postId
  );

  return {
    success: true,
    postId: data.postId,
    hasParts: Boolean(data.hasParts),
  };
}