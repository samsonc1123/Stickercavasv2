export function normalizeTaxonomyCode(input: string): string {
  let code = input
    .trim()
    .toUpperCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  if (code.length === 0) {
    throw new Error(`normalizeTaxonomyCode: empty result from input "${input}"`);
  }

  if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(code)) {
    throw new Error(
      `normalizeTaxonomyCode: invalid code "${code}" from input "${input}". ` +
      `Only A-Z, 0-9, and single hyphens allowed. No leading/trailing/double hyphens.`
    );
  }

  return code;
}
