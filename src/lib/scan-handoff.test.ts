// @vitest-environment node
import { expect, test } from "vitest";
import type { Scan } from "@/lib/domain";
import {
  forgetHandedOffScan,
  handedOffPhoto,
  handedOffScan,
  handOffScan,
} from "@/lib/scan-handoff";

const scan: Scan = {
  id: "abc",
  createdAt: "2026-11-07T10:00:00.000Z",
  photo: { src: "/contoh/kepingan-2.jpg", width: 1200, height: 800 },
  detections: [],
};

test("the handed-off scan is found by its id only, until it is forgotten", () => {
  handOffScan(scan);
  expect(handedOffScan("abc")).toBe(scan);
  expect(handedOffScan("other")).toBeNull();
  forgetHandedOffScan("other");
  expect(handedOffScan("abc")).toBe(scan);
  forgetHandedOffScan("abc");
  expect(handedOffScan("abc")).toBeNull();
});

test("the handoff carries the local copy of the photo, or the scan's own", () => {
  const remote: Scan = {
    ...scan,
    photo: { ...scan.photo, src: "https://photos.legoin.example/abc.jpg" },
  };
  const local = { ...scan.photo, src: "data:image/jpeg;base64,AA==" };
  handOffScan(remote, local);
  expect(handedOffScan("abc")).toBe(remote);
  expect(handedOffPhoto("abc")).toBe(local);
  expect(handedOffPhoto("other")).toBeNull();
  handOffScan(scan);
  expect(handedOffPhoto("abc")).toBe(scan.photo);
  forgetHandedOffScan("abc");
  expect(handedOffPhoto("abc")).toBeNull();
});
