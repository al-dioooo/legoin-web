// @vitest-environment node
import { expect, test } from "vitest";
import { flowPosition } from "@/lib/flow";

test("capture is the first step", () => {
  expect(flowPosition("/en/scan")).toEqual({
    current: "photo",
    hrefs: { photo: "/en/scan", pieces: null, ideas: null },
  });
});

test("a scan's results unlock the pieces step", () => {
  expect(flowPosition("/id/scan/abc")).toEqual({
    current: "pieces",
    hrefs: { photo: "/id/scan", pieces: "/id/scan/abc", ideas: null },
  });
});

test("ideas and idea details are the ideas step", () => {
  for (const path of ["/en/scan/abc/ideas", "/en/scan/abc/ideas/race-car"]) {
    expect(flowPosition(path)).toEqual({
      current: "ideas",
      hrefs: {
        photo: "/en/scan",
        pieces: "/en/scan/abc",
        ideas: "/en/scan/abc/ideas",
      },
    });
  }
});

test("pages outside the flow have no current step", () => {
  expect(flowPosition("/en/history").current).toBeNull();
});
