import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { PictureFlow } from "@/components/picture/picture-flow";
import { PictureList } from "@/components/picture/picture-list";
import { PictureResult } from "@/components/picture/picture-result";
import { en } from "@/i18n/dictionaries/en";
import { id as idDictionary } from "@/i18n/dictionaries/id";
import {
  createPictureBuild,
  getPictureBuild,
  listScans,
  register,
} from "@/lib/api";

const route = vi.hoisted(() => ({ id: "", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: route.id }),
  useRouter: () => ({ push: route.push, replace: vi.fn() }),
}));
// The real data layer, watched, so a test can make one call fail.
vi.mock("@/lib/api", async (importOriginal) => {
  const api = await importOriginal<typeof import("@/lib/api")>();
  return { ...api, getPictureBuild: vi.fn(api.getPictureBuild) };
});
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

const resultCopy = {
  result: en.picture.result,
  summary: en.ideaDetail.summary,
  steps: {
    markDone: en.ideaDetail.markDone,
    progress: en.ideaDetail.progress,
    allDone: en.ideaDetail.allDone,
  },
  common: {
    step: en.common.step,
    pieces: en.common.pieces,
    partsUsed: en.common.partsUsed,
    partsMissing: en.common.partsMissing,
  },
};

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

test("a build shows its preview, model, parts and steps, and checks a scan's pieces", async () => {
  const build = await createPictureBuild(PICTURE, "en");
  const [scan] = await listScans();
  route.id = build.id;
  render(<PictureResult copy={resultCopy} locale="en" />);

  expect(
    await screen.findByRole("heading", { level: 1, name: build.title }),
  ).toBeDefined();
  expect(
    screen.getByRole("img", {
      name: `The finished LEGO build: ${build.title}`,
    }),
  ).toBeDefined();
  expect(
    screen
      .getByRole("link", { name: "Download 3D model (.ldr)" })
      .getAttribute("href"),
  ).toBe(build.preview.model);
  expect(
    within(screen.getByRole("region", { name: "Parts" })).getAllByRole(
      "listitem",
    ).length,
  ).toBe(build.parts.length);
  expect(screen.getAllByRole("checkbox")).toHaveLength(build.steps.length);

  fireEvent.change(await screen.findByLabelText("Compare with a scan"), {
    target: { value: scan.id },
  });

  const missing = await screen.findByRole("heading", {
    name: "What you're missing",
  });
  expect(missing).toBeDefined();
  const checked = await getPictureBuild(build.id, { scanId: scan.id });
  const missingCount = (checked?.check?.missing ?? []).reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  const missingBox = screen.getByRole("region", {
    name: "What you're missing",
  });
  expect(
    within(missingBox).getAllByText(String(missingCount)).length,
  ).toBeGreaterThan(0);
});

test("a build Legoin wrote plain steps for says so", async () => {
  const build = await createPictureBuild(PICTURE, "en");
  vi.mocked(getPictureBuild).mockResolvedValueOnce({ ...build, plain: true });
  route.id = build.id;
  render(<PictureResult copy={resultCopy} locale="en" />);

  expect(await screen.findByText(en.picture.result.plain)).toBeDefined();
});

test("a build that's gone says so, and one that fails to load can be retried", async () => {
  route.id = "pic_gone";
  const { unmount } = render(<PictureResult copy={resultCopy} locale="en" />);
  expect(
    await screen.findByRole("heading", {
      name: en.picture.result.missing.title,
    }),
  ).toBeDefined();
  unmount();

  vi.mocked(getPictureBuild).mockRejectedValueOnce(new Error("offline"));
  render(<PictureResult copy={resultCopy} locale="en" />);
  expect(
    await screen.findByRole("heading", {
      name: en.picture.result.failed.title,
    }),
  ).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", {
      name: en.picture.result.missing.title,
    }),
  ).toBeDefined();
});

test("deleting a build asks first, then goes back to the picture page", async () => {
  const build = await createPictureBuild(PICTURE, "en");
  route.id = build.id;
  render(<PictureResult copy={resultCopy} locale="en" />);
  fireEvent.click(await screen.findByRole("button", { name: /^Delete/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Delete build/ }));

  await waitFor(() => expect(route.push).toHaveBeenCalledWith("/en/picture"));
  expect(await getPictureBuild(build.id)).toBeNull();
});

test("the list links each build to its page, newest first", async () => {
  const older = await createPictureBuild(PICTURE, "en");
  const newer = await createPictureBuild({ ...PICTURE, src: "data:x" }, "id");
  render(
    <PictureList
      copy={{ list: en.picture.list, previewAlt: en.picture.result.previewAlt }}
      locale="en"
    />,
  );

  const links = await screen.findAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    `/en/picture/${newer.id}`,
    `/en/picture/${older.id}`,
  ]);
});
