const LIGHT_ONLY_CLASS =
  /(^|\s)(bg-white|bg-gray-50|bg-gray-100|text-gray-900|text-gray-700|text-gray-600|border-gray-200|border-gray-300)(\s|$)/;

/** Returns elements still styled with light-theme-only classes that clash with the dark app shell. */
export function findLightOnlyElements<
  T extends { getAttribute(name: string): string | null },
>(root: { querySelectorAll(selector: string): ArrayLike<T> }): T[] {
  return Array.from(root.querySelectorAll('[class]')).filter((element) =>
    LIGHT_ONLY_CLASS.test(element.getAttribute('class') ?? '')
  );
}
