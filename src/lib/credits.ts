/* Credits shown in the site footer. Names and citations read the same in every
 * language, so they live here; the sentences around them are in the dictionaries.
 */

/**
 * The detector's training data, cited as in the legoin-ml README. It's licensed
 * CC BY 4.0, so anything built on it credits the source.
 */
export const DATASET = {
  authors: "Zawora, K., Zaraziński, S., Śledź, B., & Łobacz, B.",
  year: 2021,
  title: "Tagged images with LEGO bricks",
  publisher: "MOST Wiedzy, Gdańsk University of Technology",
  url: "https://doi.org/10.34808/anq4-rn44",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
};

/**
 * The checked builds behind template ideas and their pictures, credited as
 * ADR-0010 in legoin-docs lists: the BrickWright paper, its code, and the part
 * data BrickLayer builds with. The pictures are rendered from the LDraw.org
 * Parts Library, which the `.ldr` downloads refer to but don't include.
 */
export const BUILDS = {
  paper: {
    authors:
      "Pun, A., Dai, K., Chen, S., Jones, M., Liu, R., Deng, K., Liu, C., Agrawala, M., Ramanan, D., & Zhu, J.-Y.",
    year: 2026,
    title: "BrickWright: Agentic Creation of Physically Feasible Brick Builds",
    id: "arXiv:2610.31651",
    url: "https://arxiv.org/abs/2610.31651",
  },
  sources: [
    {
      name: "BrickLayer and BrickWright",
      url: "https://github.com/AvaLovelace1/brickwright",
      license: "MIT",
    },
    {
      name: "LDraw.org Parts Library",
      url: "https://library.ldraw.org/",
      license: "CC BY 2.0 and 4.0",
    },
    {
      name: "BrickNet",
      url: "https://github.com/kulits/BrickNet",
      license: "MIT",
    },
    { name: "Rebrickable", url: "https://rebrickable.com/downloads/" },
  ],
};

/** The team, as listed in the PRD. */
export const TEAM = {
  name: "Kelompok 5",
  members: ["Dika Aprilio Wibowo", "Aldio Lisafron", "Ricky Bonardo"],
  course: "Visual Komputer Cerdas",
};
