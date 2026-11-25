/* The examples in the API contract, api/contract.md in al-dioooo/legoin-docs
 * (https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md), as
 * written there, for the HTTP client's contract tests. Where the contract
 * shortens an example (the ones marked `jsonc`), its comment says what was
 * left out, and that is filled in from the examples it points to.
 *
 * Section names follow the contract. Update these with the contract.
 */

export const BASE_URL = "https://api.legoin.example/v1";

/** The `Legoin-Device-Id` every example sends. */
export const DEVICE_ID = "3b0e6f1c-5d2a-4f7e-9c41-8a2d7e5b9f10";

// 4. Scans: POST /scan-jobs and GET /scan-jobs/{jobId}

export const JOB_ACCEPTED = {
  id: "job_8c1f2e",
  status: "running",
  stage: "detecting",
};

export const JOB_RUNNING = {
  id: "job_8c1f2e",
  status: "running",
  stage: "classifying",
};

export const JOB_DONE = {
  id: "job_8c1f2e",
  status: "done",
  scan: {
    id: "scn_4kd2p9",
    createdAt: "2026-11-09T03:12:45.120Z",
    photo: {
      src: "https://photos.legoin.example/scn_4kd2p9.jpg",
      width: 1200,
      height: 800,
    },
    detections: [
      {
        id: "det_a1",
        part: "brick-2x4",
        color: "red",
        box: { x: 0.075, y: 0.165, width: 0.278, height: 0.245 },
        confidence: 0.94,
      },
      {
        id: "det_a2",
        part: "slope-2x2",
        color: "green",
        box: { x: 0.405, y: 0.54, width: 0.18, height: 0.235 },
        confidence: 0.82,
      },
      {
        id: "det_a3",
        part: "brick-2x2",
        color: "dark-gray",
        box: { x: 0.727, y: 0.54, width: 0.172, height: 0.262 },
        confidence: 0.58,
      },
    ],
  },
} as const;

export const JOB_FAILED = {
  id: "job_8c1f2e",
  status: "failed",
  error: { code: "too_dark", message: "The photo is too dark to find pieces." },
};

// 4. Scans: GET /scans/{scanId}

export const SCAN_NOT_FOUND = {
  error: { code: "not_found", message: "No scan scn_4kd2p9." },
};

// 4. Scans: GET /scans ("the three detections above" filled in)

export const SCAN_LIST = {
  scans: [
    JOB_DONE.scan,
    {
      id: "scn_9tq1m3",
      createdAt: "2026-11-08T11:20:00.000Z",
      photo: {
        src: "https://photos.legoin.example/scn_9tq1m3.jpg",
        width: 900,
        height: 1200,
      },
      detections: [
        {
          id: "det_k7",
          part: "brick-2x4",
          color: "blue",
          box: { x: 0.271, y: 0.361, width: 0.47, height: 0.286 },
          confidence: 0.96,
        },
      ],
    },
  ],
};

// 4. Scans: PATCH /scans/{scanId}/detections

export const CORRECTION = {
  changes: [
    { type: "edit", id: "det_a3", color: "black" },
    { type: "add", part: "plate-1x2", color: "blue", quantity: 1 },
  ],
} as const;

export const CORRECTED_SCAN = {
  id: "scn_4kd2p9",
  createdAt: "2026-11-09T03:12:45.120Z",
  photo: {
    src: "https://photos.legoin.example/scn_4kd2p9.jpg",
    width: 1200,
    height: 800,
  },
  detections: [
    {
      id: "det_a1",
      part: "brick-2x4",
      color: "red",
      box: { x: 0.075, y: 0.165, width: 0.278, height: 0.245 },
      confidence: 0.94,
    },
    {
      id: "det_a2",
      part: "slope-2x2",
      color: "green",
      box: { x: 0.405, y: 0.54, width: 0.18, height: 0.235 },
      confidence: 0.82,
    },
    {
      id: "det_a3",
      part: "brick-2x2",
      color: "black",
      box: { x: 0.727, y: 0.54, width: 0.172, height: 0.262 },
      confidence: 0.58,
      edited: true,
    },
    {
      id: "det_b7",
      part: "plate-1x2",
      color: "blue",
      box: null,
      confidence: null,
      edited: true,
    },
  ],
  lastTheme: "vehicles",
};

// 5. Ideas: POST /scans/{scanId}/ideas

export const IDEAS_REQUEST = {
  theme: "vehicles",
  locale: "id",
  exclude: ["idea_m2x9", "idea_p0d4", "idea_t6w1"],
} as const;

export const IDEA_SET = {
  theme: "vehicles",
  locale: "id",
  items: [
    {
      id: "idea_r4c8",
      theme: "vehicles",
      difficulty: "easy",
      title: "Mobil balap kecil",
      summary: "Badan merah, kap hijau, lampu kuning.",
      steps: [
        "Pasang brick 2×4 merah di atas plate 2×4 hitam sebagai badan.",
        "Taruh slope 2×2 hijau di depan sebagai kap mesin.",
        "Tambahkan brick 2×2 hitam di belakang dan dua round 1×1 kuning sebagai lampu.",
      ],
      used: [
        { part: "brick-2x2", color: "black", quantity: 1 },
        { part: "brick-2x4", color: "red", quantity: 1 },
        { part: "slope-2x2", color: "green", quantity: 1 },
      ],
      missing: [
        { part: "round-1x1", color: "yellow", quantity: 2 },
        { part: "plate-2x4", color: "black", quantity: 1 },
      ],
    },
    {
      id: "idea_l8k3",
      theme: "vehicles",
      difficulty: "medium",
      title: "Lokomotif",
      summary: "Lokomotif merah dengan cerobong hitam.",
      steps: [
        "Letakkan brick 2×4 merah sebagai badan lokomotif.",
        "Pasang brick 2×2 hitam di depan sebagai cerobong.",
        "Taruh plate 1×2 biru di belakang sebagai atap kabin.",
        "Tambahkan empat round 1×1 hitam di bawah sebagai roda.",
      ],
      used: [
        { part: "brick-2x2", color: "black", quantity: 1 },
        { part: "brick-2x4", color: "red", quantity: 1 },
        { part: "plate-1x2", color: "blue", quantity: 1 },
      ],
      missing: [{ part: "round-1x1", color: "black", quantity: 4 }],
    },
    {
      id: "idea_w5n0",
      theme: "vehicles",
      difficulty: "easy",
      title: "Pesawat kecil",
      summary: "Badan putih, sayap biru, ekor hijau.",
      steps: [
        "Pakai brick 1×4 putih sebagai badan pesawat.",
        "Pasang plate 2×4 biru melintang di tengah sebagai sayap.",
        "Taruh slope 2×2 hijau di belakang sebagai ekor.",
      ],
      used: [{ part: "slope-2x2", color: "green", quantity: 1 }],
      missing: [
        { part: "brick-1x4", color: "white", quantity: 1 },
        { part: "plate-2x4", color: "blue", quantity: 1 },
      ],
    },
  ],
} as const;

// 5. Ideas: GET /scans/{scanId}/ideas/{ideaId} ("the rest of the idea" and
// "all three ideas of the set" filled in)

export const STORED_IDEA = { idea: IDEA_SET.items[0], set: IDEA_SET };

// 6. Errors

export const INVALID_REQUEST = {
  error: {
    code: "invalid_request",
    message: "changes[1].quantity must be from 1 to 20.",
    field: "changes[1].quantity",
  },
};
