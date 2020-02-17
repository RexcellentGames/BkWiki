
/* Some util stuff */

/** The current mouse position */
const mousePos = { x: 0, y: 0 };
window.onmousemove = e => { mousePos.x = e.clientX; mousePos.y = e.clientY; };

/**
 * Copy text to the user's clipboard
 * @param {string} text 
 */
function copyToClipboard(text) {
  const el = document.getElementById('clipboard');
  el.innerHTML = text;
  el.select();
  el.setSelectionRange(0, 99999);
  document.execCommand('copy');
}

/**
 * Find an item by it's id
 * @param {string} id 
 */
function itemById(id) {
  return app.allItems.find(i => i.id == id);
}

/**
 * makes an id "readable"
 * @param {string} id the id
 */
function stringifyId(id) {
  if (id.includes(':')) id = id.split(':')[1];
  const out = [];
  for (const word of id.split('_')) {
    out.push(word.substr(0,1).toUpperCase() + word.substr(1));
  }
  return out.join(' ');
}

const showdownConv = new showdown.Converter();
showdownConv.setOption("strikethrough", true)
/**
 * Converts markdown to HTML using the showdown converter
 * @param {string} md 
 */
function mdToHtml(md) {
  return showdownConv.makeHtml(md);
}

/**
 * Rounds stuff but with digits after the .
 * @param {number} number The number to round
 * @param {number} decimals The amount of digits after the .
 */
function properRound(number, decimals = 0) {
  if (decimals <= 0) return Math.round(number);
  return Math.round((number + Number.EPSILON) * (10 ** decimals)) / (10 ** decimals);
}

/**
 * Parses strings with the ingame format and renders them in HTML
 * @param {string} string The string to parse
 */
function parseBkstr(string) {
  // name, each char seperate, alternation boolean used by the c o d e
  const tokens = {
    '_': [ 'italic', false, false ],
    '**': [ 'bold', false, false ],
    '##': [ 'shake', true, false ],
    '@@': [ 'blink', false, false ],
    '&&': [ 'flip', false, false ],
    '%%': [ 'rainbow', true, false ],
    '^^': [ 'wave', true, false ]
  };
  let active = [ [] ]; // contains the modifiers active at a certain index, index 0 is before the first character
  let lastChar = '';
  let splitted = string.split('');
  let out = '';
  let pos = 0;

  // Go through every char in the string and detect tokens
  // Toggle last boolean in the token object (technically array)
  // Add all tokens that are active (last bool == true) to the active[] array
  for (let i = 0; i < splitted.length; i++) {
    let char = splitted[i];
    let full = lastChar + char;
    if (tokens[char]) {
      tokens[char][2] = !tokens[char][2];
      lastChar = '';
    } else if (tokens[full]) {
      out = out.substr(0, out.length - 1);
      tokens[full][2] = !tokens[full][2];
      lastChar = '';
      pos--;
    } else {
      out += char;
      lastChar = char;
      pos++;
    }
    active[pos] = [];
    for (let token of Object.values(tokens)) {
      if (token[2]) active[pos].push(token);
    }
  }

  string = out;
  out = '';

  // If custom styling is present
  // Go through every character again
  // Check which tags to open and which to close by looking at the active[] array
  if (Object.keys(active).length) {
    for (let i = 0; i < string.length; i++) {
      let bulk = [];
      let open = [];
      let close = 0;
      for (let token of active[i]) {
        if (token[1]) bulk.push(token[0]);
        else {
          if (i == 0 || !active[i-1].filter(o => o[0] == token[0]).length) {
            open.push(token[0]);
          } else if (i == string.length - 1 || !active[i+1].filter(o => o[0] == token[0]).length) {
            close++;
          }
        }
      }

      let add = string.split('')[i];
      if (bulk && add == ' ') add = '&nbsp;';

      if (bulk.length) {
        add = `<span class="${bulk.join(' ')}">${add}</span>`;
      }

      if (open.length) {
        for (let tag of open)
          add = `<span class="${tag}">${add}`;
      }

      if (close) {
        add += '</span>'.repeat(close);
      }

      out += add;
    }

    out = `<span class="bkstr">${out}</span>`;
  }
  if (string.includes('Fragile')) console.log(active);
  // for (let token in tokens) {
  //   const parts = string.split(token);
  //   if (parts.length % 2 == 0) {
  //     parts[parts.length - 2] += parts.splice(parts.length-1)[0];
  //   }
  //   string = '';
  //   for (let i = 0; i < parts.length; i++) {
  //     if (i) {
  //       if (i % 2) string += `<span class="bkstr ${tokens[token]}">`;
  //       else string += '</span>';
  //     }
  //     string += parts[i];
  //   }
  // }
  return out || string;
}

/* Context menu */

/**
 * Opens a custom context menu.
 * @param {[ { text: string, action: () => void } ]} options the available options
 * @param {number?} posX (optional)
 * @param {number?} posY (optional)
 */
function contextMenu(options, posX, posY) {
  if (!posX) posX = mousePos.x;
  if (!posY) posY = mousePos.y;
  Vue.set(app.contextMenu, 'options', options);
  document.getElementById('context-menu').style.left = `${posX}px`;
  document.getElementById('context-menu').style.top = `${posY}px`;
  document.getElementById('context-menu-cont').classList.add('active');
}

/**
 * Closes a custom context menu.
 * 
 * **This does not have to be called each time a context menu item is clicked!**
 */
function closeContextMenu() {
  Vue.set(app.contextMenu, 'options', [ ]);
  Vue.set(app.itemlist, 'focusElement', '');
  document.getElementById('context-menu-cont').classList.remove('active');
}