/* Fixtures for the mock service: two demo scans and nine idea templates.
 * Both photos were generated with Codex image generation, not taken from real scans.
 * Idea copy lives here in both languages, because it stands in for the AI agent's
 * output rather than UI copy.
 */
import type { Locale } from "@/i18n/locales";
import type { PartCount } from "@/lib/bricks";
import type { Detection, Difficulty, IdeaTheme, Scan } from "@/lib/domain";
import { SAMPLE_DETECTIONS, SAMPLE_PHOTO } from "@/lib/sample-scan";

export const EVENING_PHOTO = {
  src: "/contoh/kepingan-2.jpg",
  width: 1200,
  height: 800,
};

const DESK_DETECTIONS: Detection[] = SAMPLE_DETECTIONS.map(
  (detection, index) => ({ ...detection, id: `desk-${index + 1}` }),
);

/** Eight pieces; the dark gray plate is misread as a brick, the PRD's known risk. */
const EVENING_DETECTIONS: Detection[] = [
  {
    id: "evening-1",
    part: "plate-2x4",
    color: "black",
    box: { x: 0.068, y: 0.222, width: 0.238, height: 0.188 },
    confidence: 0.92,
  },
  {
    id: "evening-2",
    part: "round-1x1",
    color: "yellow",
    box: { x: 0.381, y: 0.246, width: 0.074, height: 0.145 },
    confidence: 0.88,
  },
  {
    id: "evening-3",
    part: "tile-1x2",
    color: "light-gray",
    box: { x: 0.547, y: 0.271, width: 0.142, height: 0.12 },
    confidence: 0.71,
  },
  {
    id: "evening-4",
    part: "brick-1x2",
    color: "orange",
    box: { x: 0.765, y: 0.265, width: 0.145, height: 0.135 },
    confidence: 0.9,
  },
  {
    id: "evening-5",
    part: "brick-1x3",
    color: "brown",
    box: { x: 0.064, y: 0.594, width: 0.212, height: 0.134 },
    confidence: 0.86,
  },
  {
    id: "evening-6",
    part: "brick-2x2",
    color: "dark-gray",
    box: { x: 0.355, y: 0.564, width: 0.131, height: 0.198 },
    confidence: 0.58,
  },
  {
    id: "evening-7",
    part: "brick-1x1",
    color: "white",
    box: { x: 0.573, y: 0.592, width: 0.077, height: 0.135 },
    confidence: 0.84,
  },
  {
    id: "evening-8",
    part: "brick-2x3",
    color: "blue",
    box: { x: 0.746, y: 0.549, width: 0.201, height: 0.213 },
    confidence: 0.93,
  },
];

/** Scans every new visitor starts with, so history and results have something to show. */
export const DEMO_SCANS: Scan[] = [
  {
    id: "demo-evening",
    createdAt: "2026-10-26T11:20:00.000Z",
    photo: EVENING_PHOTO,
    detections: EVENING_DETECTIONS,
  },
  {
    id: "demo-desk",
    createdAt: "2026-10-25T02:15:00.000Z",
    photo: SAMPLE_PHOTO,
    detections: DESK_DETECTIONS,
  },
];

/** Detections the mock returns for a new photo: the matching demo, else the desk scan. */
export function detectionsForPhoto(src: string): Detection[] {
  return src === EVENING_PHOTO.src ? EVENING_DETECTIONS : DESK_DETECTIONS;
}

type Localized<T> = Record<Locale, T>;

export type IdeaTemplate = {
  id: string;
  theme: IdeaTheme;
  difficulty: Difficulty;
  title: Localized<string>;
  summary: Localized<string>;
  steps: Localized<string[]>;
  /** Everything the build needs; checked against the inventory at request time. */
  requires: PartCount[];
};

