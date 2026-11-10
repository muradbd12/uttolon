/**
 * Prints ONE element in isolation: clones it into a fresh node appended to
 * <body>, hides everything else in <body> during the print, and cleans up
 * after printing.
 *
 * Important behaviours (kept deliberately, do not "simplify" them away):
 *  - If the element is missing we do NOT fall back to window.print() — that
 *    used to print the whole page (e.g. the full admission form) when only a
 *    money receipt was wanted. We tell the user instead.
 *  - Cleanup happens on `afterprint` (or after a long safety timeout), never on
 *    window `focus`: some browsers fire `focus` just as the print dialog opens,
 *    which removed the isolation early and printed the whole page.
 */
export async function printIsolated(elementId: string, opts?: { landscape?: boolean }) {
  if (typeof document === "undefined") return;

  if ("fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // proceed anyway
    }
  }

  const target = document.getElementById(elementId);
  if (!target) {
    window.alert("প্রিন্ট করার মতো রশিদ পাওয়া যায়নি — পেজ রিফ্রেশ করে আবার চেষ্টা করুন।");
    return;
  }

  const previous = document.getElementById("print-isolated-root");
  if (previous) previous.remove();

  const isolatedRoot = document.createElement("div");
  isolatedRoot.id = "print-isolated-root";
  isolatedRoot.style.position = "fixed";
  isolatedRoot.style.left = "-9999px";
  isolatedRoot.style.top = "0";
  isolatedRoot.appendChild(target.cloneNode(true));
  document.body.appendChild(isolatedRoot);
  document.body.classList.add("printing-isolated");

  // certificates print on a landscape A4 page; everything else keeps the normal page
  let pageStyle: HTMLStyleElement | null = null;
  if (opts?.landscape) {
    pageStyle = document.createElement("style");
    pageStyle.id = "print-page-style";
    pageStyle.textContent = "@page { size: A4 landscape; margin: 10mm; }";
    document.head.appendChild(pageStyle);
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const cleanup = () => {
    if (timer) clearTimeout(timer);
    document.body.classList.remove("printing-isolated");
    if (pageStyle) pageStyle.remove();
    const el = document.getElementById("print-isolated-root");
    if (el) el.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  timer = setTimeout(cleanup, 5 * 60 * 1000);

  // let the browser lay the clone out before the print snapshot is taken
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  window.print();
}
