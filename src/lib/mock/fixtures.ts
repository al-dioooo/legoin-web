/* Fixtures for the mock service: four demo scans and 18 idea templates, six per theme.
 * None of the photos are real scans. The desk and evening photos were generated
 * with Codex image generation; the pile and single-piece photos were drawn by a
 * script that placed each brick, so their boxes match the bricks exactly.
 * Idea copy lives here in both languages, because it stands in for the AI agent's
 * output rather than UI copy.
 */
import type { Locale } from "@/i18n/locales";
import type { PartCount } from "@/lib/bricks";
import type {
  Detection,
  Difficulty,
  IdeaTheme,
  Photo,
  Scan,
} from "@/lib/domain";
import {
  EVENING_PHOTO,
  SAMPLE_DETECTIONS,
  SAMPLE_PHOTO,
} from "@/lib/sample-scan";

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

/** Thirty pieces, as many as the detector's busiest training photos hold. */
const PILE_PHOTO: Photo = {
  src: "/contoh/kepingan-banyak.jpg",
  width: 1200,
  height: 800,
};

/** Three pieces to check: an orange round, and two misreads to correct. */
const PILE_DETECTIONS: Detection[] = [
  {
    id: "pile-1",
    part: "plate-1x2",
    color: "yellow",
    box: { x: 0.148, y: 0.085, width: 0.062, height: 0.058 },
    confidence: 0.72,
  },
  {
    id: "pile-2",
    part: "plate-2x2",
    color: "blue",
    box: { x: 0.316, y: 0.037, width: 0.077, height: 0.125 },
    confidence: 0.88,
  },
  {
    id: "pile-3",
    part: "brick-1x4",
    color: "light-gray",
    box: { x: 0.819, y: 0.097, width: 0.124, height: 0.121 },
    confidence: 0.91,
  },
  {
    id: "pile-4",
    part: "brick-1x2",
    color: "orange",
    box: { x: 0.083, y: 0.166, width: 0.068, height: 0.119 },
    confidence: 0.79,
  },
  {
    id: "pile-5",
    part: "plate-2x4",
    color: "green",
    box: { x: 0.211, y: 0.234, width: 0.062, height: 0.19 },
    confidence: 0.89,
  },
  {
    id: "pile-6",
    part: "brick-2x2",
    color: "green",
    box: { x: 0.323, y: 0.197, width: 0.062, height: 0.12 },
    confidence: 0.74,
  },
  {
    id: "pile-7",
    part: "plate-2x2",
    color: "blue",
    box: { x: 0.444, y: 0.327, width: 0.08, height: 0.13 },
    confidence: 0.78,
  },
  {
    id: "pile-8",
    part: "brick-2x3",
    color: "dark-gray",
    box: { x: 0.453, y: 0.168, width: 0.108, height: 0.172 },
    confidence: 0.82,
  },
  {
    id: "pile-9",
    part: "brick-1x3",
    color: "black",
    box: { x: 0.636, y: 0.177, width: 0.096, height: 0.114 },
    confidence: 0.82,
  },
  {
    id: "pile-10",
    part: "brick-2x2",
    color: "white",
    box: { x: 0.782, y: 0.317, width: 0.083, height: 0.151 },
    confidence: 0.89,
  },
  {
    id: "pile-11",
    part: "round-1x1",
    color: "yellow",
    box: { x: 0.887, y: 0.269, width: 0.031, height: 0.074 },
    confidence: 0.95,
  },
  {
    id: "pile-12",
    part: "brick-1x1",
    color: "red",
    box: { x: 0.053, y: 0.368, width: 0.044, height: 0.094 },
    confidence: 0.87,
  },
  {
    id: "pile-13",
    part: "brick-2x2",
    color: "yellow",
    box: { x: 0.096, y: 0.404, width: 0.084, height: 0.153 },
    confidence: 0.76,
  },
  {
    id: "pile-14",
    part: "brick-2x2",
    color: "yellow",
    box: { x: 0.399, y: 0.49, width: 0.084, height: 0.153 },
    confidence: 0.9,
  },
  {
    id: "pile-15",
    part: "brick-2x4",
    color: "blue",
    box: { x: 0.49, y: 0.522, width: 0.12, height: 0.12 },
    confidence: 0.79,
  },
  {
    id: "pile-16",
    part: "round-1x1",
    color: "orange",
    box: { x: 0.651, y: 0.509, width: 0.031, height: 0.074 },
    confidence: 0.55,
  },
  {
    id: "pile-17",
    part: "round-1x1",
    color: "yellow",
    box: { x: 0.781, y: 0.495, width: 0.031, height: 0.074 },
    confidence: 0.81,
  },
  {
    id: "pile-18",
    part: "brick-1x4",
    color: "light-gray",
    box: { x: 0.06, y: 0.573, width: 0.123, height: 0.124 },
    confidence: 0.73,
  },
  // A black tile, read as a plate.
  {
    id: "pile-19",
    part: "plate-1x2",
    color: "black",
    box: { x: 0.195, y: 0.587, width: 0.068, height: 0.089 },
    confidence: 0.52,
  },
  {
    id: "pile-20",
    part: "brick-2x4",
    color: "red",
    box: { x: 0.267, y: 0.502, width: 0.062, height: 0.207 },
    confidence: 0.8,
  },
  // A white brick, read as light gray.
  {
    id: "pile-21",
    part: "brick-1x2",
    color: "light-gray",
    box: { x: 0.507, y: 0.725, width: 0.033, height: 0.12 },
    confidence: 0.57,
  },
  {
    id: "pile-22",
    part: "slope-2x2",
    color: "red",
    box: { x: 0.652, y: 0.615, width: 0.062, height: 0.12 },
    confidence: 0.83,
  },
  {
    id: "pile-23",
    part: "brick-2x4",
    color: "red",
    box: { x: 0.752, y: 0.577, width: 0.124, height: 0.132 },
    confidence: 0.96,
  },
  {
    id: "pile-24",
    part: "brick-1x2",
    color: "white",
    box: { x: 0.789, y: 0.749, width: 0.062, height: 0.077 },
    confidence: 0.88,
  },
  {
    id: "pile-25",
    part: "brick-1x1",
    color: "red",
    box: { x: 0.893, y: 0.664, width: 0.044, height: 0.093 },
    confidence: 0.78,
  },
  {
    id: "pile-26",
    part: "tile-1x2",
    color: "white",
    box: { x: 0.1, y: 0.751, width: 0.033, height: 0.102 },
    confidence: 0.88,
  },
  {
    id: "pile-27",
    part: "brick-2x4",
    color: "red",
    box: { x: 0.216, y: 0.757, width: 0.122, height: 0.126 },
    confidence: 0.83,
  },
  {
    id: "pile-28",
    part: "plate-1x2",
    color: "yellow",
    box: { x: 0.42, y: 0.771, width: 0.066, height: 0.075 },
    confidence: 0.79,
  },
  {
    id: "pile-29",
    part: "slope-2x2",
    color: "red",
    box: { x: 0.59, y: 0.755, width: 0.062, height: 0.12 },
    confidence: 0.74,
  },
  {
    id: "pile-30",
    part: "brick-1x2",
    color: "brown",
    box: { x: 0.699, y: 0.863, width: 0.067, height: 0.096 },
    confidence: 0.85,
  },
];

