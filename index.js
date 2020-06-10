'use strict';

Vue.component('bkitem', {
  props: [ 'data' ],
  template: '#t-bkitem',
  computed: {
    isFocusElement: function() {
      return this.$parent.itemlist.focusElement == this.data.id;
    }
  },
  methods: {
    openDetails: function() {
      if (this.$parent.itemlist.focusElement) {
        closeContextMenu();
        return;
      }

      const pageInfo = {
        type: 'itemdetails',
        item: this.data.id
      };
      Vue.set(app, 'page', pageInfo);
      app.lastViewedItem = this.data.id;
      history.pushState(pageInfo, 'Item Details', `/?item=${this.data.id}`);
    },
    openContextMenu: function() {
      Vue.set(app.itemlist, 'focusElement', this.data.id);
      const options = [
        { text: 'Copy Name', action: () => copyToClipboard(this.data.dispName) },
        { text: 'Copy Id', action: () => copyToClipboard(this.data.id) },
        { text: 'Copy Image URL', action: () => copyToClipboard(this.data.imgURL) },
        { text: 'Copy Json Data', action: () => copyToClipboard(JSON.stringify(this.data)) }
      ];
      const eastereggs = {
        maanex: { text: 'Follow on Twitter', action: () => location.href = 'https://twitter.com/maanex_' },
        villager_head: { text: 'HMMM', action: () => location.href = 'https://www.youtube.com/watch?v=561xYvjMbNk' },
      }
      for (let egg in eastereggs) {
        if (this.data.id.includes(egg))
          options.push(eastereggs[egg]);
      }
      contextMenu(options);
    }
  }
});

