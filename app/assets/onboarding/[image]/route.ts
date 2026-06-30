import { readFile } from "node:fs/promises";
import { join } from "node:path";

const imageMap: Record<string, string> = {
  "voice-flex-go-resistance.png": "356982ed-02db-46fc-9558-3c368b7e167f.png",
  "straw-silicone-blue.png": "c6b53b6a-17c4-41b8-938a-cba64c209aaf.png",
  "straw-bamboo.png": "36aefaf1-987a-403b-b85f-b800c40cc3de.png",
  "straw-metal-6mm.png": "fd68ae79-cfd0-4c7f-9d7a-ef58bb1b2a0f.png",
  "straw-metal-3mm.png": "7b958548-85ed-4b12-8825-f22edae10b2f.png"
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
    console.warn("[onboarding-assets] failed to load image", { image, sourceFile, error });
    return new Response("Not found", { status: 404 });
  }
}
