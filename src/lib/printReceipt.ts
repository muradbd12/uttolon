/**
 * Prints a single element in isolation: clones it into a fresh node appended
 * directly to <body>, hides everything else in <body> for the duration of
 * the print, then cleans up automatically after printing (or if the user
 * cancels and returns focus to the tab without printing).
 *
 * This is more reliable than relying only on `print:hidden` classes, because
 * it doesn't depend on knowing every ancestor/sibling in the page (e.g. an
 * admin dashboard sidebar) — it hides literally everything except the
 * cloned target, regardless of where in the page the original element lives.
 */
export async function printIsolated(elementId: string) {
  if (typeof document === "undefined") return;

  if ("fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // If the font-readiness check fails for any reason, still proceed to print.
    }
  }

  const target = document.getElementById(elementId);
  if (!target) {
    window.print();
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

  const cleanup = () => {
    document.body.classList.remove("printing-isolated");
    const el = document.getElementById("print-isolated-root");
    if (el) el.remove();
    window.removeEventListener("afterprint", cleanup);
    window.removeEventListener("focus", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.addEventListener("focus", cleanup);

  window.print();
}