// there you go badosz, I converted to const
const app = new Vue({
  el: '#app',
  data: {
    allItems: [ ],
    items: [ ],
    lang: { },
    colorData: { },

    itemlist: {
      filter: {
        name: '',
        type: 'Show All',
        pool: 'Show All',
        sort: 'Color ▼',
      },
      focusElement: ''
    },

    itemSort: [
      'Color ▼',
      'Color ▲',
      'Name ▼',
      'Name ▲',
    ],

    lastViewedItem: '',
    citem: { }, // item with the id of lastViewedItem

    page: {
      // type, one of: itemlist, itemdetails, 
      type: 'itemlist',
    },
    contextMenu: {
      options: [ ]
    }
  },
  watch: {
    'itemlist.filter.name': function() { this.$nextTick(updateItemlist); },
    'itemlist.filter.type': function() { this.$nextTick(updateItemlist); },
    'itemlist.filter.pool': function() { this.$nextTick(updateItemlist); },
    'itemlist.filter.sort': function() { this.$nextTick(updateItemlist); },
    'page': function(page) {
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      switch(page.type) {
        case 'itemlist':
          link.href = 'https://cdn.discordapp.com/emojis/556781292276940810.png' /* TODO */;
          break;
        case 'itemdetails':
          link.href = itemById(this.lastViewedItem).imgURL;
          break;
      }
      document.getElementsByTagName('head')[0].appendChild(link);
    },
    'lastViewedItem': function(id) {
      this.citem = itemById(id);
    }
  },
  computed: {
    windowTitle: function() {
      switch(this.page.type) {
        case 'itemlist': return 'Burning Knight Wiki';
        case 'itemdetails': return `${itemById(this.lastViewedItem).dispName} • Burning Knight Wiki`;
      }
    },
    citemPoolsStrings: function() {
      const out = [];
      for (let i = 0; i < ITEM_POOLS.length; i++) {
        if ((this.citem.pool >> i) % 2)
          out.push(stringifyId(ITEM_POOLS[i]));
      }
      return out;
    },
    citemUsesStrings: function() {
      return renderUses(this.citem.uses);
    },
    citemInfofile: function() {
      if (this.citem.infofile) return this.citem.infofile;
      else {
        fetch(`https://raw.githubusercontent.com/RexcellentGames/BkWikiData/master/data/items/${this.citem.id.split(':').join('_')}.md`)
          .then(async res => {
            if (res.status == 200) Vue.set(this.citem, 'infofile', mdToHtml(await res.text()));
            else Vue.set(this.citem, 'infofile', '');
          })
          .catch(console.error);
      }
    }
  },
  methods: {
    itemDetailsIconClicked: function() {
      const options = [
        { text: 'Copy Image URL', action: () => copyToClipboard(app.citem.imgURL) },
        { text: 'Copy Json Data', action: () => copyToClipboard(JSON.stringify(this.citem)) },
      ];
      if (window.hoverAnim) {
        options.push({
          text: 'Stop Animation',
          action: () => { clearInterval(window.hoverAnim); window.hoverAnim = undefined; document.getElementById('hoverItem').style.transform = ''; }
        });
      } else {
        options.push({
          text: 'Start Animation',
          action: () => startItemHoverAnim()
        });
      }
      contextMenu(options)
    },
    itemDetailsNameboxClicked: function() {
      contextMenu([
        { text: 'Copy Name', action: () => copyToClipboard(this.citem.dispName) },
        { text: 'Copy ID', action: () => copyToClipboard(this.citem.id) },
        { text: 'Copy Category', action: () => copyToClipboard(ITEM_TYPES[this.citem.type+1]) },
        { text: 'Copy Description', action: () => copyToClipboard(this.citem.desc || 'none') },
      ]);
    },
    itemDetailsPoolsClicked: function() {
      contextMenu([
        {
          text: 'Copy as Bits',
          action: () => copyToClipboard(this.citem.pool)
        },
        {
          text: 'Copy as String Array',
          action: () => {
            const out = [];
            for (let i = 0; i < ITEM_POOLS.length; i++) {
              if ((this.citem.pool >> i) % 2)
                out.push(ITEM_POOLS[i]);
            }
            copyToClipboard(JSON.stringify(out));
          }
        }
      ]);
    },
    itemDetailsUsesClicked: function() {
      contextMenu([
        { text: 'Copy as Json', action: () => copyToClipboard(JSON.stringify(this.citem.uses)) }
      ]);
    },
    itemDetailsInfofileClicked: function() {
      if (!this.citem.infofile) return;
      contextMenu([
        { text: 'Copy Link', action: () => copyToClipboard(`https://raw.githubusercontent.com/RexcellentGames/BkWikiData/master/data/items/${this.citem.id.split(':').join('_')}.md`) }
      ]);
    },
    gotoItemlist: function() {
      Vue.set(app, 'page', { type: 'itemlist' });
      history.pushState({ type: 'itemlist' }, 'Burning Knight Wiki', `/`);
    },
    resetItemlistFilter: function() {
      this.itemlist.filter = {
        name: '',
        type: 'Show All',
        pool: 'Show All',
        sort: 'Color ▼',
      };
    }
  }
});

/* Itemlist search / filter */

function updateItemlist(input = app.allItems) {
  const list = [ ];
  const data = app.itemlist.filter;
  const allItemsCopy = JSON.parse(JSON.stringify(input));

  for (let item of allItemsCopy) {
    if (itemNameSearchFilter(item)
     && itemTypeFilter(item)
     && itemPoolFilter(item)) {
      list.push(item);
    }
  }

  const sortIndex = app.itemSort.indexOf(data.sort);
  switch (sortIndex) {
    case 0:
      list.sort((a, b) => ((app.colorData[a.id] || 0) < (app.colorData[b.id] || 0)) ? 1 : -1);
      break;
    case 1:
      list.sort((a, b) => ((app.colorData[a.id] || 0) < (app.colorData[b.id] || 0)) ? -1 : 1);
      break;
    case 2:
      list.sort((a, b) => (a.dispName.toLowerCase() < b.dispName.toLowerCase()) ? -1 : 1);
      break;
    case 3:
      list.sort((a, b) => (a.dispName.toLowerCase() < b.dispName.toLowerCase()) ? 1 : -1);
      break;
  }

  Vue.set(app, 'items', list);
  return list;
}

function itemPoolFilter(item) {
  const index = DISP_ITEM_POOLS.indexOf(app.itemlist.filter.pool) - 1;
  if (index < 0) return true;
  return !!((item.pool >> index) % 2);
}

