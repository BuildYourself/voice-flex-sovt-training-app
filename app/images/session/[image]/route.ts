import { readFile } from "node:fs/promises";
import { join } from "node:path";

const imageMap: Record<string, string> = {
  "easy-bubbles-step-1.png": "3.png",
  "easy-bubbles-step-2.png": "4.png",
  "easy-bubbles-step-3.png": "6.png",
  "soft-mmm-step-3.png": "5.png"
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ image: string }> }
) {
  const { image } = await params;
  const sourceFile = imageMap[image];

  if (!sourceFile) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const downloadsDir = join(process.env.USERPROFILE ?? "C:\\Users\\Asus", "Downloads");
    const bytes = await readFile(join(downloadsDir, sourceFile));

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60"
      }
    });
  } catch (error) {
    console.warn("[session-images] failed to load image", { image, sourceFile, error });
    return new Response("Not found", { status: 404 });
  }
}
