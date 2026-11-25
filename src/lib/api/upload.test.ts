// @vitest-environment node
import { expect, test, vi } from "vitest";
import { ApiError } from "@/lib/api/error";
import { photoBlob, photoFileName } from "@/lib/api/upload";

/** The first bytes of a JPEG file. */
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10];
const JPEG_DATA_URL = "data:image/jpeg;base64,/9j/4AAQ";

const bytes = async (blob: Blob) => [
  ...new Uint8Array(await blob.arrayBuffer()),
];
const unused = vi.fn<typeof fetch>();

test("the person's photo, a data URL, is decoded without a request", async () => {
  const blob = await photoBlob(
    { src: JPEG_DATA_URL, width: 4, height: 3 },
    { fetch: unused },
  );
  expect(blob.type).toBe("image/jpeg");
  expect(await bytes(blob)).toEqual(JPEG);
  expect(photoFileName(blob)).toBe("photo.jpg");
  expect(unused).not.toHaveBeenCalled();
});

test("the sample photo is fetched from the site", async () => {
  const send = vi.fn<typeof fetch>(
    async () =>
      new Response(new Uint8Array(JPEG), {
        headers: { "Content-Type": "image/jpeg" },
      }),
  );
  const blob = await photoBlob(
    { src: "/contoh/kepingan-2.jpg", width: 1200, height: 800 },
    { fetch: send },
  );
  expect(send).toHaveBeenCalledWith("/contoh/kepingan-2.jpg", {
    signal: undefined,
  });
  expect(await bytes(blob)).toEqual(JPEG);
});

test("a photo that can't be fetched is a network failure", async () => {
  const photo = { src: "/contoh/kepingan-2.jpg", width: 1200, height: 800 };
  const offline = vi.fn<typeof fetch>(async () => {
    throw new TypeError("Failed to fetch");
  });
  await expect(photoBlob(photo, { fetch: offline })).rejects.toEqual(
    new ApiError("network"),
  );
  const missing = vi.fn<typeof fetch>(
    async () => new Response(null, { status: 404 }),
  );
  await expect(photoBlob(photo, { fetch: missing })).rejects.toEqual(
    new ApiError("network"),
  );
});

test("PNG and WebP keep their extension", () => {
  expect(photoFileName(new Blob([], { type: "image/png" }))).toBe("photo.png");
  expect(photoFileName(new Blob([], { type: "image/webp" }))).toBe(
    "photo.webp",
  );
});
