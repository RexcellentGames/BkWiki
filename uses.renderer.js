let renderers = {};

/**
 * Renders a single item use
 * @param {Array<any>} use The uses
 * @returns {string} The rendered HTML
 */
function renderUse(use) {
  const renderer = renderers[use.id];
  return renderer ? renderer(use) : use.id;
}

/**
 * Render and item's uses property to HTML
 * @param {Array<any>} uses The array of uses
 * @returns {string} The rendered HTML
 */
function renderUses(uses) {
  const out = uses.map(u => `\n* ${renderUse(u)}`);
  return mdToHtml(out.join(''));
}

/* The renderer */

renderers["bk:MeleeArc"] = function(use) {
  return `Creates a melee arc that does **${use.damage}** damage and lasts for **${properRound(use.time, 2)}** seconds`
}

renderers["bk:SimpleShoot"] = function(use) {
  return `Shoots ${use.amount == 1 ? "a projectile that deals " : `**${use.amount}** projectiles that deal `} **${use.damage}** damage`
}
