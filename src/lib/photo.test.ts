// @vitest-environment node
import { expect, test } from "vitest";
import { MAX_PHOTO_BYTES, validatePhoto } from "@/lib/photo";

test("accepts any image up to 10 MB", () => {
  expect(validatePhoto({ type: "image/jpeg", size: 2_000_000 })).toBeNull();
  expect(
    validatePhoto({ type: "image/heic", size: MAX_PHOTO_BYTES }),
  ).toBeNull();
});

test("rejects files that aren't images", () => {
  expect(validatePhoto({ type: "application/pdf", size: 1000 })).toBe("type");
  expect(validatePhoto({ type: "", size: 1000 })).toBe("type");
});

test("rejects photos over 10 MB", () => {
  expect(validatePhoto({ type: "image/png", size: MAX_PHOTO_BYTES + 1 })).toBe(
    "size",
  );
});