function itemTypeFilter(item) {
  const index = ITEM_TYPES.indexOf(app.itemlist.filter.type) - 1;
  if (index < 0) return true;
  return item.type == index;
}

function itemNameSearchFilter(item) {
  const iname = app.itemlist.filter.name.toLowerCase();

  if (item.dispName.toLowerCase().includes(iname)) {
    item.dispName = stringUFrame(item.dispName, iname);
    return true;
  } else if (item.id.includes(iname)) {
    item.dispId = stringUFrame(item.id, iname);
    return true;
  } else {
    return false;
  }
}

function stringUFrame(string, search) {
  if (!search) return string;
  const startIndex = string.toLowerCase().indexOf(search);
  const before = string.substr(0, startIndex);
  const mid = string.substr(startIndex, search.length);
  const last = string.substring(startIndex + search.length);
  return `${before}<u>${mid}</u>${last}`;
}

/* Page load */

function loadLang(lang) {
  return new Promise((res, rej) => {
    fetch('https://raw.githubusercontent.com/RexcellentGames/BkWikiData/master/data/en.json')
      .then(r => r.json())
      .then(o => {
        Vue.set(app, 'lang', o);
        res();
      })
      .catch(err => {
        console.error(err);
        rej();
      });
  });
}

function loadItems() {
  return new Promise((res, rej) => {
    fetch('https://raw.githubusercontent.com/RexcellentGames/BkWikiData/master/data/items/items.json')
      .then(res => res.json())
      .then(o => {
        o = Object.values(o);
        for (const item of o) {
          item.dispName = app.lang[item.id] || stringifyId(item.id);
          item.imgURL = `https://raw.githubusercontent.com/RexcellentGames/BkWikiData/master/data/images/${item.id}.png`;
          item.desc = app.lang[`${item.id}_desc`] || '';
          item.dispDesc = parseBkstr(item.desc);
        }
        const items = updateItemlist(o);
        app.$nextTick(() => Vue.set(app, 'allItems', items));
        res();
      })
      .catch(err => {
        console.error(err);
        rej();
      });
  });
}

function loadColorData() {
  return new Promise((res, rej) => {
    fetch('https://raw.githubusercontent.com/RexcellentGames/BkWikiData/master/data/color.json')
      .then(res => res.json())
      .then(o => {
        Vue.set(app, 'colorData', o);
        res();
      })
      .catch(err => {
        console.error(err);
        rej();
      });
  });
}

function parseUrlData() {
  const url = new URL(location.href);
  if (url.searchParams.has('item')) {
    Vue.set(app, 'page', {
      type: 'itemdetails',
      item: url.searchParams.get('item')
    });
    app.lastViewedItem = url.searchParams.get('item');
  }
}

function addPopstateListener() {
  window.onpopstate = e => {
    e.preventDefault();
    if (app.page.item)
      app.lastViewedItem = app.page.item;
    Vue.set(app, 'page', e.state || { type: 'itemlist' });
  };
}

function addKeyboardListeners() {
  window.onkeydown = e => {
    if (e.key === 'Escape'
      ||e.code === 'Escape'
      ||e.keyCode === 27) {
      if (app.page.type == 'itemdetails') {
        app.gotoItemlist();
        e.preventDefault();
      }
    }
  };
}

function startItemHoverAnim() {
  window.hoverAnim = setInterval(() => {
    if (app.page.type != 'itemdetails') return;
    if (!document.getElementById('hoverItem')) return;
    const delta = (Date.now() / 700) % 360;
    const trans = Math.cos(delta) * 14;
    const rot = Math.sin(delta) * 8;
    document.getElementById('hoverItem').style.setProperty('transform', `translateY(${trans}px) rotate(${rot}deg) scale(var(--scale))`);
  }, 50);
}

async function init() {
  await loadLang();
  await loadItems();
  await loadColorData();
  parseUrlData();
  addPopstateListener();
  addKeyboardListeners();
  updateItemlist();
  document.body.classList.add('ready');

  startItemHoverAnim();
}
init();