var renderers = {};

/**
 * Renders a single item use
 * @param {Array<any>} use The uses
 * @returns {string} The rendered HTML
 */
function renderUse(use) {
  var renderer = renderers[use.id];

  if (renderer) {
    return renderer(use);
  }

  return use.id;
}

/**
 * Render and item's uses property to HTML
 * @param {Array<any>} uses The array of uses
 * @returns {string} The rendered HTML
 */
function renderUses(uses) {
  var result = [];

  for (var use in uses) {
    var data = renderUse(uses[use]);

    if (data) {
      result.push("\n* ");
      result.push(data);
    }
  }

  return mdToHtml(result.join(""));
}

renderers["bk:MeleeArc"] = function(use) {
  return `Creates a melee arc, that does ${use.damage} damage and lasts for ${use.time} seconds`
}

renderers["bk:SimpleShoot"] = function(use) {
  return `Shoots ${use.amount == 1 ? "a projectile, that deals " : `${use.amount} projectiles, that deal `} ${use.damage} damage`
}