/** One piece in a portrait phone photo. */
const SINGLE_PHOTO: Photo = {
  src: "/contoh/kepingan-satu.jpg",
  width: 900,
  height: 1200,
};

const SINGLE_DETECTIONS: Detection[] = [
  {
    id: "single-1",
    part: "brick-2x4",
    color: "blue",
    box: { x: 0.271, y: 0.361, width: 0.47, height: 0.286 },
    confidence: 0.96,
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
  {
    id: "demo-pile",
    createdAt: "2026-10-24T08:40:00.000Z",
    photo: PILE_PHOTO,
    detections: PILE_DETECTIONS,
  },
  {
    id: "demo-single",
    createdAt: "2026-10-23T13:05:00.000Z",
    photo: SINGLE_PHOTO,
    detections: SINGLE_DETECTIONS,
  },
];

/**
 * Detections the mock returns for a new photo. A demo photo gets its own. Any
 * other photo, such as one the person took, gets the desk scan's pieces with no
 * boxes: the mock can't see where anything is, so it marks nothing on the photo
 * rather than drawing boxes over empty table.
 */
export function detectionsForPhoto(src: string): Detection[] {
  const demo = DEMO_SCANS.find((scan) => scan.photo.src === src);
  if (demo) return demo.detections;
  return DESK_DETECTIONS.map((detection) => ({ ...detection, box: null }));
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

/**
 * The 18 idea templates, the same as legoin-api's `TEMPLATES`: each is a
 * checked build in its `builds/` library (ADR-0010), with the build's id, text
 * and parts. Change them there first, then copy them here.
 */
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
        "Put the red 2×4 brick on the black 2×4 plate, one stud back, so the plate's front row shows.",
        "Add the green 2×2 slope on the front of the red brick as the hood, and the black 2×2 brick behind it as the cab.",
        "Put the two yellow 1×1 rounds on the plate's front row as headlights.",
      ],
      id: [
        "Pasang brick 2×4 merah di atas plate 2×4 hitam, mundur satu stud, supaya baris depan plate kelihatan.",
        "Taruh slope 2×2 hijau di depan brick merah sebagai kap mesin, dan brick 2×2 hitam di belakangnya sebagai kabin.",
        "Pasang dua round 1×1 kuning di baris depan plate sebagai lampu depan.",
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
        "Lay the black 2×4 plate and the black 2×2 plate end to end as the chassis.",
        "Put the blue 2×2 brick on the front as the cab, then stack two white 2×4 bricks behind it, across both plates, as the cargo box.",
        "Turn it over and press four black 1×1 rounds under the front and the back as wheels.",
      ],
      id: [
        "Letakkan plate 2×4 hitam dan plate 2×2 hitam berjajar sebagai sasis.",
        "Pasang brick 2×2 biru di depan sebagai kabin, lalu tumpuk dua brick 2×4 putih di belakangnya, menyambung kedua plate, sebagai bak.",
        "Balik truknya, lalu pasang empat round 1×1 hitam di bawah bagian depan dan belakang sebagai roda.",
      ],
    },
    requires: [
      { part: "round-1x1", color: "black", quantity: 4 },
      { part: "brick-2x4", color: "white", quantity: 2 },
      { part: "brick-2x2", color: "blue", quantity: 1 },
      { part: "plate-2x2", color: "black", quantity: 1 },
      { part: "plate-2x4", color: "black", quantity: 1 },
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
    id: "go-kart",
    theme: "vehicles",
    difficulty: "easy",
    title: { en: "Go-kart", id: "Gokar" },
    summary: {
      en: "A low kart with a blue seat.",
      id: "Gokar rendah dengan kursi biru.",
    },
    steps: {
      en: [
        "Use the black 2×4 plate as the chassis.",
        "Put the blue 2×3 brick at the back as the seat.",
        "Add the orange 1×2 brick at the front and the yellow round as the steering wheel.",
      ],
      id: [
        "Pakai plate 2×4 hitam sebagai sasis.",
        "Pasang brick 2×3 biru di belakang sebagai kursi.",
        "Tambahkan brick 1×2 oranye di depan dan round kuning sebagai setir.",
      ],
    },
    requires: [
      { part: "plate-2x4", color: "black", quantity: 1 },
      { part: "brick-2x3", color: "blue", quantity: 1 },
      { part: "brick-1x2", color: "orange", quantity: 1 },
      { part: "round-1x1", color: "yellow", quantity: 1 },
    ],
  },
  {
    id: "tractor",
    theme: "vehicles",
    difficulty: "medium",
    title: { en: "Tractor", id: "Traktor" },
    summary: {
      en: "Green body, white cab, black wheels.",
      id: "Badan hijau, kabin putih, roda hitam.",
    },
    steps: {
      en: [
        "Lay the green 2×4 brick down as the body.",
        "Put the white 2×2 brick at the back as the cab.",
        "Press four black 1×1 bricks under its corners as wheels.",
      ],
      id: [
        "Letakkan brick 2×4 hijau sebagai badan.",
        "Pasang brick 2×2 putih di belakang sebagai kabin.",
        "Pasang empat brick 1×1 hitam di bawah keempat sudutnya sebagai roda.",
      ],
    },
    requires: [
      { part: "brick-2x4", color: "green", quantity: 1 },
      { part: "brick-2x2", color: "white", quantity: 1 },
      { part: "brick-1x1", color: "black", quantity: 4 },
    ],
  },
  {
    id: "rocket",
    theme: "vehicles",
    difficulty: "hard",
    title: { en: "Rocket", id: "Roket" },
    summary: {
      en: "A white tower with red fins and a nose cone.",
      id: "Menara putih dengan sirip merah dan hidung lancip.",
    },
    steps: {
      en: [
        "Stack three white 2×2 bricks as the body.",
        "Press the two red 1×2 bricks under the body at opposite corners, each sticking out one stud to the side, as fins.",
        "Top it with the red 2×2 slope as the nose.",
      ],
      id: [
        "Tumpuk tiga brick 2×2 putih sebagai badan.",
        "Pasang dua brick 1×2 merah di bawah badan, di sudut yang berseberangan, masing-masing menjorok satu stud ke samping, sebagai sirip.",
        "Tutup dengan slope 2×2 merah sebagai hidung roket.",
      ],
    },
    requires: [
      { part: "brick-2x2", color: "white", quantity: 3 },
      { part: "brick-1x2", color: "red", quantity: 2 },
      { part: "slope-2x2", color: "red", quantity: 1 },
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
        "Put the orange 2×2 plate on its front end, sticking out one stud, as the beak, and the yellow 1×2 plate right behind it.",
        "Put the yellow 2×2 brick on the back of the beak and the yellow plate as the head.",
      ],
      id: [
        "Pakai brick 2×4 kuning sebagai badan.",
        "Pasang plate 2×2 oranye di ujung depan, menjorok satu stud, sebagai paruh, lalu plate 1×2 kuning tepat di belakangnya.",
        "Pasang brick 2×2 kuning di atas bagian belakang paruh dan plate kuning sebagai kepala.",
      ],
    },
    requires: [
      { part: "brick-2x2", color: "yellow", quantity: 1 },
      { part: "brick-2x4", color: "yellow", quantity: 1 },
      { part: "plate-1x2", color: "yellow", quantity: 1 },
      { part: "plate-2x2", color: "orange", quantity: 1 },
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
        "Start with the orange 2×2 plate as the feet.",
        "Put the white 1×2 brick on its front row as the belly, and the black 1×2 brick behind it as the back.",
        "Put the black 2×2 brick on the black brick, sticking out one stud at the back, as the head, and the yellow 1×1 round on the belly in front of it as the beak.",
      ],
      id: [
        "Mulai dengan plate 2×2 oranye sebagai kaki.",
        "Pasang brick 1×2 putih di baris depannya sebagai perut, lalu brick 1×2 hitam di belakangnya sebagai punggung.",
        "Pasang brick 2×2 hitam di atas brick hitam, menjorok satu stud ke belakang, sebagai kepala, lalu round 1×1 kuning di atas perut, di depan kepala, sebagai paruh.",
      ],
    },
    requires: [
      { part: "brick-1x2", color: "black", quantity: 1 },
      { part: "brick-1x2", color: "white", quantity: 1 },
      { part: "brick-2x2", color: "black", quantity: 1 },
      { part: "plate-2x2", color: "orange", quantity: 1 },
      { part: "round-1x1", color: "yellow", quantity: 1 },
    ],
  },
  {
    id: "snail",
    theme: "animals",
    difficulty: "easy",
    title: { en: "Snail", id: "Siput" },
    summary: {
      en: "A dark gray shell on a brown body.",
      id: "Cangkang abu-abu gelap di atas badan cokelat.",
    },
    steps: {
      en: [
        "Lay the brown 1×3 brick down as the body.",
        "Put the dark gray 2×2 brick on the back half as the shell.",
        "Add the yellow round at the front as the eye.",
      ],
      id: [
        "Letakkan brick 1×3 cokelat sebagai badan.",
        "Pasang brick 2×2 abu-abu gelap di setengah belakang sebagai cangkang.",
        "Tambahkan round kuning di depan sebagai mata.",
      ],
    },
    requires: [
      { part: "brick-1x3", color: "brown", quantity: 1 },
      { part: "brick-2x2", color: "dark-gray", quantity: 1 },
      { part: "round-1x1", color: "yellow", quantity: 1 },
    ],
  },
  {
    id: "crab",
    theme: "animals",
    difficulty: "medium",
    title: { en: "Crab", id: "Kepiting" },
    summary: {
      en: "A red body with two claws and black eyes.",
      id: "Badan merah dengan dua capit dan mata hitam.",
    },
    steps: {
      en: [
        "Use the red 2×4 brick as the body.",
        "Put a red 1×2 brick on each front corner, sticking out one stud to the side, as claws.",
        "Add the two black 1×1 rounds between the claws as eyes.",
      ],
      id: [
        "Pakai brick 2×4 merah sebagai badan.",
        "Pasang brick 1×2 merah di tiap sudut depan, menjorok satu stud ke samping, sebagai capit.",
        "Tambahkan dua round 1×1 hitam di antara capit sebagai mata.",
      ],
    },
    requires: [
      { part: "brick-2x4", color: "red", quantity: 1 },
      { part: "brick-1x2", color: "red", quantity: 2 },
      { part: "round-1x1", color: "black", quantity: 2 },
    ],
  },
  {
    id: "puppy",
    theme: "animals",
    difficulty: "hard",
    title: { en: "Puppy", id: "Anak anjing" },
    summary: {
      en: "Brown body, black ears and a round nose.",
      id: "Badan cokelat, telinga hitam, dan hidung bulat.",
    },
    steps: {
      en: [
        "Stand the brown 2×4 brick on four brown 1×1 bricks as the body and legs.",
        "Add the brown 2×2 brick on the front, sticking out one stud, as the head.",
        "Put the black 1×1 round on the front of the head as the nose, and the two black 1×2 plates on its back row, sticking out to the sides, as ears.",
      ],
      id: [
        "Berdirikan brick 2×4 cokelat di atas empat brick 1×1 cokelat sebagai badan dan kaki.",
        "Pasang brick 2×2 cokelat di bagian depan, menjorok satu stud, sebagai kepala.",
        "Taruh round 1×1 hitam di depan kepala sebagai hidung, lalu dua plate 1×2 hitam di baris belakangnya, menjorok ke samping, sebagai telinga.",
      ],
    },
    requires: [
      { part: "brick-2x4", color: "brown", quantity: 1 },
      { part: "brick-1x1", color: "brown", quantity: 4 },
      { part: "brick-2x2", color: "brown", quantity: 1 },
      { part: "round-1x1", color: "black", quantity: 1 },
      { part: "plate-1x2", color: "black", quantity: 2 },
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
        "Lay the green 2×4 plate down as the lawn.",
        "Stack two white 2×4 bricks on it, one stud back, as the walls.",
        "Put two red 2×2 slopes on top, back to back, as the roof.",
        "Add the light gray 1×2 tile on the lawn's front row as the door step.",
      ],
      id: [
        "Letakkan plate 2×4 hijau sebagai halaman.",
        "Tumpuk dua brick 2×4 putih di atasnya, mundur satu stud, sebagai dinding.",
        "Pasang dua slope 2×2 merah di atasnya, saling membelakangi, sebagai atap.",
        "Tambahkan tile 1×2 abu-abu terang di baris depan halaman sebagai anak tangga.",
      ],
    },
    requires: [
      { part: "brick-2x4", color: "white", quantity: 2 },
      { part: "slope-2x2", color: "red", quantity: 2 },
      { part: "plate-2x4", color: "green", quantity: 1 },
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
        "Build two pillars, each of two brown 1×2 bricks stacked, two studs apart.",
        "Lay the black 2×4 plate across them as the deck.",
        "Cover the middle of the deck with the two light gray 1×2 tiles as the road.",
      ],
      id: [
        "Buat dua tiang, masing-masing dari dua brick 1×2 cokelat yang ditumpuk, berjarak dua stud.",
        "Letakkan plate 2×4 hitam melintang di atasnya sebagai lantai jembatan.",
        "Tutup bagian tengah lantai dengan dua tile 1×2 abu-abu terang sebagai jalan.",
      ],
    },
    requires: [
      { part: "brick-1x2", color: "brown", quantity: 4 },
      { part: "tile-1x2", color: "light-gray", quantity: 2 },
      { part: "plate-2x4", color: "black", quantity: 1 },
    ],
  },
  {
    id: "bus-stop",
    theme: "buildings",
    difficulty: "easy",
    title: { en: "Bus stop", id: "Halte bus" },
    summary: {
      en: "Two posts, a flat roof and a bench.",
      id: "Dua tiang, atap datar, dan bangku.",
    },
    steps: {
      en: [
        "Lay the dark gray 2×4 plate down as the pavement.",
        "Stack two white 1×1 bricks on each back corner as the posts.",
        "Put the brown 1×2 brick in front, between the posts, with the light gray 1×2 tile on top, as a bench.",
        "Lay the black 2×4 plate on the posts as the roof.",
      ],
      id: [
        "Letakkan plate 2×4 abu-abu gelap sebagai trotoar.",
        "Tumpuk dua brick 1×1 putih di tiap sudut belakang sebagai tiang.",
        "Pasang brick 1×2 cokelat di depan, di antara tiang, dengan tile 1×2 abu-abu terang di atasnya, sebagai bangku.",
        "Letakkan plate 2×4 hitam di atas tiang sebagai atap.",
      ],
    },
    requires: [
      { part: "brick-1x1", color: "white", quantity: 4 },
      { part: "brick-1x2", color: "brown", quantity: 1 },
      { part: "plate-2x4", color: "black", quantity: 1 },
      { part: "plate-2x4", color: "dark-gray", quantity: 1 },
      { part: "tile-1x2", color: "light-gray", quantity: 1 },
    ],
  },
  {
    id: "windmill",
    theme: "buildings",
    difficulty: "medium",
    title: { en: "Windmill", id: "Kincir angin" },
    summary: {
      en: "A white tower, a red roof and sails.",
      id: "Menara putih, atap merah, dan baling-baling.",
    },
    steps: {
      en: [
        "Stack three white 2×2 bricks as the tower.",
        "Put the two brown 1×2 plates along the front of the top, each sticking out one stud to its side, as sails, and the white 1×2 plate behind them.",
        "Top it with the red 2×2 slope as the roof.",
      ],
      id: [
        "Tumpuk tiga brick 2×2 putih sebagai menara.",
        "Pasang dua plate 1×2 cokelat berjajar di sisi depan atasnya, masing-masing menjorok satu stud ke samping, sebagai baling-baling, lalu plate 1×2 putih di belakangnya.",
        "Tutup dengan slope 2×2 merah sebagai atap.",
      ],
    },
    requires: [
      { part: "brick-2x2", color: "white", quantity: 3 },
      { part: "plate-1x2", color: "brown", quantity: 2 },
      { part: "plate-1x2", color: "white", quantity: 1 },
      { part: "slope-2x2", color: "red", quantity: 1 },
    ],
  },
  {
    id: "castle-tower",
    theme: "buildings",
    difficulty: "hard",
    title: { en: "Castle tower", id: "Menara kastel" },
    summary: {
      en: "Gray walls with battlements on top.",
      id: "Dinding abu-abu dengan benteng di atasnya.",
    },
    steps: {
      en: [
        "Start with the dark gray 2×4 plate as the base.",
        "Stack two light gray 2×4 bricks as the walls.",
        "Put four light gray 1×1 bricks on the corners as battlements.",
      ],
      id: [
        "Mulai dengan plate 2×4 abu-abu gelap sebagai dasar.",
        "Tumpuk dua brick 2×4 abu-abu terang sebagai dinding.",
        "Pasang empat brick 1×1 abu-abu terang di sudut sebagai benteng.",
      ],
    },
    requires: [
      { part: "plate-2x4", color: "dark-gray", quantity: 1 },
      { part: "brick-2x4", color: "light-gray", quantity: 2 },
      { part: "brick-1x1", color: "light-gray", quantity: 4 },
    ],
  },
];