export const IDEA_TEMPLATES: IdeaTemplate[] = [
  {
    id: "race-car",
    theme: "vehicles",
    difficulty: "easy",
    title: { en: "Little race car", id: "Mobil balap kecil" },
    summary: {
      en: "Red body, green hood, yellow lights.",
      id: "Badan merah, kap hijau, lampu kuning.",
    },
    steps: {
      en: [
        "Put the red 2×4 brick on a black 2×4 plate as the body.",
        "Add the green 2×2 slope at the front as the hood.",
        "Add the black 2×2 brick at the back and two yellow 1×1 rounds as lights.",
      ],
      id: [
        "Pasang brick 2×4 merah di atas plate 2×4 hitam sebagai badan.",
        "Taruh slope 2×2 hijau di depan sebagai kap mesin.",
        "Tambahkan brick 2×2 hitam di belakang dan dua round 1×1 kuning sebagai lampu.",
      ],
    },
    requires: [
      { part: "plate-2x4", color: "black", quantity: 1 },
      { part: "brick-2x4", color: "red", quantity: 1 },
      { part: "slope-2x2", color: "green", quantity: 1 },
      { part: "brick-2x2", color: "black", quantity: 1 },
      { part: "round-1x1", color: "yellow", quantity: 2 },
    ],
  },
  {
    id: "delivery-truck",
    theme: "vehicles",
    difficulty: "medium",
    title: { en: "Delivery truck", id: "Truk pengantar" },
    summary: {
      en: "Blue cab, white cargo box, round wheels.",
      id: "Kabin biru, bak putih, roda bulat.",
    },
    steps: {
      en: [
        "Lay the black 2×4 plate as the chassis.",
        "Stack two white 2×4 bricks at the back as the cargo box.",
        "Put the blue 2×3 brick at the front as the cab and four black rounds underneath as wheels.",
      ],
      id: [
        "Letakkan plate 2×4 hitam sebagai sasis.",
        "Tumpuk dua brick 2×4 putih di belakang sebagai bak.",
        "Pasang brick 2×3 biru di depan sebagai kabin dan empat round hitam di bawah sebagai roda.",
      ],
    },
    requires: [
      { part: "plate-2x4", color: "black", quantity: 1 },
      { part: "brick-2x4", color: "white", quantity: 2 },
      { part: "brick-2x3", color: "blue", quantity: 1 },
      { part: "round-1x1", color: "black", quantity: 4 },
    ],
  },
  {
    id: "little-boat",
    theme: "vehicles",
    difficulty: "easy",
    title: { en: "Little boat", id: "Perahu kecil" },
    summary: {
      en: "Brown hull, white cabin, a funnel on top.",
      id: "Lambung cokelat, kabin putih, cerobong di atas.",
    },
    steps: {
      en: [
        "Use the brown 1×3 brick as the hull.",
        "Put the white 1×1 brick on top as the cabin.",
        "Finish with a yellow round on the cabin as the funnel.",
      ],
      id: [
        "Pakai brick 1×3 cokelat sebagai lambung.",
        "Pasang brick 1×1 putih di atasnya sebagai kabin.",
        "Tutup dengan round kuning di atas kabin sebagai cerobong.",
      ],
    },
    requires: [
      { part: "brick-1x3", color: "brown", quantity: 1 },
      { part: "brick-1x1", color: "white", quantity: 1 },
      { part: "round-1x1", color: "yellow", quantity: 1 },
    ],
  },
  {
    id: "rubber-duck",
    theme: "animals",
    difficulty: "easy",
    title: { en: "Rubber duck", id: "Bebek karet" },
    summary: {
      en: "Yellow body and head, orange beak.",
      id: "Badan dan kepala kuning, paruh oranye.",
    },
    steps: {
      en: [
        "Use the yellow 2×4 brick as the body.",
        "Stack the yellow 2×2 brick at one end as the head.",
        "Add the orange 1×2 brick at the front of the head as the beak.",
      ],
      id: [
        "Pakai brick 2×4 kuning sebagai badan.",
        "Tumpuk brick 2×2 kuning di salah satu ujung sebagai kepala.",
        "Pasang brick 1×2 oranye di depan kepala sebagai paruh.",
      ],
    },
    requires: [
      { part: "brick-2x4", color: "yellow", quantity: 1 },
      { part: "brick-2x2", color: "yellow", quantity: 1 },
      { part: "brick-1x2", color: "orange", quantity: 1 },
    ],
  },
  {
    id: "turtle",
    theme: "animals",
    difficulty: "easy",
    title: { en: "Turtle", id: "Kura-kura" },
    summary: {
      en: "A green slope shell on a flat base.",
      id: "Tempurung slope hijau di atas alas datar.",
    },
    steps: {
      en: [
        "Lay a green 2×4 plate as the base.",
        "Put the green 2×2 slope in the middle as the shell.",
        "Add a green 1×1 brick at the front as the head.",
      ],
      id: [
        "Letakkan plate 2×4 hijau sebagai alas.",
        "Pasang slope 2×2 hijau di tengah sebagai tempurung.",
        "Tambahkan brick 1×1 hijau di depan sebagai kepala.",
      ],
    },
    requires: [
      { part: "plate-2x4", color: "green", quantity: 1 },
      { part: "slope-2x2", color: "green", quantity: 1 },
      { part: "brick-1x1", color: "green", quantity: 1 },
    ],
  },
  {
    id: "penguin",
    theme: "animals",
    difficulty: "medium",
    title: { en: "Penguin", id: "Penguin" },
    summary: {
      en: "Black body, white belly, orange feet.",
      id: "Badan hitam, perut putih, kaki oranye.",
    },
    steps: {
      en: [
        "Start with an orange 2×2 plate as the feet.",
        "Stack two black 2×2 bricks on top as the body.",
        "Add the white 1×1 brick on the front as the belly and the yellow round as the beak.",
      ],
      id: [
        "Mulai dengan plate 2×2 oranye sebagai kaki.",
        "Tumpuk dua brick 2×2 hitam di atasnya sebagai badan.",
        "Pasang brick 1×1 putih di depan sebagai perut dan round kuning sebagai paruh.",
      ],
    },
    requires: [
      { part: "plate-2x2", color: "orange", quantity: 1 },
      { part: "brick-2x2", color: "black", quantity: 2 },
      { part: "brick-1x1", color: "white", quantity: 1 },
      { part: "round-1x1", color: "yellow", quantity: 1 },
    ],
  },
  {
    id: "little-house",
    theme: "buildings",
    difficulty: "easy",
    title: { en: "Little house", id: "Rumah kecil" },
    summary: {
      en: "White walls, a red roof and a door step.",
      id: "Dinding putih, atap merah, dan anak tangga pintu.",
    },
    steps: {
      en: [
        "Stack two white 2×4 bricks as the walls.",
        "Put two red 2×2 slopes on top as the roof.",
        "Add a light gray 1×2 tile in front as the door step.",
      ],
      id: [
        "Tumpuk dua brick 2×4 putih sebagai dinding.",
        "Pasang dua slope 2×2 merah di atasnya sebagai atap.",
        "Tambahkan tile 1×2 abu-abu terang di depan sebagai anak tangga.",
      ],
    },
    requires: [
      { part: "brick-2x4", color: "white", quantity: 2 },
      { part: "slope-2x2", color: "red", quantity: 2 },
      { part: "tile-1x2", color: "light-gray", quantity: 1 },
    ],
  },
  {
    id: "lighthouse",
    theme: "buildings",
    difficulty: "medium",
    title: { en: "Lighthouse", id: "Mercusuar" },
    summary: {
      en: "A striped tower with a yellow light.",
      id: "Menara bergaris dengan lampu kuning.",
    },
    steps: {
      en: [
        "Start with a dark gray 2×2 plate as the base.",
        "Stack 2×2 bricks red, white, red, white.",
        "Finish with a yellow round on top as the light.",
      ],
      id: [
        "Mulai dengan plate 2×2 abu-abu gelap sebagai dasar.",
        "Tumpuk brick 2×2 merah, putih, merah, putih.",
        "Tutup dengan round kuning di atas sebagai lampu.",
      ],
    },
    requires: [
      { part: "plate-2x2", color: "dark-gray", quantity: 1 },
      { part: "brick-2x2", color: "red", quantity: 2 },
      { part: "brick-2x2", color: "white", quantity: 2 },
      { part: "round-1x1", color: "yellow", quantity: 1 },
    ],
  },
  {
    id: "small-bridge",
    theme: "buildings",
    difficulty: "hard",
    title: { en: "Small bridge", id: "Jembatan kecil" },
    summary: {
      en: "Brown pillars, a plate deck and a smooth road.",
      id: "Tiang cokelat, lantai plate, dan jalan yang mulus.",
    },
    steps: {
      en: [
        "Build two pillars from brown 1×3 bricks, a gap apart.",
        "Lay the black 2×4 plate across them as the deck.",
        "Add light gray 1×2 tiles on top for a smooth road.",
      ],
      id: [
        "Buat dua tiang dari brick 1×3 cokelat, beri jarak di antaranya.",
        "Letakkan plate 2×4 hitam melintang di atasnya sebagai lantai.",
        "Tambahkan tile 1×2 abu-abu terang di atas sebagai jalan yang mulus.",
      ],
    },
    requires: [
      { part: "brick-1x3", color: "brown", quantity: 2 },
      { part: "plate-2x4", color: "black", quantity: 1 },
      { part: "tile-1x2", color: "light-gray", quantity: 2 },
    ],
  },
];
