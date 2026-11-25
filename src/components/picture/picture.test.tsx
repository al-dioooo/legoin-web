import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { PictureFlow } from "@/components/picture/picture-flow";
import { en } from "@/i18n/dictionaries/en";
import { id as idDictionary } from "@/i18n/dictionaries/id";
import { createPictureBuild, register } from "@/lib/api";

const route = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: route.push, replace: vi.fn() }),
}));
// jsdom can't decode images; reading a valid file yields a fixed picture.
vi.mock("@/lib/photo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/photo")>()),
  readPhoto: async () => ({
    src: "data:image/jpeg;base64,AA==",
    width: 4,
    height: 3,
  }),
}));

const PICTURE = { src: "data:image/jpeg;base64,BB==", width: 9, height: 6 };

const flowCopy = (dict: typeof en) => ({
  privacy: dict.picture.privacy,
  quota: dict.picture.quota,
  capture: dict.picture.capture,
  errors: dict.picture.errors,
  progress: dict.picture.progress,
  failures: dict.picture.failures,
  generic: dict.scan.errors.generic,
});

function pick(file: File) {
  const input = document.querySelector<HTMLInputElement>(
    'input[type="file"]:not([capture])',
  );
  if (!input) throw new Error("file input missing");
  fireEvent.change(input, { target: { files: [file] } });
}

const jpeg = () =>
  new File(["\xff\xd8\xff"], "car.jpg", { type: "image/jpeg" });

/** The mock's demo options, read from the page's URL by the data layer. */
function demo(search: string) {
  window.history.replaceState(null, "", `/en/picture?${search}`);
}

beforeEach(async () => {
  localStorage.clear();
  route.push.mockReset();
  await register("test@example.com", "baseplate-2x4");
  demo("mockDelay=0");
});

test("says where the picture goes and what's left today before anything is chosen", async () => {
  render(<PictureFlow copy={flowCopy(en)} locale="en" />);

  expect(
    screen.getByRole("complementary", { name: "Before you upload" })
      .textContent,
  ).toContain("sent to Anthropic");
  expect(await screen.findByText("2 picture builds left today")).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: "Choose a picture" })
      .hasAttribute("disabled"),
  ).toBe(false);
});

test("a picture is designed through its stages and opens its build", async () => {
  demo("mockDelay=5");
  render(<PictureFlow copy={flowCopy(en)} locale="en" />);
  pick(jpeg());
  // The note stays on screen with the picture, until it's sent.
  expect(
    screen.getByRole("complementary", { name: "Before you upload" }),
  ).toBeDefined();
  fireEvent.click(
    await screen.findByRole("button", { name: "Design my build" }),
  );

  expect(
    await screen.findByRole("heading", { name: "Designing your build" }),
  ).toBeDefined();
  expect(screen.getByText("Designing the build")).toBeDefined();
  await waitFor(() => expect(route.push).toHaveBeenCalledTimes(1));
  expect(route.push.mock.calls[0][0]).toMatch(/^\/en\/picture\/pic_/);
  // Coming back to this page starts over, with one build used.
  expect(
    await screen.findByRole("button", { name: "Choose a picture" }),
  ).toBeDefined();
  expect(await screen.findByText("1 picture build left today")).toBeDefined();
});

test("a picture with nothing to build says so, and offers another picture", async () => {
  demo("mockDelay=0&mock=fail-picture_unusable");
  render(<PictureFlow copy={flowCopy(en)} locale="en" />);
  pick(jpeg());
  fireEvent.click(
    await screen.findByRole("button", { name: "Design my build" }),
  );

  const heading = await screen.findByRole("heading", {
    name: en.picture.failures.picture_unusable.title,
  });
  expect(document.activeElement).toBe(heading);
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Choose another picture" }),
  );
  expect(
    screen.getByRole("button", { name: "Choose a picture" }),
  ).toBeDefined();
});

test("a failure worth retrying offers to try the same picture again", async () => {
  demo("mockDelay=0&mock=fail-no_valid_build");
  render(<PictureFlow copy={flowCopy(en)} locale="en" />);
  pick(jpeg());
  fireEvent.click(
    await screen.findByRole("button", { name: "Design my build" }),
  );

  expect(
    await screen.findByRole("heading", {
      name: en.picture.failures.no_valid_build.title,
    }),
  ).toBeDefined();
  expect(screen.getByRole("button", { name: "Try again" })).toBeDefined();
});

test("with today's builds used, the upload is off and says why", async () => {
  await createPictureBuild(PICTURE, "en");
  await createPictureBuild(PICTURE, "en");

  render(<PictureFlow copy={flowCopy(en)} locale="en" />);

  expect(await screen.findByText(en.picture.quota.limit)).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: "Choose a picture" })
      .hasAttribute("disabled"),
  ).toBe(true);
});

test("a file that isn't an image shows an inline error, in Indonesian too", async () => {
  render(<PictureFlow copy={flowCopy(idDictionary)} locale="id" />);
  pick(new File(["%PDF"], "notes.pdf", { type: "application/pdf" }));

  expect((await screen.findByRole("alert")).textContent).toBe(
    idDictionary.picture.errors.type,
  );
});
