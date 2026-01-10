export function isMatch(a, b) {
  if (!a || !b) return false;

  // Must be opposite type
  if (a.type === b.type) return false;

  // AI metadata must exist
  if (!a.itemType || !b.itemType) return false;

  // Core rule: same itemType
  if (a.itemType.toLowerCase() !== b.itemType.toLowerCase()) {
    return false;
  }

  // Optional: color boost (not mandatory)
  if (a.primaryColor && b.primaryColor) {
    return a.primaryColor.toLowerCase() === b.primaryColor.toLowerCase();
  }

  return true;
}
