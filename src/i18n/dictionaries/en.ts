/** English UI copy. It defines the dictionary shape that every other language must match. */
export const en = {
  meta: {
    description:
      "Photograph your LEGO pieces and get an automatic inventory and build ideas from the pieces you own.",
    designSystem: "Design system",
  },
  language: {
    label: "Language",
    names: { en: "English", id: "Bahasa Indonesia" },
  },
  app: {
    home: "Legoin home",
    history: "History",
    steps: {
      label: "Scan progress",
      photo: "Photo",
      pieces: "Pieces",
      ideas: "Ideas",
    },
  },
  footer: {
    team: {
      title: "Team",
      body: "Made by {team} for the {course} course, School of Vocational Studies, IPB University.",
    },
    dataset: {
      title: "Dataset",
      body: "Legoin's piece detector learns from this dataset:",
      license: "Licensed under",
    },
    notes: {
      title: "Good to know",
      photos: "The sample photos are AI-generated, not real scans.",
      trademark:
        "LEGO® is a trademark of the LEGO Group. Legoin is a student project and isn't affiliated with or endorsed by the LEGO Group.",
    },
  },
  scan: {
    title: "Photograph your pieces",
    lead: "Lay all your pieces flat on a plain table, apart from each other, and take one photo from above.",
    guide: {
      title: "Photo tips",
      do: "Do",
      dont: "Don't",
      plain: {
        title: "Plain background",
        body: "A plain table or a sheet of paper, no patterns.",
      },
      above: {
        title: "Shoot from above",
        body: "Hold your phone flat over the pieces.",
      },
      light: {
        title: "Good light",
        body: "Daylight or a bright lamp, without harsh shadows.",
      },
      apart: {
        title: "Stacked or touching",
        body: "Spread the pieces out so none overlap or touch.",
      },
    },
    capture: {
      title: "Your photo",
      drop: "Drop a photo here",
      or: "or",
      take: "Take a photo",
      choose: "Choose a photo",
      sample: "Try the sample photo",
      hint: "JPEG or PNG, up to 10 MB.",
      previewAlt: "Your photo of your pieces",
      sampleAlt:
        "Sample photo: eight pieces on a gray table, including a black 2×4 plate, a yellow round, an orange 1×2 brick and a blue 2×3 brick.",
      retake: "Retake",
      submit: "Scan pieces",
      scanning: "Scanning…",
    },
    errors: {
      type: "That file isn't an image. Choose a JPEG or PNG photo.",
      size: "That photo is over 10 MB. Choose a smaller one.",
      read: "We couldn't open that photo. Try another one.",
      generic: "Something went wrong. Try again.",
    },
    progress: {
      title: "Scanning your pieces",
      photoAlt: "The photo being scanned",
      stages: {
        detecting: "Finding pieces",
        classifying: "Recognizing parts",
        coloring: "Reading colors",
      },
      status: { done: "done", current: "in progress", waiting: "waiting" },
      elapsed: "Time",
      slow: "This is taking longer than usual. Hang on a little longer.",
      cancel: "Cancel",
    },
    failures: {
      no_pieces: {
        title: "We couldn't find any pieces",
        body: "Spread your pieces out on a plain background and take the photo again.",
      },
      too_dark: {
        title: "Your photo is too dark",
        body: "Move to daylight or turn on a bright lamp, then retake the photo.",
      },
      too_blurry: {
        title: "Your photo is blurry",
        body: "Hold your phone still over the pieces and let it focus before you shoot.",
      },
      network: {
        title: "We couldn't reach Legoin",
        body: "Check your connection and try again. Your photo is still here.",
      },
      retake: "Retake photo",
      retry: "Try again",
      tips: "See the photo tips",
    },
  },
  results: {
    title: "Your pieces",
    loading: "Loading your scan…",
    photoAlt: "Your photo with a box around each piece found",
    missing: {
      title: "We couldn't find that scan",
      body: "It may have been deleted from this browser.",
      action: "Start a new scan",
    },
    toCheck: {
      one: "{count} piece to check",
      other: "{count} pieces to check",
    },
    labels: { hide: "Hide labels", show: "Show labels" },
    zoom: { in: "Zoom in", out: "Zoom out" },
    piece: {
      title: "Selected piece",
      empty: "Select a piece on the photo or in the inventory to see it here.",
      confidence: "Confidence",
      added: "Added by you",
      check: "Check this",
      lowConfidence:
        "We're not sure about this piece. Check its part and color.",
    },
    edit: {
      title: "Fix this piece",
      part: "Part",
      color: "Color",
      save: "Save changes",
      remove: "Remove piece",
      confirm: "Remove this piece from your inventory?",
      confirmRemove: "Remove",
      keep: "Keep it",
      edited: "Edited",
    },
    add: {
      title: "Add a missed piece",
      part: "Part",
      color: "Color",
      quantity: "How many",
      submit: "Add to inventory",
      invalid: "Enter a number from 1 to 20.",
    },
    totals: {
      parts: { one: "{count} part type", other: "{count} part types" },
      colors: { one: "{count} color", other: "{count} colors" },
    },
    undo: "Undo last change",
    status: {
      edited: "Piece updated.",
      removed: "Piece removed.",
      added: { one: "{count} piece added.", other: "{count} pieces added." },
      undone: "Change undone.",
      failed: "We couldn't save that. Try again.",
    },
    continue: "Get build ideas",
  },
  ideas: {
    title: "Build ideas",
    picker: {
      title: "What do you want to build?",
      lead: "Pick a theme. Legoin suggests three builds from your pieces.",
      legend: "Theme",
      themes: {
        vehicles: { label: "Vehicles", hint: "Cars, trucks and boats" },
        animals: { label: "Animals", hint: "Ducks, turtles and penguins" },
        buildings: {
          label: "Buildings",
          hint: "Houses, lighthouses and bridges",
        },
        surprise: { label: "Surprise me", hint: "One idea from each theme" },
      },
      submit: "Get ideas",
    },
    finding: "Finding ideas…",
    found: { one: "{count} idea ready.", other: "{count} ideas ready." },
    difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
    uses: {
      one: "Uses {count} of your pieces",
      other: "Uses {count} of your pieces",
    },
    usesNone: "Uses none of your pieces yet",
    complete: "Uses only your pieces",
    seeSteps: "See steps",
    again: "Try other ideas",
    none: "No ideas for this theme yet. Try another theme.",
    failed: {
      title: "We couldn't get ideas",
      body: "Check your connection and try again.",
      retry: "Try again",
    },
    empty: {
      title: "No pieces to build with",
      body: "This scan has no pieces left. Add the pieces you have, then come back for ideas.",
      action: "Back to your pieces",
    },
  },
  ideaDetail: {
    title: "Build steps",
    loading: "Loading this idea…",
    back: "All ideas",
    steps: "Steps",
    markDone: "Step {step} done",
    progress: "{done} of {total} steps done",
    allDone: "All steps done. Nice build!",
    summary: {
      title: "What you're missing",
      needed: "Pieces needed",
      have: "You have",
      missing: "Missing",
      some: {
        one: "Find {count} more piece, or swap in a similar one you have.",
        other: "Find {count} more pieces, or swap in similar ones you have.",
      },
      none: "You have every piece. Start building!",
    },
    nav: "Other ideas",
    previous: "Previous idea",
    next: "Next idea",
    language: {
      note: "This idea was written in {language}. Ideas aren't translated, but you can get new ones in English.",
      names: { en: "English", id: "Indonesian" },
      action: "Get ideas in English",
    },
    missing: {
      title: "We couldn't find that idea",
      body: "Asking for new ideas replaces the ones before, so this one may be gone.",
      action: "See your ideas",
    },
    failed: {
      title: "We couldn't load this idea",
      body: "Check your connection and try again.",
      retry: "Try again",
    },
  },
  motion: {
    title: { before: "Motion & ", sticker: "interaction" },
    intro:
      "Legoin works like a building-instructions booklet laid on a baseplate: screens assemble step by step, and every piece clicks into place. One motion, reused everywhere.",
    back: "Design system",
    reduce: "Preview reduced motion",
    replay: "Replay",
    tokens: {
      title: "Tokens",
      description:
        "Timings, curves and distances live in tokens.css. With reduced motion every distance drops to zero, so the values below change when you preview it.",
      name: "Token",
      value: "Value",
    },
    clickIn: {
      title: "Click-in",
      description:
        "A piece drops onto the studs, squashes a little on impact and settles. Screens assemble with it, one piece a stagger step after the last, eight steps at most.",
    },
    press: {
      title: "Press-fit",
      description:
        "A filled button sinks exactly into its hard shadow while pressed and springs back. One primary button per screen is magnetic: it leans toward a nearby mouse pointer.",
      magnetic: "I'm magnetic",
      plain: "I'm not",
    },
    pick: {
      title: "Picking pieces",
      description:
        "A selected piece lifts off the photo and leaves a dotted stud footprint, and its tile slides out like a part callout. A removed piece pops off; undo clicks it back. On phones the snap is a tiny vibration.",
      remove: "Pop it off",
      undo: "Click it back",
    },
    counts: {
      title: "Counts",
      description:
        "Counts roll like an odometer: up from zero when they appear, to the new value when they change. Screen readers get the plain sentence.",
      fewer: "One fewer",
      more: "One more",
    },
    scanner: {
      title: "Scanner",
      description:
        "While a photo is scanned, a beam sweeps it and the studs it passes light up, then fade behind it. Only transforms move, so it stays smooth on phones.",
    },
    apart: {
      title: "Falling apart",
      description:
        "When a scan fails, a small build wobbles and tumbles apart. With reduced motion the pieces are simply shown apart.",
    },
    baseplate: {
      title: "Baseplate",
      description:
        "Screens sit on a stud grid, and one stud is the layout module: 16px on phones, 24px from 640px. With a mouse, the studs near the pointer light up. Touch screens and reduced motion don't get the glow.",
    },
    steps: {
      title: "Between steps",
      description:
        "From Photo to Pieces, the photo morphs from the scanner into the results and the current-step marker slides along. Add ?mockDelay=3000 to the address to slow a scan down, or ?mock=fail-too_dark to see a failure.",
      action: "Try a scan",
    },
    reduced: {
      title: "Reduced motion",
      description:
        "With reduced motion nothing travels, tilts or staggers. Pieces still fade in, the selection still shows, counts change at once, and the scanner beam and pointer glow are off.",
    },
  },
  history: {
    title: "Your scans",
    lead: "Scans are saved in this browser. Open one to see its pieces and ideas again.",
    loading: "Loading your scans…",
    count: { one: "{count} scan", other: "{count} scans" },
    newScan: "New scan",
    lastTheme: "Last theme: {theme}",
    ideas: "See ideas",
    delete: {
      action: "Delete",
      question: "Delete this scan? You can't get it back.",
      confirm: "Delete scan",
      keep: "Keep it",
      done: "Scan deleted.",
      failed: "We couldn't delete that scan. Try again.",
    },
    clear: {
      action: "Clear my scans",
      question:
        "Delete all {count} scans from this browser? You can't get them back.",
      confirm: "Delete all",
      keep: "Keep my scans",
      done: "Your scans are cleared.",
      failed: "We couldn't clear your scans. Try again.",
    },
    empty: {
      title: "No scans yet",
      body: "Photograph your pieces and the scan is saved here, in this browser.",
      action: "Start a scan",
    },
    failed: {
      title: "We couldn't load your scans",
      body: "Try again in a moment. Your scans are still saved in this browser.",
      retry: "Try again",
    },
  },
  states: {
    notFound: {
      title: "We couldn't find that page",
      body: "The link may be broken, or the page has moved. Your scans are still saved in this browser.",
      home: "Back to home",
      scan: "Start a scan",
    },
    error: {
      title: "Something went wrong",
      body: "This page stopped working. Try again, or go back to the home page. Your scans are still saved in this browser.",
      retry: "Try again",
      home: "Back to home",
    },
    design: {
      title: "Empty and error states",
      description:
        "When there's nothing to show or something breaks: the scanner frame on a sticker tile, a short title, a sentence or two and the way forward. The not-found and error pages use the same card.",
      empty: {
        title: "No scans yet",
        body: "Photograph your pieces and your scans will show up here.",
        action: "Start a scan",
      },
    },
  },
  common: {
    step: "Step",
    partsUsed: "Parts used",
    partsMissing: "Parts missing",
    inventory: "Inventory",
    inventoryDetailed: "Inventory (detailed)",
    missingCount: {
      one: "{count} part missing",
      other: "{count} parts missing",
    },
    pieces: { one: "{count} piece", other: "{count} pieces" },
    ideaOf: "IDEA {index}/{total}",
  },
  sample: {
    title: "Sample scan",
    photoAlt:
      "Six pieces on a white table: a red 2×4 brick, a yellow 2×2 brick, a white 1×4 brick, a blue 1×2 plate, a green 2×2 slope and a black 2×2 brick.",
    idea: {
      title: "Little race car",
      difficulty: "Easy",
      summary: "Red body, green hood, yellow lights.",
      steps: [
        "Put the red 2×4 brick on a black 2×4 plate as the body.",
        "Add the green 2×2 slope at the front as the hood.",
        "Add the black 2×2 brick at the back and two yellow 1×1 rounds as lights.",
      ],
    },
    seeSteps: "See the steps",
    hideSteps: "Hide the steps",
  },
  home: {
    eyebrow: "Scan · Count · Build",
    title: {
      before: "Build with the ",
      sticker: "bricks",
      after: " you already have.",
    },
    lead: "Photograph all your LEGO pieces in one shot. Legoin recognizes each part and color, then suggests three build ideas, including the parts you're missing.",
    ctaScan: "Start scanning",
    ctaHistory: "Your scans",
    facts: {
      parts: "13 part types",
      colors: "10 colors",
      ideas: "3 ideas per photo",
    },
    how: {
      title: "How it works",
      photo:
        "Spread your pieces on a plain table and take one photo from above.",
      pieces:
        "Legoin finds each piece and names its part and color. Fix anything it got wrong.",
      ideas:
        "Pick a theme and get three build ideas, with the parts you have and the ones you're missing.",
    },
    tape: ["Legoin", "Snap your pieces", "Auto count", "Three build ideas"],
  },
  design: {
    title: { before: "Design ", sticker: "system" },
    intro:
      "The ballers-addict style in LEGO colors: paper, ink outlines, hard shadows and stickers. Red for actions, yellow for highlights, brick colors for bricks only.",
    motion: "Motion & interaction",
    colors: {
      title: "Colors",
      description:
        "Scales are built around real LEGO colors (Rebrickable values), on warm paper from ballers-addict. Components use roles, never scales.",
      scaleNote: "{name} at {step}",
      roles: "Roles",
      roleNotes: {
        primary: "Main action. One per screen.",
        highlight: "Stickers, highlights, steps. Text is always ink.",
        page: "Paper from ballers-addict.",
        card: "Panels and cards.",
        ink: "Ink: text, outlines, hard shadows.",
        inkSecondary: "Supporting text.",
        warning: "Missing parts.",
        success: "Available.",
        overlay: "Detection boxes over photos.",
      },
      bricks: "Brick colors",
      bricksNote: "data, not UI. Always with the color name.",
    },
    type: {
      title: "Type",
      description:
        "Dela Gothic One for headings (one weight, never bold). DM Sans for text. JetBrains Mono for counts, part ids and scores.",
      display: "Build from what you have.",
      pageTitle: "Page title · Dela Gothic One",
      cardTitle: "Card title · Dela Gothic One",
      body: "Body text, DM Sans 16. Photograph all your pieces from above on a plain background, not stacked. Legoin counts each part and color, then suggests three build ideas.",
      small: "Small text, DM Sans 14, for captions.",
      monoLabel: "Mono label · Inventory",
    },
    logo: {
      title: "Logo",
      description:
        "A yellow 2×2 brick inside a scanner frame, with a Dela Gothic One wordmark. The logo uses no red, so red and yellow never meet in it.",
    },
    buttons: {
      title: "Buttons",
      description:
        "Filled buttons carry a hard ink shadow and press into it on click; every button tilts slightly on hover. One red button per screen. Destructive actions use a red outline and a confirmation.",
      scan: "Scan pieces",
      upload: "Upload photo",
      theme: "Pick a theme",
      skip: "Skip",
      remove: "Delete scan",
      processing: "Processing…",
      link: "Link as a button",
    },
    status: {
      title: "Status",
      description:
        "Status is always an ink dot and a label, never color alone.",
      available: "Available",
      failed: "Detection failed",
      draft: "Draft",
    },
    stickers: {
      title: "Stickers, grain and tape",
      description:
        "A sticker highlights one word. Grain stays on marketing areas, never over photos or inventories. Tape moves slowly and stops when motion is reduced.",
      yellow: "Yellow",
      red: "Red",
      paper: "Paper",
      grain: "Grain over color",
      tape: ["Legoin", "Snap", "Count", "Build"],
    },
    pieces: {
      title: "Pieces",
      description: "The 13 MVP parts drawn from above in ink line art.",
    },
    detection: {
      title: "Detection",
      description:
        "Ink boxes with a white halo read on any brick color. The selected box is thicker and shows its score. The sample photo was made with Codex image generation.",
    },
    correction: {
      title: "Label correction",
      description: "People can fix the part and color before asking for ideas.",
      part: "Part",
      color: "Color",
    },
    example: {
      title: "Example: idea card",
      description:
        "One build idea from the AI agent for the sample inventory: parts used, parts missing and short steps.",
      save: "Save idea",
      another: "Another idea",
    },
  },
};

export type Dictionary = typeof en;
