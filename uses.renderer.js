
/**
 * Render and item's uses property to HTML
 * @param {Array<any>} uses The array of uses
 * @returns {string} The rendered HTML
 */
function renderUses(uses) {
  // TODO do your thing egor :p
  return uses.map(u => u.id).join(', ');
}
