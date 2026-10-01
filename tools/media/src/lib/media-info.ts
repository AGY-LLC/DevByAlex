import { spawnSync } from "node:child_process";
import { extname } from "node:path";

const MIME: Record<string, string> = {
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".m4v": "video/x-m4v",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac", ".ogg": "audio/ogg",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".json": "application/json", ".zip": "application/zip", ".pdf": "application/pdf", ".md": "text/markdown", ".txt": "text/plain",
  ".ttf": "font/ttf", ".otf": "font/otf", ".woff2": "font/woff2",
};

export const mimeFor = (path: string) => MIME[extname(path).toLowerCase()] ?? "application/octet-stream";

export interface MediaInfo {
  width?: number;
  height?: number;
  durationSeconds?: number;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
}

/** Dimensions for images and video, duration for video and audio, via
 *  ffprobe. Undefined when ffprobe is unavailable or the file is not media. */
export function probe(path: string): MediaInfo | undefined {
  const mime = mimeFor(path);
  if (!/^(image|video|audio)\//.test(mime) || mime === "image/svg+xml") return undefined;
  const r = spawnSync("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", path], { encoding: "utf8" });
  if (r.status !== 0 || !r.stdout) return undefined;
  const j = JSON.parse(r.stdout) as { streams?: Record<string, string & number>[]; format?: { duration?: string } };
  const v = j.streams?.find((s) => s.codec_type === "video");
  const a = j.streams?.find((s) => s.codec_type === "audio");
  const info: MediaInfo = {};
  if (v) {
    info.width = Number(v.width);
    info.height = Number(v.height);
    if (!mime.startsWith("image/")) {
      const [n, d] = String(v.avg_frame_rate ?? "0/1").split("/").map(Number);
      if (d) info.fps = Math.round((n / d) * 1000) / 1000;
      info.videoCodec = String(v.codec_name);
    }
  }
  if (a) info.audioCodec = String(a.codec_name);
  const duration = Number(j.format?.duration);
  if (!mime.startsWith("image/") && Number.isFinite(duration)) info.durationSeconds = duration;
  return info;
}

export function ffprobeAvailable(): boolean {
  return spawnSync("ffprobe", ["-version"], { encoding: "utf8" }).status === 0;
}
