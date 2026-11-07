/**
 * The scanner beam over a photo: put it inside a `.scan-bed` container that
 * holds the image. The studs it passes light up and fade behind it. Hidden
 * under reduced motion, where the stage list carries the progress.
 */
export function ScannerSweep() {
  return (
    <div aria-hidden="true" className="scan-sweep">
      <div className="scan-wake" />
      <div className="scan-beam" />
    </div>
  );
}
