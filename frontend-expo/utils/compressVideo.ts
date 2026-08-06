import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

let ffmpeg = null;

export const compressVideo = async (file, onProgress) => {
  console.log("Compression starting...");

  if (!ffmpeg) {
    console.log("Creating ffmpeg instance...");
    ffmpeg = createFFmpeg({
      log: true,
      corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
    });
  }

  if (!ffmpeg.isLoaded()) {
    console.log("Loading ffmpeg core...");
    await ffmpeg.load();
  }

  const inputName = "input.mp4";
  const outputName = "output.mp4";

  console.log("Writing file to ffmpeg FS");

  ffmpeg.FS("writeFile", inputName, await fetchFile(file));

  ffmpeg.setProgress(({ ratio }) => {
    const percent = Math.round(ratio * 100);
    console.log("Compression progress:", percent + "%");
    if (onProgress) onProgress(percent);
  });

  console.log("Running compression");

  await ffmpeg.run(
    "-i",
    inputName,
    "-vcodec",
    "libx264",
    "-b:v",
    "900k",
    "-preset",
    "fast",
    "-movflags",
    "faststart",
    outputName
  );

  console.log("Reading compressed file");

  const data = ffmpeg.FS("readFile", outputName);

  const compressedBlob = new Blob([data.buffer], { type: "video/mp4" });

  console.log("Compression finished");

  return new File([compressedBlob], "compressed.mp4", {
    type: "video/mp4"
  });
};