/** The id of every page's main element, where the skip link lands. */
export const MAIN_ID = "main";

/**
 * The first stop on every page: it jumps past the header to the page's main
 * element. It waits above the top edge and drops in as a yellow sticker when it
 * has focus.
 */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href={`#${MAIN_ID}`}
      className="fixed top-0 left-stud z-50 -translate-y-[calc(100%+1rem)] rounded-full border-[2.5px] border-ink bg-highlight px-4 py-2 font-semibold text-highlight-foreground shadow-sticker focus:translate-y-stud"
    >
      {label}
    </a>
  );
}
