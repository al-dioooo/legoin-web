// @vitest-environment node
import { expect, test } from "vitest";
import type { Scan } from "@/lib/domain";
import {
  forgetHandedOffScan,
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
