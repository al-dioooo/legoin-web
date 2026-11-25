import type { Preview } from "@/lib/domain";

/**
 * The mock's copy of legoin-api's checked builds (ADR-0010): each build's
 * picture and LDraw model in `public/builds/<id>/`, copied from its `builds/`
 * library with its `manifest.json`. As in the API, a URL carries the first 12
 * hex digits of its file's SHA-256, so a changed file gets a new URL.
 */
export const BUILD_PREVIEWS: Record<string, Preview> = {
  "bus-stop": {
    image: "/builds/bus-stop/preview.webp?v=51a5a1a25917",
    model: "/builds/bus-stop/model.ldr?v=ab53909149ea",
  },
  "castle-tower": {
    image: "/builds/castle-tower/preview.webp?v=e7364b8adf44",
    model: "/builds/castle-tower/model.ldr?v=005e4b0f2e0b",
  },
  crab: {
    image: "/builds/crab/preview.webp?v=74561fe47a52",
    model: "/builds/crab/model.ldr?v=56430b1aef20",
  },
  "delivery-truck": {
    image: "/builds/delivery-truck/preview.webp?v=c3724891d98a",
    model: "/builds/delivery-truck/model.ldr?v=346801085e53",
  },
  "go-kart": {
    image: "/builds/go-kart/preview.webp?v=2715381c3af6",
    model: "/builds/go-kart/model.ldr?v=a159648bb2e3",
  },
  lighthouse: {
    image: "/builds/lighthouse/preview.webp?v=f883fcd84e9c",
    model: "/builds/lighthouse/model.ldr?v=ed279df7c82a",
  },
  "little-boat": {
    image: "/builds/little-boat/preview.webp?v=3e7cc3855449",
    model: "/builds/little-boat/model.ldr?v=9b2528211fec",
  },
  "little-house": {
    image: "/builds/little-house/preview.webp?v=0ca9fe502889",
    model: "/builds/little-house/model.ldr?v=8a2fe7f58d9f",
  },
  penguin: {
    image: "/builds/penguin/preview.webp?v=0adc3c5caed5",
    model: "/builds/penguin/model.ldr?v=6539a5ffc7e9",
  },
  puppy: {
    image: "/builds/puppy/preview.webp?v=a5001bebdc7f",
    model: "/builds/puppy/model.ldr?v=3af04bfc6e99",
  },
  "race-car": {
    image: "/builds/race-car/preview.webp?v=32a32212e618",
    model: "/builds/race-car/model.ldr?v=378de85baa5d",
  },
  rocket: {
    image: "/builds/rocket/preview.webp?v=c4114306c6d7",
    model: "/builds/rocket/model.ldr?v=de4e5c925f04",
  },
  "rubber-duck": {
    image: "/builds/rubber-duck/preview.webp?v=267341ecbdcc",
    model: "/builds/rubber-duck/model.ldr?v=ec4868cac571",
  },
  "small-bridge": {
    image: "/builds/small-bridge/preview.webp?v=6320843ae406",
    model: "/builds/small-bridge/model.ldr?v=4ec5347f1ec2",
  },
  snail: {
    image: "/builds/snail/preview.webp?v=2a2047fe4641",
    model: "/builds/snail/model.ldr?v=8b10bd9d530e",
  },
  tractor: {
    image: "/builds/tractor/preview.webp?v=6504aa658f87",
    model: "/builds/tractor/model.ldr?v=fdceb213f2dc",
  },
  turtle: {
    image: "/builds/turtle/preview.webp?v=f8acddfa0c40",
    model: "/builds/turtle/model.ldr?v=364484741e34",
  },
  windmill: {
    image: "/builds/windmill/preview.webp?v=130140f119ee",
    model: "/builds/windmill/model.ldr?v=44b51397d464",
  },
};
