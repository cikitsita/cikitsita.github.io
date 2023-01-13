(() => {
  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function assign(tar, src) {
    for (const k in src)
      tar[k] = src[k];
    return tar;
  }
  function is_promise(value) {
    return value && typeof value === "object" && typeof value.then === "function";
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function subscribe(store, ...callbacks) {
    if (store == null) {
      return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function get_store_value(store) {
    let value;
    subscribe(store, (_2) => value = _2)();
    return value;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
  }
  function null_to_empty(value) {
    return value == null ? "" : value;
  }
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i])
        iterations[i].d(detaching);
    }
  }
  function element(name2) {
    return document.createElement(name2);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.wholeText !== data)
      text2.data = data;
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function toggle_class(element2, name2, toggle) {
    element2.classList[toggle ? "add" : "remove"](name2);
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component)
      throw new Error("Function called outside component initialization");
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function setContext(key2, context) {
    get_current_component().$$.context.set(key2, context);
    return context;
  }
  function getContext(key2) {
    return get_current_component().$$.context.get(key2);
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
  }
  var seen_callbacks = /* @__PURE__ */ new Set();
  var flushidx = 0;
  function flush() {
    const saved_component = current_component;
    do {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = /* @__PURE__ */ new Set();
  var outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }
  function handle_promise(promise, info) {
    const token = info.token = {};
    function update2(type, index, key2, value) {
      if (info.token !== token)
        return;
      info.resolved = value;
      let child_ctx = info.ctx;
      if (key2 !== void 0) {
        child_ctx = child_ctx.slice();
        child_ctx[key2] = value;
      }
      const block = type && (info.current = type)(child_ctx);
      let needs_flush = false;
      if (info.block) {
        if (info.blocks) {
          info.blocks.forEach((block2, i) => {
            if (i !== index && block2) {
              group_outros();
              transition_out(block2, 1, 1, () => {
                if (info.blocks[i] === block2) {
                  info.blocks[i] = null;
                }
              });
              check_outros();
            }
          });
        } else {
          info.block.d(1);
        }
        block.c();
        transition_in(block, 1);
        block.m(info.mount(), info.anchor);
        needs_flush = true;
      }
      info.block = block;
      if (info.blocks)
        info.blocks[index] = block;
      if (needs_flush) {
        flush();
      }
    }
    if (is_promise(promise)) {
      const current_component2 = get_current_component();
      promise.then((value) => {
        set_current_component(current_component2);
        update2(info.then, 1, info.value, value);
        set_current_component(null);
      }, (error) => {
        set_current_component(current_component2);
        update2(info.catch, 2, info.error, error);
        set_current_component(null);
        if (!info.hasCatch) {
          throw error;
        }
      });
      if (info.current !== info.pending) {
        update2(info.pending, 0);
        return true;
      }
    } else {
      if (info.current !== info.then) {
        update2(info.then, 1, info.value, promise);
        return true;
      }
      info.resolved = promise;
    }
  }
  function update_await_block_branch(info, ctx, dirty) {
    const child_ctx = ctx.slice();
    const { resolved } = info;
    if (info.current === info.then) {
      child_ctx[info.value] = resolved;
    }
    if (info.current === info.catch) {
      child_ctx[info.error] = resolved;
    }
    info.block.p(child_ctx, dirty);
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function get_spread_update(levels, updates) {
    const update2 = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
      const o = levels[i];
      const n = updates[i];
      if (n) {
        for (const key2 in o) {
          if (!(key2 in n))
            to_null_out[key2] = 1;
        }
        for (const key2 in n) {
          if (!accounted_for[key2]) {
            update2[key2] = n[key2];
            accounted_for[key2] = 1;
          }
        }
        levels[i] = n;
      } else {
        for (const key2 in o) {
          accounted_for[key2] = 1;
        }
      }
    }
    for (const key2 in to_null_out) {
      if (!(key2 in update2))
        update2[key2] = void 0;
    }
    return update2;
  }
  function get_spread_object(spread_props) {
    return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
  }
  function bind(component, name2, callback) {
    const index = component.$$.props[name2];
    if (index !== void 0) {
      component.$$.bound[index] = callback;
      callback(component.$$.ctx[index]);
    }
  }
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance46, create_fragment49, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: null,
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance46 ? instance46(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment49 ? create_fragment49($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key2 in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key2]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // node_modules/svelte/store/index.mjs
  var subscriber_queue = [];
  function writable(value, start = noop) {
    let stop;
    const subscribers = /* @__PURE__ */ new Set();
    function set(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update2(fn) {
      set(fn(value));
    }
    function subscribe2(run2, invalidate = noop) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set) || noop;
      }
      run2(value);
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0) {
          stop();
          stop = null;
        }
      };
    }
    return { set, update: update2, subscribe: subscribe2 };
  }

  // src/ts/savestore.ts
  var AppPrefix = "ACC22.";
  var loadSettings = () => {
    const panepos2 = localStorage.getItem(AppPrefix + "panepos") || 70;
    const fontsize2 = localStorage.getItem(AppPrefix + "fontsize") || 100;
    const palitrans2 = localStorage.getItem(AppPrefix + "palitrans") || "";
    const tosim2 = localStorage.getItem(AppPrefix + "tosim") || "0";
    const factorization2 = parseInt(localStorage.getItem(AppPrefix + "factorization") || "1");
    const tofind2 = localStorage.getItem(AppPrefix + "tofind") || "";
    let parallels2 = localStorage.getItem(AppPrefix + "parallels") || "{}";
    try {
      JSON.parse(parallels2);
    } catch (e) {
      console.log(e);
      parallels2 = "{}";
    }
    return { panepos: panepos2, palitrans: palitrans2, tosim: tosim2, factorization: factorization2, tofind: tofind2, parallels: parallels2, fontsize: fontsize2 };
  };
  var saveSettings = () => {
    for (let key2 in settingsToBeSave) {
      localStorage.setItem(key2, settingsToBeSave[key2]);
      delete settingsToBeSave[key2];
    }
    clearTimeout(updateTimer);
    console.log("settings autosaved on", new Date());
  };
  var updateTimer = 0;
  var settingsToBeSave = {};
  var updateSettings = (_settings) => {
    let updated = false, oldval;
    for (let key2 in _settings) {
      if (_settings.hasOwnProperty(key2)) {
        if (settings[key2] !== _settings[key2]) {
          let val = _settings[key2];
          if (typeof val == "object") {
            val = JSON.stringify(_settings[key2]);
            oldval = JSON.stringify(settings[key2]);
          }
          if (val !== oldval) {
            settingsToBeSave[AppPrefix + key2] = val;
            if (typeof _settings[key2] == "object") {
              settings[key2] = JSON.parse(JSON.stringify(_settings[key2]));
            } else {
              settings[key2] = _settings[key2];
            }
            updated = true;
          }
        }
      }
    }
    if (updated) {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(saveSettings, 5e3);
    }
  };
  var settings = loadSettings();

  // ../ptk/offtext/constants.ts
  var OFFTAG_REGEX_G = /\^([#@\/\.\:a-z_\-\d~]+)(<(?:\\.|.)*?>)?/g;
  var QUOTEPREFIX = "";
  var QUOTEPAT = /\u001a(\d+)/g;
  var OFFTAG_NAME_ATTR = /([a-z_\:]+)(.*)/;
  var OFFTAG_COMPACT_ID = /^([a-z\d]+[_a-z\d\-~\.]*)/;
  var QSTRING_REGEX_G = /"((?:\\.|.)*?)"/g;
  var OFFTAG_LEADBYTE = "^";
  var FROMTILL = /^(>\d+)?(<\d+)?(:\d+)?$/;
  var PTK_FROMTILL = /^([a-z\.\d\-_]+\:)(>\d+)?(<\d+)?(:\d+)?$/;
  var PTK_ACTION_FROMTILL = /^([a-z\.\d\-_]+\:)?([^<>\d:]+[^:<>]*)(>\d+)?(<\d+)?(:\d+)?$/;
  var MIN_ABRIDGE = 8;

  // ../ptk/utils/bsearch.ts
  var bsearchNumber = (arr, obj) => {
    let low = 0, high = arr.length - 1, mid;
    while (low < high) {
      mid = low + high >> 1;
      if (arr[mid] === obj) {
        while (mid > -1 && arr[mid - 1] === obj)
          mid--;
        return mid;
      }
      arr[mid] < obj ? low = mid + 1 : high = mid;
    }
    return low;
  };
  var bsearch = (arr, obj) => {
    let low = 0, high = arr.length - 1, mid;
    while (low < high) {
      mid = low + high >> 1;
      if (arr[mid] === obj) {
        while (mid > -1 && arr[mid - 1] === obj)
          mid--;
        return mid;
      }
      arr[mid] < obj ? low = mid + 1 : high = mid;
    }
    return low;
  };
  var bsearchGetter = (getter, obj) => {
    const len = parseInt(getter(-1));
    let low = 0, high = len - 1;
    while (low < high) {
      let mid = low + high >> 1;
      if (getter(mid) === obj) {
        while (mid > -1 && getter(mid - 1) === obj)
          mid--;
        return mid;
      }
      getter(mid) < obj ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // ../ptk/utils/sortedarray.ts
  var alphabetically = (a, b) => a > b ? 1 : a < b ? -1 : 0;
  var alphabetically0 = (a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
  var unique = (arr, sorted = false) => {
    if (!arr || !arr.length)
      return [];
    if (!sorted) {
      arr.sort(typeof arr[0] == "string" ? alphabetically : (a, b) => a - b);
    }
    let prev, out = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== prev)
        out.push(arr[i]);
      prev = arr[i];
    }
    return out;
  };
  var fromObj = (obj, cb) => {
    const arr = [];
    for (let key2 in obj) {
      if (!cb) {
        arr.push(key2 + "	" + obj[key2]);
      } else {
        if (typeof cb == "function") {
          arr.push(cb(key2, obj[key2]));
        } else {
          arr.push([key2, obj[key2]]);
        }
      }
    }
    if (cb && typeof cb !== "function") {
      arr.sort((a, b) => b[1] - a[1]);
    }
    return arr;
  };
  var sortNumberArray = (arr) => {
    const value_id = arr.map((v, idx2) => [v, idx2]);
    value_id.sort((a, b) => a[0] - b[0]);
    const indexes = value_id.map(([v, idx2]) => idx2);
    const newarr = value_id.map(([v, idx2]) => v);
    return [newarr, indexes];
  };

  // ../ptk/utils/array.ts
  var union = (arr1, arr2, hasdup = false) => {
    if (!arr2 || !arr1)
      return arr1 || arr2;
    let out = [];
    const extra = [];
    let a1 = hasdup ? unique(arr1) : arr1;
    let a2 = hasdup ? unique(arr2) : arr2;
    if (a1.length > a2.length) {
      const a = a2;
      a2 = a1;
      a1 = a;
    }
    for (let i = 0; i < a1.length; i++) {
      const at1 = bsearchNumber(a2, a1[i]);
      if (at1 == -1)
        extra.push(a1[i]);
    }
    return a2.concat(extra).sort();
  };
  var intersect = (arr1, arr2) => {
    const out = [];
    let j2 = 0;
    for (let i = 0; i < arr1.length; i++) {
      let v = arr1[i];
      while (j2 < arr2.length) {
        if (arr2[j2] >= v)
          break;
        j2++;
      }
      if (v == arr2[j2] && out[out.length - 1] !== v)
        out.push(v);
      if (j2 == arr2.length)
        break;
    }
    return out;
  };
  var intersects = (arr) => {
    if (!arr || !arr.length)
      return [];
    let out = arr.shift();
    while (arr.length) {
      out = intersect(out, arr.shift());
    }
    return out;
  };
  var similaritySet = (arr, basearr) => {
    const I = intersect(arr, basearr);
    const U = union(arr, basearr);
    return I.length / U.length;
  };

  // ../ptk/utils/unpackintarray.ts
  var maxlen2 = 113 * 113;
  var maxlen3 = 113 * 113 * 113;
  var CodeStart = 14;
  var BYTE_MAX = 113;
  var BYTE1_MAX = 45;
  var BYTE2_MAX = 44 * BYTE_MAX + BYTE1_MAX;
  var BYTE2_START = 45;
  var BYTE3_START = 89;
  var BYTE4_START = 105;
  var BYTE5_START = 112;
  var BYTE3_MAX = 16 * BYTE_MAX * BYTE_MAX + BYTE2_MAX;
  var BYTE4_MAX = 6 * BYTE_MAX * BYTE_MAX * BYTE_MAX + BYTE3_MAX;
  var BYTE5_MAX = 2 * BYTE_MAX * BYTE_MAX * BYTE_MAX * BYTE_MAX + BYTE4_MAX;
  var SEP2DITEM = 127;
  var SEPARATOR2D = "\x7F";
  var unpackInt = (s, delta = false) => {
    let arr = [];
    if (!s)
      return [];
    let o, i = 0, c2 = 0, prev = 0;
    while (i < s.length) {
      o = s.charCodeAt(i) - CodeStart;
      if (o < BYTE2_START) {
      } else if (o < BYTE3_START) {
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE2_START;
        o = o * BYTE_MAX + i1 + BYTE1_MAX;
      } else if (o < BYTE4_START) {
        const i2 = s.charCodeAt(++i) - CodeStart;
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE3_START;
        o = o * BYTE_MAX * BYTE_MAX + i2 * BYTE_MAX + i1 + BYTE2_MAX;
      } else if (o < BYTE5_START) {
        const i3 = s.charCodeAt(++i) - CodeStart;
        const i2 = s.charCodeAt(++i) - CodeStart;
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE4_START;
        o = o * BYTE_MAX * BYTE_MAX * BYTE_MAX + i3 * BYTE_MAX * BYTE_MAX + i2 * BYTE_MAX + i1 + BYTE3_MAX;
      } else if (o < SEP2DITEM) {
        const i4 = s.charCodeAt(++i) - CodeStart;
        const i3 = s.charCodeAt(++i) - CodeStart;
        const i2 = s.charCodeAt(++i) - CodeStart;
        const i1 = s.charCodeAt(++i) - CodeStart;
        o -= BYTE5_START;
        o = o * BYTE_MAX * BYTE_MAX * BYTE_MAX * BYTE_MAX + i4 * BYTE_MAX * BYTE_MAX * BYTE_MAX + i3 * BYTE_MAX * BYTE_MAX + i2 * BYTE_MAX + i1 + BYTE3_MAX;
      } else {
        throw new Error("exit max integer 0x7f," + o);
      }
      arr[c2] = o + (delta ? prev : 0) - 1;
      prev = arr[c2];
      c2++;
      i++;
    }
    return arr;
  };
  var unpackIntDelta = (str) => {
    return unpackInt(str, true);
  };
  var unpackIntDelta2d = (str) => {
    if (!str)
      return [];
    return unpack2d(str, true);
  };
  var unpack2d = (str, delta = false) => {
    if (!str)
      return [];
    const arr = str.split(SEPARATOR2D);
    if (arr.length == 1)
      return [unpackInt(arr[0])];
    return arr.map((it) => unpackInt(it, delta));
  };

  // ../ptk/utils/packintarray.ts
  var packInt2d = (arr, delta = false) => {
    const o = [];
    for (let i = 0; i < arr.length; i++) {
      o.push(packInt(arr[i], delta));
    }
    return o.join(SEPARATOR2D);
  };
  var packInt = (arr, delta = false) => {
    if (arr.length == 0)
      return "";
    const sz = arr.length * 5;
    let s = new Uint8Array(sz), int = arr[0] + 1, prev = arr[0], idx2 = 0;
    for (let i = 1; i <= arr.length; i++) {
      if (isNaN(int))
        new Error("not an integer at" + i);
      if (int < 0)
        new Error("negative value at" + i + " value" + int);
      if (int < BYTE1_MAX) {
        s[idx2++] = int + CodeStart;
      } else if (int < BYTE2_MAX) {
        int -= BYTE1_MAX;
        let i1, i2;
        i1 = int % BYTE_MAX;
        i2 = Math.floor(int / BYTE_MAX);
        s[idx2++] = i2 + BYTE2_START + CodeStart;
        s[idx2++] = i1 + CodeStart;
      } else if (int < BYTE3_MAX) {
        int -= BYTE2_MAX;
        let i1, i2, i3;
        i1 = int % BYTE_MAX;
        int = Math.floor(int / BYTE_MAX);
        i2 = int % BYTE_MAX;
        i3 = Math.floor(int / BYTE_MAX);
        s[idx2++] = i3 + BYTE3_START + CodeStart;
        s[idx2++] = i2 + CodeStart;
        s[idx2++] = i1 + CodeStart;
      } else if (int < BYTE4_MAX) {
        int -= BYTE3_MAX;
        let i1, i2, i3, i4;
        i1 = int % BYTE_MAX;
        int = Math.floor(int / BYTE_MAX);
        i2 = int % BYTE_MAX;
        int = Math.floor(int / BYTE_MAX);
        i3 = int % BYTE_MAX;
        i4 = Math.floor(int / BYTE_MAX);
        s[idx2++] = i4 + BYTE4_START + CodeStart;
        s[idx2++] = i3 + CodeStart;
        s[idx2++] = i2 + CodeStart;
        s[idx2++] = i1 + CodeStart;
      } else if (int < BYTE5_MAX) {
        int -= BYTE4_MAX;
        let i1, i2, i3, i4, i5;
        i1 = int % BYTE_MAX;
        int = Math.floor(int / BYTE_MAX);
        i2 = int % BYTE_MAX;
        int = Math.floor(int / BYTE_MAX);
        i3 = int % BYTE_MAX;
        int = Math.floor(int / BYTE_MAX);
        i4 = int % BYTE_MAX;
        i5 = Math.floor(int / BYTE_MAX);
        s[idx2++] = i5 + BYTE5_START + CodeStart;
        s[idx2++] = i4 + CodeStart;
        s[idx2++] = i3 + CodeStart;
        s[idx2++] = i2 + CodeStart;
        s[idx2++] = i1 + CodeStart;
      } else {
        throw new Error("exist max int boundary " + BYTE5_MAX + " i" + i + ",val:" + arr[i] + " int" + int);
      }
      int = (delta ? arr[i] - prev : arr[i]) + 1;
      prev = arr[i] || 0;
    }
    return new TextDecoder().decode(s.subarray(0, idx2));
  };
  var packIntDelta = (arr) => packInt(arr, true);
  var packIntDelta2d = (arr2d) => packInt2d(arr2d, true);

  // ../ptk/utils/packstr.ts
  var CodeStart2 = 14;
  var CodeEnd = 31;
  var MaxShared = CodeEnd - CodeStart2;
  var SEP = String.fromCharCode(CodeStart2);

  // ../ptk/utils/unicode.ts
  var substrUTF32 = (str, from, n) => {
    if (!str || !n || n < 0)
      return "";
    let i = from;
    while (n > 0 && i < str.length) {
      if (str.codePointAt(i) > 65535) {
        i++;
      }
      n--;
      i++;
    }
    return str.slice(from, i);
  };

  // ../ptk/utils/stringarray.ts
  var LEMMA_DELIMITER = "\x7F";
  var StringArray = class {
    constructor(buf, opts = {}) {
      this.buf = "";
      this.sep = "";
      this.charpos = [];
      this.middleCache = {};
      this.endCache = {};
      this.findMatches = (rawtext) => {
        let i = 0;
        const out = [];
        while (i < rawtext.length) {
          const tf = rawtext.slice(i);
          const m4 = this.match(tf);
          if (m4.length) {
            i += m4.length;
            out.push([i, m4[0]]);
          } else {
            i++;
          }
        }
        return out;
      };
      this.sequencial = opts.sequencial;
      this.delimiter = opts.delimiter || "";
      this.buf = buf;
      this.sep = opts.sep || "\n";
      this.now = 0;
      if (!this.sequencial)
        this.buildcharpos();
    }
    buildcharpos() {
      let prev = -1, p2 = 0;
      while (p2 < this.buf.length) {
        const at = this.buf.indexOf(this.sep, prev);
        if (at == -1) {
          this.charpos.push(this.buf.length);
          break;
        } else {
          this.charpos.push(at + 1);
          prev = at + 1;
        }
      }
    }
    len() {
      return this.charpos.length;
    }
    reset() {
      this.now = 0;
    }
    first() {
      this.reset();
      return this.next();
    }
    next() {
      if (this.now == -1)
        return;
      const at = this.buf.indexOf(this.sep, this.now);
      if (at == -1) {
        if (this.now >= 0) {
          const lastline = this.buf.slice(this.now);
          this.now = -1;
          return lastline;
        } else {
          this.now = -1;
          return;
        }
      }
      const s = this.buf.slice(this.now, at);
      this.now = at + 1;
      return s;
    }
    get(idx2) {
      if (this.sequencial)
        return null;
      if (idx2 == -1)
        return this.charpos.length.toString();
      const from = idx2 == 0 ? 0 : this.charpos[idx2 - 1];
      const to = this.charpos[idx2] - (idx2 == this.charpos.length - 1 ? 0 : 1);
      return this.buf.slice(from, to);
    }
    at(offset) {
      return bsearchNumber(this.charpos, offset);
    }
    find(pat) {
      const getter = this.get.bind(this);
      if (this.delimiter)
        pat += this.delimiter;
      const at = bsearchGetter(getter, pat);
      const found = getter(at);
      return found.endsWith(pat) ? at : -1;
    }
    enumMiddle(infix) {
      if (this.middleCache.hasOwnProperty(infix)) {
        return this.middleCache[infix];
      }
      let idx2 = this.buf.indexOf(infix);
      const out = [];
      while (idx2 > -1) {
        const at = this.at(idx2);
        const lp = at ? this.charpos[at - 1] : 0;
        const lp2 = this.charpos[at];
        if (idx2 > lp && idx2 < lp2 - 2) {
          out.push(at);
        }
        idx2 = this.buf.indexOf(infix, lp2 + this.sep.length);
      }
      this.middleCache[infix] = out;
      return out;
    }
    enumStart(prefix) {
      const getter = this.get.bind(this);
      let at = bsearchGetter(getter, prefix);
      if (at == -1)
        return [];
      const out = [];
      const len = this.len();
      while (at < len) {
        const found = this.get(at);
        if (found.startsWith(prefix))
          out.push(at);
        else
          break;
        at++;
      }
      return out;
    }
    enumEnd(suffix) {
      if (this.endCache.hasOwnProperty(suffix)) {
        console.log("cache");
        return this.endCache[suffix];
      }
      if (suffix[suffix.length - 1] !== this.sep)
        suffix = suffix + this.sep;
      let idx2 = this.buf.indexOf(suffix);
      const out = [];
      while (idx2 > -1 && this.buf.charAt(idx2 - 1) !== this.sep) {
        const at = this.at(idx2);
        out.push(at);
        idx2 = this.buf.indexOf(suffix, idx2 + this.sep.length);
      }
      this.endCache[suffix] = out;
      return out;
    }
    enumMode(s, mode = 0) {
      if (mode == 0)
        return this.enumStart(s);
      else if (mode == 1)
        return this.enumMiddle(s);
      else if (mode == 2)
        return this.enumEnd(s);
      return [];
    }
    match(text2) {
      const getter = this.get.bind(this);
      const at = bsearchGetter(getter, text2) - 1;
      const out = [];
      let upper = at - 1;
      if (text2.startsWith(this.get(at)))
        out.push(this.get(at));
      let lower = at + 1;
      while (upper > 0) {
        const found = this.get(upper);
        if (text2.startsWith(found))
          out.push(found);
        else if (text2.codePointAt(0) < 256 || text2[0] !== found[0])
          break;
        upper--;
      }
      while (lower < this.len()) {
        const found = this.get(lower);
        if (text2.startsWith(found))
          out.push(found);
        else if (text2.codePointAt(0) < 256 || text2[0] !== found[0])
          break;
        lower++;
      }
      out.sort((a, b) => b.length - a.length);
      return out;
    }
    getValue(key2) {
      const at = this.find(key2);
      return ~at ? this.get(at).slice(key2.length + this.delimiter.length) : "";
    }
  };

  // ../ptk/utils/cjk.ts
  var openBrackets = "(\u300C\u300E\u3014\uFF08\uFE39\uFE35\uFE37\u3010\uFE3B\u300A\u3008\uFE3D\uFE3F\uFE41\uFE43\uFE59\uFE5D\u2018\u201C\u301D";
  var closeBracketOf = (ch) => {
    if (!ch)
      return;
    const at = openBrackets.indexOf(ch.slice(0, 1));
    return ~at ? String.fromCodePoint(1 + (openBrackets.codePointAt(at) || 0)) : "";
  };
  var removeBracket = (str) => {
    const closebracket = closeBracketOf(str);
    if (closebracket && str.slice(str.length - 1) == closebracket) {
      return str.slice(1, str.length - 1);
    }
    return str;
  };

  // ../ptk/utils/misc.ts
  var lineBreaksOffset = (str) => {
    let i = 0, at = 0;
    const out = [];
    while (i < str.length) {
      const at2 = str.indexOf("\n", i);
      if (at2 == -1)
        break;
      out.push(at2);
      i = at2 + 1;
    }
    return out;
  };
  function debounce(f, ms) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(f.bind(this, ...args), ms);
    };
  }

  // ../ptk/utils/loadscript.ts
  var parseJsonp = (str) => {
    const start = str.indexOf("{");
    const end = str.indexOf("},`") + 1;
    let payload = str.substring(end + 2, str.length - 2);
    if (payload.indexOf("\\\\") > -1)
      payload = payload.replace(/\\\\/g, "\\");
    if (payload.indexOf("\\`") > -1)
      payload = payload.replace(/\\`/g, "`");
    if (payload.indexOf("$\\{") > -1)
      payload = payload.replace(/\$\\\{/g, "${");
    return [JSON.parse(str.substring(start, end)), payload];
  };
  var loadScript = async (src, cb) => {
    if (cb && cb()) {
      return true;
    }
    if (src.slice(0, 2) == "./")
      src = src.slice(2);
    const css = src.endsWith(".css");
    const children2 = document.head.children;
    for (let i = 0; i < children2.length; i++) {
      const ele = children2[i];
      if (css && ele.tagName == "LINK" && ele.href.endsWith("/" + src)) {
        if (i < children2.length - 1) {
          document.head.removeChild(ele);
          document.head.appendChild(ele);
        }
        return true;
      } else if (ele.tagName == "SCRIPT" && ele.src.endsWith("/" + src))
        return true;
    }
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement(css ? "link" : "script");
      script.type = css ? "text/css" : "text/javascript";
      if (css) {
        script.rel = "stylesheet";
        script.href = src;
      } else {
        script.src = src;
      }
      script.onerror = reject;
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
    return promise;
  };

  // ../ptk/utils/bopomofo.ts
  var consonants = "b,p,m,f,d,t,n,l,g,k,h,j,q,x,zh,ch,sh,r,z,c,s".split(",");
  var vowels = "a,o,e,e,ai,ei,ao,ou,an,en,ang,eng,er,i,u,v".split(",");

  // ../ptk/offtext/parser.ts
  var parseCompactAttr = (str) => {
    const out = {}, arr = str.split(/([@#~])/);
    while (arr.length) {
      let v = arr.shift();
      if (v === "~")
        out["~"] = arr.shift();
      else if (v === "@")
        out["@"] = arr.shift();
      else if (v === "#") {
        v = arr.shift();
        const m4 = v.match(OFFTAG_COMPACT_ID);
        if (m4)
          out.id = m4[1];
      } else {
        out.id = v;
      }
    }
    return out;
  };
  var parseAttributes = (rawAttrs, compactAttr) => {
    let quotes = [];
    const getqstr = (str, withq) => str.replace(QUOTEPAT, (m4, qc) => {
      return (withq ? '"' : "") + quotes[parseInt(qc)] + (withq ? '"' : "");
    });
    let rawattr = rawAttrs ? rawAttrs.slice(1, rawAttrs.length - 1).replace(QSTRING_REGEX_G, (m4, m1) => {
      quotes.push(m1);
      return QUOTEPREFIX + (quotes.length - 1);
    }) : "";
    const attrarr = rawattr.split(/( +)/), attrs = {};
    let i = 0;
    if (compactAttr)
      Object.assign(attrs, parseCompactAttr(compactAttr));
    while (attrarr.length) {
      const it = attrarr.shift();
      let eq = -1, key2 = "";
      if (it[0] == "~" || it[0] == "#" || it[0] == "@") {
        key2 = it[0];
        if (key2 == "#")
          key2 = "id";
        eq = it[1] == "=" ? 1 : 0;
      } else {
        eq = it.indexOf("=");
        if (eq > 0)
          key2 = it.slice(0, eq);
      }
      if (eq > -1) {
        attrs[key2] = getqstr(it.slice(eq + 1));
        if (attrarr.length && !attrarr[0].trim())
          attrarr.shift();
      } else {
        if (it)
          attrs[it] = true;
      }
      i++;
    }
    return attrs;
  };
  var parseOfftag = (raw, rawAttrs) => {
    if (raw[0] == OFFTAG_LEADBYTE)
      raw = raw.slice(1);
    if (!rawAttrs) {
      const at = raw.indexOf("<");
      if (at > 0) {
        rawAttrs = raw.slice(at);
        raw = raw.slice(0, at);
      }
    }
    const o = raw.match(OFFTAG_NAME_ATTR);
    if (!o) {
      console.log("\ninvalid tag, raw", raw, "attr", rawAttrs);
      return [raw, {}];
    } else {
      let [m22, tagName, compactAttr] = o;
      let attrs = parseAttributes(rawAttrs, compactAttr);
      return [tagName, attrs];
    }
  };
  var resolveEnd = (raw, plain, tags) => {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      let j2 = i;
      if (tag.end > tag.start && !tag.width) {
        while (j2 < tags.length && tag.end > tags[j2].start)
          j2++;
        if (j2 < tags.length && tags[j2].start > tag.end || j2 == tags.length)
          j2--;
        const closest = j2 < tags.length ? tags[j2] : tag;
        tag.width = tag.end - closest.start;
        tag.width += closest.choff - tag.choff;
      }
    }
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      if (tag.width && tag.end == tag.start) {
        tag.width = substrUTF32(plain, tag.choff, tag.width).length;
        let j2 = i + 1;
        while (j2 < tags.length && tag.choff + tag.width > tags[j2].choff)
          j2++;
        if (j2 < tags.length && tags[j2].choff > tag.choff + tag.width || j2 == tags.length)
          j2--;
        const closest = j2 < tags.length ? tags[j2] : tag;
        if (closest === tag) {
          tag.end += tag.width;
        } else {
          tag.end = closest.start + (tag.choff + tag.width - closest.choff);
        }
      }
    }
  };
  var parseOfftext = (str, line = 0) => {
    if (str.indexOf("^") == -1)
      return [str, []];
    let tags = [];
    let choff = 0, prevoff = 0;
    let text2 = str.replace(OFFTAG_REGEX_G, (m4, rawName, rawAttrs, offset) => {
      if (!rawName) {
        console.log(str);
      }
      let [tagName, attrs] = parseOfftag(rawName, rawAttrs);
      let width = 0;
      let start = offset + m4.length, end = start;
      let endch = attrs["~"];
      if (endch) {
        if (isNaN(parseInt(endch))) {
          width = 0;
          let repeat = 0;
          const m5 = endch.match(/\+(\d+)$/);
          if (m5) {
            endch = endch.slice(0, endch.length - m5.length);
            repeat = parseInt(m5[1]);
          }
          let at = str.indexOf(endch, start);
          while (~at && repeat) {
            at = str.indexOf(endch, at + 1);
            repeat--;
          }
          if (~at) {
            end = at + endch.length;
            delete attrs["~"];
          }
        } else {
          width = parseInt(endch);
        }
      } else {
        const closebracket = closeBracketOf(str.charAt(start));
        if (closebracket) {
          const at = str.indexOf(closebracket, start + 1);
          if (~at)
            end = at + closebracket.length;
        }
      }
      const aoffset = offset + rawName.length + 1;
      choff += offset - prevoff;
      let offtag = {
        name: tagName,
        offset,
        aoffset,
        attrs,
        line,
        choff,
        width,
        start,
        end,
        active: false
      };
      tags.push(offtag);
      choff -= m4.length;
      prevoff = offset;
      return "";
    });
    resolveEnd(str, text2, tags);
    return [text2, tags];
  };
  var updateOfftext = (rawtext, tag, newtag) => {
    for (let n in newtag.attrs) {
      if (newtag.attrs[n] != tag.attrs[n]) {
        let newvalue = typeof newtag.attrs[n] !== "string" ? JSON.stringify(newtag.attrs[n]) : newtag.attrs[n];
        if (newvalue.indexOf(" ") > 0) {
          newvalue = '"' + newvalue + '"';
        }
        const regex = new RegExp("\\b" + n + ' *= *"?' + tag.attrs[n] + '"?');
        rawtext = rawtext.replace(regex, n + "=" + newvalue);
      }
    }
    return rawtext;
  };
  var Offtext = class {
    constructor(raw, line = 0) {
      this.raw = raw;
      [this.plain, this.tags] = parseOfftext(raw, line);
    }
    getTag(ntag) {
      return this.tags[ntag];
    }
    tagText(tag, raw = false) {
      if (typeof tag == "number")
        tag = this.tags[tag];
      if (!tag)
        return;
      return raw ? this.raw.slice(tag.start, tag.end) : this.plain.slice(tag.choff, tag.choff + tag.width);
    }
    tagRawText(tag) {
      return this.tagText(tag, true);
    }
  };

  // ../ptk/fts/constants.ts
  var Word_tailspace_Reg = /([\dA-Za-z\u1000-\u1049\u0900-\u0963\u96f\u00c0-\u02af\u1e00-\u1faf]+ ?)/g;
  var MAXPHRASELEN = 16;
  var EXCERPT_PAGESIZE = 5;

  // ../ptk/fts/tokenize.ts
  function Token(text2, choff, tkoff, type) {
    return { text: text2, choff, tkoff, type };
  }
  var tokenize = (text2) => {
    const out = [];
    let i = 0, tkoff = 0;
    if (typeof text2 !== "string")
      return [];
    while (i < text2.length) {
      let code = text2.codePointAt(i) || 0;
      if (code > 65535) {
        const sur = String.fromCodePoint(code);
        out.push(Token(sur, i, tkoff, 50 /* CJK_SURROGATE */));
        tkoff++;
        i += 2;
        continue;
      } else if (code >= 8192 && code <= 65535) {
        const tt = code >= 2e80 && code <= 12287 || code >= 12353 && code <= 40959 || code >= 54272 && code < 57343 || code >= 57344 && code < 64223 ? 49 /* CJK_BMP */ : 1 /* UNSEARCHABLE */;
        out.push(Token(text2[i], i, tkoff, tt));
        if (tt !== 1 /* UNSEARCHABLE */)
          tkoff++;
        i++;
        continue;
      }
      let s = "", prev = 0;
      let j2 = i;
      while (j2 < text2.length && code < 8192) {
        s += text2[j2];
        code = text2.codePointAt(++j2) || 0;
      }
      s.replace(Word_tailspace_Reg, (m4, m1, offset) => {
        if (offset > prev) {
          out.push(Token(s.substring(prev, offset), prev + i, tkoff, 1 /* UNSEARCHABLE */));
        }
        while (s[offset] == " ")
          offset++;
        out.push(Token(m1, i + offset, tkoff, 32 /* ROMANIZE */));
        tkoff++;
        prev = offset + m4.length;
        return "";
      });
      if (prev < s.length)
        out.push(Token(s.substring(prev), prev + i, tkoff, 1 /* UNSEARCHABLE */));
      i = j2;
    }
    return out;
  };

  // ../ptk/fts/criteria.ts
  var parseCriteria = (cstr) => {
    const query = [];
    const criteria = cstr.split(";");
    for (let i = 0; i < criteria.length; i++) {
      const [name2, tofind2] = criteria[i].split("=");
      query.push({ name: name2, tofind: tofind2 });
    }
    return query;
  };

  // ../lossless-simplified-chinese/sc-tc-map.js
  var sc2tc = `\u3454\u346F
\u3447\u3473
\u3439\u3476
\u523E\u34E8
\u360E\u361A
\u36AF\u3704
\u36E3\u370F
\u37C6\u380F
\u3918\u396E
\u3A2B\u3A5C
\u39D0\u3A73
\u64DC\u3A75
\u3EEA\u3EFD
\u4025\u407B
\u9FCE\u40EE
\u4336\u42B7
\u433A\u42D9
\u433B\u42DA
\u433F\u42F9
\u433E\u42FB
\u43AC\u43B1
\u464C\u4661
\u4727\u4700
\u478D\u477C
\u4982\u4947
\u9FCF\u4951
\u497E\u4971
\u49B6\u499B
\u49B7\u499F
\u4BC5\u4BC0
\u9C83\u4C3E
\u4CA3\u4C77
\u4C9D\u4C7D
\u9CDA\u4C81
\u9CE4\u4C98
\u9E6E\u4D09
\u4E22\u4E1F
\u5E76<\u4F75\u4E26
\u5E72<\u5E79>\u4E7E
\u4E71\u4E82
\u4E9A\u4E9E
\u4F2B\u4F47
\u6765\u4F86
\u4ED1\u4F96
\u4FA3\u4FB6
\u4FE3\u4FC1
\u7CFB<\u7E6B\u4FC2
\u4F23\u4FD4
\u4FA0\u4FE0
\u4F21\u4FE5
\u4F25\u5000
\u4FE9\u5006
\u4FEB\u5008
\u4ED3\u5009
\u4E2A\u500B
\u4EEC\u5011
\u4F26\u502B
\u3448\u5032
\u4F1F\u5049
\u343D\u5051
\u4FA7\u5074
\u4FA6\u5075
\u4F2A\u50DE\u507D
\u3437\u508C
\u6770<\u5091
\u4F27\u5096
\u4F1E\u5098
\u5907\u5099
\u4F63<\u50AD
\u506C\u50AF
\u4F20\u50B3
\u4F1B\u50B4
\u503A\u50B5
\u4F24\u50B7
\u503E\u50BE
\u507B\u50C2
\u4EC5\u50C5
\u4F65\u50C9
\u4FA8\u50D1
\u4EC6<\u50D5
\u4FA5\u50E5
\u507E\u50E8
\u4EF7<\u50F9
\u4EEA\u5100
\u347A\u5101
\u4FAC\u5102
\u4EBF\u5104
\u4FA9\u5108
\u4FED\u5109
\u50A7\u5110
\u4FE6\u5114
\u4FAA\u5115
\u5C3D\u76E1\u5118
\u507F\u511F
\u4F18<\u512A
\u50A8\u5132
\u4FEA\u5137
\u3469\u5138
\u50A9\u513A
\u50A5\u513B
\u4FE8\u513C
\u5151\u514C
\u513F<\u5152
\u5156\u5157
\u5185\u5167
\u4E24\u5169
\u518C\u518A
\u5E42\u51AA
\u51C0\u51C8
\u51BB\u51CD
\u51DB\u51DC
\u51EF\u51F1
\u522B\u5225
\u5220\u522A
\u522D\u5244
\u5219\u5247
\u514B<\u524B
\u5239\u524E
\u522C\u5257
\u521A\u525B
\u5265\u525D
\u5250\u526E
\u5240\u5274
\u521B\u5275
\u5212<\u5283
\u5267\u5287
\u5218\u5289
\u523D\u528A
\u523F\u528C
\u5251\u528D
\u34E5\u528F
\u5242\u5291
\u3509\u529A
\u52B2\u52C1
\u52A8\u52D5
\u52A1\u52D9
\u52CB\u52DB
\u80DC<\u52DD
\u52B3\u52DE
\u52BF\u52E2
\u52DA\u52E9
\u52A2\u52F1
\u52B1\u52F5
\u529D\u52F8
\u5300\u52FB
\u5326\u532D
\u6C47\u5F59\u532F
\u532E\u5331
\u533A\u5340
\u534F\u5354
\u5374\u537B
\u538D\u5399
\u538C\u53AD
\u5389\u53B2
\u53A3\u53B4
\u53C2\u53C3
\u53C1\u53C4
\u4E1B\u53E2
\u54A4>\u5412
\u5434\u5433
\u5450\u5436
\u5415\u5442
\u5459\u54BC
\u5458\u54E1
\u5457\u5504
\u5423\u551A
\u95EE\u554F
\u54D1\u555E
\u542F\u555F
\u5521\u5562
\u359E\u558E
\u5524\u559A
\u4E27\u55AA
\u4E54\u55AC
\u5355\u55AE
\u54DF\u55B2
\u545B\u55C6
\u556C\u55C7
\u551D\u55CA
\u5417\u55CE
\u545C\u55DA
\u5522\u55E9
\u54D4\u55F6
\u53F9\u5606
\u55BD\u560D
\u556F\u5613
\u5455\u5614
\u5567\u5616
\u5C1D\u5617
\u551B\u561C
\u54D7\u5629
\u5520\u562E
\u5578\u562F
\u53FD\u5630
\u54D3\u5635
\u5452\u5638
\u5574\u563D
\u5618\u5653
\u358A\u565A
\u549D\u565D
\u54D2\u5660
\u54DD\u5665
\u54D5\u5666
\u55F3\u566F
\u54D9\u5672
\u55B7\u5674
\u5428<\u5678
\u5F53\u7576\u5679
\u549B\u5680
\u5413\u5687
\u54DC\u568C
\u565C\u5695
\u556E\u5699
\u5456\u56A6
\u5499\u56A8
\u4EB8\u56B2
\u55BE\u56B3
\u4E25\u56B4
\u5624\u56B6
\u556D\u56C0
\u55EB\u56C1
\u56A3\u56C2
\u5181\u56C5
\u5453\u56C8
\u5570\u56C9
\u5631\u56D1
\u56F1\u56EA
\u56F5\u5707
\u56FD\u570B
\u56F4\u570D
\u56ED\u5712
\u5706\u5713
\u56FE\u5716
\u56E2\u5718
\u57EF\u57B5
\u57AD\u57E1
\u91C7<\u63A1\u57F0
\u6267\u57F7
\u575A\u5805
\u57A9\u580A
\u57B4\u5816
\u57DA\u581D
\u5C27\u582F
\u62A5\u5831
\u573A\u5834
\u5757\u584A
\u8314\u584B
\u57B2\u584F
\u57D8\u5852
\u6D82<\u5857
\u575E\u5862
\u57D9\u5864
\u5C18\u5875
\u5811\u5879
\u57AB\u588A
\u5760\u589C
\u5815\u58AE
\u575F\u58B3
\u57AF\u58B6
\u57A6\u58BE
\u575B\u7F48\u58C7
\u57B1\u58CB
\u538B\u58D3
\u5792\u58D8
\u5739\u58D9
\u5786\u58DA
\u574F<\u58DE
\u5784\u58DF
\u5785\u58E0
\u575C\u58E2
\u575D\u58E9
\u5846\u58EA
\u58EE\u58EF
\u58F6\u58FA
\u58F8\u58FC
\u5BFF\u58FD
\u591F\u5920
\u68A6\u5922
\u5939\u593E
\u5942\u5950
\u5965\u5967
\u5941\u5969
\u593A\u596A
\u5968\u596C
\u594B\u596E
\u59F9\u597C
\u5986\u599D
\u59D7\u59CD
\u5978<\u59E6
\u5A31\u5A1B
\u5A04\u5A41
\u5987\u5A66
\u5A05\u5A6D
\u5A32\u5AA7
\u59AB\u5AAF
\u36C0\u5AB0
\u5AAA\u5ABC
\u5988\u5ABD
\u59AA\u5AD7
\u59A9\u5AF5
\u5A34\u5AFB
\u5A73\u5AFF
\u5AAD\u5B03
\u5A06\u5B08
\u5A75\u5B0B
\u5A07\u5B0C
\u5AF1\u5B19
\u5AD2\u5B21
\u5B37\u5B24
\u5AD4\u5B2A
\u5A74\u5B30
\u5A76\u5B38
\u36E4\u5B4B
\u5A08\u5B4C
\u5B59\u5B6B
\u5B66\u5B78
\u5B6A\u5B7F
\u5BAB\u5BAE
\u5BDD\u5BE2
\u5B9E\u5BE6
\u5B81<\u5BE7
\u5BA1\u5BE9
\u5199\u5BEB
\u5BBD\u5BEC
\u3766\u5BEF
\u5BA0\u5BF5
\u5B9D\u5BF6
\u5C06\u5C07
\u4E13\u5C08
\u5BFB\u5C0B
\u5BF9\u5C0D
\u5BFC\u5C0E
\u5C34\u5C37
\u5C4A\u5C46
\u5C38<\u5C4D
\u5C43\u5C53
\u5C49\u5C5C
\u5C61\u5C62
\u5C42\u5C64
\u5C66\u5C68
\u5C5E\u5C6C
\u5188\u5CA1
\u5C98\u5CF4
\u5C9B\u5CF6
\u5CE1\u5CFD
\u5D03\u5D0D
\u5C97\u5D17
\u5CE5\u5D22
\u5CBD\u5D2C
\u5C9A\u5D50
\u37E5\u5D7E
\u5D5D\u5D81
\u5D2D\u5D84
\u5C96\u5D87
\u5D5A\u5D94
\u5D02\u5D97
\u5CE4\u5DA0
\u5CE3\u5DA2
\u5CC4\u5DA7
\u5D04\u5DAE
\u5C99\u5DB4
\u5D58\u5DB8
\u5CAD<\u5DBA
\u5C7F\u5DBC
\u5CBF\u5DCB
\u5CE6\u5DD2
\u5DC5\u5DD4
\u5DEF\u5DF0
\u5E05\u5E25
\u5E08\u5E2B
\u5E10\u5E33
\u5E26\u5E36
\u5E27\u5E40
\u5E0F\u5E43
\u384E\u5E53
\u5E3C\u5E57
\u5E3B\u5E58
\u5E1C\u5E5F
\u5E01\u5E63
\u5E2E\u5E6B
\u5E31\u5E6C
\u4E48<\u9EBC>\u5E7A>\u9EBD
\u51E0<\u5E7E
\u5E93\u5EAB
\u5395\u5EC1
\u53A2\u5EC2
\u53A9\u5EC4
\u53A6\u5EC8
\u53A8\u5EDA
\u53AE\u5EDD
\u5E99\u5EDF
\u5382<\u5EE0
\u5E91\u5EE1
\u5E9F\u5EE2
\u5E7F\u5EE3
\u5EEA\u5EE9
\u5E90\u5EEC
\u5385\u5EF3
\u5F11\u5F12
\u5F2A\u5F33
\u5F20\u5F35
\u5F3A\u5F37
\u5F39\u5F48
\u5F25\u5F4C
\u5F2F\u5F4E
\u5F5D<\u5F5E
\u5F5F\u5F60
\u5F66\u5F65
\u5F68\u5F72
\u540E<>\u5F8C
\u5F84\u5F91
\u4ECE\u5F9E
\u5F95\u5FA0
\u590D<\u8907\u5FA9>\u8986
\u5F81<>\u5FB5
\u5F7B\u5FB9
\u6052\u6046
\u803B\u6065
\u60A6\u6085
\u60AE\u609E
\u6005\u60B5
\u95F7\u60B6
\u6076\u60E1
\u607C\u60F1
\u607D\u60F2
\u607B\u60FB
\u7231\u611B
\u60EC\u611C
\u60AB\u6128
\u6006\u6134
\u607A\u6137
\u5FFE\u613E
\u6817<\u6144
\u6001\u614B
\u6120\u614D
\u60E8\u6158
\u60ED\u615A
\u6078\u615F
\u60EF\u6163
\u6004\u616A
\u6002\u616B
\u8651\u616E
\u60AD\u6173
\u5E86\u6176
\u396A\u617A
\u5FE7\u6182
\u60EB\u618A
\u392D\u618D
\u601C<\u6190
\u51ED\u6191
\u6126\u6192
\u616D\u6196
\u60EE\u619A
\u6124\u61A4
\u60AF\u61AB
\u6003\u61AE
\u5BAA\u61B2
\u5FC6\u61B6
\u6073\u61C7
\u5E94\u61C9
\u603F\u61CC
\u61D4\u61CD
\u603C\u61DF
\u61D1\u61E3
\u393D\u61E4
\u3916\u61E7
\u6079\u61E8
\u60E9\u61F2
\u61D2\u61F6
\u6000<\u61F7
\u60AC\u61F8
\u5FCF<\u61FA
\u60E7\u61FC
\u6151\u61FE
\u604B\u6200
\u6206\u6207
\u620B\u6214
\u6217\u6227
\u622C\u6229
\u6218\u6230
\u622F\u6231
\u620F\u6232
\u6237\u6236
\u629B\u62CB
\u635D\u6329
\u631F\u633E
\u820D<\u6368
\u626A\u636B
\u626B\u6383
\u62A1\u6384
\u39CF\u6386
\u631C\u6397
\u6323\u6399
\u6302<\u639B
\u62E3\u63C0
\u626C\u63DA
\u6362\u63DB
\u6325\u63EE
\u635F\u640D
\u6447\u6416
\u6363\u6417
\u63FE\u6435
\u62A2\u6436
\u63B4\u6451
\u63BC\u645C
\u6402\u645F
\u631A\u646F
\u62A0\u6473
\u629F\u6476
\u63BA\u647B
\u635E\u6488
\u6326\u648F
\u6491\u6490
\u6320\u6493
\u39D1\u649D
\u6322\u649F
\u63B8\u64A3
\u62E8\u64A5
\u629A\u64AB
\u6251<\u64B2
\u63FF\u64B3
\u631E\u64BB
\u631D\u64BE
\u6361\u64BF
\u62E5\u64C1
\u63B3\u64C4
\u62E9\u64C7
\u51FB\u64CA
\u6321\u64CB
\u39DF\u64D3
\u62C5\u64D4
\u636E<\u64DA
\u6324\u64E0
\u39DB\u64E5
\u62DF\u64EC
\u6448\u64EF
\u62E7\u64F0
\u6401\u64F1
\u63B7\u64F2
\u6269\u64F4
\u64B7\u64F7
\u6446\u64FA
\u64DE\u64FB
\u64B8\u64FC
\u39F0\u64FD
\u6270<\u64FE
\u6445\u6504
\u64B5\u6506
\u62E2\u650F
\u62E6\u6514
\u6484\u6516
\u6400\u6519
\u64BA\u651B
\u643A\u651C
\u6444\u651D
\u6512\u6522
\u631B\u6523
\u644A\u6524
\u6405\u652A
\u63FD\u652C
\u8D25\u6557
\u53D9\u6558
\u654C\u6575
\u6570\u6578
\u655B\u6582
\u6BD9\u6583
\u6569\u6586
\u6593\u6595
\u65A9\u65AC
\u65AD\u65B7
\u4E8E<>\u65BC
\u65F6\u6642
\u664B\u6649
\u663C\u665D
\u6655\u6688
\u6656\u6689
\u65F8\u6698
\u7545\u66A2
\u6682\u66AB
\u6654\u66C4
\u5386\u6B77\u66C6
\u6619\u66C7
\u6653\u66C9
\u5411<\u66CF
\u66A7\u66D6
\u65F7\u66E0
\u663D\u66E8
\u6652<\u66EC
\u4E66\u66F8
\u4F1A\u6703
\u80E7\u6727
\u4E1C\u6771
\u6805\u67F5
\u6746<\u687F
\u6800\u6894
\u67A7\u6898
\u6761\u689D
\u67AD\u689F
\u68C1\u68B2
\u5F03\u68C4
\u67A8\u68D6
\u67A3\u68D7
\u680B\u68DF
\u3B4E\u68E1
\u6808\u68E7
\u6816<\u68F2
\u68BE\u68F6
\u6860\u690F
\u3B4F\u6932
\u6768\u694A
\u67AB\u6953
\u6862\u6968
\u4E1A\u696D
\u6781<\u6975
\u6769\u69AA
\u8363\u69AE
\u6985\u69B2
\u6864\u69BF
\u6784<\u69CB
\u67AA\u69CD
\u68BF\u69E4
\u6920\u69E7
\u6901\u69E8
\u692E\u69EE
\u6868\u69F3
\u6922\u69F6
\u691D\u69FC
\u6869\u6A01
\u4E50\u6A02
\u679E\u6A05
\u697C\u6A13
\u6807\u6A19
\u67A2\u6A1E
\u3B64\u6A22
\u6837\u6A23
\u3B74\u6A2B
\u686A\u6A33
\u6734<\u6A38
\u6811\u6A39
\u6866\u6A3A
\u692B\u6A3F
\u6861\u6A48
\u6865\u6A4B
\u673A<\u6A5F
\u692D\u6A62
\u6A2A\u6A6B
\u6AA9\u6A81
\u67FD\u6A89
\u6863\u6A94
\u6867\u6A9C
\u69DA\u6A9F
\u68C0\u6AA2
\u6A2F\u6AA3
\u68BC\u6AAE
\u53F0<\u98B1\u81FA\u6AAF
\u69DF\u6AB3
\u67E0\u6AB8
\u69DB\u6ABB
\u67DC<\u6AC3
\u6A79\u6AD3
\u6988\u6ADA
\u6809\u6ADB
\u691F\u6ADD
\u6A7C\u6ADE
\u680E\u6ADF
\u6A71\u6AE5
\u69E0\u6AE7
\u680C\u6AE8
\u67A5\u6AEA
\u6A65\u6AEB
\u6987\u6AEC
\u8616\u6AF1
\u680A\u6AF3
\u6989\u6AF8
\u6A31\u6AFB
\u680F\u6B04
\u6743\u6B0A
\u6924\u6B0F
\u683E\u6B12
\u6984\u6B16
\u68C2\u6B1E
\u94A6\u6B3D
\u6B27\u6B50
\u6B24\u6B5F
\u6B22\u6B61
\u5C81\u6B72
\u5F52\u6B78
\u6B81\u6B7F
\u6B8B\u6B98
\u6B92\u6B9E
\u6B87\u6BA4
\u3C6E\u6BA8
\u6B9A\u6BAB
\u6B93\u6BAE
\u6BA1\u6BAF
\u3C69\u6BB0
\u6B7C\u6BB2
\u6740\u6BBA
\u58F3\u6BBC
\u6BC1\u6BC0
\u6BB4\u6BC6
\u6BF5\u6BFF
\u7266\u6C02
\u6BE1\u6C08
\u6C07\u6C0C
\u6C14<\u6C23
\u6C22\u6C2B
\u6C29\u6C2C
\u6C32\u6C33
\u51B3\u6C7A
\u6CA1\u6C92
\u51B2\u885D\u6C96
\u51B5\u6CC1
\u6C79\u6D36
\u6D43\u6D79
\u6CFE\u6D87
\u51C9\u6DBC
\u6CEA\u6DDA
\u6E0C\u6DE5
\u6CA6\u6DEA
\u6E0A\u6DF5
\u6D9E\u6DF6
\u6D45\u6DFA
\u6DA3\u6E19
\u51CF\u6E1B
\u6CA8\u6E22
\u6DA1\u6E26
\u6D4B\u6E2C
\u6D51\u6E3E
\u51D1\u6E4A
\u6D48\u6E5E
\u6C64\u6E6F
\u6CA9\u6E88
\u51C6<\u6E96
\u6C9F\u6E9D
\u6E29\u6EAB
\u6D49\u6EAE
\u6DA2\u6EB3
\u6CA7\u6EC4
\u706D\u6EC5
\u6DA4\u6ECC
\u8365\u6ECE
\u6CAA\u6EEC
\u6EDE\u6EEF
\u6E17\u6EF2
\u6D52\u6EF8
\u6D50\u6EFB
\u6EDA\u6EFE
\u6EE1\u6EFF
\u6E14\u6F01
\u6E87\u6F0A
\u6CA4\u6F1A
\u6C49\u6F22
\u6D9F\u6F23
\u6E0D\u6F2C
\u6DA8\u6F32
\u6E86\u6F35
\u6E10\u6F38
\u6D46\u6F3F
\u988D\u6F41
\u6CFC\u6F51
\u6D01<\u6F54
\u3D0B\u6F5A
\u6F5C\u6F5B
\u6DA6\u6F64
\u6D54\u6F6F
\u6E83\u6F70
\u6ED7\u6F77
\u6DA0\u6F7F
\u6DA9\u6F80
\u6D47\u6F86
\u6D9D\u6F87
\u6DA7\u6F97
\u6E11\u6FA0
\u6CFD\u6FA4
\u6EEA\u6FA6
\u6CF6\u6FA9
\u6D4D\u6FAE
\u6DC0<\u6FB1
\u3CE0\u6FBE
\u6D4A\u6FC1
\u6D53\u6FC3
\u3CE1\u6FC4
\u6E7F\u6FD5
\u6CDE<\u6FD8
\u6E81\u6FDA
\u6D55\u6FDC
\u6D4E\u6FDF
\u6D9B\u6FE4
\u3CD4\u6FE7
\u6EE5\u6FEB
\u6F4D\u6FF0
\u6EE8\u6FF1
\u6E85\u6FFA
\u6CFA\u6FFC
\u6EE4\u6FFE
\u6F9B\u7002
\u6EE2\u7005
\u6E0E\u7006
\u3CBF\u7007
\u6CFB\u7009
\u6C88<\u700B
\u6D4F\u700F
\u6FD2\u7015
\u6CF8\u7018
\u6CA5\u701D
\u6F47\u701F
\u6F46\u7020
\u6F74\u7026
\u6CF7\u7027
\u6FD1\u7028
\u3CFD\u7030
\u6F4B\u7032
\u6F9C\u703E
\u6CA3\u7043
\u6EE0\u7044
\u6D12<\u7051
\u6F13<\u7055
\u6EE9\u7058
\u704F\u705D
\u6F24\u7060
\u3CD5\u7061
\u6E7E\u7063
\u6EE6\u7064
\u6EDF\u7067
\u707E\u707D
\u4E3A\u70BA
\u4E4C\u70CF
\u70C3\u70F4
\u65E0\u7121
\u70BC\u7149
\u709C\u7152
\u70DF\u7159
\u8315\u7162
\u7115\u7165
\u70E6\u7169
\u7080\u716C
\u3DBD\u7171
\u7174\u7185
\u8367\u7192
\u709D\u7197
\u70ED\u71B1
\u988E\u71B2
\u70BD\u71BE
\u70E8\u71C1
\u706F\u71C8
\u70E7\u71D2
\u70EB\u71D9
\u7116\u71DC
\u8425\u71DF
\u707F\u71E6
\u70DB\u71ED
\u70E9\u71F4
\u3DB6\u71F6
\u70EC\u71FC
\u7118\u71FE
\u70C1\u720D
\u7089\u7210
\u70C2\u721B
\u4E89\u722D
\u7237\u723A
\u5C14\u723E
\u5899\u7246
\u724D\u7258
\u7275\u727D
\u8366\u7296
\u728A\u72A2
\u727A\u72A7
\u72B6\u72C0
\u72ED\u72F9
\u72C8\u72FD
\u72F0\u7319
\u72B9\u7336
\u72F2\u733B
\u72B8\u7341
\u72F1\u7344
\u72EE\u7345
\u5956\u734E
\u72EC\u7368
\u72EF\u736A
\u7303\u736B
\u72DD\u736E
\u72DE\u7370
\u3E8D\u7371
\u83B7\u7A6B\u7372
\u730E\u7375
\u72B7\u7377
\u517D\u7378
\u736D\u737A
\u732E\u737B
\u7315\u737C
\u7321\u7380
\u73B0\u73FE
\u73D0\u743A
\u73F2\u743F
\u73AE\u744B
\u739A\u7452
\u7410\u7463
\u7476\u7464
\u83B9\u7469
\u739B\u746A
\u73B1\u7472
\u740F\u7489
\u740E\u74A1
\u7391\u74A3
\u7477\u74A6
\u73F0\u74AB
\u3EC5\u74AF
\u73AF\u74B0
\u7399\u74B5
\u7478\u74B8
\u73BA\u74BD
\u743C\u74CA
\u73D1\u74CF
\u748E\u74D4
\u74D2\u74DA
\u74EF\u750C
\u4EA7\u7522
\u4EA9\u755D
\u6BD5\u7562
\u753B\u756B
\u5F02<\u7570
\u7574\u7587
\u53E0\u758A
\u75C9\u75D9
\u75B4\u75FE
\u75D6\u7602
\u75AF\u760B
\u75A1\u760D
\u75EA\u7613
\u7617\u761E
\u75AE\u7621
\u759F\u7627
\u7606\u762E
\u75AD\u7632
\u7618\u763A
\u7597\u7642
\u75E8\u7646
\u75EB\u7647
\u7605\u7649
\u75A0\u7658
\u762A\u765F
\u75D2<\u7662
\u7596\u7664
\u75C7<\u7665
\u75AC\u7667
\u765E\u7669
\u7663\u766C
\u763F\u766D
\u763E\u766E
\u75C8\u7670
\u762B\u7671
\u766B\u7672
\u53D1\u9AEE\u767C
\u7691\u769A
\u75B1\u76B0
\u76B2\u76B8
\u76B1\u76BA
\u76D7\u76DC
\u76CF\u76DE
\u76D1\u76E3
\u76D8\u76E4
\u5362\u76E7
\u8361\u8569\u76EA
\u7726\u7725
\u4F17\u773E
\u56F0<\u774F
\u7741\u775C
\u7750\u775E
\u770D\u7798
\u4056\u779C
\u7792\u779E
\u7786\u77B6
\u7751\u77BC
\u772C\u77D3
\u77A9\u77DA
\u77EB\u77EF
\u7841\u785C
\u7856\u7864
\u7817\u7868
\u781A\u786F
\u7855\u78A9
\u7800\u78AD
\u781C\u78B8
\u786E<\u78BA
\u7801\u78BC
\u40B5\u78BD
\u7859\u78D1
\u7816\u78DA
\u7875\u78E0
\u789C\u78E3
\u789B\u78E7
\u77F6\u78EF
\u7857\u78FD
\u40C5\u78FE
\u785A\u7904
\u7877\u9E7C\u7906
\u7840\u790E
\u788D\u7919
\u77FF\u7926
\u783A\u792A
\u783E\u792B
\u77FE\u792C
\u783B\u7931
\u7984\u797F
\u7978\u798D
\u796F\u798E
\u794E\u7995
\u7943\u79A1
\u5FA1<\u79A6
\u7985\u79AA
\u793C\u79AE
\u7962\u79B0
\u7977\u79B1
\u79C3\u79BF
\u7C7C\u79C8
\u7A0E\u7A05
\u79C6\u7A08
\u4149\u7A0F
\u7980\u7A1F
\u79CD<\u7A2E
\u79F0\u7A31
\u8C37<\u7A40
\u415F\u7A47
\u7A23\u7A4C
\u79EF\u7A4D
\u9896\u7A4E
\u79FE\u7A60
\u7A51\u7A61
\u79FD\u7A62
\u7A33\u7A69
\u7A06\u7A6D
\u7A9D\u7AA9
\u6D3C<\u7AAA
\u7A77\u7AAE
\u7A91\u7AAF
\u7A8E\u7AB5
\u7AAD\u7AB6
\u7AA5\u7ABA
\u7A9C\u7AC4
\u7A8D\u7AC5
\u7AA6\u7AC7
\u7A83\u7ACA
\u7ADE\u7AF6
\u7B14\u7B46
\u7B0B\u7B4D
\u7B15\u7B67
\u41F2\u7B74
\u7B3A\u7B8B
\u7B5D\u7B8F
\u8282\u7BC0
\u8303<\u7BC4
\u7B51<\u7BC9
\u7BA7\u7BCB
\u7B7C\u7BD4
\u7B03\u7BE4
\u7B5B\u7BE9
\u7B5A\u7BF3
\u7BA6\u7C00
\u7BD3\u7C0D
\u7BAA\u7C1E
\u7B80\u7C21
\u7BD1\u7C23
\u7BAB\u7C2B
\u7B5C\u7C39
\u7B7E\u7C3D
\u5E18<\u7C3E
\u7BEE\u7C43
\u7B79\u7C4C
\u4264\u7C54
\u7B93\u7C59
\u7BEF\u7C5B
\u7BA8\u7C5C
\u7C41\u7C5F
\u7B3C\u7C60
\u7B3E\u7C69
\u7C16\u7C6A
\u7BF1<\u7C6C
\u7BA9\u7C6E
\u7CA4\u7CB5
\u7CC1\u7CDD
\u7CAA\u7CDE
\u7CAE\u7CE7
\u7C9D\u7CF2
\u7C74\u7CF4
\u7C9C\u7CF6
\u7E9F\u7CF9
\u7EA0\u7CFE
\u7EAA\u7D00
\u7EA3\u7D02
\u7EA6\u7D04
\u7EA2\u7D05
\u7EA1\u7D06
\u7EA5\u7D07
\u7EA8\u7D08
\u7EAB\u7D09
\u7EB9\u7D0B
\u7EB3\u7D0D
\u7EBD\u7D10
\u7EBE\u7D13
\u7EAF\u7D14
\u7EB0\u7D15
\u7EBC\u7D16
\u7EB1\u7D17
\u7EAE\u7D18
\u7EB8\u7D19
\u7EA7\u7D1A
\u7EB7\u7D1B
\u7EAD\u7D1C
\u7EB4\u7D1D
\u7EBA\u7D21
\u4337\u7D2C
\u7EC6\u7D30
\u7EC2\u7D31
\u7EC1\u7D32
\u7EC5\u7D33
\u7EBB\u7D35
\u7ECD\u7D39
\u7EC0\u7D3A
\u7ECB\u7D3C
\u7ED0\u7D3F
\u7ECC\u7D40
\u7EC8\u7D42
\u7EC4\u7D44
\u4339\u7D45
\u7ECA\u7D46
\u7ED7\u7D4E
\u7ED3\u7D50
\u7EDD\u7D55
\u7EE6\u7E27\u7D5B
\u7ED4\u7D5D
\u7EDE\u7D5E
\u7EDC\u7D61
\u7EDA\u7D62
\u7ED9\u7D66
\u7ED2\u7D68
\u7ED6\u7D70
\u7EDF\u7D71
\u4E1D\u7D72
\u7EDB\u7D73
\u7EE2\u7D79
\u7ED1\u7D81
\u7EE1\u7D83
\u7EE0\u7D86
\u7EE8\u7D88
\u7EE4\u7D8C
\u7EE5\u7D8F
\u433C\u7D90
\u7ECF\u7D93
\u7EFC\u7D9C
\u7F0D\u7D9E
\u7EFF\u7DA0
\u7EF8\u7DA2
\u7EFB\u7DA3
\u7EF6\u7DAC
\u7EF4\u7DAD
\u7EF9\u7DAF
\u7EFE\u7DB0
\u7EB2\u7DB1
\u7F51<\u7DB2
\u7F00\u7DB4
\u433D\u7DB5
\u7EB6\u7DB8
\u7EFA\u7DB9
\u7EEE\u7DBA
\u7EFD\u7DBB
\u7EF0\u7DBD
\u7EEB\u7DBE
\u7EF5\u7DBF
\u7EF2\u7DC4
\u7F01\u7DC7
\u7D27\u7DCA
\u7EEF\u7DCB
\u7EEA\u7DD2
\u7EEC\u7DD3
\u7EF1\u979D\u7DD4
\u7F03\u7DD7
\u7F04\u7DD8
\u7F02\u7DD9
\u7EBF\u7DDA
\u7F09\u7DDD
\u7F0E\u7DDE
\u7F14\u7DE0
\u7F17\u7DE1
\u7F18\u7DE3
\u7F0C\u7DE6
\u7F16\u7DE8
\u7F13\u7DE9
\u7F05\u7DEC
\u7EAC\u7DEF
\u7F11\u7DF1
\u7F08\u7DF2
\u7EC3\u7DF4
\u7F0F\u7DF6
\u7F07\u7DF9
\u81F4<\u7DFB
\u8426\u7E08
\u7F19\u7E09
\u7F22\u7E0A
\u7F12\u7E0B
\u7EC9\u7E10
\u7F23\u7E11
\u7F0A\u7E15
\u7F1E\u7E17
\u7F1A\u7E1B
\u7F1C\u7E1D
\u7F1F\u7E1E
\u7F1B\u7E1F
\u53BF\u7E23
\u7F1D\u7E2B
\u7F21\u7E2D
\u7F29\u7E2E
\u7EB5\u7E31
\u7F27\u7E32
\u4338\u7E33
\u7F26\u7E35
\u7D77\u7E36
\u7F15\u7E37
\u7F25\u7E39
\u603B\u7E3D
\u7EE9\u7E3E
\u7EF7\u7E43
\u7F2B\u7E45
\u7F2A\u7E46
\u7F2F\u7E52
\u7EC7\u7E54
\u7F2E\u7E55
\u7F2D\u7E5A
\u7ED5\u7E5E
\u7EE3\u7E61
\u7F0B\u7E62
\u7EF3\u7E69
\u7ED8\u7E6A
\u8327<\u7E6D
\u7F30\u97C1\u7E6E
\u7F33\u7E6F
\u7F32\u7E70
\u7F34\u7E73
\u4341\u7E78
\u7ECE\u7E79
\u7EE7\u7E7C
\u7F24\u7E7D
\u7F31\u7E7E
\u4340\u7E7F
\u98A3\u7E87
\u7F2C\u7E88
\u7EA9\u7E8A
\u7EED\u7E8C
\u7D2F<\u7E8D
\u7F20\u7E8F
\u7F28\u7E93
\u7EA4\u7E96
\u7F35\u7E98
\u7F06\u7E9C
\u94B5\u7F3D
\u7F42\u7F4C
\u7F5A\u7F70
\u9A82\u7F75
\u7F62\u7F77
\u7F57\u7F85
\u7F74\u7F86
\u7F81\u7F88
\u8288\u7F8B
\u7F9F\u7FA5
\u4E49\u7FA9
\u4E60\u7FD2
\u7FDA\u7FEC
\u7FD8\u7FF9
\u7FD9\u7FFD
\u8027\u802C
\u8022\u802E
\u5723<\u8056
\u95FB\u805E
\u8054\u806F
\u806A\u8070
\u58F0\u8072
\u8038\u8073
\u8069\u8075
\u8042\u8076
\u804C\u8077
\u804D\u8079
\u542C<\u807D
\u804B\u807E
\u8083\u8085
\u80C1\u8105
\u8109\u8108
\u80EB\u811B
\u8131\u812B
\u80C0\u8139
\u80BE\u814E
\u80E8\u8156
\u8136\u8161
\u8111\u8166
\u80BF\u816B
\u811A\u8173
\u80A0\u8178
\u817D\u8183
\u8158\u8195
\u80A4\u819A
\u43DD\u819E
\u80F6\u81A0
\u817B\u81A9
\u80C6\u81BD
\u810D\u81BE
\u8113\u81BF
\u442A\u81C7
\u8138\u81C9
\u8110\u81CD
\u8191\u81CF
\u814A<\u81D8
\u80EA\u81DA
\u810F\u9AD2\u81DF
\u8114\u81E0
\u81DC\u81E2
\u4E34\u81E8
\u4E0E<\u8207
\u5174\u8208
\u4E3E\u8209
\u65E7\u820A
\u8231\u8259
\u8223\u8264
\u8230\u8266
\u823B\u826B
\u8270\u8271
\u8273\u8277
\u520D\u82BB
\u82CE\u82E7
\u5179\u8332
\u8346\u834A
\u5E84<\u838A
\u830E\u8396
\u835A\u83A2
\u82CB\u83A7
\u534E\u83EF
\u82CC\u8407
\u83B1\u840A
\u4E07<\u842C
\u835D\u8434
\u83B4\u8435
\u53F6\u8449
\u836D\u8452
\u7740>\u8457
\u836E\u8464
\u82C7\u8466
\u8364\u8477
\u83B3\u8494
\u8385\u849E
\u82CD\u84BC
\u836A\u84C0
\u76D6\u84CB
\u83B2\u84EE
\u82C1\u84EF
\u83BC\u84F4
\u835C\u84FD
\u848C\u851E
\u848B\u8523
\u8471\u8525
\u8311\u8526
\u836B\u852D
\u8368\u8541
\u8487\u8546
\u835E\u854E
\u836C\u8552
\u82B8<\u8553
\u83B8\u8555
\u835B\u8558
\u8489\u8562
\u829C\u856A
\u8427\u856D
\u84E3\u8577
\u8570\u8580
\u835F\u8588
\u84DF\u858A
\u8297\u858C
\u8537\u8594
\u8359\u8598
\u83B6\u859F
\u8350<\u85A6
\u8428\u85A9
\u44D5\u85B3
\u82E7<\u85B4
\u44D3\u85B5
\u8360\u85BA
\u84DD\u85CD
\u8369\u85CE
\u827A\u85DD
\u836F\u85E5
\u85AE\u85EA
\u82C8\u85F6
\u853C\u85F9
\u853A\u85FA
\u841A\u8600
\u8572\u8604
\u82A6\u8606
\u82CF\u8607
\u8574\u860A
\u82F9<\u860B
\u85D3\u861A
\u8539\u861E
\u830F\u8622
\u5170\u862D
\u84E0\u863A
\u841D\u863F
\u8502<\u8646
\u5904\u8655
\u865A\u865B
\u864F\u865C
\u53F7\u865F
\u4E8F\u8667
\u866C\u866F
\u86F1\u86FA
\u8715\u86FB
\u86AC\u8706
\u8680\u8755
\u732C\u875F
\u867E\u8766
\u8717\u8778
\u86F3\u8784
\u8682\u879E
\u8424\u87A2
\u45D6\u87AE
\u877C\u87BB
\u8780\u87BF
\u86F0\u87C4
\u8748\u87C8
\u87A8\u87CE
\u866E<\u87E3
\u8749\u87EC
\u86F2\u87EF
\u866B<\u87F2
\u86CF\u87F6
\u8681\u87FB
\u8683\u8801
\u8747\u8805
\u867F\u8806
\u86F4\u8810
\u877E\u8811
\u8721<\u881F
\u86CE\u8823
\u87CF\u8828
\u86CA\u8831
\u8695<\u8836
\u86EE\u883B
\u672F\u8853
\u540C<\u8855
\u80E1<\u9B0D\u885A
\u536B\u885B
\u886E\u889E
\u8885\u88CA
\u8865\u88DC
\u88C5\u88DD
\u91CC<\u88E1
\u5236<\u88FD
\u88C8\u890C
\u8886\u8918
\u88E4\u8932
\u88E2\u8933
\u891B\u8938
\u4EB5\u893B
\u88E5\u8947
\u891D\u894C
\u88AF\u894F
\u8884\u8956
\u88E3\u895D
\u88C6\u8960
\u8934\u8964
\u889C\u896A
\u4653\u896C
\u886C\u896F
\u88AD\u8972
\u8955\u8974
\u89C1\u898B
\u89C3\u898E
\u89C4\u898F
\u89C5\u8993
\u89C6\u8996
\u89C7\u8998
\u89CB\u89A1
\u89CD\u89A5
\u89CE\u89A6
\u4EB2\u89AA
\u89CA\u89AC
\u89CF\u89AF
\u89D0\u89B2
\u89D1\u89B7
\u89C9\u89BA
\u89C8\u89BD
\u89CC\u89BF
\u89C2\u89C0
\u89DE\u89F4
\u89EF\u89F6
\u89E6<\u89F8
\u8BA0\u8A01
\u8BA2\u8A02
\u8BA3\u8A03
\u8BA1\u8A08
\u8BAF\u8A0A
\u8BA7\u8A0C
\u8BA8\u8A0E
\u8BA6\u8A10
\u8BB1\u8A12
\u8BAD\u8A13
\u8BAA\u8A15
\u8BAB\u8A16
\u8BAC\u8A17
\u8BB0\u8A18
\u8BB9\u8A1B
\u8BB6\u8A1D
\u8BBC\u8A1F
\u4723\u8A22
\u8BC0\u8A23
\u8BB7\u8A25
\u8BBB\u8A29
\u8BBF\u8A2A
\u8BBE\u8A2D
\u8BB8\u8A31
\u8BC9\u8A34
\u8BC3\u8A36
\u8BCA\u8A3A
\u6CE8<\u8A3B
\u8BC2\u8A41
\u8BCB\u8A46
\u8BB5\u8A4E
\u8BC8\u8A50
\u8BD2\u8A52
\u8BCF\u8A54
\u8BC4\u8A55
\u8BD0\u8A56
\u8BC7\u8A57
\u8BCE\u8A58
\u8BC5\u8A5B
\u8BCD\u8A5E
\u548F\u8A60
\u8BE9\u8A61
\u8BE2\u8A62
\u8BE3\u8A63
\u8BD5\u8A66
\u8BD7\u8A69
\u8BE7\u8A6B
\u8BDF\u8A6C
\u8BE1\u8A6D
\u8BE0\u8A6E
\u8BD8\u8A70
\u8BDD\u8A71
\u8BE5\u8A72
\u8BE6\u8A73
\u8BDC\u8A75
\u8BD9\u8A7C
\u8BD6\u8A7F
\u8BD4\u8A84
\u8BDB\u8A85
\u8BD3\u8A86
\u5938<\u8A87
\u5FD7<\u8A8C
\u8BA4\u8A8D
\u8BF3\u8A91
\u8BF6\u8A92
\u8BDE\u8A95
\u8BF1\u8A98
\u8BEE\u8A9A
\u8BED\u8A9E
\u8BDA\u8AA0
\u8BEB\u8AA1
\u8BEC\u8AA3
\u8BEF\u8AA4
\u8BF0\u8AA5
\u8BF5\u8AA6
\u8BF2\u8AA8
\u8BF4\u8AAA
\u8C01\u8AB0
\u8BFE\u8AB2
\u8C07\u8AB6
\u8BFD\u8AB9
\u8C0A\u8ABC
\u8A1A\u8ABE
\u8C03\u8ABF
\u8C04\u8AC2
\u8C06\u8AC4
\u8C08\u8AC7
\u8BFF\u8AC9
\u8BF7\u8ACB
\u8BE4\u8ACD
\u8BF9\u8ACF
\u8BFC\u8AD1
\u8C05\u8AD2
\u8BBA\u8AD6
\u8C02\u8AD7
\u8C00\u8ADB
\u8C0D\u8ADC
\u8C1E\u8ADD
\u8C1D\u8ADE
\u8BE8\u8AE2
\u8C14\u8AE4
\u8C1B\u8AE6
\u8C10\u8AE7
\u8C0F\u8AEB
\u8C15\u8AED
\u8C18\u8AEE
\u8BB3\u8AF1
\u8C19\u8AF3
\u8C0C\u8AF6
\u8BBD\u8AF7
\u8BF8\u8AF8
\u8C1A\u8AFA
\u8C16\u8AFC
\u8BFA\u8AFE
\u8C0B\u8B00
\u8C12\u8B01
\u8C13\u8B02
\u8A8A\u8B04
\u8BCC\u8B05
\u8C0E\u8B0A
\u8C1C\u8B0E
\u8C27\u8B10
\u8C11\u8B14
\u8C21\u8B16
\u8C24\u8B17
\u8C26\u8B19
\u8C25\u8B1A
\u8BB2\u8B1B
\u8C22\u8B1D
\u8C23\u8B20
\u8C1F\u8B28
\u8C2A\u8B2B
\u8C2C\u8B2C
\u8C2B\u8B7E\u8B2D
\u8BB4\u8B33
\u8C28\u8B39
\u8C29\u8B3E
\u8BC1\u8B49
\u8C32\u8B4E
\u8BA5\u8B4F
\u8C2E\u8B56
\u8BC6\u8B58
\u8C2F\u8B59
\u8C2D\u8B5A
\u8C31\u8B5C
\u8C35\u8B6B
\u8BD1\u8B6F
\u8BAE\u8B70
\u8C34\u8B74
\u62A4\u8B77
\u8BEA\u8B78
\u46D3\u8B7C
\u8A89\u8B7D
\u8BFB\u8B80
\u8C09\u8B85
\u53D8\u8B8A
\u8A5F\u8B8B
\u4729\u8B8C
\u96E0\u8B8E
\u8C17\u8B92
\u8BA9\u8B93
\u8C30\u8B95
\u8C36\u8B96
\u8C20\u8B9C
\u8C33\u8B9E
\u5C82\u8C48
\u7AD6\u8C4E
\u4E30<\u8C50
\u732A\u8C6C
\u8C6E\u8C76
\u732B\u8C93
\u4759\u8C99
\u8D1D\u8C9D
\u8D1E\u8C9E
\u8D20\u8C9F
\u8D1F\u8CA0
\u8D22\u8CA1
\u8D21\u8CA2
\u8D2B\u8CA7
\u8D27\u8CA8
\u8D29\u8CA9
\u8D2A\u8CAA
\u8D2F\u8CAB
\u8D23\u8CAC
\u8D2E\u8CAF
\u8D33\u8CB0
\u8D40\u8CB2
\u8D30\u8CB3
\u8D35\u8CB4
\u8D2C\u8CB6
\u4E70\u8CB7
\u8D37\u8CB8
\u8D36\u8CBA
\u8D39\u8CBB
\u8D34\u8CBC
\u8D3B\u8CBD
\u8D38\u8CBF
\u8D3A\u8CC0
\u8D32\u8CC1
\u8D42\u8CC2
\u8D41\u8CC3
\u8D3F\u8CC4
\u8D45\u8CC5
\u8D44\u8CC7
\u8D3E\u8CC8
\u8D3C\u8CCA
\u8D48\u8CD1
\u8D4A\u8CD2
\u5BBE\u8CD3
\u8D47\u8CD5
\u8D52\u8CD9
\u8D49\u8CDA
\u8D50\u8CDC
\u8D4F\u8CDE
\u8D54\u8CE0
\u8D53\u8CE1
\u8D24\u8CE2
\u5356\u8CE3
\u8D31\u8CE4
\u8D4B\u8CE6
\u8D55\u8CE7
\u8D28\u8CEA
\u8D26\u8CEC
\u8D4C\u8CED
\u4790\u8CF0
\u8D56\u8CF4
\u8D57\u8CF5
\u8D5A\u8CFA
\u8D59\u8CFB
\u8D2D\u8CFC
\u8D5B\u8CFD
\u8D5C\u8CFE
\u8D3D\u8D04
\u8D58\u8D05
\u8D5F\u8D07
\u8D60\u8D08
\u8D5E\u8D0A
\u8D5D\u8D17\u8D0B
\u8D61\u8D0D
\u8D62\u8D0F
\u8D46\u8D10
\u8D43\u8D13
\u8D51\u8D14
\u8D4E\u8D16
\u8D63\u8D1B
\u8D6A\u8D6C
\u8D76<\u8D95
\u8D75\u8D99
\u8D8B\u8DA8
\u8DB1\u8DB2
\u8FF9\u8DE1
\u8DF5\u8E10
\u8E0A<\u8E34
\u8DC4\u8E4C
\u8DF8\u8E55
\u8E52\u8E63
\u8E2A\u8E64
\u8DF7\u8E7A
\u8DF6\u8E82
\u8DB8\u8E89
\u8E0C\u8E8A
\u8DFB\u8E8B
\u8DC3\u8E8D
\u47E2\u8E8E
\u8E2F\u8E91
\u8DDE\u8E92
\u8E2C\u8E93
\u8E70\u8E95
\u8DF9\u8E9A
\u8E51\u8EA1
\u8E7F\u8EA5
\u8E9C\u8EA6
\u8E8F\u8EAA
\u8EAF\u8EC0
\u8F66\u8ECA
\u8F67\u8ECB
\u8F68\u8ECC
\u519B\u8ECD
\u8F6A\u8ED1
\u8F69\u8ED2
\u8F6B\u8ED4
\u8F6D\u8EDB
\u8F6F\u8EDF
\u8F77\u8EE4
\u8F78\u8EEB
\u8F71\u8EF2
\u8F74\u8EF8
\u8F75\u8EF9
\u8F7A\u8EFA
\u8F72\u8EFB
\u8F76\u8EFC
\u8F7C\u8EFE
\u8F83\u8F03
\u8F82\u8F05
\u8F81\u8F07
\u8F80\u8F08
\u8F7D\u8F09
\u8F7E\u8F0A
\u8F84\u8F12
\u633D<\u8F13
\u8F85\u8F14
\u8F7B\u8F15
\u8F86\u8F1B
\u8F8E\u8F1C
\u8F89\u8F1D
\u8F8B\u8F1E
\u8F8D\u8F1F
\u8F8A\u8F25
\u8F87\u8F26
\u8F88\u8F29
\u8F6E\u8F2A
\u8F8C\u8F2C
\u8F91\u8F2F
\u8F8F\u8F33
\u8F93\u8F38
\u8F90\u8F3B
\u8F97\u8F3E
\u8206\u8F3F
\u8F92\u8F40
\u6BC2\u8F42
\u8F96\u8F44
\u8F95\u8F45
\u8F98\u8F46
\u8F6C\u8F49
\u8F99\u8F4D
\u8F7F\u8F4E
\u8F9A\u8F54
\u8F70\u8F5F
\u8F94\u8F61
\u8F79\u8F62
\u8F73\u8F64
\u529E\u8FA6
\u8F9E\u8FAD
\u8FAB\u8FAE
\u8FA9\u8FAF
\u519C\u8FB2
\u8FF3\u9015
\u8FD9\u9019
\u8FDE\u9023
\u8FDB\u9032
\u8FD0\u904B
\u8FC7\u904E
\u8FBE\u9054
\u8FDD\u9055
\u9065\u9059
\u900A\u905C
\u9012\u905E
\u8FDC\u9060
\u9002<\u9069
\u8FDF\u9072
\u8FC1\u9077
\u9009\u9078
\u9057\u907A
\u8FBD\u907C
\u8FC8\u9081
\u8FD8\u9084
\u8FE9\u9087
\u8FB9\u908A
\u903B\u908F
\u9026\u9090
\u90CF\u90DF
\u90AE\u90F5
\u90D3\u9106
\u4E61\u9109
\u90B9\u9112
\u90AC\u9114
\u90E7\u9116
\u9093\u9127
\u90D1\u912D
\u90BB\u9130
\u90F8\u9132
\u90BA\u9134
\u90D0\u9136
\u909D\u913A
\u9142\u9147
\u90E6\u9148
\u4E11<\u919C
\u915D\u919E
\u533B\u91AB
\u9171\u91AC
\u9166\u91B1
\u917F\u91C0
\u8845\u91C1
\u917E\u91C3
\u917D\u91C5
\u91CA\u91CB
\u5398<\u91D0
\u9485\u91D2
\u9486\u91D3
\u9487\u91D4
\u948C\u91D5
\u948A\u91D7
\u9489\u91D8
\u948B\u91D9
\u9488\u91DD
\u9493\u91E3
\u9490\u91E4
\u948F\u91E7
\u9492\u91E9
\u9497\u91F5
\u948D\u91F7
\u9495\u91F9
\u948E\u91FA
\u497A\u91FE
\u94AF\u9200
\u94AB\u9201
\u9498\u9203
\u94AD\u9204
\u949A\u9208
\u94A0\u9209
\u949D\u920D
\u94A9\u9264\u920E
\u94A4\u9210
\u94A3\u9211
\u9491\u9212
\u949E\u9214
\u94AE\u9215
\u94A7\u921E
\u9499\u9223
\u94AC\u9225
\u949B\u9226
\u94AA\u9227
\u94CC\u922E
\u94C8\u9230
\u94B6\u9233
\u94C3\u9234
\u94B4\u9237
\u94B9\u9238
\u94CD\u9239
\u94B0\u923A
\u94B8\u923D
\u94C0\u923E
\u94BF\u923F
\u94BE\u9240
\u949C\u9245
\u94CA\u9248
\u94C9\u9249
\u94C7\u924B
\u94CB\u924D
\u94C2\u9251
\u94B7\u9255
\u94B3\u9257
\u94C6\u925A
\u94C5\u925B
\u94BA\u925E
\u94B2\u9266
\u9FED\u9448\u9268
\u94BC\u926C
\u94BD\u926D
\u94CF\u9276
\u94F0\u9278
\u94D2\u927A
\u94EC\u927B
\u94EA\u927F
\u94F6\u9280
\u94F3\u9283
\u94DC\u9285
\u94DA\u928D
\u94E3\u9291
\u94E8\u9293
\u94E2\u9296
\u94ED\u9298
\u94EB\u929A
\u94E6\u929B
\u8854\u929C
\u94D1\u92A0
\u94F7\u92A3
\u94F1\u92A5
\u94DF\u92A6
\u94F5\u92A8
\u94E5\u92A9
\u94D5\u92AA
\u94EF\u92AB
\u94D0\u92AC
\u94DE\u92B1
\u9510\u92B3
\u9500\u92B7
\u9508\u93FD\u92B9
\u9511\u92BB
\u9509\u92BC
\u94DD\u92C1
\u9512\u92C3
\u950C\u92C5
\u94A1\u92C7
\u94E4\u92CC
\u94D7\u92CF
\u950B\u92D2
\u94FB\u92D9
\u950A\u92DD
\u9513\u92DF
\u94D8\u92E3
\u9504\u92E4
\u9503\u92E5
\u9514\u92E6
\u9507\u92E8
\u94D3\u92E9
\u94FA\u92EA
\u94D6\u92EE
\u9506\u92EF
\u9502\u92F0
\u94FD\u92F1
\u950D\u92F6
\u952F\u92F8
\u94A2\u92FC
\u951E\u9301
\u5F55\u9304
\u9516\u9306
\u952B\u9307
\u9529\u9308
\u94D4\u930F
\u9525\u9310
\u9515\u9312
\u951F\u9315
\u9524\u9318
\u9531\u9319
\u94EE\u931A
\u951B\u931B
\u952C\u931F
\u952D\u9320
\u951C\u9321
\u94B1\u9322
\u9526\u9326
\u951A\u9328
\u9520\u9329
\u9521\u932B
\u9522\u932E
\u9519\u932F
\u9530\u9333
\u8868<\u9336
\u94FC\u9338
\u951D\u9340
\u9528\u9341
\u952A\u9343
\u9494\u9346
\u9534\u9347
\u9533\u9348
\u9505\u934B
\u9540\u934D
\u9537\u9354
\u94E1\u9358
\u9496\u935A
\u953B\u935B
\u953D\u9360
\u9538\u9364
\u9532\u9365
\u9518\u9369
\u9539\u936C
\u953E\u9370
\u952E\u9375
\u9536\u9376
\u9517\u937A
\u949F\u9418\u937E
\u9541\u9382
\u953F\u9384
\u9545\u9387
\u9551\u938A
\u9555\u9394
\u9501\u9396
\u9549\u9398
\u9548\u939B
\u9543\u93A1
\u94A8\u93A2
\u84E5\u93A3
\u954F\u93A6
\u94E0\u93A7
\u94E9\u93A9
\u953C\u93AA
\u9550\u93AC
\u9547\u93AE
\u9552\u93B0
\u954B\u93B2
\u954D\u93B3
\u9553\u93B5
\u9FD4\u93B6
\u954E\u93BF
\u955E\u93C3
\u955F\u93C7
\u94FE\u93C8
\u9546\u93CC
\u9559\u93CD
\u9560\u93D0
\u955D\u93D1
\u94FF\u93D7
\u9535\u93D8
\u9557\u93DC
\u9558\u93DD
\u955B\u93DE
\u94F2\u93DF
\u955C\u93E1
\u9556\u93E2
\u9542\u93E4
\u933E\u93E8
\u955A\u93F0
\u94E7\u93F5
\u9564\u93F7
\u956A\u93F9
\u497D\u93FA
\u94D9\u9403
\u94F4\u940B
\u9563\u9410
\u94F9\u9412
\u9566\u9413
\u9561\u9414
\u956B\u9419
\u9562\u941D
\u9568\u9420
\u4985\u9425
\u950E\u9426
\u950F\u9427
\u9544\u9428
\u954C\u942B
\u9570\u942E
\u4983\u942F
\u956F\u9432
\u956D\u9433
\u94C1\u9435
\u956E\u9436
\u94CE\u9438
\u94DB\u943A
\u9571\u943F
\u94F8\u9444
\u956C\u944A
\u9554\u944C
\u9274\u9452
\u9572\u9454
\u9527\u9455
\u9574\u945E
\u94C4\u9460
\u9573\u9463
\u9565\u9465
\u9567\u946D
\u94A5\u9470
\u9575\u9471
\u9576\u9472
\u954A\u9477
\u9569\u9479
\u9523\u947C
\u94BB\u947D
\u92AE\u947E
\u51FF\u947F
\u4986\u9481
\u957F\u9577
\u95E8\u9580
\u95E9\u9582
\u95EA\u9583
\u95EB\u9586
\u95EC\u9588
\u95ED\u9589
\u5F00\u958B
\u95F6\u958C
\u95F3\u958E
\u95F0\u958F
\u95F2\u9592\u9591
\u95F4\u9593
\u95F5\u9594
\u95F8\u9598
\u9602\u95A1
\u9601\u95A3
\u9600\u95A5
\u95FA\u95A8
\u95FD\u95A9
\u9603\u95AB
\u9606\u95AC
\u95FE\u95AD
\u9605\u95B1
\u960A\u95B6
\u9609\u95B9
\u960E\u95BB
\u960F\u95BC
\u960D\u95BD
\u9608\u95BE
\u960C\u95BF
\u9612\u95C3
\u677F<\u95C6
\u95F1\u95C8
\u9614\u95CA
\u9615\u95CB
\u9611\u95CC
\u9607\u95CD
\u9617\u95D0
\u9618\u95D2
\u95FF\u95D3
\u9616\u95D4
\u9619\u95D5
\u95EF\u95D6
\u5173\u95DC
\u961A\u95DE
\u9613\u95E0
\u9610\u95E1
\u8F9F<\u95E2
\u961B\u95E4
\u95FC\u95E5
\u5742>\u962A
\u9649\u9658
\u9655\u965D
\u9635\u9663
\u9634\u9670
\u9648\u9673
\u9646\u9678
\u9633\u967D
\u9667\u9689
\u961F\u968A
\u9636\u968E
\u9668\u9695
\u9645\u969B
\u968F\u96A8
\u9669\u96AA
\u9666\u96AF
\u9690\u96B1
\u9647\u96B4
\u96B6\u96B8
\u53EA<\u96BB
\u96BD\u96CB
\u867D\u96D6
\u53CC\u96D9
\u96CF\u96DB
\u6742\u96DC
\u9E21\u96DE
\u79BB<\u96E2
\u96BE\u96E3
\u4E91<\u96F2
\u7535\u96FB
\u9721\u9722
\u96FE\u9727
\u9701\u973D
\u96F3\u9742
\u972D\u9744
\u53C7\u9746
\u7075\u9748
\u53C6\u9749
\u9753\u975A
\u9759\u975C
\u4A44\u9766
\u9765\u9768
\u9F17\u9780
\u5DE9\u978F
\u9792\u97BD
\u9791\u97C3
\u97AF\u97C9
\u97E6\u97CB
\u97E7\u97CC
\u97E8\u97CD
\u97E9\u97D3
\u97EA\u97D9
\u97EC\u97DC
\u97EB\u97DE
\u97F5\u97FB
\u54CD\u97FF
\u9875\u9801
\u9876\u9802
\u9877\u9803
\u9879\u9805
\u987A\u9806
\u9878\u9807
\u987B\u9B1A\u9808
\u987C\u980A
\u9882\u980C
\u9880\u980E
\u9883\u980F
\u9884\u9810
\u987D\u9811
\u9881\u9812
\u987F\u9813
\u9887\u9817
\u9886\u9818
\u988C\u981C
\u9889\u9821
\u9890\u9824
\u988F\u9826
\u5934\u982D
\u9892\u982E
\u988A\u9830
\u988B\u9832
\u9895\u9834
\u9894\u9837
\u9888\u9838
\u9893\u9839
\u9891\u983B
\u9897\u9846
\u9898\u984C
\u989D\u984D
\u989A\u984E
\u989C\u984F
\u9899\u9852
\u989B\u9853
\u613F<\u9858
\u98A1\u9859
\u98A0\u985B
\u7C7B\u985E
\u989F\u9862
\u98A2\u9865
\u987E\u9867
\u98A4\u986B
\u98A5\u986C
\u663E\u986F
\u98A6\u9870
\u9885\u9871
\u989E\u9873
\u98A7\u9874
\u98CE\u98A8
\u98D0\u98AD
\u98D1\u98AE
\u98D2\u98AF
\u522E<\u98B3
\u98D3\u98B6
\u98D4\u98B8
\u98CF\u98BA
\u98D6\u98BB
\u98D5\u98BC
\u98D7\u98C0
\u98D8\u98C4
\u98D9\u98C6
\u98DA\u98C8
\u98DE\u98DB
\u9963\u98E0
\u9965\u98E2
\u9964\u98E3
\u9966\u98E5
\u9968\u98E9
\u996A\u98EA
\u996B\u98EB
\u996C\u98ED
\u996D\u98EF
\u996E\u98F2
\u9974\u98F4
\u9972\u98FC
\u9971\u98FD
\u9970\u98FE
\u9973\u98FF
\u997A\u9903
\u9978\u9904
\u997C\u9905
\u9977\u9909
\u517B\u990A
\u9975\u990C
\u9979\u990E
\u997B\u990F
\u997D\u9911
\u9981\u9912
\u997F\u9913
\u9982\u9915
\u997E\u9916
\u4F59<\u9918
\u80B4<\u991A
\u9984\u991B
\u9983\u991C
\u996F\u991E
\u9985\u9921
\u9986\u9928
\u7CC7\u9931
\u9967\u9933
\u9989\u9936
\u9987\u9937
\u998E\u993A
\u9969\u993C
\u998F\u993E
\u998A\u993F
\u998C\u9941
\u998D\u9943
\u9992\u9945
\u9990\u9948
\u9991\u9949
\u9993\u994A
\u9988\u994B
\u9994\u994C
\u9976\u9952
\u98E8\u9957
\u990D\u995C
\u998B\u995E
\u9995\u9962
\u9A6C\u99AC
\u9A6D\u99AD
\u51AF\u99AE
\u9A6E\u99B1
\u9A70\u99B3
\u9A6F\u99B4
\u9A72\u99B9
\u9A73\u99C1
\u9A7B\u99D0
\u9A7D\u99D1
\u9A79\u99D2
\u9A75\u99D4
\u9A7E\u99D5
\u9A80\u99D8
\u9A78\u99D9
\u9A76\u99DB
\u9A7C\u99DD
\u9A77\u99DF
\u9A88\u99E2
\u9A87\u99ED
\u9A83\u99F0
\u9A86\u99F1
\u9A8E\u99F8
\u9A8F\u99FF
\u9A8B\u9A01
\u9A8D\u9A02
\u9A93\u9A05
\u9A94\u9A0C
\u9A92\u9A0D
\u9A91\u9A0E
\u9A90\u9A0F
\u9A9B\u9A16
\u9A97\u9A19
\u9A99\u9A24
\u4BC4\u9A27
\u9A9E\u9A2B
\u9A98\u9A2D
\u9A9D\u9A2E
\u817E\u9A30
\u9A7A\u9A36
\u9A9A\u9A37
\u9A9F\u9A38
\u9AA1\u9A3E
\u84E6\u9A40
\u9A9C\u9A41
\u9A96\u9A42
\u9AA0\u9A43
\u9AA2\u9A44
\u9A71\u9A45
\u9A85\u9A4A
\u9A95\u9A4C
\u9A81\u9A4D
\u9AA3\u9A4F
\u9A84\u9A55
\u9A8C\u9A57
\u60CA<\u9A5A
\u9A7F\u9A5B
\u9AA4\u9A5F
\u9A74\u9A62
\u9AA7\u9A64
\u9AA5\u9A65
\u9AA6\u9A66
\u9A8A\u9A6A
\u9A89\u9A6B
\u80AE<\u9AAF
\u9AC5\u9ACF
\u4F53<\u9AD4
\u9ACC\u9AD5
\u9ACB\u9AD6
\u677E<\u9B06
\u9B13\u9B22
\u6597<\u9B25
\u95F9\u9B27
\u960B\u9B29
\u9604\u9B2E
\u90C1<\u9B31
\u9B36\u9B39
\u9B49\u9B4E
\u9B47\u9B58
\u9C7C\u9B5A
\u9C7D\u9B5B
\u9C7E\u9B62
\u9C80\u9B68
\u9C81\u9B6F
\u9C82\u9B74
\u9C7F\u9B77
\u9C84\u9B7A
\u9C85\u9B81
\u9C86\u9B83
\u9C8C\u9B8A
\u9C89\u9B8B
\u9C8F\u9B8D
\u9C87\u9B8E
\u9C90\u9B90
\u9C8D\u9B91
\u9C8B\u9B92
\u9C8A\u9B93
\u9C92\u9B9A
\u9C98\u9B9C
\u9C95\u9B9E
\u4C9F\u9BA3
\u9C96\u9BA6
\u9C94\u9BAA
\u9C9B\u9BAB
\u9C91\u9BAD
\u9C9C\u9BAE
\u9C93\u9BB3
\u9CAA\u9BB6
\u9C9D\u9BBA
\u9CA7\u9BC0
\u9CA0\u9BC1
\u9CA9\u9BC7
\u9CA4\u9BC9
\u9CA8\u9BCA
\u9CAC\u9BD2
\u9CBB\u9BD4
\u9CAF\u9BD5
\u9CAD\u9BD6
\u9C9E\u9BD7
\u9CB7\u9BDB
\u9CB4\u9BDD
\u9CB1\u9BE1
\u9CB5\u9BE2
\u9CB2\u9BE4
\u9CB3\u9BE7
\u9CB8\u9BE8
\u9CAE\u9BEA
\u9CB0\u9BEB
\u9CB6\u9BF0
\u9CBA\u9BF4
\u9CC0\u9BF7
\u9CAB\u9BFD
\u9CCA\u9BFF
\u9CC8\u9C01
\u9C97\u9C02
\u9CC2\u9C03
\u4CA0\u9C06
\u9CBD\u9C08
\u9CC7\u9C09
\u4CA1\u9C0C
\u9CC5\u9C0D
\u9CBE\u9C0F
\u9CC4\u9C77\u9C10
\u9CC6\u9C12
\u9CC3\u9C13
\u9CD2\u9C1C
\u9CD1\u9C1F
\u9CCB\u9C20
\u9CA5\u9C23
\u9CCF\u9C25
\u4CA2\u9C27
\u9CCE\u9C28
\u9CD0\u9C29
\u9CCD\u9C2D
\u9CC1\u9C2E
\u9CA2\u9C31
\u9CCC\u9C32
\u9CD3\u9C33
\u9CD8\u9C35
\u9CA6\u9C37
\u9CA3\u9C39
\u9CB9\u9C3A
\u9CD7\u9C3B
\u9CDB\u9C3C
\u9CD4\u9C3E
\u9CC9\u9C42
\u9CD9\u9C45
\u9CD5\u9C48
\u9CD6\u9C49
\u9CDF\u9C52
\u9CDD\u9C54
\u9CDC\u9C56
\u9CDE\u9C57
\u9C9F\u9C58
\u9CBC\u9C5D
\u9C8E\u9C5F
\u9C99\u9C60
\u9CE3\u9C63
\u9CE1\u9C64
\u9CE2\u9C67
\u9CBF\u9C68
\u9C9A\u9C6D
\u9CE0\u9C6F
\u9C88\u9C78
\u9CA1\u9C7A
\u9E1F\u9CE5
\u51EB\u9CE7
\u9E20\u9CE9
\u9E24\u9CF2
\u51E4\u9CF3
\u9E23\u9CF4
\u9E22\u9CF6
\u4D13\u9CFE
\u9E29\u9D06
\u9E28\u9D07
\u9E26\u9D09
\u9E30\u9D12
\u9E35\u9D15
\u9E33\u9D1B
\u9E32\u9D1D
\u9E2E\u9D1E
\u9E31\u9D1F
\u9E2A\u9D23
\u9E2F\u9D26
\u9E2D\u9D28
\u9E38\u9D2F
\u9E39\u9D30
\u9E3B\u9D34
\u4D15\u9D37
\u9E3F\u9D3B
\u9E3D\u9D3F
\u4D14\u9D41
\u9E3A\u9D42
\u9E3C\u9D43
\u9E40\u9D50
\u9E43\u9D51
\u9E46\u9D52
\u9E41\u9D53
\u9E48\u9D5C
\u9E45\u9D5D
\u9E44\u9D60
\u9E49\u9D61
\u9E4C\u9D6A
\u9E4F\u9D6C
\u9E50\u9D6E
\u9E4E\u9D6F
\u9E4A\u9D72
\u9E53\u9D77
\u9E4D\u9D7E
\u4D16\u9D84
\u9E2B\u9D87
\u9E51\u9D89
\u9E52\u9D8A
\u9E4B\u9D93
\u9E59\u9D96
\u9E55\u9D98
\u9E57\u9D9A
\u9E56\u9DA1
\u9E5B\u9DA5
\u9E5C\u9DA9
\u4D17\u9DAA
\u9E27\u9DAC
\u83BA\u9DAF
\u9E5F\u9DB2
\u9E64\u9DB4
\u9E60\u9DB9
\u9E61\u9DBA
\u9E58\u9DBB
\u9E63\u9DBC
\u9E5A\u9DC0
\u9E62\u9DC1
\u9E5E\u9DC2
\u4D18\u9DC9\u9DC8
\u9E5D\u9DCA
\u9E67\u9DD3
\u9E65\u9DD6
\u9E25\u9DD7
\u9E37\u9DD9
\u9E68\u9DDA
\u9E36\u9DE5
\u9E6A\u9DE6
\u9E54\u9DEB
\u9E69\u9DEF
\u9E6B\u9DF2
\u9E47\u9DF3
\u9E6C\u9DF8
\u9E70\u9DF9
\u9E6D\u9DFA
\u9E34\u9DFD
\u4D19\u9E0A\u9DFF
\u3D89\u9E02
\u9E6F\u9E07
\u9E71\u9E0C
\u9E72\u9E0F
\u9E2C\u9E15
\u9E74\u9E18
\u9E66\u9E1A
\u9E73\u9E1B
\u9E42\u9E1D
\u9E3E\u9E1E
\u5364\u9E75
\u54B8<\u9E79
\u9E7E\u9E7A
\u76D0\u9E7D
\u4E3D\u9E97
\u9EA6\u9EA5
\u9EB8\u9EA9
\u66F2<\u9EAF
\u9EB9>\u9EB4
\u9762<\u9EB5
\u9EC4\u9EC3
\u9EC9\u9ECC
\u70B9\u9EDE
\u515A<\u9EE8
\u9EEA\u9EF2
\u9EE1\u9EF6
\u9EE9\u9EF7
\u9EFE\u9EFD
\u9F0B\u9EFF
\u9F0D\u9F09
\u9F39\u9F34
\u9F50\u9F4A
\u658B\u9F4B
\u8D4D\u9F4E
\u9F51\u9F4F
\u9F7F\u9F52
\u9F80\u9F54
\u9F81\u9F55
\u9F82\u9F57
\u9F85\u9F59
\u9F87\u9F5C
\u9F83\u9F5F
\u9F86\u9F60
\u9F84\u9F61
\u51FA<\u9F63
\u9F88\u9F66
\u9F8A\u9F6A
\u9F89\u9F6C
\u9F8B\u9F72
\u816D\u9F76
\u9F8C\u9F77
\u9F99\u9F8D
\u5390\u9F8E
\u5E9E\u9F90
\u4DAE\u9F91
\u9F9A\u9F94
\u9F9B\u9F95
\u9F9F\u9F9C
\u4724\u9FC1
\u4CA4\u9FD0
\u9FD3\u9FD2`;

  // ../lossless-simplified-chinese/index.js
  var mapping = sc2tc.split(/\r?\n/);
  mapping.push("\u201C\u300C");
  mapping.push("\u2018\u300E");
  mapping.push("\u201D\u300D");
  mapping.push("\u2019\u300F");
  var overwrite = {
    "\u83B7": "\u7372\u7A6B",
    "\u7F30": "\u7E6E\u97C1",
    "\u8D5D": "\u8D0B\u8D17",
    "\u4F2A": "\u50DE\u507D",
    "\u6C47": "\u532F\u5F59",
    "\u575B": "\u58C7\u7F48",
    "\u53F0": "\u81FA\u98B1\u6AAF",
    "\u51B2": "\u6C96\u885D",
    "\u7877": "\u7906\u9E7C",
    "\u7EF1": "\u7DD4\u979D",
    "\u810F": "\u81DF\u9AD2",
    "\u8C2B": "\u8B2D\u8B7E",
    "\u94A9": "\u920E\u9264",
    "\u9FED": "\u9268\u9448",
    "\u9508": "\u92B9\u93FD",
    "\u95F2": "\u9591\u9592",
    "\u987B": "\u9808\u9B1A",
    "\u9CC4": "\u9C10\u9C77"
  };
  var t2s = {};
  var t2s_unsafe1 = {};
  var s2t = {};
  mapping.forEach((line, idx2) => {
    const r = line.match(/(.)(<?)(.+)/u);
    if (!r)
      throw "wrong data format " + idx2;
    let [m4, sc, op, tc] = r;
    let oldtc = tc;
    if (overwrite[sc])
      tc = overwrite[sc];
    if (op == "") {
      if (tc.length == 1) {
        t2s[tc] = sc;
      } else {
        if (tc[0] == ">") {
          t2s_unsafe1[tc.substring(1)] = sc;
        } else {
          t2s[tc[0]] = sc;
          tc = tc.substring(1);
          for (let i = 0; i < tc.length; i++) {
            const cp = tc.codePointAt(i);
            if (!cp)
              break;
            t2s_unsafe1[String.fromCodePoint(cp)] = sc;
          }
        }
      }
    } else {
      if (tc.length == 1) {
        t2s_unsafe1[tc] = sc;
      } else {
        while (tc && tc[0] !== ">") {
          const ch = String.fromCodePoint(tc.codePointAt(0));
          t2s_unsafe1[ch] = sc;
          tc = tc.substring(ch.length);
        }
      }
    }
    tc = oldtc.replace(/\>/g, "");
    if (op == "<") {
      s2t[sc] = tc.replace(sc, "") + sc;
    } else
      s2t[sc] = tc;
  });
  var toSim = (s, mode = 1) => {
    if (!s)
      return s;
    let out = "", i = 0;
    if (!mode)
      return s;
    while (i < s.length) {
      const cp = s.codePointAt(i);
      const ucs4 = String.fromCodePoint(cp);
      if (!ucs4)
        break;
      let sc = t2s[ucs4];
      if (mode == 2 && !sc)
        sc = t2s_unsafe1[ucs4];
      out += sc || ucs4;
      i++;
      if (cp > 65535)
        i++;
    }
    return out;
  };
  var fromSim = (s, mode = 1) => {
    let out = "", i = 0;
    if (!mode || !s)
      return s;
    while (i < s.length && s[i]) {
      const cp = s.codePointAt(i);
      const ucs4 = String.fromCodePoint(cp);
      if (!ucs4)
        break;
      let tc = s2t[ucs4];
      if (!tc) {
        out += ucs4;
      } else if (mode == 1 && !tc.codePointAt(1)) {
        out += tc;
      } else if (mode == 2) {
        out += String.fromCodePoint(tc.codePointAt(0));
      } else if (mode == 3) {
        if (tc.codePointAt(1))
          out += "[" + tc + "]";
        else
          out += tc;
      } else
        out += ucs4;
      i++;
      if (cp > 65535)
        i++;
    }
    return out;
  };

  // ../ptk/fts/inverted.ts
  var Inverted = class {
    constructor(section, postingStart) {
      this.words = new StringArray(section.shift(), { sep: LEMMA_DELIMITER });
      this.bmpwithposting = unpackIntDelta(section.shift());
      this.tokenlinepos = unpackIntDelta(section.shift());
      this.postings = [];
      this.postingStart = postingStart;
      this.bmppostingcount = 0;
      for (let i = 1; i < 65536; i++) {
        if (this.bmpwithposting[i])
          this.bmppostingcount++;
      }
    }
    nPostingOf(s) {
      const out = [];
      const tokens = tokenize(s);
      for (let i = 0; i < tokens.length; i++) {
        const { type, text: text2 } = tokens[i];
        let at = -1;
        if (type == 49 /* CJK_BMP */) {
          const cp = text2.charCodeAt(0);
          at = bsearchNumber(this.bmpwithposting, cp);
          if (this.bmpwithposting[at] !== cp) {
            const cpsim = fromSim(text2).charCodeAt(0);
            at = bsearchNumber(this.bmpwithposting, cpsim);
            if (this.bmpwithposting[at] !== cpsim)
              continue;
          }
        } else if (type >= 16 /* SEARCHABLE */) {
          if (~at)
            at += this.bmppostingcount;
          else {
            let at2 = this.words.find(s);
            if (~at2)
              at = at2 + this.bmppostingcount;
          }
          ;
        }
        out.push(at);
      }
      return out;
    }
  };

  // ../ptk/fts/posting.ts
  var counter = 0;
  var maxspeed = 0;
  var plFind = (arr, v, p2 = 0) => {
    let speed = 1;
    let p22 = p2;
    while (p22 < arr.length) {
      if (v > arr[p22]) {
        speed++;
        if (speed > maxspeed)
          maxspeed = speed;
      } else {
        if (speed <= 1)
          break;
        p22 -= speed;
        speed = 1;
      }
      p22 += speed;
      counter++;
    }
    return p22;
  };
  var plAnd = (pl1, pl2, dist = 1) => {
    let p2 = 0, c2 = 0;
    if (!pl1 || !pl2 || pl1.length == 0 || pl2.length == 0)
      return [];
    const sz = Math.min(pl1.length, pl2.length);
    let out = [];
    for (let p1 = 0; p1 < pl1.length; p1++) {
      let v1 = pl1[p1] + dist;
      let v2 = pl2[p2];
      while (v1 > v2 && p2 < pl2.length)
        v2 = pl2[++p2];
      if (v1 === v2) {
        out[c2++] = v1 - dist;
      }
    }
    return out.slice(0, c2);
  };
  var plCount = (pl, plgroup) => {
    let p2 = 0, start = 0, end = 0;
    const out = [];
    for (let i = 0; i < plgroup.length; i++) {
      const [from, to] = plgroup[i];
      start = p2;
      if (from > pl[p2])
        start = plFind(pl, from, p2);
      end = start;
      while (pl[end] < to && end < pl.length)
        end++;
      if (end > start) {
        out[i] = end - start;
      }
      p2 = end;
    }
    for (let i = 0; i < out.length; i++) {
      if (typeof out[i] !== "number")
        out[i] = 0;
    }
    return out;
  };
  var plTrim = (pl, from, to) => {
    const at1 = bsearchNumber(pl, from);
    let at2 = bsearchNumber(pl, to);
    if (pl[at2] < to)
      at2++;
    return pl.slice(at1, at2);
  };
  var plRanges = (posting, ranges) => {
    if (!ranges || !ranges.length)
      return posting;
    const out = [];
    let j2 = 0, r = ranges[j2];
    for (let i = 0; i < posting.length; i++) {
      const p2 = posting[i];
      if (p2 >= r[0] && r[1] >= p2)
        out.push(p2);
      while (p2 > r[0] && j2 < ranges.length - 1) {
        r = ranges[++j2];
      }
      if (j2 >= ranges.length)
        break;
    }
    return out;
  };
  var plContain = (posting, ltp, withHits = false) => {
    let p2, i = 0, j2 = 0;
    const lines = [], hits = [];
    while (i < posting.length) {
      let p3 = posting[i];
      let at = bsearchNumber(ltp, p3);
      if (at >= 0 && at < ltp.length) {
        if (lines[lines.length - 1] !== at) {
          lines.push(at);
        }
        if (withHits) {
          if (!hits[lines.length - 1])
            hits[lines.length - 1] = [];
          hits[lines.length - 1].push(p3 - ltp[at - 1]);
        }
        p3 = posting[i];
      }
      i++;
    }
    return [lines, hits];
  };

  // ../ptk/offtext/render.ts
  var RenderUnit = class {
    constructor(token, ntoken, offtext, postingoffset) {
      this.token = token;
      this.postingoffset = postingoffset;
      this.choff = token.choff;
      this.text = token.text;
      this.ntoken = ntoken;
      this.offtext = offtext;
      this.tags = [];
      this.hide = false;
      this.luminate = 0;
      this.highlight = false;
      this.css = "";
    }
    tagsOf(closing = false) {
      const out = [];
      if (!this.tags || !this.tags.length)
        return "";
      for (let i = 0; i < this.tags.length; i++) {
        const tag = this.offtext.getTag(this.tags[i]);
        if (this.choff == tag.choff + (closing ? tag.width - 1 : 0)) {
          out.push(this.tags[i]);
        }
      }
      return out;
    }
    closestTag() {
      return this.offtext.getTag(this.tags[this.tags.length - 1]);
    }
  };
  var findUnitText = (runits, text2, from = 0) => {
    for (let i = from; i < runits.length; i++) {
      if (runits[i].token.text === text2)
        return runits[i];
    }
  };
  var getRenderUnitClasses = (ru, prepend = "", append2 = "") => {
    const css = [];
    css.push(prepend);
    const ot = ru.offtext;
    for (let j2 = 0; j2 < ru.tags.length; j2++) {
      const tag = ot.tags[ru.tags[j2]];
      css.push(tag.name);
      if (tag.active)
        css.push(tag.name + "_active");
      const hasbracket = closeBracketOf(ru.offtext.tagRawText(tag)) ? 1 : 0;
      if (ru.choff == tag.choff + hasbracket)
        css.push(tag.name + "_start");
      if (ru.choff == tag.choff + tag.width - 1 - hasbracket)
        css.push(tag.name + "_end");
    }
    if (ru.highlight)
      css.push("highlight");
    css.push(append2);
    ru.hide && css.push("hide");
    return css.join(" ");
  };
  var renderOfftext = (linetext = "", opts = {}) => {
    const extra = opts.extra || [];
    const hits = opts.hits || [];
    const phraselength = opts.phraselength || [];
    const ot = new Offtext(linetext, opts.line || 0);
    let postingoffset = 0;
    const runits = tokenize(ot.plain).map((tk, idx2) => {
      postingoffset++;
      const ru = new RenderUnit(tk, idx2, ot, postingoffset);
      return ru;
    });
    const tagsAt = [];
    let phit = 0, pextra = 0;
    for (let i = 0; i < ot.tags.length; i++) {
      const tag = ot.tags[i];
      for (let j2 = tag.choff; j2 <= tag.choff + tag.width; j2++) {
        if (!tagsAt[j2])
          tagsAt[j2] = [];
        tagsAt[j2].push(i);
      }
    }
    for (let i = 0; i < runits.length; i++) {
      const ru = runits[i];
      ru.tags = tagsAt[ru.token.choff] || [];
      if (extra.length && pextra < extra.length) {
        if (ru.choff == extra[pextra].choff) {
          ru.extra = extra[pextra];
          pextra++;
        }
      }
      if (hits && hits.length && phit < hits.length) {
        if (ru.postingoffset >= hits[phit] && ru.postingoffset < hits[phit] + phraselength[phit] && ru.token.type >= 16 /* SEARCHABLE */) {
          ru.highlight = true;
        }
        if (hits[phit] < ru.postingoffset)
          phit++;
        if (ru.highlight) {
          ru.luminate++;
          let j2 = i + 1;
          while (j2 < runits.length) {
            if (runits[j2].token.type >= 16 /* SEARCHABLE */ || j2 - i < MIN_ABRIDGE)
              j2++;
            else
              break;
            if (j2 < runits.length)
              runits[j2].luminate++;
          }
          j2 = i - 1;
          while (j2 > 0) {
            if (runits[j2].token.type >= 16 /* SEARCHABLE */ || i - j2 < MIN_ABRIDGE)
              j2--;
            else
              break;
            if (j2 >= 0)
              runits[j2].luminate++;
          }
        }
      }
      const bracket = closeBracketOf(ru.text);
      if (ru.hide || ru.tags.length && bracket) {
        ru.hide = true;
        const closeAt = findUnitText(runits, bracket, i + 1);
        if (closeAt)
          closeAt.hide = true;
      }
    }
    return [runits, ot];
  };
  var abridgeRenderUnits = (runits, minwidth = 20) => {
    const out = [];
    let abridged = [];
    const addAbridge = (final = false) => {
      if (abridged.length > MIN_ABRIDGE) {
        out.push([abridged.length, abridged[0], final]);
      } else {
        for (let j2 = 0; j2 < abridged.length; j2++) {
          out.push(runits[abridged[j2]]);
        }
      }
      abridged = [];
    };
    if (runits.length < minwidth)
      return runits;
    for (let i = 0; i < runits.length; i++) {
      const ru = runits[i];
      if (ru.luminate) {
        addAbridge();
        out.push(ru);
      } else {
        abridged.push(i);
      }
    }
    addAbridge(true);
    return out;
  };

  // ../ptk/platform/chromefs.ts
  var m = typeof navigator !== "undefined" && navigator.userAgent.match(/Chrome\/(\d+)/);
  var supprtedBrowser = m && parseInt(m[1]) >= 86;

  // ../ptk/basket/pool.ts
  var _pool = {};
  var poolGet = (name2) => _pool[name2];
  var poolAdd = (name2, inst) => _pool[name2] = inst;
  var poolDel = (name2) => delete _pool[name2];
  var hasLang = (lang) => {
    for (const name2 in _pool) {
      const ptk = _pool[name2];
      if (ptk.lang === lang)
        return true;
    }
  };
  var poolParallelPitakas = (ptk) => {
    let align = ptk.attributes?.align;
    if (!align)
      align = ptk.name.replace(/\-[^-]+$/, "");
    const out = [];
    for (const n in _pool) {
      if (_pool[n].attributes.align == align || n.replace(/\-[^-]+$/, "") == align) {
        if (ptk.name !== _pool[n].name)
          out.push(n);
      }
    }
    return out;
  };

  // ../ptk/linebase/loadpage.ts
  var pagefilename = (page) => page.toString().padStart(3, "0") + ".js";
  var makePageURI = (folder, page) => {
    const fn = folder + "/" + pagefilename(page);
    return fn;
  };
  async function loadNodeJs(page) {
    const fn = makePageURI(this.name, page);
    try {
      const data = await fs.promises.readFile(fn, "utf8");
      this.setPage(page, ...parseJsonp(data));
    } catch (e) {
      console.error("readFile failed,", fn, e);
    }
  }
  async function loadRemoteZip(page) {
    throw "not implement yet";
  }
  async function loadInMemoryZipStore(page) {
    let content;
    const fn = this.name + "/" + pagefilename(page);
    for (let i = 0; i < this.zipstore.files.length; i++) {
      if (this.zipstore.files[i].name == fn) {
        content = new TextDecoder().decode(this.zipstore.files[i].content);
      }
    }
    content && this.setPage(page, ...parseJsonp(content));
  }
  async function loadFetch(page) {
    if (this.zip) {
      const data = await this.zip.readTextFile(this.name + "/" + pagefilename(page));
      this.setPage(page, ...parseJsonp(data));
      return;
    }
    const uri = makePageURI(this.name, page);
    try {
      const res = await fetch(uri);
      const text2 = await res.text();
      const arr = parseJsonp(text2);
      this.setPage(page, ...arr);
    } catch (e) {
      this.failed = true;
    }
  }
  var jsonp = (page, header, _payload) => {
    const ptk = poolGet(header.name);
    ptk.setPage(page, header, _payload);
  };
  function isLoaded(page) {
    return page == 0 ? this.pagestarts.length : this._pages[page - 1];
  }
  async function loadJSONP(page) {
    if (isLoaded.call(this, page))
      return;
    if (!typeof window.jsonp !== "function") {
      window.jsonp = jsonp;
    }
    let tried = 0, timer;
    const that = this;
    try {
      const status = await loadScript(makePageURI(that.name, page), () => {
        if (isLoaded.call(that, page))
          return true;
        timer = setInterval(() => {
          tried++;
          if (tried > 10 || isLoaded.call(that, page)) {
            if (tried > 10)
              console.error("failed loading page", page, that.name);
            clearInterval(timer);
          }
        }, 10);
      });
    } catch (e) {
      this.failed = true;
    }
  }

  // ../ptk/linebase/linebase.ts
  var instancecount = 0;
  var combineRange = (range) => {
    const combined = [];
    let from = 0;
    range = range.filter((it) => !!it);
    if (Array.isArray(range[0]) && range.length) {
      range.sort((a, b) => a - b);
      from = range[0][0];
      for (let i = 1; i < range.length; i++) {
        if (range[i][0] > range[i - 1][1]) {
          combined.push([from, range[i - 1][1]]);
          from = range[i][0];
        }
      }
      if (range[range.length - 1][1] > from)
        combined.push([from, range[range.length - 1][1]]);
    } else {
      return range;
    }
    return combined;
  };
  var LineBase = class {
    constructor(opts = {}) {
      this.pageOfLine = (line) => {
        if (line >= this.pagestarts[this.pagestarts.length - 1])
          return this.pagestarts.length - 1;
        return bsearchNumber(this.pagestarts, line, true);
      };
      this.stamp = ++instancecount;
      this._pages = [];
      this._lineoffsets = [];
      this.pagestarts = [];
      this.header = { starts: [], sectionnames: [], sectionstarts: [], sectiontypes: [] };
      this.name = opts.name || "";
      this.zip = opts.zip;
      this.zipstore = opts.zipstore;
      this.payload;
      let protocol = typeof chrome !== "undefined" ? "chrome-extension:" : "";
      this._loader = () => {
      };
      if (typeof window !== "undefined") {
        protocol = window.location.protocol;
      }
      if (this.zipstore) {
        this._loader = loadInMemoryZipStore;
      } else if (protocol === "http:" || protocol === "https:" || protocol === "chrome-extension:") {
        this._loader = loadFetch;
      } else if (protocol == "file:") {
        this._loader = loadJSONP;
      } else {
        this._loader = this.zip ? loadRemoteZip : loadNodeJs;
      }
      this.failed = false;
      if (!opts.inmemory) {
        this._loader.call(this, 0);
      }
    }
    async loadAll() {
      await this.loadLines([[0, this.pagestarts[this.pagestarts.length - 1]]]);
    }
    inMem() {
      return this.inmemory || this.zipstore;
    }
    pageOfRange([from, to]) {
      if (from < 0)
        return [];
      if (from > to)
        to += from;
      const cstart = this.pageOfLine(from);
      const cend = this.pageOfLine(to);
      const notloaded = [];
      for (let i = cstart; i < cend + 1; i++) {
        if (!this._pages[i])
          notloaded.push(i);
      }
      return notloaded;
    }
    async loadLines(_range) {
      const that = this;
      let toload = [], range = combineRange(_range);
      const notincache = {};
      for (let i = 0; i < range.length; i++) {
        if (Array.isArray(range[i])) {
          const [from, to] = range[i];
          toload.push(...this.pageOfRange([from, to]));
        } else {
          notincache[this.pageOfLine(range[i])] = true;
        }
      }
      toload.push(...Object.keys(notincache).map((it) => parseInt(it)));
      toload = unique(toload.filter((it) => !that._pages[it]));
      const jobs = [];
      for (let i = 0; i < toload.length; i++) {
        jobs.push(this._loader.call(this, toload[i] + 1));
      }
      await Promise.all(jobs);
    }
    lineCount() {
      return this.header.starts[this.header.starts.length - 1];
    }
    getPageLineOffset(page, line) {
      if (page > this._pages.length)
        return 0;
      if (line == 0)
        return 0;
      if (line > this._lineoffsets[page].length)
        return this._pages[page].length;
      return this._lineoffsets[page][line - 1];
    }
    getLines(nlines) {
      if (!nlines.length)
        return [];
      let out = Array();
      let pline = nlines[0];
      let start = pline;
      for (let i = 1; i < nlines.length; i++) {
        if (pline + 1 !== nlines[i]) {
          out = out.concat(this.slice(start, i));
          start = nlines[i];
        }
        pline = nlines[i];
      }
      out = out.concat(this.slice(start, pline + 1));
      return out;
    }
    getLine(nline) {
      return this.slice(nline, nline + 1)[0];
    }
    slice(nline, to) {
      if (!to)
        to = nline + 1;
      const p1 = this.pageOfLine(nline, this.pagestarts);
      const p2 = this.pageOfLine(to, this.pagestarts);
      let out = "";
      for (let i = p1; i <= p2; i++) {
        if (!this._pages[i])
          return out.split("\n");
        if (i == p1 || i == p2) {
          let slicefrom = this.getPageLineOffset(i, nline - (p1 > 0 ? this.pagestarts[p1 - 1] : 0));
          if (nline)
            slicefrom++;
          const sliceto = this.getPageLineOffset(i, to - (p2 > 0 ? this.pagestarts[p2 - 1] : 0));
          if (p2 > p1) {
            if (i == p1)
              out = this._pages[i].slice(slicefrom);
            else
              out += (out ? "\n" : "") + this._pages[i].slice(0, sliceto);
          } else {
            out += this._pages[i].slice(slicefrom, sliceto);
          }
        } else
          out += "\n" + this._pages[i];
      }
      return out.split("\n");
    }
    setPage(page, header, payload) {
      if (page == 0) {
        this.header = header;
        this.name = this.header.name;
        this.pagestarts = header.starts;
        this.payload = payload || "nopayload";
        this.opened = true;
      } else if (page > 0) {
        this._pages[page - 1] = payload;
        this._lineoffsets[page - 1] = lineBreaksOffset(payload);
      }
    }
    isReady() {
      if (this.payload)
        return true;
      const that = this;
      let timer = 0;
      return new Promise((resolve) => {
        timer = setInterval(() => {
          if (that.failed)
            resolve(false);
          else if (that.payload) {
            clearInterval(timer);
            resolve(true);
          }
        }, 50);
      });
    }
    getSection(name2) {
      const [from, to] = this.sectionRange(name2);
      if (from == to)
        return [];
      return this.slice(from, to);
    }
    sectionRange(sname) {
      const notfound = [0, 0];
      const { sectionnames, sectionstarts } = this.header;
      if (!sectionnames || !sectionnames.length)
        return notfound;
      for (let i = 0; i < sectionnames.length; i++) {
        const name2 = sectionnames[i];
        if (sname && name2 == sname) {
          const endoflastsection = i < sectionstarts.length - 1 ? sectionstarts[i + 1] : this.pagestarts[this.pagestarts.length - 1];
          return [sectionstarts[i], endoflastsection];
        }
      }
      return notfound;
    }
  };

  // ../ptk/compiler/basefield.ts
  var Field = class {
    constructor(name2, def) {
      this.name = name2;
      this.foreign = def.foreign || "";
      this.pattern = def.pattern || null;
      this.keys = def.keys || [];
      this.unique = null;
      this.optional = true;
      this.caption = "";
      this.type = def.type || "string";
      this.values = [];
      this.bracket = [];
      this.sortedIndex;
      for (let n in def) {
        if (!this.hasOwnProperty(n)) {
          console.log("unknown defining attr", n, "of", name2, def);
        }
        this[n] = def[n];
      }
      if (def.unique)
        this.unique = {};
    }
    validate(value, line) {
      return [0, value];
    }
    find() {
      return -1;
    }
  };

  // ../ptk/compiler/error.ts
  var MAX_VERROR = 10;

  // ../ptk/compiler/keyfield.ts
  var KeyField = class extends Field {
    constructor(name2, def) {
      super(name2, def);
      this.type = "key";
    }
    validate(value, line) {
      const keys = this.keys;
      if (!keys)
        return ["NO_KEYS" /* NoKeys */, value];
      if (!value) {
        return [this.optional ? 0 : "MANDANTORY" /* Mandatory */, []];
      }
      const at = bsearch(keys, value);
      if (keys[at] !== value) {
        return ["NO_KEY" /* NoKey */, []];
      } else {
        return [0, at];
      }
    }
  };

  // ../ptk/compiler/keysfield.ts
  var KeysField = class extends Field {
    constructor(name2, def) {
      super(name2, def);
      this.type = "keys";
    }
    validate(value, line) {
      const keys = this.keys;
      if (!keys)
        return ["NO_KEYS" /* NoKeys */, value];
      if (!value) {
        return [this.optional ? 0 : "MANDANTORY" /* Mandatory */, []];
      }
      const items = value.split(",").map((it) => {
        if (!it)
          return 0;
        const at = bsearch(keys, it);
        if (keys[at] === it) {
          return at;
        } else {
          return -1;
        }
      }).filter((it) => !!it).sort((a, b) => a - b);
      if (items.filter((it) => it === -1).length) {
        return ["NO_KEY" /* NoKey */, []];
      } else {
        return [0, items];
      }
    }
  };

  // ../ptk/compiler/textfield.ts
  var TextField = class extends Field {
    constructor(name2, def) {
      super(name2, def);
      this.type = "text";
    }
  };

  // ../ptk/compiler/numberfield.ts
  var NumberField = class extends Field {
    constructor(name2, def) {
      super(name2, def);
      this.type = "number";
      this.sortedIndex = null;
    }
    _sort() {
      [this.values, this.sortedIndex] = sortNumberArray(this.values);
    }
    find(value) {
      if (!this.values.length)
        return -1;
      if (!this.sortedIndex)
        this._sort();
      const at = bsearch(this.values, value);
      return this.values[at] == value ? this.sortedIndex[at] : -1;
    }
    validate(value, line) {
      const n = parseInt(value);
      if (n.toString() !== value && value.length) {
        return ["NOT_NUMBER" /* NotANumber */, 0];
      }
      if (this.pattern && !value.match(this.pattern)) {
        return ["PATTERN_MISMATCH" /* Pattern */, 0];
      }
      if (this.unique && n >= 0) {
        if (this.unique[value]) {
          return ["NOT_UNIQUE" /* NotUnique */, value, this.unique[value]];
        } else {
          this.unique[value] = line;
        }
      }
      return [0, parseInt(value)];
    }
  };

  // ../ptk/compiler/numbersfield.ts
  var NumbersField = class extends Field {
    constructor(name2, def) {
      super(name2, def);
      this.type = "numbers";
    }
    validate(value, line) {
      if (typeof value == "undefined") {
        console.log("undefined", line);
      }
      const items = value.split(",");
      const out = [];
      for (let i = 0; i < items.length; i++) {
        const v = items[i];
        const n = parseInt(items[i]);
        if (n.toString() !== v && v.length) {
          return ["NOT_NUMBER" /* NotANumber */, line];
        }
        if (this.pattern && !v.match(this.pattern)) {
          return ["PATTERN_MISMATCH" /* Pattern */, line];
        }
        out.push(n);
      }
      return [0, out];
    }
  };

  // ../ptk/compiler/groupfield.ts
  var GroupField = class extends Field {
    constructor(name2, def) {
      super(name2, def);
      this.type = def.type || "range";
      this.ranges = {};
    }
    validate(value, line) {
      if (!value) {
        return [this.optional ? 0 : VError.Mandatory, []];
      }
      if (!this.ranges[value])
        this.ranges[value] = [];
      this.ranges[value].push(line);
      if (isNaN(value)) {
        throw "group index should be numeric";
      }
      return [0, parseInt(value)];
    }
    serialize(out) {
      const keys = Object.keys(this.ranges);
      keys.sort(alphabetically);
      out.push(keys.join(LEMMA_DELIMITER));
      const delta2d = [];
      for (let i = 0; i < keys.length; i++) {
        delta2d.push(this.ranges[keys[i]]);
      }
      out.push(packIntDelta2d(delta2d));
      out.push();
    }
    deserialize(section) {
      const keys = (section.shift() || "").split(LEMMA_DELIMITER);
      const arr = unpackIntDelta2d(section.shift());
      for (let i = 0; i < keys.length; i++) {
        this.ranges[keys[i]] = arr[i];
      }
    }
  };

  // ../ptk/compiler/fielder.ts
  function createField(name2, def, primarykeys, ownkeys) {
    if (typeof def !== "string") {
      return new Field(name2, def);
    }
    let v;
    const m4 = def.match(/([a-z_]+):?([a-z_]*)\/?(.*)/);
    if (!m4) {
      return;
    }
    const typename = m4[1], foreign = m4[2];
    let pat = m4[3], pattern;
    if (pat) {
      const at2 = pat.lastIndexOf("/");
      let regopts = "";
      if (at2 > 0) {
        regopts = pat.slice(at2 + 1);
        pat = pat.slice(0, at2);
      }
      pattern = new RegExp(pat, regopts);
    }
    if (typename === "number")
      v = new NumberField(name2, { pattern, foreign });
    else if (typename === "numbers")
      v = new NumbersField(name2, { pattern, foreign });
    else if (typename === "unique_number")
      v = new NumberField(name2, { pattern, unique: true, optional: false, foreign });
    else if (typename === "unique")
      v = new TextField(name2, { pattern, unique: true, optional: false, foreign });
    else if (typename === "string")
      v = new Field(name2, { pattern, foreign });
    else if (typename === "text")
      v = new TextField(name2, { pattern });
    else if (typename === "key") {
      const keys = primarykeys && primarykeys[foreign] || ownkeys;
      v = new KeyField(name2, { keys, pattern, foreign, optional: false });
    } else if (typename === "keys") {
      const keys = primarykeys && primarykeys[foreign] || ownkeys;
      v = new KeysField(name2, { keys, pattern, foreign });
    } else if (typename === "group") {
      v = new GroupField(name2, { type: typename });
    } else if (typename === "note") {
      const keys = primarykeys && primarykeys[foreign] || ownkeys;
      v = new Field(name2, { type: typename, keys, pattern, foreign });
    } else if (typename === "confer") {
      v = new Field(name2, { type: typename, foreign });
    }
    if (!v)
      v = new Field(name2, {});
    return v;
  }
  function validate_z(offtext, tag) {
    const depth = parseInt(tag.name.slice(1, 2), 36) - 10;
    if (isNaN(depth))
      return;
    if (!(depth == this.prevdepth || depth == this.prevdepth + 1 || depth < this.prevdepth)) {
      const msg = "\u76EE\u5F54\u6DF1\u5EA6\u9519\u8BEF " + this.prevdepth + "+1!=" + depth;
      this.errors.push({ msg, offset: tag.offset, prev: this.prevzline });
    }
    let text2 = offtext.tagText(tag);
    const bracket = closeBracketOf(text2);
    if (text2.slice(text2.length - 1) == bracket)
      text2 = text2.slice(1, text2.length - 1);
    const line = this.compiledLine + this.line;
    this.toc.push({ depth, text: text2, key: this.zcount, line });
    this.zcount++;
    this.prevzline = line;
    this.prevdepth = depth;
  }

  // ../ptk/compiler/typedef.ts
  var reservedAttributes = {
    caption: true,
    lazy: false,
    key: true,
    field: true,
    text: true,
    type: true
  };
  var Typedef = class {
    constructor(attrs, tagname, primarykeys) {
      this.fields = {};
      this.mandatory = {};
      this.tagname = tagname;
      this.linepos = [];
      this.innertext = [];
      for (let aname in attrs) {
        const def = attrs[aname];
        const opts = typeof def == "string" ? def : { optional: false };
        const V = createField(tagname, opts, primarykeys);
        if (V)
          this.fields[aname] = V;
        if (V && !V.optional && !reservedAttributes[aname])
          this.mandatory[aname] = true;
      }
      this.attrs = attrs;
      this.column = "";
    }
    validateTag(offtext, tag, line, compiledLine, onError) {
      let touched = false, newtag;
      if (this.fields.id || this.attrs.savelinepos) {
        this.linepos.push(compiledLine + line);
      }
      if (this.fields.bracket) {
        let tagtext = offtext.tagText(tag);
        if (this.fields.bracket !== "true")
          tagtext = removeBracket(tagtext);
        this.innertext.push(tagtext);
      }
      for (let aname in tag.attrs) {
        const V = this.fields[aname];
        let value = tag.attrs[aname];
        if (V && !V.foreign)
          V.values.push(tag.attrs[aname]);
        let [err, newvalue, refline] = V && V.validate(tag.attrs[aname], line) || [0, value, -1];
        if (err) {
          onError(err, newvalue, refline);
        } else if (newvalue != value) {
          if (!touched) {
            newtag = Object.assign({}, tag);
            newtag.attrs = Object.assign({}, tag.attrs);
          }
          if (Array.isArray(newvalue))
            newvalue = newvalue.join(",");
          newtag.attrs[aname] = newvalue;
          touched = true;
        }
      }
      for (let aname in this.mandatory) {
        if (!tag.attrs.hasOwnProperty(aname) && this.mandatory[aname]) {
          onError("MANDANTORY" /* Mandatory */, aname);
        }
      }
      return newtag;
    }
    deserialize(section) {
      const attrline = section.shift();
      const attrs = attrline ? attrline.split(LEMMA_DELIMITER) : [];
      if (section.length > attrs.length) {
        this.linepos = unpackIntDelta(section.shift());
      }
      this.innertext = null;
      if (!section.length)
        return;
      if (this.fields.bracket) {
        this.innertext = new StringArray(section.shift(), { sep: LEMMA_DELIMITER });
      }
      for (let i = 0; i < attrs.length; i++) {
        const aname = attrs[i];
        const V = this.fields[aname];
        if (!V) {
          console.error("unknown type " + aname);
          continue;
        }
        if (V?.type === "number") {
          V.values = unpackInt(section.shift());
        } else if (V?.type === "text") {
          V.values = section.length ? section.shift().split("	") : [];
        }
      }
      if (section.length) {
        console.log("unconsumed section lines", section.length);
      }
    }
    serialize() {
      const attrs = [], out = [];
      if (this.linepos.length) {
        out.push(packIntDelta(this.linepos));
      }
      if (this.fields.bracket) {
        out.push(this.innertext.join(LEMMA_DELIMITER));
      }
      for (let aname in this.fields) {
        const V = this.fields[aname];
        if (V.foreign)
          continue;
        if (V.type == "number") {
          attrs.push(aname);
          out.push(packInt(V.values.map((it) => parseInt(it))));
        } else if (V.type == "text") {
          attrs.push(aname);
          out.push(V.values.join("	"));
        }
      }
      out.unshift(attrs.join(LEMMA_DELIMITER));
      return out.length ? out.join("\n") : null;
    }
  };

  // ../ptk/compiler/predefines.ts
  var predefines = {
    generic: `^:ak<id=unique bracket=false>
^:bk<id=unique  bracket=false>
^:ck<id=unique bracket=false>
^:ad
^:bc
^:ver<savelinepos=true>
^:f<id=number>
^:fn<id=number>`,
    cs: `^:ak<id=unique  bracket=false>
^:bk<id=unique>
^:ck<caption=chunk id=unique bracket=false>
^:n
^:h
^:sz
^:https
`
  };

  // ../ptk/compiler/compiler.ts
  var sourceType = (firstline, filename) => {
    const at = firstline.indexOf("\n");
    firstline = at > -1 ? firstline.slice(0, at) : firstline;
    const [text2, tags] = parseOfftext(firstline);
    let lazy = true, sourcetype, name2, caption;
    let consumed = false;
    sourcetype = filename?.endsWith(".tsv") ? "tsv" /* TSV */ : "txt" /* Offtext */;
    if (tags.length && tags[0].name == ":") {
      const attrs = tags[0].attrs;
      if (attrs.hasOwnProperty(lazy))
        lazy = !!attrs.lazy;
      sourcetype = tags[0].attrs.type?.toLowerCase() || sourcetype;
      name2 = attrs.name;
      caption = attrs.caption;
      consumed = true;
      if (sourcetype == "tsv") {
        consumed = false;
        lazy = false;
      }
    }
    return { sourcetype, tag: tags[0], lazy, name: name2, caption, consumed };
  };
  var Compiler2 = class {
    constructor(opts = {}) {
      this.reset(opts);
    }
    reset(opts = {}) {
      this.ptkname = "";
      this.compilingname = "";
      this.line = 0;
      this.compiledLine = 0;
      this.compiledFiles = {};
      this.primarykeys = {};
      this.errors = [];
      this.typedefs = {};
      this.stopcompile = false;
      this.toc = [];
      this.zcount = 0;
      this.prevzline = 0;
      this.prevdepth = 0;
      this.tagdefs = [];
    }
    onError(code, msg, refline = -1, line) {
      this.errors.push({ name: this.compilingname, line: line || this.line, code, msg, refline });
      if (this.errors.length >= MAX_VERROR)
        this.stopcompile = true;
    }
    setPredefine(name2 = "generic") {
      const predefine = predefines[name2] || "";
      this.compileOfftext(predefine, this.tagdefs);
    }
    compileOfftext(str, tagdefs) {
      const at = str.indexOf("^");
      if (at == -1)
        return str;
      const ot = new Offtext(str);
      let updated = false;
      for (let i = 0; i < ot.tags.length; i++) {
        const tag = ot.tags[i];
        if (tag.name[0] == ":" && tag.name.length > 1) {
          const newtagname = tag.name.slice(1);
          if (this.typedefs[newtagname]) {
            this.onError("TYPE_REDEF" /* TypeRedef */, newtagname);
          } else {
            this.typedefs[newtagname] = new Typedef(tag.attrs, newtagname, this.primarykeys);
          }
          tagdefs.push(str);
          str = null;
        } else {
          if (tag.name[0] == "z") {
            validate_z.call(this, ot, tag);
          } else {
            const typedef = this.typedefs[tag.name];
            if (!typedef) {
              this.onError("MISSING_TYPEDEF" /* MissingTypedef */, tag.name);
            } else {
              const newtag = typedef.validateTag(ot, tag, this.line, this.compiledLine, this.onError.bind(this));
              if (newtag) {
                str = updateOfftext(str, tag, newtag);
                updated = true;
              }
            }
          }
        }
      }
      return str;
    }
    clearCompiled(filename) {
      delete this.compiledFiles[filename];
    }
    compileBuffer(buffer, filename) {
      if (!buffer)
        return this.onError("EMPTY_BUFFER" /* Empty */);
      if (!filename)
        return this.onError("PTK_NONAME" /* PtkNoName */);
      let processed, samepage = false, tagdefs = [], attributes = {};
      const sa = new StringArray(buffer, { sequencial: true });
      const firstline = sa.first();
      const { sourcetype, tag, lazy, name: name2, caption, consumed } = sourceType(firstline, filename);
      if (sourcetype == "txt" && consumed)
        tagdefs.push(firstline);
      let compiledname = name2 || filename;
      let textstart = 0;
      this.compilingname = filename;
      this.stopcompile = false;
      if (tag?.name == ":") {
        if (tag.attrs.ptk) {
          if (this.ptkname && this.ptkname !== tag.attrs.ptk) {
            this.onError("PTK_NAMED" /* PtkNamed */, this.ptkname);
          } else {
            this.ptkname = tag.attrs.ptk;
          }
        }
        if (tag.attrs.type === "txt" || filename == "0.off")
          this.setPredefine(tag.attrs.define);
        attributes = tag.attrs;
      }
      if (sourcetype === "tsv" /* TSV */) {
        const [text2, tags] = parseOfftext(firstline);
        const attrs = tags[0].attrs;
        const typedef = text2.split("	");
        const columns = new Column({ typedef, primarykeys: this.primarykeys, onError: this.onError.bind(this) });
        const [serialized, _textstart] = columns.fromStringArray(sa, attrs, 1);
        textstart = _textstart;
        if (serialized) {
          compiledname = attrs.name || filename;
          serialized.unshift(firstline);
          if (attrs.name)
            this.primarykeys[attrs.name] = columns.keys;
          this.compiledLine += serialized.length;
          processed = serialized;
          textstart++;
          samepage = true;
        } else {
          processed = [];
        }
      } else {
        const out = [];
        let linetext = sa.first();
        if (consumed)
          linetext = sa.next();
        this.line = 0;
        while (linetext || linetext === "") {
          const o = this.compileOfftext(linetext, tagdefs);
          if (o || o == "") {
            out.push(o);
            this.line++;
          }
          linetext = sa.next();
          if (this.stopcompile)
            break;
        }
        this.compiledLine += out.length;
        processed = out;
      }
      this.compiledFiles[filename] = {
        name: compiledname,
        caption,
        lazy,
        sourcetype,
        processed,
        textstart,
        errors: this.errors,
        samepage,
        tagdefs,
        attributes
      };
      return this.compiledFiles[filename];
    }
  };

  // ../ptk/compiler/toc.ts
  var TableOfContent = class {
    constructor(section, name2) {
      this.lines = unpackIntDelta(section.shift());
      this.depths = unpackInt(section.shift());
      this.texts = new StringArray(section.shift());
    }
  };

  // ../ptk/linebase/column.ts
  var Column = class {
    constructor(opts = {}) {
      this.fieldvalues = [];
      this.fieldnames = [];
      this.fieldsdef = [];
      this.attrs;
      this.name = "";
      this.keys = null;
      this.primarykeys = opts.primarykeys || {};
      this.onError = opts.onError;
      this.typedef = opts.typedef;
      this.tokenfield = -1;
      this.tokentable = null;
    }
    addColumn(name2) {
      this.fieldnames.push(name2);
      this.fieldvalues.push([]);
    }
    tokenizeField(value) {
      const tokenized = tokenize(value);
      for (let i = 0; i < tokenized.length; i++) {
        const { text: text2, type } = tokenized[i];
        if (type > 16 /* SEARCHABLE */ && !this.tokentable[text2]) {
          this.tokentable[text2] = true;
        }
      }
    }
    addRow(fields, nrow, skipFirstField) {
      let i = 0;
      if (skipFirstField)
        i++;
      for (; i < this.fieldsdef.length; i++) {
        const F2 = this.fieldsdef[i];
        const [err, value] = F2.validate(fields[i], nrow);
        if (err) {
          this.onError && this.onError(err, this.fieldnames[i] + " " + fields[i], -1, nrow);
        }
        this.fieldvalues[i].push(value || "");
        if (i + 1 == this.tokenfield)
          this.tokenizeField(value);
      }
    }
    createFields(typedef) {
      if (typedef)
        for (let idx2 in typedef) {
          const fieldtype = typedef[idx2] || "key=string";
          const [name2, def] = fieldtype.split("=");
          this.addColumn(name2);
          const field = createField(name2, def || {}, this.primarykeys, this.keys);
          this.fieldsdef.push(field);
        }
    }
    deserialize(section) {
      if (!section.length)
        return;
      const firstline = section.shift();
      const [text2, tags] = parseOfftext(firstline);
      if (!section.length)
        return;
      this.attrs = tags[0]?.attrs;
      this.name = this.attrs.name;
      this.caption = this.attrs.caption;
      const typedef = text2.split("	");
      this.createFields(typedef);
      if (this.attrs.keytype == "serial") {
        this.keys = null;
      } else {
        this.keys = new StringArray(section.shift(), { sep: LEMMA_DELIMITER });
      }
      if (this.attrs.tokenfield) {
        this.tokenfield = parseInt(this.attrs.tokenfield);
        this.tokentable = section.shift()?.split(LEMMA_DELIMITER);
        this.tokentable.sort(alphabetically);
      }
      let idx2 = 0, usesection = false;
      for (let fieldname in this.fieldsdef) {
        const field = this.fieldsdef[fieldname];
        if (field.type === "number") {
          this.fieldvalues[idx2] = unpackInt(section.shift());
        } else if (field.type === "numbers") {
          this.fieldvalues[idx2] = unpackIntDelta2d(section.shift());
        } else if (field.type === "keys") {
          this.fieldvalues[idx2] = unpackIntDelta2d(section.shift());
        } else if (field.type === "key") {
          this.fieldvalues[idx2] = unpackInt(section.shift());
        } else if (field.type === "string") {
          this.fieldvalues[idx2] = section.shift().split(LEMMA_DELIMITER);
        } else if (field.type === "group") {
          field.deserialize(section);
          this.fieldvalues[idx2] = unpackInt(section.shift());
        } else if (field.type === "text") {
          usesection = true;
          this.fieldvalues[idx2] = section;
        }
        if (!this[field.name]) {
          this[field.name] = this.fieldvalues[idx2];
        }
        idx2++;
      }
      if (!usesection && section.length) {
        console.log("section not consumed");
      }
    }
    fromStringArray(sa, attrs = {}, from = 1) {
      const allfields = [];
      let line = sa.first();
      let textstart = 0;
      let skipFirstField = false;
      while (from > 0) {
        line = sa.next();
        from--;
      }
      while (line || line === "") {
        const fields = line.split("	");
        allfields.push(fields);
        line = sa.next();
      }
      if (attrs.keytype !== "serial") {
        allfields.sort(alphabetically0);
        skipFirstField = true;
        this.keys = allfields.map((it) => it[0]);
      }
      this.createFields(this.typedef);
      if (attrs.tokenfield) {
        this.tokenfield = parseInt(attrs.tokenfield || -1);
        this.tokentable = {};
        if (this.tokenfield === 0)
          this.tokenizeField(this.keys.join(LEMMA_DELIMITER));
      }
      if (!this.fieldnames.length) {
        throw "missing typedef";
        return;
      }
      for (let i = 0; i < allfields.length; i++) {
        this.addRow(allfields[i], i + 1, skipFirstField);
      }
      const out = [];
      if (this.keys)
        out.push(this.keys.join(LEMMA_DELIMITER));
      if (this.tokenfield > -1) {
        out.push(Object.keys(this.tokentable).join(LEMMA_DELIMITER));
      }
      for (let i = 0; i < this.fieldnames.length; i++) {
        const V = this.fieldsdef[i];
        if (V.type == "number" || V.type == "line") {
          const numbers = this.fieldvalues[i].map((it) => parseInt(it) || 0) || [];
          out.push(packInt(numbers));
        } else if (V.type == "numbers") {
          const numbers = this.fieldvalues[i] || [];
          out.push(packIntDelta2d(numbers));
        } else if (V.type == "keys") {
          const numnums = this.fieldvalues[i] || [];
          out.push(packIntDelta2d(numnums));
        } else if (V.type == "key") {
          const nums = this.fieldvalues[i] || [];
          out.push(packInt(nums));
        } else if (V.type == "string") {
          out.push(this.fieldvalues[i].join(LEMMA_DELIMITER));
        } else if (V.type == "group") {
          V.serialize(out);
          out.push(packInt(this.fieldvalues[i]));
        } else if (V.type == "text") {
          if (i !== this.fieldnames.length - 1) {
            throw "multiline text fieldtype must be the last, " + this.fieldnames[i];
          }
          textstart = out.length;
          for (let j2 = 0; j2 < this.fieldvalues[i].length; j2++) {
            out.push(this.fieldvalues[i][j2]);
          }
        } else if (V.type) {
          this.onError && this.onError("UNKNOWN_TYPE" /* UnknownType */, V.type);
        }
      }
      if (textstart == 0)
        textstart = out.length;
      return [out, textstart];
    }
    fromTSV(buffer, attrs, from = 1) {
      const sa = new StringArray(buffer, { sequencial: true });
      return this.fromStringArray(sa, attrs, from);
    }
    findKey(key2) {
      if (this.keys) {
        return this.keys.find(key2);
      } else {
        return parseInt(key2) - 1;
      }
    }
    getKey(i) {
      if (this.keys) {
        return this.keys.get(i);
      } else {
        return (i + 1).toString();
      }
    }
  };

  // ../ptk/lineview/interfaces.ts
  var ACTIONPAGESIZE = 5;

  // ../ptk/basket/address.ts
  var BRANCH_SEP = ".";
  var parseAction = (action) => {
    const branches = action.split(BRANCH_SEP);
    const out = [];
    for (let i = 0; i < branches.length; i++) {
      const m1 = branches[i].match(/([a-z_\-]+)#([a-z\d_-]+)/);
      const m22 = branches[i].match(/([a-z_\-]+)(\d+[a-z\d_-]+)/);
      const m32 = branches[i].match(/([a-z_\-]+)(\d*)/);
      if (m1) {
        out.push([m1[1], m1[2]]);
      } else if (m22) {
        out.push([m22[1], m22[2]]);
      } else if (m32) {
        out.push([m32[1], m32[2]]);
      }
    }
    return out;
  };
  var sameAddress = (addr1, addr2) => {
    if (typeof addr1 == "string")
      addr1 = parseAddress(addr1);
    if (typeof addr2 == "string")
      addr2 = parseAddress(addr2);
    if (!addr1 || !addr2)
      return;
    return addr1.action == addr2.action && addr1.ptkname == addr2.ptkname;
  };
  var parseAddress = (address) => {
    let m0, ptkname = "", action = "", from = "", till = "", highlightline = "";
    let m4 = address.match(PTK_ACTION_FROMTILL);
    if (m4) {
      [m0, ptkname, action, from, till, highlightline] = m4;
    } else {
      m4 = address.match(PTK_FROMTILL);
      if (m4) {
        [m0, ptkname, from, till, highlightline] = m4;
      } else {
        m4 = address.match(FROMTILL);
        if (m4)
          [m0, from, till, highlightline] = m4;
        else
          return null;
      }
    }
    from = (from || "").slice(1);
    till = (till || "").slice(1);
    highlightline = (highlightline || "").slice(1);
    if (!from && !till && highlightline) {
      if (highlightline > ACTIONPAGESIZE) {
        from = highlightline - Math.floor(ACTIONPAGESIZE / 2);
        till = from + ACTIONPAGESIZE;
      }
    }
    ptkname = ptkname || "";
    ptkname = ptkname.slice(0, ptkname.length - 1);
    return {
      ptkname,
      action,
      from: Math.abs(parseInt(from)) || 0,
      till: Math.abs(parseInt(till)) || 0,
      highlightline: Math.abs(parseInt(highlightline)) || -1
    };
  };
  function rangeOfElementId(eleid) {
    const out = [], ptk = this;
    let from = 0;
    for (let i = 0; i < eleid.length; i++) {
      const [ele, id] = eleid[i];
      if (ptk.defines[ele]) {
        const idtype = ptk.defines[ele].fields?.id;
        const _id = idtype?.type == "number" ? parseInt(id) : id;
        const startfrom = bsearchNumber(ptk.defines[ele].linepos, from);
        const at = idtype.values.indexOf(_id, startfrom);
        const first = ptk.defines[ele].linepos[at] || ptk.defines[ele].linepos[0];
        const last = ptk.defines[ele].linepos[at + 1] || ptk.header.eot;
        from = first;
        out.push([first, last]);
      } else {
        const at = ptk.defines.bk?.fields.id.values.indexOf(ele);
        const at2 = at == -1 ? ptk.defines.ak?.fields.id.values.indexOf(ele) : -1;
        if (i == 0 && (~at || ~at2)) {
          const first = ptk.defines.bk.linepos[at] || ptk.defines.ak.linepos[at2];
          let last = ptk.defines.bk.linepos[at + 1] || ptk.defines.ak.linepos[at2 + 1];
          if (!last)
            last = ptk.header.eot;
          out.push([first, last]);
          from = first;
        }
      }
    }
    return out;
  }
  function rangeOfAddress(address) {
    let addr = address;
    if (typeof address == "string") {
      addr = parseAddress(address);
    }
    const { ptkname, from, till, action } = addr;
    const eleid = parseAction(action);
    const ranges = rangeOfElementId.call(this, eleid);
    if (ranges.length) {
      const [first, last] = ranges[ranges.length - 1];
      return [first, last];
    } else {
      const end = till ? till : from + 1;
      return [0, end];
    }
  }
  function captionOfAddress(address) {
    let addr = address;
    if (typeof address == "string") {
      addr = parseAddress(address);
    }
    const { action } = addr;
    const defines = this.defines;
    const eleidarr = parseAction(action);
    const out = [];
    for (let i = 0; i < eleidarr.length; i++) {
      const [ele, id] = eleidarr[i];
      if (!defines[ele] || !defines[ele].fields.id)
        return "";
      const at = defines[ele].fields.id.values.indexOf(id);
      out.push(defines[ele]?.innertext?.get(at));
    }
    return out.join("/");
  }
  function makeElementId(ele, id) {
    return ele + (parseInt(id).toString() == id ? "" : "#") + id;
  }
  function makeChunkAddress(ck, id, lineoff = 0) {
    const scrollto = lineoff ? (lineoff >= 5 ? ">" + (lineoff - 1) : "") + (lineoff ? ":" + lineoff : "") : "";
    return "bk" + (parseInt(ck.bk?.id).toString() == ck.bk?.id ? "" : "#") + ck.bk?.id + ".ck" + (parseInt(ck.id).toString() == ck.id ? "" : "#") + (id || ck.id) + scrollto;
  }

  // ../ptk/basket/columns.ts
  function columnField(name2, field, idx2) {
    const column = this.columns[name2];
    const at = column.fieldnames.indexOf(field);
    return column.fieldvalues[at][idx2];
  }
  async function inlineNote(tagname, noteid) {
    const typedef = this.defines[tagname];
    const col = this.columns[typedef.fields.type.foreign];
    if (!col)
      return;
    const at = col.findKey(noteid);
    const textfield = typedef.attrs.text;
    const at2 = col.fieldnames.indexOf(textfield);
    const values = col.fieldvalues[at2];
    return values && values[at] || "";
  }
  function rowOf(rowname, idx2, field = -1) {
    const column = this.columns[rowname];
    if (typeof field == "string") {
      field = column.fieldnames.indexOf(field);
    }
    const out = [];
    if (field > 0) {
      out.push({ name, typedef: column.fieldsdef[field], value: column.fieldvalues[field][idx2] });
    } else {
      for (let i = 0; i < column.fieldnames.length; i++) {
        const name2 = column.fieldnames[i];
        out.push({ name: name2, typedef: column.fieldsdef[i], value: column.fieldvalues[i][idx2] });
      }
    }
    return out;
  }
  function scanPrimaryKeys(tofind2) {
    const out = [];
    if (!tofind2)
      return [];
    for (let name2 in this.primarykeys) {
      if (!this.columns[name2].attrs.bme)
        continue;
      const cachekey = name2 + "=" + tofind2;
      let cache = this.scanCache[cachekey];
      if (!cache) {
        const sa = this.primarykeys[name2];
        const start = sa.enumStart(tofind2);
        const middle = sa.enumMiddle(tofind2);
        const end = sa.enumEnd(tofind2);
        const caption = this.columns[name2].caption || name2;
        cache = { name: name2, caption, start, middle, end };
        this.scanCache[cachekey] = cache;
      }
      out.push(cache);
    }
    return out;
  }

  // ../ptk/fts/query.ts
  var MAX_PHRASE = 5;
  var scoreMatch = (matching, weights) => {
    if (matching.length == 0)
      return 0;
    let score = 0, matchcount = 0;
    for (let j2 = 0; j2 < weights.length; j2++) {
      if (matching[j2]) {
        matchcount++;
        score += weights[j2] * (matching[j2] > 1 ? Math.sqrt(matching[j2]) : 1);
      }
    }
    let boost = matchcount / weights.length;
    boost *= boost;
    return score * boost;
  };
  function scoreLine(postings, chunklinepos, tlp) {
    tlp = tlp || this.inverted.tokenlinepos, tlplast = tlp[tlp.length - 1];
    chunklinepos = chunklinepos || this.defines.ck.linepos;
    const averagelinelen = tlplast / tlp.length;
    const allhits = postings.reduce((acc, i2) => i2.length + acc, 0);
    const weights = postings.map((pl) => Math.sqrt(allhits / pl.length));
    let i = 0, scoredLine = [];
    const ptr = new Array(postings.length);
    ptr.fill(0);
    let prev = 0;
    while (i < tlp.length - 1) {
      let nearest = tlplast;
      const from = tlp[i], to = tlp[i + 1];
      let matching = [];
      prev = 0;
      for (let j2 = 0; j2 < postings.length; j2++) {
        const pl = postings[j2];
        let v = pl[ptr[j2]];
        while (v < from && ptr[j2] < pl.length) {
          ptr[j2]++;
          v = pl[ptr[j2]];
        }
        while (v >= from && v < to) {
          if (!matching[j2])
            matching[j2] = 0;
          matching[j2]++;
          if (j2 == 0)
            prev = v;
          else {
            const dist = v - prev - j2;
            if (dist == 0) {
              matching[j2] += 3;
            } else {
              matching[j2] += 1 / dist;
            }
          }
          ptr[j2]++;
          v = pl[ptr[j2]];
        }
        if (nearest > v)
          nearest = v;
      }
      const score = scoreMatch(matching, weights);
      let shortpara = 10 * (averagelinelen / (to - from + 1));
      if (shortpara < 10)
        shortpara = 10;
      const boost = Math.log(shortpara);
      if (score > 0) {
        const chunk = bsearchNumber(chunklinepos, i) - 1;
        scoredLine.push([i + 1, score * boost, chunk]);
      }
      i++;
      while (nearest > tlp[i + 1])
        i++;
    }
    scoredLine = scoredLine.sort((a, b) => b[1] - a[1]);
    return scoredLine;
  }
  async function phraseQuery(phrase) {
    phrase = phrase.trim();
    const qkey = this.name + "@" + phrase;
    let out = this.queryCache[qkey];
    if (out)
      return out;
    const tokens = await this.loadPostings(phrase);
    if (!tokens)
      return [];
    out = tokens[0];
    for (let i = 1; i < tokens.length; i++) {
      let pl1 = out;
      out = plAnd(pl1, tokens[i], i);
    }
    this.queryCache[qkey] = out || [];
    return this.queryCache[qkey];
  }
  async function parseQuery(tofind2, opts) {
    opts = opts || {};
    const phrases = tofind2.split(/[, 　]/);
    if (phrases.length > MAX_PHRASE)
      phrases.length = MAX_PHRASE;
    const outphrases = [], postings = [];
    for (let i = 0; i < phrases.length; i++) {
      if (!phrases[i].trim())
        continue;
      let posting = await phraseQuery.call(this, phrases[i]);
      if ((!posting || !posting.length) && this.attributes.lang == "zh") {
        posting = await phraseQuery.call(this, fromSim(phrases[i]));
      }
      if (opts.ranges && opts.ranges.length) {
        posting = plRanges(posting, opts.ranges);
      }
      outphrases.push(phrases[i]);
      postings.push(posting || []);
    }
    return [outphrases, postings];
  }
  async function scanText(tofind2, opts) {
    const ptk = this;
    const [phrases, postings] = await ptk.parseQuery(tofind2, opts);
    if (!postings.length || !ptk.inverted)
      return [];
    const tagname = opts?.groupby || "ak";
    const groupby = ptk.defines[tagname];
    const tlp = [], TLP = ptk.inverted.tokenlinepos;
    if (groupby) {
      for (let i = 0; i < groupby.linepos.length; i++) {
        const nextstart = TLP[groupby.linepos[i + 1]] || TLP[TLP.length - 1];
        tlp.push([TLP[groupby.linepos[i]], nextstart]);
      }
      const res = plCount(postings[0], tlp).map((count, idx2) => {
        const id = groupby.fields.id.values[idx2];
        return {
          count,
          caption: groupby.innertext.get(idx2),
          scope: tagname + (parseInt(id) ? id : "#" + id)
        };
      });
      return res;
    } else {
      return [{ count: postings.length, caption: "-", name: "-" }];
    }
  }

  // ../ptk/basket/footnote.ts
  function footNoteAddress(id, line) {
    const ptk = this;
    const ck = ptk.getNearestChunk(line);
    const chunktag = ptk.defines.ck;
    const bktag = ptk.defines.bk;
    const footbk = ck.bkid + "-fn";
    const at = bktag.fields.id.values.indexOf(footbk);
    const booknotebkline = bktag.linepos[at];
    const closestchunk = ptk.findClosestTag(chunktag, "id", ck.id, booknotebkline);
    const chunk = chunktag.fields.id.values[closestchunk];
    const address = ptk.name + ":" + footbk + "." + ptk.attributes.chunktag + chunk + ".fn" + id;
    return address;
  }
  function footNoteByAddress(id, line) {
    const ptk = this;
    const ck = ptk.getNearestChunk(line);
    const chunktag = ptk.defines.ck;
    const bktag = ptk.defines.ck;
    const footnotetag = ptk.defines.f;
    let footbk = ck.bkid.replace("-fn", "");
    const at = bktag.fields.id.values.indexOf(footbk);
    if (at == 0)
      footbk = "";
    else
      footbk += ".";
    const booknotebkline = bktag.linepos[at];
    const closestchunk = ptk.findClosestTag(chunktag, "id", ck.id, booknotebkline);
    const chunk = chunktag.fields.id.values[closestchunk];
    const footnoteat = ptk.findClosestTag(footnotetag, "id", parseInt(id), chunktag.linepos[closestchunk]);
    const footnoteline = footnotetag.linepos[footnoteat];
    const highlightline = footnoteline - chunktag.linepos[closestchunk];
    const address = footbk + ptk.attributes.chunktag + chunk + (highlightline ? ":" + highlightline : "");
    return address;
  }

  // ../ptk/compiler/template.ts
  var nop = () => {
    return [];
  };
  var addTemplate = (name2, template) => {
    Templates[name2] = template;
    if (!template.getFilters)
      template.getFilters = nop;
    if (!template.runFilter)
      template.runFilter = nop;
  };
  var Templates = {};

  // ../ptk/basket/pitaka.ts
  var Pitaka = class extends LineBase {
    constructor(opts) {
      super(opts);
      this.defines = {};
      this.primarykeys = {};
      this.columns = {};
      this.tocs = {};
      this.rangeOfAddress = rangeOfAddress;
      this.captionOfAddress = captionOfAddress;
      this.scanPrimaryKeys = scanPrimaryKeys;
      this.scanText = scanText;
      this.parseQuery = parseQuery;
      this.scoreLine = scoreLine;
      this.scanCache = {};
      this.queryCache = {};
      this.columnField = columnField;
      this.inlineNote = inlineNote;
      this.footNoteAddress = footNoteAddress;
      this.footNoteByAddress = footNoteByAddress;
      this.rowOf = rowOf;
      this.inverted = null;
      this.parallels = {};
      this.lang = "";
      this.preprocessor = null;
    }
    async init() {
      if (!this.payload)
        return;
      const compiler2 = new Compiler2();
      compiler2.compileBuffer(this.payload, "0.off");
      this.defines = compiler2.typedefs;
      this.attributes = compiler2.compiledFiles["0.off"]?.attributes;
      this.lang = this.attributes.lang || "zh";
      this.template = Templates[this.attributes.template] || {};
      const ranges = [];
      for (let i = 0; i < this.header.preload.length; i++) {
        const r = this.sectionRange(this.header.preload[i]);
        if (r && r[1] > r[0])
          ranges.push(r);
      }
      for (let n in this.defines) {
        if (!this.defines[n].fields.lazy) {
          const r = this.sectionRange("^" + n);
          if (r && r[1] > r[0])
            ranges.push(r);
        }
      }
      await this.loadLines(ranges);
      for (let i = 0; i < this.header.preload.length; i++) {
        const section = this.getSection(this.header.preload[i]);
        if (section.length)
          this.deserialize(section, this.header.preload[i]);
      }
      for (const n in this.defines) {
        if (!this.defines[n].fields.lazy) {
          const section = this.getSection("^" + n);
          this.defines[n].deserialize(section);
        }
        for (let attr2 in this.defines[n].fields) {
          const A = this.defines[n].fields[attr2];
          if (A.foreign && this.primarykeys[A.foreign]) {
            A.keys = this.primarykeys[A.foreign];
          }
        }
      }
      for (const n in this.columns) {
        const tagname = this.columns[n].attrs?.tagname;
        if (tagname && this.defines[tagname]) {
          this.defines[tagname].column = n;
        }
      }
    }
    deserialize(section, sectionname) {
      if (!section.length)
        return;
      if (!section[0])
        section.shift();
      if (!section.length)
        return;
      const firstline = section[0];
      const { name: name2 } = sourceType(firstline);
      const at = this.header.sectionnames.indexOf(sectionname);
      const sourcetype = this.header.sectiontypes[at];
      if (sourcetype === "tsv") {
        const column = new Column();
        column.deserialize(section);
        this.columns[column.name] = column;
        this.primarykeys[column.name] = column.keys;
      } else if (sourcetype === "tokens") {
        section.shift();
        const postingstart = this.sectionRange("_postings")[0];
        this.inverted = new Inverted(section, postingstart);
      } else if (sourcetype === "toc") {
        section.shift();
        this.tocs[name2 || "*"] = new TableOfContent(section, name2);
      }
    }
    async loadPostings(s) {
      if (!this.inverted)
        return;
      const nPostings = this.inverted.nPostingOf(s);
      const jobs = [];
      const that = this;
      for (let i = 0; i < nPostings.length; i++) {
        if (nPostings[i] < 0)
          continue;
        const line = this.inverted.postingStart + nPostings[i];
        jobs.push(async function(at) {
          await that.loadLines([[line, line + 1]]);
          that.inverted.postings[at] = unpackIntDelta(that.getLine(line));
        }(nPostings[i]));
      }
      await Promise.all(jobs);
      return this.getPostings(s);
    }
    getHeading(line) {
      if (!line)
        return "";
      const chunktag = this.defines.ck;
      const booktag = this.defines.bk;
      const linepos = chunktag?.linepos || [];
      const at = bsearchNumber(linepos, line) - 1;
      const lineoff = line - linepos[at];
      let caption = chunktag?.innertext.get(at);
      const id = chunktag?.fields?.id?.values[at];
      const bkat = this.getNearestTag(line, booktag) - 1;
      const bkid = booktag.fields.id.values[bkat];
      const onChunkCaption2 = this.template.onChunkCaption;
      if (!caption) {
        caption = this.columns[chunktag?.column]?.keys?.get(id);
        if (!caption && onChunkCaption2)
          caption = onChunkCaption2(id);
      }
      const humanId = onChunkCaption2 ? caption : id + "." + caption;
      return { id, tagname: "ck", caption, lineoff, bkid, humanId };
    }
    getPostings(s) {
      const nPostings = this.inverted.nPostingOf(s);
      const postings = this.inverted.postings;
      return nPostings.map((np) => postings[np]);
    }
    getNearestTag(line, tag) {
      if (typeof tag == "string")
        tag = this.defines[tag];
      const linepos = tag.linepos;
      if (!linepos)
        return null;
      const at = bsearchNumber(linepos, line);
      return line < linepos[linepos.length - 1] ? at : at + 1;
    }
    getNearestChunk(line) {
      const chunktag = this.defines.ck;
      const booktag = this.defines.bk;
      const at = this.getNearestTag(line, chunktag);
      if (at < 1)
        return null;
      const bkat = this.getNearestTag(line, booktag) - 1;
      const bkid = booktag.fields.id.values[bkat];
      return {
        bkid,
        at,
        id: chunktag.fields.id.values[at - 1],
        bk: { id: bkid },
        line: chunktag.linepos[at - 1],
        innertext: chunktag.innertext.get(at - 1)
      };
    }
    findClosestTag(typedef, key2, value, from = 0) {
      let at = typedef.fields[key2].values.indexOf(value);
      while (at >= 0 && typedef.linepos[at] < from) {
        at = typedef.fields[key2].values.indexOf(value, at + 1);
      }
      return at;
    }
    postingLine(posting) {
      return plContain(posting, this.inverted.tokenlinepos)[0];
    }
    validId(tagname, id) {
      const V = this.defines[tagname]?.fields;
      if (!V || !V.id)
        return false;
      if (V.id.type == "number" && typeof id !== "number")
        id = parseInt(id);
      return ~V.id.values.indexOf(id);
    }
    typedefOf(tagname) {
      return this.defines[tagname];
    }
    humanName(short, lang = "zh") {
      let n = this.attributes[lang] || this.name;
      const at = n.indexOf("|");
      if (at == -1)
        return n;
      return short ? n.slice(0, at) : n.slice(at + 1);
    }
    getParallelLine(masterptk, line) {
      return [true, 0];
    }
    getSectionStart(name2) {
      const at = this.header.sectionnames.indexOf(name2);
      if (~at) {
        return this.header.sectionstarts[at] || -1;
      }
      return -1;
    }
  };

  // ../ptk/zip/utils.ts
  var makeUint8Array = (thing) => new Uint8Array(thing.buffer || thing);
  var wasm = "AGFzbQEAAAABCgJgAABgAn9/AXwDAwIAAQUDAQACBwkCAW0CAAFjAAEIAQAKlQECSQEDfwNAIAEhAEEAIQIDQCAAQQF2IABBAXFBoIbi7X5scyEAIAJBAWoiAkEIRw0ACyABQQJ0IAA2AgAgAUEBaiIBQYACRw0ACwtJAQF/IAFBf3MhAUGAgAQhAkGAgAQgAGohAANAIAFB/wFxIAItAABzQQJ0KAIAIAFBCHZzIQEgAkEBaiICIABJDQALIAFBf3O4Cw";
  var instance = new WebAssembly.Instance(new WebAssembly.Module(Uint8Array.from(atob(wasm), (c2) => c2.charCodeAt(0))));
  var { c, m: m2 } = instance.exports;
  var pageSize = 65536;
  var crcBuffer = makeUint8Array(m2).subarray(pageSize);

  // ../ptk/basket/openptk.ts
  var openPtk = async (name2) => {
    let ptk = usePtk(name2);
    if (ptk)
      return ptk;
    if (!name2)
      return null;
    ptk = new Pitaka({ name: name2 });
    poolAdd(name2, ptk);
    if (await ptk.isReady()) {
      await ptk.init();
      return ptk;
    } else {
      poolDel(name2);
    }
  };
  var usePtk = (name2) => {
    return poolGet(name2);
  };

  // ../ptk/lineview/lisp.ts
  function readToken(token) {
    if (token === "(") {
      return { type: 1 /* Opening */, value: null };
    } else if (token === ")") {
      return { type: 2 /* Closing */, value: null };
    } else {
      return { type: 3 /* Action */, value: token };
    }
  }
  function tokenize2(expression) {
    return expression.replace(/\(/g, "^(^").replace(/\)/g, "^)^").trim().split(/\^/).map(readToken);
  }
  function buildAST(tokens) {
    let depth = 0;
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type == 1 /* Opening */) {
        depth++;
      } else if (token.type == 2 /* Closing */) {
        if (depth > 0)
          depth--;
      } else {
        out.push([depth, token.value]);
      }
    }
    return out;
  }
  function parseLisp(expression) {
    return buildAST(tokenize2(expression));
  }

  // ../ptk/meta/sponsor.ts
  var sponsors = [
    "\u91CB\u5E38\u660E",
    "\u752F\u8000\u5357",
    "\u9673\u4FE1\u826F",
    "\u845B\u4ECB\u6B63",
    "\u738B\u5FD7\u6500"
  ];
  var getSponsor = (ptk, line) => {
    return sponsors[Math.floor(Math.random() * sponsors.length)];
  };

  // ../ptk/lineview/loadline.ts
  async function loadLines(lva, noparallel = false) {
    const jobs = [], out = [];
    const divisions = lva.divisions();
    const pitaka_lines = {};
    for (let i = 0; i < divisions.length; i++) {
      if (!pitaka_lines[divisions[i].ptkname])
        pitaka_lines[divisions[i].ptkname] = [];
      pitaka_lines[divisions[i].ptkname].push(...divisions[i].getLines());
      const parallels2 = divisions[i].getParallelWithDiff();
      const ptk = usePtk(divisions[i].ptkname);
      if (!noparallel) {
        for (let j2 = 0; j2 < parallels2.length; j2++) {
          const [pptk, linediff] = parallels2[j2];
          if (!ptk.parallels[pptk.name])
            continue;
          let lines = divisions[i].getLines();
          if (linediff !== 0)
            lines = lines.map((i2) => i2 + linediff);
          if (!pitaka_lines[pptk.name])
            pitaka_lines[pptk.name] = [];
          pitaka_lines[pptk.name].push(...lines);
        }
      }
    }
    for (const ptkname in pitaka_lines) {
      const ptk = usePtk(ptkname);
      if (!ptk)
        continue;
      jobs.push(ptk.loadLines(pitaka_lines[ptkname]));
    }
    await Promise.all(jobs);
    let seq = 0;
    for (let i = 0; i < divisions.length; i++) {
      const { action, ptkname, depth, ownerdraw, highlightline, first, from, closable } = divisions[i];
      const ptk = usePtk(ptkname);
      if (ownerdraw) {
        out.push({ seq, idx: i, ownerdraw, depth, ptkname, key: ptkname + ":" + action, closable });
        seq++;
        continue;
      }
      if (!ptk)
        continue;
      const segment = [];
      const lines = divisions[i].getLines();
      const linetexts = ptk.getLines(lines);
      const prevdepth = i ? divisions[i - 1].depth : 0;
      const onLineText2 = ptk.template?.onLineText;
      for (let j2 = 0; j2 < linetexts.length; j2++) {
        const text2 = onLineText2 ? onLineText2(linetexts[j2], lines[j2]) : linetexts[j2];
        let edge = 0;
        if (j2 === 0)
          edge |= 1;
        if (j2 === linetexts.length - 1)
          edge |= 2;
        if (depth > prevdepth && edge & true && out.length)
          out[out.length - 1].edge ^= 2;
        if (prevdepth > depth && edge & true)
          edge ^= 1;
        const closable2 = edge == 1 || edge == 3 || !divisions[i].diggable;
        const sponser = closable2 && from == 0 ? getSponsor(ptk, lines[j2]) : "";
        const highlight = highlightline - divisions[i].from == j2;
        segment.push({
          seq,
          idx: j2 == 0 ? i : -1,
          ptkname,
          key: ptkname + ":" + lines[j2],
          line: lines[j2],
          highlight,
          text: text2,
          depth,
          edge,
          closable: closable2,
          sponser
        });
        seq++;
      }
      out.push(...segment);
    }
    lva.loadedItems = out;
    return out;
  }
  async function load(lva) {
    if (typeof lva == "undefined")
      lva = this;
    else if (typeof lva == "string")
      lva = new LVA(lva);
    const divisions = lva.divisions();
    let pitakas2 = {};
    for (let i = 0; i < divisions.length; i++) {
      const ptkname = divisions[i].ptkname;
      if (!pitakas2[ptkname])
        pitakas2[ptkname] = [];
      pitakas2[ptkname].push(divisions[i]);
    }
    const jobs = [];
    for (let ptkname in pitakas2) {
      const ptk = await openPtk(ptkname);
      if (!ptk) {
      }
    }
    await Promise.all(jobs);
    for (let i = 0; i < divisions.length; i++) {
      await divisions[i].run();
    }
    const out = await loadLines(lva);
    return out;
  }

  // ../ptk/lineview/baseaction.ts
  var ACTIONPAGESIZE2 = 5;
  var EXCERPTACTIONPREFIX = "*";
  var GUIDEACTIONPREFIX = "!";
  var TITLECOUNTACTIONPREFIX = "~";
  var OWNERDRAWPREFIX = "@";
  var Action = class {
    constructor(addr, depth = 0, dividx = 0) {
      this.act = Action.parse(addr.action);
      this.action = addr.action;
      this.depth = depth;
      this.first = 0;
      this.last = 0;
      this.highlightline = addr.highlightline || -1;
      this.from = addr.from;
      this.till = addr.till || -1;
      this.res = [];
      this.text = "";
      this.lines = [];
      this.diggable = false;
      this.closable = true;
      this.ptkname = addr.ptkname;
      this.opts = {};
      this.dividx = dividx;
    }
    async run() {
    }
    lineOf(idx2) {
      return this.first + idx2;
    }
    getLines() {
      const out = [];
      let till = this.till;
      if (till == -1)
        till = this.from + ACTIONPAGESIZE2;
      for (let i = this.from; i < till; i++) {
        const line = this.lineOf(i);
        if (line < this.first || line >= this.last)
          continue;
        out.push(line);
      }
      return out;
    }
    getParallelWithDiff() {
      const out = [];
      const ptk = usePtk(this.ptkname);
      if (!ptk)
        return out;
      const parallelPitakas = poolParallelPitakas(ptk);
      for (let i = 0; i < parallelPitakas.length; i++) {
        const pptk = usePtk(parallelPitakas[i]);
        const line = this.lineOf(this.from);
        const [hasparallel, linediff] = pptk.getParallelLine(ptk, line);
        if (hasparallel)
          out.push([pptk, linediff]);
      }
      return out;
    }
    async loadParallel(ptkname) {
      let parallels2 = this.getParallelWithDiff().filter(([p2]) => p2.name == ptkname);
      if (!parallels2.length)
        return;
      const ptk = usePtk(this.ptkname);
      const pptk = parallels2[0][0];
      const [hasparallel, linediff] = pptk.getParallelLine(ptk, this.first);
      if (hasparallel)
        await pptk.loadLines([[this.first + this.from + linediff, this.first + this.till + linediff]], true);
    }
    static parse(action) {
      return parseCriteria(action);
    }
  };

  // ../ptk/lineview/rangeaction.ts
  var RangeAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
      this.eleid = this.action;
      this.address = addr;
      this.diggable = true;
      this.pagable = true;
    }
    async run() {
      const ptk = usePtk(this.ptkname);
      [this.first, this.last] = ptk.rangeOfAddress(this.address);
    }
  };

  // ../ptk/lineview/guideaction.ts
  var GuideAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
      this.address = addr;
    }
    async run() {
      const ptk = usePtk(this.ptkname);
      const caption = ptk.captionOfAddress(this.address);
      let { name: name2 } = this.act[0];
      const action = this.address.action.slice(1);
      const idx2 = this.dividx;
      const actionprefix = GUIDEACTIONPREFIX;
      const [choices, groupby, groupfilter] = ptk.template.parseChoice(action);
      const col = ptk.columns[ptk.template.filterColumn];
      const master = ptk.defines[col.attrs.master];
      let { items, groups } = ptk.template.runFilter(ptk, col, { choices, groupby, groupfilter });
      items = items.map((idx3) => {
        const line = master.linepos[idx3];
        const ck = ptk.getNearestChunk(line);
        const size = (master.linepos[idx3 + 1] ? master.linepos[idx3 + 1] : ptk.header.eot) - line;
        const lineoff = line - ck.line;
        const record = [];
        const recordend = master.linepos[idx3 + 1];
        for (let i = 0; i < col.fieldnames.length; i++) {
          const def = ptk.defines[col.fieldnames[i]];
          if (!def)
            continue;
          const at = bsearchNumber(def.linepos, line);
          if (def.linepos[at] < recordend) {
            record.push(def.linepos[at]);
          }
        }
        if (!ck)
          return null;
        return { chunkname: ck.name, line, size, ck, lineoff, record };
      }).filter((it) => !!it);
      this.ownerdraw = { painter: "guide", data: {
        from: this.from,
        actionprefix,
        idx: idx2,
        items,
        name: name2,
        action,
        caption,
        ptk
      } };
    }
  };

  // ../ptk/lineview/customaction.ts
  var CustomAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
      this.painter = addr.action.slice(1);
      this.ptkname = addr.ptkname;
      this.diggable = true;
    }
    async run() {
      let items;
      const ptk = await usePtk(this.ptkname);
      if (this.painter == "systeminfo") {
        items = [];
      }
      this.ownerdraw = { painter: this.painter, data: { ptk, items, name: this.address, ptkname: this.ptkname } };
      this.last = 1;
    }
  };

  // ../ptk/lineview/excerptaction.ts
  var ExcerptAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
    }
    lineOf(idx2) {
      return this.lines[idx2];
    }
    async run() {
      const ptk = usePtk(this.ptkname);
      let { name: name2, tofind: tofind2 } = this.act[0];
      const section = name2.slice(1);
      const at = ptk.header.fulltext.indexOf(section);
      const caption = ptk.header.fulltextcaption[at];
      const tlp = ptk.inverted.tokenlinepos;
      let sectionfrom = 0, sectionto = 0;
      if (section) {
        const [first, last] = ptk.rangeOfAddress(section);
        sectionfrom = tlp[first];
        sectionto = tlp[last];
      } else {
        sectionfrom = tlp[0];
        sectionto = tlp[ptk.header.eot];
      }
      const [phrases, postings] = await ptk.parseQuery(tofind2, { tosim: ptk.attributes.lang == "zh" });
      let chunkobj = {}, lineobj = {}, hitcount = 0;
      const chunklinepos = ptk.defines.ck.linepos;
      for (let i = 0; i < postings.length; i++) {
        const pl = plTrim(postings[i], sectionfrom, sectionto);
        const [pllines, lineshits] = plContain(pl, ptk.inverted.tokenlinepos, true);
        const phraselen = phrases[i].length;
        for (let j2 = 0; j2 < pllines.length; j2++) {
          const line = pllines[j2];
          if (!lineobj[line])
            lineobj[line] = [];
          lineobj[line].push(...lineshits[j2].map((it) => it * MAXPHRASELEN + phraselen));
          hitcount++;
          const at2 = bsearchNumber(chunklinepos, line);
          if (!chunkobj[chunklinepos[at2]])
            chunkobj[chunklinepos[at2]] = true;
        }
      }
      let till = this.till;
      let from = this.from;
      if (till == -1)
        till = this.from + ACTIONPAGESIZE;
      let arr = fromObj(lineobj, (a, b) => [a, b.sort()]).sort((a, b) => a[0] - b[0]);
      this.first = 0;
      this.last = arr.length;
      if (till >= arr.length)
        till = arr.length;
      arr = arr.slice(from, till);
      const lines = arr.map((it) => parseInt(it[0]));
      const hits = arr.map((it) => it[1].map((n) => Math.floor(n / MAXPHRASELEN)));
      const phraselength = arr.map((it) => it[1].map((n) => n % MAXPHRASELEN));
      const cobj = fromObj(chunkobj, (a, b) => a);
      const samechunkline = cobj.length == 1 ? cobj[0] : -1;
      this.ownerdraw = { painter: "excerpt", data: {
        last: this.last,
        samechunkline,
        from: this.from,
        name: name2,
        hitcount,
        caption,
        ptk,
        tofind: tofind2,
        lines,
        hits,
        phraselength
      } };
    }
  };

  // ../ptk/lexicon/backref.ts
  var lookupKeyColumn = (ptk, name2, key2, keycolname) => {
    const column = ptk.columns[name2];
    let at = column.findKey(key2);
    if (keycolname) {
      const keycolumn = ptk.columns[keycolname];
      const norm_at = keycolumn.fieldnames.indexOf("norm");
      const at2 = keycolumn.findKey(key2);
      if (~norm_at) {
        const norm = keycolumn.fieldvalues[norm_at][at2];
        if (norm) {
          key2 = norm;
          at = column.findKey(key2);
        }
      }
    }
    if (!~at)
      return [];
    const out = column.fieldvalues[1][at];
    return out;
  };
  var countMembers = (items, foreigncol, tofind2, col) => {
    const members = {};
    const tofinds = tofind2.split(",");
    for (let i = 0; i < items.length; i++) {
      const at = foreigncol.findKey(items[i]);
      const list = foreigncol.fieldvalues[0][at];
      for (let i2 = 0; i2 < list?.length; i2++) {
        if (!members[list[i2]])
          members[list[i2]] = 0;
        members[list[i2]]++;
      }
    }
    let arr = fromObj(members, true);
    if (tofind2 && arr.length) {
      if (col.findKey(tofinds[0]) == arr[0][0]) {
        arr.shift();
      }
      const avg = arr.reduce((acc, it) => it[1] + acc, 0) / arr.length;
      arr = arr.filter((it) => it[1] >= avg / 2);
      let drop = tofinds.length - 1;
      while (drop) {
        arr.shift();
        drop--;
      }
    }
    return arr;
  };
  var threshold = 0.7;
  var calApprox = (col, members) => {
    let idx2 = 0;
    if (col.attrs.keytype !== "serial")
      idx2++;
    const out = [];
    const values = col.fieldvalues[idx2];
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      const similarity = similaritySet(v, members);
      if (similarity > threshold) {
        out.push([i, similarity]);
      }
    }
    return out;
  };

  // ../ptk/lineview/booleanexcerptaction.ts
  var BooleanExcerptAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
    }
    async run() {
      let hitcount = 0, caption, lines = [], hits = [], phraselength = [], samechunkline;
      const ptk = usePtk(this.ptkname);
      let { name: name2, tofind: tofind2 } = this.act[0];
      const [colname, members] = name2.slice(1).split("@");
      const tofinds = tofind2.split(",");
      const refcolname = colname.replace(/s$/, "");
      const items = intersects(tofinds.map((it) => lookupKeyColumn(ptk, refcolname, it, members)));
      const linepos = ptk.defines[colname].linepos;
      lines = items.map((it) => linepos[it]);
      let till = this.till;
      let from = this.from;
      if (till == -1)
        till = this.from + ACTIONPAGESIZE;
      this.first = 0;
      this.last = lines.length;
      if (till >= lines.length)
        till = lines.length;
      lines = lines.slice(from, till);
      this.ownerdraw = { painter: "excerpt", data: {
        last: this.last,
        samechunkline,
        from: this.from,
        name: name2,
        hitcount,
        caption,
        ptk,
        tofind: tofind2,
        lines,
        hits,
        phraselength
      } };
    }
  };

  // ../ptk/lineview/approxaction.ts
  var ApproxAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
    }
    lineOf(idx2) {
      return this.lines[idx2];
    }
    getApprox(ptk, tagname, id) {
      if (ptk.template.getApprox) {
        return ptk.template.getApprox(ptk, tagname, id);
      }
      const col = ptk.columns[tagname];
      const at = col.findKey(id);
      const members = col.fieldvalues[0][at];
      const approx = calApprox(col, members);
      const out = approx.map(([at2, similarity]) => {
        const _id = col.keys ? col.keys.get(at2) : at2 + 1;
        const linepos = ptk.defines[tagname].linepos;
        return id == _id ? null : { id: _id, similarity, line: linepos[at2] };
      }).filter((it) => !!it).sort((a, b) => b.similarity - a.similarity);
      return out;
    }
    async run() {
      let hitcount = 0, caption, samechunkline;
      const ptk = usePtk(this.ptkname);
      let { name: name2, tofind: tofind2 } = this.act[0];
      const tagname = name2.slice(1);
      const id = tofind2.slice(tofind2.indexOf("~") + 1);
      const items = this.getApprox(ptk, tagname, id);
      const similarity = items.map((it) => it.similarity);
      let lines = items.map((it) => it.line);
      let till = this.till;
      let from = this.from;
      if (till == -1)
        till = this.from + ACTIONPAGESIZE;
      this.first = 0;
      this.last = lines.length;
      if (till >= lines.length)
        till = lines.length;
      lines = lines.slice(from, till);
      this.ownerdraw = { painter: "approx", data: {
        last: this.last,
        samechunkline,
        from: this.from,
        name: name2,
        hitcount,
        caption,
        ptk,
        tofind: tofind2,
        lines,
        similarity
      } };
    }
  };

  // ../ptk/lineview/titlecountaction.ts
  var TitleCountAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
    }
    lineOf(idx2) {
      return this.lines[idx2];
    }
    async run() {
      const ptk = usePtk(this.ptkname);
      let { name: name2, tofind: tofind2 } = this.act[0];
      const address = name2.slice(1);
      const sectionrange = address ? ptk.rangeOfAddress(address) : [0, ptk.header.eot + 1];
      const caption = ptk.captionOfAddress(address);
      const [sectionfrom, sectionto] = sectionrange.map((it) => ptk.inverted.tokenlinepos[it]);
      let chunkcountobj = {}, hitcount = 0, items = [];
      const chunktag = ptk.defines.ck;
      const bktag = ptk.defines.bk;
      if (!tofind2) {
        const at1 = chunktag ? bsearchNumber(chunktag.linepos, sectionrange[0]) : 0;
        const at2 = chunktag ? bsearchNumber(chunktag.linepos, sectionrange[1]) + 1 : 0;
        let pagesize = this.till - this.from;
        if (pagesize < ACTIONPAGESIZE)
          pagesize = ACTIONPAGESIZE;
        for (let j2 = at1 + this.from; j2 < at2; j2++) {
          const title = chunktag.innertext.get(j2);
          const line = chunktag.linepos[j2];
          const ck = ptk.getNearestChunk(line + 1);
          const address2 = makeChunkAddress(ck);
          if (items.length >= pagesize)
            break;
          items.push({ id: ck.id, bkid: ck.bkid, title, count: -1, address: address2, line });
        }
        this.ownerdraw = { painter: "titlecount", data: {
          last: at2 - at1,
          from: this.from,
          name: name2,
          hitcount,
          caption,
          ptk,
          tofind: tofind2,
          items
        } };
        return;
      }
      const [phrases, postings] = await ptk.parseQuery(tofind2);
      for (let i = 0; i < postings.length; i++) {
        const pl = plTrim(postings[i], sectionfrom, sectionto);
        const [pllines] = plContain(pl, ptk.inverted.tokenlinepos);
        for (let j2 = 0; j2 < pllines.length; j2++) {
          const at = bsearchNumber(chunktag.linepos, pllines[j2]) - 1;
          if (!chunkcountobj[at])
            chunkcountobj[at] = 0;
          chunkcountobj[at]++;
          hitcount++;
        }
      }
      let till = this.till;
      let from = this.from;
      if (till == -1)
        till = this.from + ACTIONPAGESIZE;
      let arr = fromObj(chunkcountobj, (a, b) => [parseInt(a), b]).sort((a, b) => b[1] - a[1]);
      this.last = arr.length;
      if (till >= arr.length)
        till = arr.length;
      arr = arr.slice(from, till);
      items = arr.map((it) => {
        const count = it[1];
        const chunk = it[0];
        const ck = ptk.getNearestChunk(chunktag.linepos[chunk]);
        const address2 = makeChunkAddress(ck);
        const title = chunktag.innertext.get(chunk);
        return { id: ck.id, title, count, address: address2 };
      });
      this.first = 0;
      this.ownerdraw = { painter: "titlecount", data: {
        last: this.last,
        from: this.from,
        name: name2,
        hitcount,
        caption,
        ptk,
        tofind: tofind2,
        items
      } };
    }
  };

  // ../ptk/lineview/queryaction.ts
  var QueryAction = class extends Action {
    constructor(addr, depth = 0) {
      super(addr, depth);
    }
    lineOf(idx2) {
      if (idx2 >= this.res.length)
        return -1;
      return this.res[idx2].line;
    }
    async run() {
      const ptk = usePtk(this.ptkname);
      for (let i = 0; i < this.act.length; i++) {
        let { name: name2, tofind: tofind2 } = this.act[i];
        const lexicon = ptk.primarykeys[name2];
        if (!lexicon)
          continue;
        let matcher = lexicon.enumMiddle;
        let enummode = 1;
        if (tofind2[0] == "$") {
          enummode = 0;
          matcher = lexicon.enumStart;
          tofind2 = tofind2.slice(1);
        } else if (tofind2[tofind2.length - 1] == "$") {
          enummode = 2;
          matcher = lexicon.enumEnd;
          tofind2 = tofind2.slice(0, tofind2.length - 1);
        }
        const items = matcher.call(lexicon, tofind2);
        const tagname = ptk.columns[name2]?.attrs?.tagname;
        const foreign = ptk.columns[name2]?.attrs?.foreign || ptk.columns[name2]?.fieldnames[0];
        const backref = ptk.columns[name2]?.attrs?.backref;
        this.last = 1;
        this.till = 1;
        const caption = ptk.columns[name2]?.caption;
        this.ownerdraw = {
          painter: "queryresult",
          data: { name: name2, caption, ptk, tagname, foreign, tofind: tofind2, items, backref, lexicon }
        };
      }
    }
  };

  // ../ptk/lineview/action.ts
  var makeExcerptAddress = (ptkname, section, tofind2, chunk = "") => {
    return EXCERPTACTIONPREFIX + section + (chunk ? "." + chunk : "") + "=" + tofind2;
  };
  var createAction = (addr, depth = 0) => {
    const at = addr.action.indexOf("=");
    const atype = addr.action.slice(0, 1);
    if (at > 0) {
      if (atype == EXCERPTACTIONPREFIX) {
        if (~addr.action.indexOf(OWNERDRAWPREFIX)) {
          return new BooleanExcerptAction(addr, depth);
        } else if (~addr.action.indexOf(TITLECOUNTACTIONPREFIX)) {
          return new ApproxAction(addr, depth);
        } else {
          return new ExcerptAction(addr, depth);
        }
      } else if (atype == TITLECOUNTACTIONPREFIX) {
        return new TitleCountAction(addr, depth);
      } else {
        return new QueryAction(addr, depth);
      }
    } else {
      if (atype == OWNERDRAWPREFIX) {
        return new CustomAction(addr, depth);
      } else if (atype == GUIDEACTIONPREFIX) {
        return new GuideAction(addr, depth);
      } else {
        return new RangeAction(addr, depth);
      }
    }
  };
  var createNestingAction = (address, ctx) => {
    const addr = parseAddress(address);
    if (!addr)
      return null;
    if (addr.action)
      ctx.actions[ctx.depth] = addr.action;
    if (addr.ptkname)
      ctx.ptknames[ctx.depth] = addr.ptkname;
    addr.action = addr.action || ctx.actions[ctx.depth] || ctx.same_level_action;
    addr.ptkname = addr.ptkname || ctx.ptknames[ctx.depth] || ctx.same_level_ptkname;
    ctx.same_level_ptkname = addr.ptkname;
    ctx.same_level_action = addr.action;
    if (addr.from && addr.till && addr.till < addr.from)
      addr.till = addr.from;
    return createAction(addr, ctx.depth);
  };

  // ../ptk/lineview/lva.ts
  var LVA2 = class {
    constructor(addresses = "") {
      this._divisions = LVA2.parse(addresses);
      this.load = load;
      this.loadedItems = [];
    }
    divisions() {
      return this._divisions;
    }
    getNode(idx2) {
      return this._divisions[idx2];
    }
    remove(idx2) {
      if (typeof idx2 !== "number") {
        idx2 = this._divisions.indexOf(idx2);
      }
      if (!this._divisions.length)
        return;
      if (this._divisions.length == 1) {
        this._divisions = [];
        return this;
      }
      const depth = this._divisions[idx2].depth;
      let next = idx2 + 1;
      let nextdepth = this._divisions[next]?.depth;
      while (next < this._divisions.length && nextdepth > depth) {
        next++;
        nextdepth = this._divisions[next]?.depth;
      }
      if (next - idx2 > 1) {
        this._divisions.splice(idx2 + 1, next - idx2);
        this._combine();
      }
      this._divisions.splice(idx2, 1);
      this._combine();
      return this;
    }
    static stringify(lvnode, hideptkname = false, hideaction = false) {
      const { depth, action, from, till, highlightline, ptkname } = lvnode;
      return (ptkname && (!action || !hideptkname) ? ptkname + ":" : "") + (hideaction ? "" : action) + (from ? ">" + from : "") + (till > 0 ? "<" + till : "") + (highlightline > -1 ? ":" + highlightline : "");
    }
    stringify(lvnode, hideptkname = false, hideaction = false) {
      if (typeof lvnode == "number")
        lvnode = this.divisions(lvnode);
      if (!lvnode)
        return this.serialize();
      return LVA2.stringify(lvnode, hideptkname, hideaction);
    }
    firstChild(idx2) {
      if (idx2 < this._divisions.length - 1)
        return;
      const firstchild = this._divisions[idx2 + 1];
      if (firstchild && firstchild.depth == this._divisions[idx2].depth + 1) {
        return firstchild;
      }
    }
    serialize() {
      if (!this._divisions && !this._divisions.length)
        return "";
      let prevdepth = 0, same_level_ptkname = "", activeptkname;
      const firstdepth = this._divisions[0]?.depth || 0;
      const out = [], ptknames = [], actions = [];
      for (let i = 0; i < this._divisions.length; i++) {
        const { depth, from, till, ptkname, action } = this._divisions[i];
        if (depth > prevdepth)
          out.push("(");
        else if (prevdepth > depth)
          out.push(")");
        if (ptkname) {
          activeptkname = ptkname;
          ptknames[depth] = ptkname;
        }
        activeptkname = activeptkname || ptknames[depth] || same_level_ptkname;
        out.push(LVA2.stringify(this._divisions[i], activeptkname == same_level_ptkname, action == actions[depth]));
        if (action)
          actions[depth] = action;
        same_level_ptkname = activeptkname;
        prevdepth = depth;
      }
      while (prevdepth > firstdepth) {
        prevdepth--;
        out.push(")");
      }
      return out.join("^").replace(/\^?([\(\)])\^?/g, "$1").replace(/\++/g, "^");
    }
    removeSameAction(newaddr, from = 0, depth = -1) {
      let p2 = from;
      while (p2 < this._divisions.length && this._divisions[p2].depth > depth) {
        if (sameAddress(this._divisions[p2], newaddr) && newaddr.action) {
          this._divisions.splice(p2, 1);
          return p2;
          break;
        }
        p2++;
      }
      return -1;
    }
    findAction(action) {
      for (let i = 0; i < this._divisions.length; i++) {
        if (this._divisions[i].action == action)
          return i;
      }
      return -1;
    }
    canless(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      return division.till - division.from > ACTIONPAGESIZE;
    }
    canmore(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      const pagesize = this.getViewPageSize(division);
      return (division.till > 0 ? division.till : 0) + pagesize < division.last - division.first;
    }
    cannext(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      if (!division.pagable && !division.ownerdraw?.pagable)
        return;
      const pagesize = this.getViewPageSize(division);
      return division.last - division.first > pagesize;
    }
    canprev(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      if (!division.pagable && !division.ownerdraw?.pagable)
        return;
      return division.from > 0;
    }
    canpromote(idx2) {
      if (idx2 < 1)
        return;
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      if (division.depth > 0)
        return true;
    }
    promote(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return this;
      if (!this.canpromote(idx2))
        return this;
      division.depth = 0;
      this._divisions.splice(idx2, 1);
      this._divisions.unshift(division);
      this._combine();
      return this;
    }
    less(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return this;
      division.till -= ACTIONPAGESIZE;
      if (division.till - ACTIONPAGESIZE < division.from)
        division.till = division.from + ACTIONPAGESIZE;
      return this;
    }
    more(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return this;
      let linecount = division.last - division.first;
      const till = division.till;
      if (till == -1)
        division.till = division.from + ACTIONPAGESIZE;
      else
        division.till += ACTIONPAGESIZE;
      if (division.till > linecount)
        division.till = linecount;
      return this;
    }
    getViewPageSize(division) {
      let pagesize = division.till - division.from;
      const linecount = division.last - division.first;
      if (pagesize < ACTIONPAGESIZE) {
        pagesize = ACTIONPAGESIZE;
        if (pagesize > linecount) {
          pagesize = division.last - division.first;
        }
      }
      return pagesize;
    }
    removeChildren(idx2) {
      const depth = this._divisions[idx2]?.depth;
      const action = this._divisions[idx2]?.action;
      const ptkname = this._divisions[idx2]?.ptkname;
      for (let i = idx2 + 1; i < this._divisions.length; i++) {
        if (this._divisions[i].depth > depth) {
          this._divisions[i] = null;
        } else if (this._divisions[i].action !== action || this._divisions[i].ptkname !== ptkname)
          break;
      }
      this._divisions = this._divisions.filter((it) => !!it);
      this._combine();
    }
    next(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      this.removeChildren(idx2);
      const linecount = division.last - division.first;
      const pagesize = this.getViewPageSize(division);
      if (linecount <= pagesize || linecount <= ACTIONPAGESIZE)
        return this;
      if (division.till == -1)
        division.till = division.from + ACTIONPAGESIZE;
      division.from = division.till - 1;
      if (division.from < 0)
        division.from = 0;
      division.till = division.from + pagesize;
      if (division.from + 1 > linecount)
        division.from = linecount - 1;
      if (division.till > linecount)
        division.till = linecount;
      return this;
    }
    prev(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      const pagesize = this.getViewPageSize(division);
      division.from -= pagesize - 1;
      if (division.from < 0)
        division.from = 0;
      division.till = division.from + pagesize;
      return this;
    }
    top(idx2) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return;
      const pagesize = division.till - division.from;
      division.from = 0;
      division.till = pagesize;
      return this;
    }
    setFrom(idx2, from) {
      const division = this._divisions[idx2];
      if (!division)
        return;
      division.from = from;
      if (division.till !== -1)
        division.till = division.from + ACTIONPAGESIZE;
      if (division.till > division.last - division.first)
        division.till = division.last - division.first;
      return this;
    }
    insert(addr, idx2 = 0) {
      const newaddr = parseAddress(addr);
      if (!newaddr)
        return this;
      newaddr.ptkname = newaddr.ptkname || this._divisions[idx2]?.ptkname || this._divisions[idx2 - 1]?.ptkname;
      const removeat = this.removeSameAction(newaddr);
      if (removeat > -1) {
        if (removeat !== idx2)
          this._divisions.splice(idx2, 0, newaddr);
      } else {
        this._divisions.splice(idx2, 0, newaddr);
      }
      return this;
    }
    changeAction(newaction, idx2 = 0) {
      const division = typeof idx2 == "number" ? this._divisions[idx2] : idx2;
      if (!division)
        return this;
      division.action = newaction;
      return this;
    }
    dig(digaddr, idx2 = 0, nline = 0) {
      const newaddr = parseAddress(digaddr);
      if (!newaddr)
        return this;
      newaddr.ptkname = newaddr.ptkname || this._divisions[idx2].ptkname;
      const newaction = createAction(newaddr, 0, idx2);
      if (!this._divisions || !this._divisions.length) {
        this._divisions.push(newaddr);
        return this;
      }
      if (sameAddress(this._divisions[idx2], newaddr))
        return this;
      if (!this._divisions[idx2].diggable) {
        const removeat = this.removeSameAction(newaddr);
        if (removeat == -1 || removeat > idx2) {
          this._divisions.splice(idx2, 0, newaddr);
        }
        return;
      }
      let depth = this._divisions[idx2].depth;
      if (this._divisions.length > 1 && idx2 < this._divisions.length - 1 && this._divisions[idx2 + 1].depth == depth + 1) {
        const removeat = this.removeSameAction(newaddr, idx2 + 1, depth);
        if (~removeat && idx2 + 1 == removeat) {
          this._combine();
          return this;
        }
        newaddr.depth = this._divisions[idx2].depth + 1;
        this._divisions.splice(idx2 + 1, 0, newaddr);
        return this;
      }
      const addr = this._divisions[idx2];
      const splitat = addr.from + (nline || 0);
      let breakleft, breakright;
      const toinsert = parseAddress(digaddr);
      if (addr.from && addr.till && addr.till == addr.from || splitat + 1 >= addr.last - addr.first) {
        breakleft = addr;
        if (addr.action == toinsert.action) {
          this._divisions.splice(idx2, 1);
          return this;
        }
      } else {
        breakleft = Object.assign({}, addr, { till: splitat + 1 });
        breakright = Object.assign({}, addr, { from: splitat + 1 });
      }
      toinsert.depth = breakleft.depth + 1;
      const out = [breakleft, toinsert];
      if (breakright)
        out.push(breakright);
      this._divisions.splice(idx2, 1, ...out);
      return this;
    }
    _combine() {
      const out = [];
      let i = 0;
      while (i < this._divisions.length) {
        const { ptkname, from, till, action, depth } = this._divisions[i];
        let next = this._divisions[i + 1];
        out.push(this._divisions[i]);
        while (i < this._divisions.length && next && next.ptkname == ptkname && next.action == action && next.depth == depth && next.from == till) {
          this._divisions[i].till = next.till;
          i++;
          next = this._divisions[i + 1];
        }
        i++;
      }
      this._divisions = out;
      return this;
    }
    static parse(addresses) {
      if (!addresses)
        return [];
      const expr = parseLisp(addresses);
      const ctx = { same_level_ptkname: "", same_level_action: "", ptknames: [], actions: [] };
      const divisions = expr.map(([depth, action]) => {
        ctx.depth = depth;
        return createNestingAction(action, ctx);
      }).filter((it) => !!it);
      return divisions;
    }
  };

  // ../ptk/lineview/lineviewmenu.ts
  var getOfftextLineClass = (ptk, offtext, attr2) => {
    const out = [];
    if (!offtext?.tags?.length)
      return [];
    const tags = offtext.tags;
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const def = ptk.defines[tag.name];
      const value = def.attrs[attr2];
      if (typeof value !== "undefined") {
        const backref = def.attrs.backref;
        out.push({
          tagname: tag.name,
          attrs: tag.attrs,
          defattrs: def.attrs,
          id: tag.attrs.id,
          ptk,
          backref,
          attr: attr2,
          value,
          choff: tag.choff
        });
      }
    }
    return out;
  };

  // ../ptk/meta/cm.ts
  var tounge = [
    { prefix: "l", caption: "\u2693", factors: ["\u5C16,\u908A", "\u4E2D", "\u6839"] },
    { prefix: "b", caption: "\u{1F505}", factors: ["\u6DE1", "\u6697,\u9EEF"] },
    { prefix: "c", caption: "\u{1F308}", factors: ["\u767D", "\u9EC3", "\u7D05,\u8D64", "\u7D2B,\u7D73", "\u9752", "\u9ED1,\u7070"] },
    { prefix: "t", caption: "\u{1F35E}", factors: ["\u8584,\u5C11", "\u539A,\u80D6,\u5AE9"] },
    { prefix: "o", caption: "\u{1F406}", factors: ["\u7D0B,\u88C2", "\u6591,\u75D5,\u5370", "\u523A", "\u7600"] },
    { prefix: "p", caption: "\u2618\uFE0F", factors: ["\u6E05,\u7121", "\u57A2", "\u81A9,\u9ECF", "\u525D,\u5149"] },
    { prefix: "h", caption: "\u{1F911}", factors: ["\u4E7E,\u71E5,\u7CD9,\u7126,\u5C11\u6D25,\u7121\u6D25", "\u6F64,\u6ED1,\u591A\u6D25,\u6709\u6D25,\u6D8E"] }
  ];
  var pulse = [
    { prefix: "l", caption: "\u2693", factors: ["\u5BF8", "\u95DC", "\u5C3A"] },
    { prefix: "t", caption: "\u{1F476}", factors: ["\u7D30"] },
    { prefix: "g", caption: "\u{1F4AA}", factors: ["\u8EDF", "\u5F31,\u5FAE,\u7121\u529B", "\u6D2A,\u6709\u529B,\u5927", "\u5BE6,\u5805", "\u865B"] },
    { prefix: "q", caption: "\u{1F422}", factors: ["\u6025,\u75BE,\u4FC3", "\u6578,\u983B", "\u7DE9", "\u9072"] },
    { prefix: "p", caption: "\u{1F418}", factors: ["\u6D6E", "\u6C89,\u4F0F", "\u6309"] },
    { prefix: "s", caption: "\u{1F3BF}", factors: ["\u6ED1", "\u6F80,\u6F81"] },
    { prefix: "w", caption: "\u{1F30A}", factors: ["\u5F26", "\u7DCA", "\u7D50,\u7D50\u4EE3", "\u6FE1"] }
  ];
  var symtom = [
    { prefix: "a", caption: "\u{1F9CD}", factors: ["\u80A9", "\u9838,\u9805", "\u7662", "\u9EBB"] },
    { prefix: "b", caption: "\u{1F9D1}", factors: ["\u982D\u75DB", "\u982D\u6688", "\u982D\u91CD", "\u982D\u8139"] },
    { prefix: "c", caption: "\u{1F610}", factors: ["\u767D", "\u9EC3"], include: "\u9762,\u81C9" },
    { prefix: "d", caption: "\u{1F9B5}", factors: ["\u51B7", "\u62BD\u6410", "\u986B,\u6296"], inluce: "\u624B,\u8DB3,\u80A2" },
    { prefix: "g", caption: "\u{1F930}", factors: ["\u8179\u75DB", "\u8179\u8139", "\u80F8\u60B6"] },
    { prefix: "h", caption: "\u{1F42A}", factors: ["\u8170\u9178,\u8170\u75E0", "\u8170\u75DB", "\u80CC\u75DB"] },
    { prefix: "e", caption: "\u2744\uFE0F", factors: ["\u5BD2,\u754F\u5BD2,\u60E1\u5BD2", "\u60E1\u98A8"] },
    { prefix: "f", caption: "\u2668\uFE0F", factors: ["\u767C\u71B1,\u58EF\u71B1", "\u5C11\u71B1", "\u5BD2\u71B1"] },
    { prefix: "i", caption: "\u{1F4A6}", factors: ["\u81EA\u6C57", "\u76DC\u6C57", "\u7121\u6C57"] },
    { prefix: "j", caption: "\u{1F440}", factors: ["\u754F\u5149,\u7F9E\u660E", "\u816B", "\u8D64,\u7D05", "\u6DDA", "\u4E0D\u6E05,\u7CCA"], include: "\u773C,\u76EE,\u8996" },
    { prefix: "k", caption: "\u{1F442}", factors: ["\u8033\u9CF4", "\u807E"] },
    { prefix: "l", caption: "\u{1F443}", factors: ["\u9F3B\u585E", "\u5598,\u54EE", "\u6D95", "\u9F3B\u8840,\u8842"] },
    { prefix: "m", caption: "\u{1F444}", factors: ["\u6E34,\u4E7E", "\u5614,\u5443", "\u53E3\u81ED", "\u53E3\u6DE1", "\u53E3\u82E6", "\u54B3\u8840"] },
    { prefix: "n", caption: "\u{1F4AC}", factors: ["\u54B3\u55FD", "\u75F0", "\u54BD\u75DB", "\u8B6B,\u8A9E"] },
    { prefix: "o", caption: "\u{1F9B7}", factors: ["\u9F66,\u7259\u5BA3", "\u7259\u75DB", "\u86C0"] },
    { prefix: "p", caption: "\u{1F494}", factors: ["\u60B8,\u75F5,\u6014,\u5FE1", "\u7D5E\u75DB"] },
    { prefix: "q", caption: "\u{1F61E}", factors: ["\u7169,\u8E81,\u4EA2", "\u6012,\u72C2", "\u9B30,\u4E0D\u6A02", "\u75B2,\u5026,\u6020,\u61F6,\u60F0"] },
    { prefix: "r", caption: "\u{1F6CC}", factors: ["\u5931\u7720,\u4E0D\u5BD0", "\u6613\u9192,\u6DFA\u7720", "\u591A\u5922"] },
    { prefix: "s", caption: "\u{1F4A9}", factors: ["\u4FBF\u79D8,\u79D8\u7D50,\u4FBF\u7D50", "\u4FBF\u6E8F,\u6E8F,\u62C9\u7A00", "\u4FBF\u8840,\u4E0B\u8840", "\u809B", "\u75D4"] },
    { prefix: "t", caption: "\u{1F6BD}", factors: ["\u4E0D\u901A,\u4E0D\u5229", "\u6FC1", "\u6E05\u9577", "\u591A\u5C3F,\u983B\u6578", "\u5931\u7981,\u591C\u5C3F", "\u8840\u5C3F,\u5C3F\u8840"] }
  ];
  var expandFactor = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (~arr[i].indexOf(",")) {
        arr[i] = arr[i].split(",");
      }
    }
  };
  var splitFactors = (allFactors) => {
    for (let i = 0; i < allFactors.length; i++) {
      expandFactor(allFactors[i].factors);
      if (typeof allFactors[i].include == "string") {
        allFactors[i].include = allFactors[i].include.split(",");
      }
    }
  };
  splitFactors(tounge);
  splitFactors(pulse);
  splitFactors(symtom);
  var SickFactors = { tounge, pulse, symtom };
  var SickCauses = {
    l01: "\u98A8\u5BD2",
    l02: "\u98A8\u71B1",
    l03: "\u98A8\u71E5",
    l04: "\u865B\u98A8",
    l05: "\u9670\u5BD2",
    l06: "\u5BD2\u71B1",
    l07: "\u865B\u5BD2",
    l08: "\u98A8\u6691",
    l09: "\u6691\u6FD5",
    l10: "\u98A8\u6FD5",
    l11: "\u5BD2\u6FD5",
    l12: "\u6FD5\u71B1",
    l13: "\u71E5\u706B",
    l14: "\u6EAB\u71E5",
    l15: "\u71E5\u71B1",
    l16: "\u71E5\u6FD5",
    l17: "\u865B\u71E5",
    l18: "\u98A8\u706B",
    l19: "\u5BD2\u706B",
    l20: "\u6FD5\u706B",
    l21: "\u71E5\u706B",
    l22: "\u9B30\u706B",
    l23: "\u865B\u706B",
    l24: "\u6C23\u9B30",
    l25: "\u6C23\u7600",
    l26: "\u6C23\u75F0",
    l27: "\u6C23\u706B",
    l28: "\u5BD2\u7600",
    l29: "\u7600\u71B1",
    l30: "\u75F0\u7600",
    l31: "\u75F0\u6FD5",
    l32: "\u71B1\u75F0",
    l33: "\u75F0\u706B",
    l34: "\u98A8\u75F0",
    l35: "\u865B\u75F0",
    l36: "\u6C34\u98F2",
    l37: "\u5BD2\u98F2",
    l38: "\u98F2\u71B1",
    l39: "\u98DF\u6EEF",
    l40: "\u7A4D\u71B1",
    l41: "\u87F2\u7A4D",
    l42: "\u6C23\u865B",
    l43: "\u8840\u865B",
    l44: "\u9670\u865B",
    l45: "\u967D\u865B"
  };
  var SickLocations = {
    z01: "\u80BA\u885B",
    z02: "\u80BA\u813E",
    z03: "\u5FC3\u80BA",
    z04: "\u809D\u80BA",
    z05: "\u80BA\u814E",
    z06: "\u5FC3\u71DF",
    z07: "\u5FC3\u80C3",
    z08: "\u5FC3\u813E",
    z09: "\u5FC3\u81BD",
    z10: "\u5FC3\u809D",
    z11: "\u5FC3\u814E",
    z12: "\u80BA\u80C3",
    z13: "\u813E\u80C3",
    z14: "\u80C3\u8178",
    z15: "\u81BD\u80C3",
    z16: "\u809D\u80C3",
    z17: "\u814E\u80C3",
    z18: "\u809D\u813E",
    z19: "\u813E\u814E",
    z20: "\u809D\u81BD",
    z21: "\u809D\u814E"
  };
  var SickSigns = {
    h001: "\u885B\u6C23\u5931\u5BA3",
    h002: "\u885B\u6C23\u9B30\u84B8",
    h003: "\u885B\u6C23\u4E0D\u632F",
    h004: "\u885B\u6C23\u865B\u9B30",
    h005: "\u885B\u967D\u5931\u5BA3",
    h006: "\u885B\u967D\u602B\u9B30",
    h007: "\u885B\u967D\u9B30\u9589",
    h008: "\u885B\u967D\u9B30\u84B8",
    h009: "\u885B\u967D\u4E0D\u632F",
    h010: "\u885B\u967D\u865B\u9B30",
    h011: "\u885B\u967D\u4E0D\u56FA",
    h012: "\u71DF\u885B\u9B30\u6EEF",
    h013: "\u71DF\u885B\u9B30\u84B8",
    h014: "\u71DF\u885B\u9B30\u71BE",
    h015: "\u71DF\u885B\u865B\u5F31",
    h016: "\u71DF\u885B\u865B\u9B30",
    h017: "\u71DF\u885B\u5931\u8ABF",
    h018: "\u71DF\u885B\u4E0D\u884C",
    h019: "\u71DF\u6C23\u5931\u5BA3",
    h020: "\u71DF\u6C23\u9B30\u84B8",
    h021: "\u6C23\u71DF\u860A\u84B8",
    h022: "\u6C23\u71DF\u84B8\u707C",
    h023: "\u6C23\u71DF\u860A\u9589",
    h024: "\u71DF\u8840\u5931\u5BA3",
    h025: "\u71DF\u8840\u9B30\u84B8",
    h026: "\u71DF\u8840\u9B30\u9589",
    h027: "\u71DF\u8840\u84B8\u707C",
    h028: "\u71DF\u8840\u860A\u9589",
    h029: "\u71DF\u8840\u5931\u990A",
    h030: "\u71DF\u6DB2\u84B8\u707C",
    h031: "\u71DF\u9670\u6D88\u707C",
    h032: "\u71DF\u9670\u5931\u990A",
    h033: "\u6E05\u6C23\u5931\u5BA3",
    h034: "\u6E05\u6C23\u9B30\u904F",
    h035: "\u6E05\u6C23\u9B30\u84B8",
    h036: "\u6E05\u6C23\u9B30\u71BE",
    h037: "\u6E05\u6C23\u9B30\u9589",
    h038: "\u6E05\u6C23\u9B30\u9677",
    h039: "\u6E05\u6C23\u602B\u9B30",
    h040: "\u6E05\u6C23\u860A\u84B8",
    h041: "\u6E05\u6C23\u860A\u71BE",
    h042: "\u6E05\u6C23\u5931\u5BE7",
    h043: "\u6E05\u6C23\u9B30\u6EEF",
    h044: "\u6E05\u6C23\u4E0D\u5316",
    h045: "\u6E05\u6C23\u9B30\u9006",
    h046: "\u6E05\u6C23\u9006\u4E82",
    h047: "\u6E05\u6C23\u9B30\u7D50",
    h048: "\u6E05\u6C23\u9589\u53A5",
    h049: "\u6E05\u6C23\u865B\u9B30",
    h050: "\u6E05\u6C23\u865B\u6EEF",
    h051: "\u6E05\u6C23\u53A5\u819A",
    h052: "\u6E05\u6C23\u865B\u84B8",
    h053: "\u6E05\u6C23\u865B\u9677",
    h054: "\u6E05\u6C23\u4E0D\u5347",
    h055: "\u6E05\u6C23\u4E0B\u9677",
    h056: "\u6E05\u967D\u5931\u5BA3",
    h057: "\u6E05\u967D\u9B30\u904F",
    h058: "\u6E05\u967D\u9B30\u6EEF",
    h059: "\u6E05\u967D\u602B\u9B30",
    h060: "\u6E05\u967D\u9B30\u84B8",
    h061: "\u6E05\u967D\u9B30\u71BE",
    h062: "\u6E05\u967D\u9B30\u9589",
    h063: "\u6E05\u967D\u9B30\u7D50",
    h064: "\u6E05\u967D\u9B30\u9006",
    h065: "\u6E05\u967D\u9006\u4E82",
    h066: "\u6E05\u967D\u9B30\u9677",
    h067: "\u6E05\u967D\u9B30\u75F9",
    h068: "\u6E05\u967D\u4E0D\u884C",
    h069: "\u6E05\u967D\u4E0D\u5316",
    h070: "\u6E05\u967D\u5931\u4F4D",
    h071: "\u6E05\u967D\u8499\u9589",
    h072: "\u6E05\u967D\u9589\u53A5",
    h073: "\u6E05\u967D\u865B\u9B30",
    h074: "\u6E05\u967D\u865B\u9677",
    h075: "\u6E05\u967D\u865B\u9589",
    h076: "\u6E05\u967D\u5931\u8ABF",
    h077: "\u6E05\u967D\u865B\u6EEF",
    h078: "\u6E05\u967D\u865B\u7D50",
    h079: "\u6E05\u967D\u865B\u71BE",
    h080: "\u6E05\u967D\u4E0D\u5347",
    h081: "\u6E05\u967D\u4E0B\u9677",
    h082: "\u6A1E\u6A5F\u9B30\u904F",
    h083: "\u6A1E\u6A5F\u9B30\u6EEF",
    h084: "\u6A1E\u6A5F\u9B30\u84B8",
    h085: "\u6A1E\u6A5F\u9B30\u71BE",
    h086: "\u6A1E\u6A5F\u9B30\u7D50",
    h087: "\u6A1E\u6A5F\u865B\u84B8",
    h088: "\u6A1E\u6A5F\u865B\u9B30",
    h089: "\u6D25\u6C23\u4E0D\u5316",
    h090: "\u6D25\u6C23\u9B30\u6EEF",
    h091: "\u6D25\u6C23\u9B30\u7D50",
    h092: "\u6C23\u865B\u4E0D\u5316",
    h093: "\u6D25\u6C23\u9B30\u84B8",
    h094: "\u6D25\u6C23\u9B30\u71BE",
    h095: "\u6D25\u6C23\u860A\u84B8",
    h096: "\u6D25\u6C23\u84B8\u707C",
    h097: "\u6D25\u6C23\u84B8\u9589",
    h098: "\u6D25\u6C23\u860A\u9589",
    h099: "\u6D25\u6C23\u84B8\u71BE",
    h100: "\u6D25\u6C23\u71E5\u7D50",
    h101: "\u6D25\u6C23\u714E\u8FEB",
    h102: "\u6D25\u6C23\u71BE\u9006",
    h103: "\u6D25\u6C23\u9677\u9589",
    h104: "\u6D25\u6C23\u71BE\u9589",
    h105: "\u6D25\u6C23\u9589\u53A5",
    h106: "\u6D25\u6C23\u865B\u707C",
    h107: "\u6D25\u6C23\u865B\u9589",
    h108: "\u6D25\u6C23\u9589\u812B",
    h109: "\u6D25\u6C23\u4E0D\u5E03",
    h110: "\u6D25\u6C23\u4E0D\u56FA",
    h111: "\u6C23\u6DB2\u6D88\u707C",
    h112: "\u6C23\u6DB2\u6D88\u6DB8",
    h113: "\u6C23\u6DB2\u812B\u7D55",
    h114: "\u6DB2\u7AED\u967D\u812B",
    h115: "\u6C23\u6DB2\u9B30\u84B8",
    h116: "\u6DB2\u7AED\u967D\u9B30",
    h117: "\u6C23\u6DB2\u9B30\u6EEF",
    h118: "\u6C23\u6DB2\u714E\u8FEB",
    h119: "\u6C23\u6DB2\u9589\u53A5",
    h120: "\u6C23\u6DB2\u865B\u9B30",
    h121: "\u6C23\u6DB2\u865B\u9006",
    h122: "\u6C23\u6DB2\u865B\u6EEF",
    h123: "\u6C23\u6DB2\u4E0D\u5316",
    h124: "\u6C23\u6DB2\u865B\u71E5",
    h125: "\u6C23\u6DB2\u865B\u9589",
    h126: "\u6C23\u6DB2\u4E0D\u56FA",
    h127: "\u6C23\u8840\u9B30\u6EEF",
    h128: "\u6C23\u8840\u9B30\u904F",
    h129: "\u6C23\u8840\u602B\u9B30",
    h130: "\u6C23\u8840\u9B30\u9006",
    h131: "\u6C23\u8840\u9B30\u7D50",
    h132: "\u6C23\u8840\u9B30\u84B8",
    h133: "\u6C23\u8840\u9B30\u71BE",
    h134: "\u6C23\u8840\u860A\u84B8",
    h135: "\u6C23\u8840\u860A\u71BE",
    h136: "\u6C23\u8840\u5169\u71D4",
    h137: "\u6C23\u8840\u84B8\u71BE",
    h138: "\u6C23\u8840\u71E5\u7D50",
    h139: "\u6C23\u8840\u714E\u8FEB",
    h140: "\u6C23\u8840\u71BE\u9589",
    h141: "\u6C23\u8840\u9589\u812B",
    h142: "\u6C23\u8840\u5931\u990A",
    h143: "\u6C23\u8840\u5931\u8ABF",
    h144: "\u6C23\u8840\u865B\u7D50",
    h145: "\u6C23\u8840\u865B\u9B30",
    h146: "\u6C23\u8840\u865B\u84B8",
    h147: "\u6C23\u8840\u865B\u71BE",
    h148: "\u6C23\u865B\u5931\u651D",
    h149: "\u8840\u865B\u967D\u6D6E",
    h150: "\u6C23\u8840\u53A5\u812B",
    h151: "\u6C23\u8840\u812B\u7D55",
    h152: "\u6C23\u9670\u9B30\u84B8",
    h153: "\u6C23\u9670\u860A\u84B8",
    h154: "\u6C23\u9670\u6D88\u707C",
    h155: "\u6C23\u9670\u5169\u865B",
    h156: "\u6C23\u9670\u865B\u9B30",
    h157: "\u6C23\u9670\u865B\u6EEF",
    h158: "\u6C23\u9670\u4E0D\u5316",
    h159: "\u6C23\u9670\u865B\u71E5",
    h160: "\u6C23\u9670\u865B\u84B8",
    h161: "\u6C23\u9670\u4E0D\u651D",
    h162: "\u6C23\u9670\u4E0D\u56FA",
    h163: "\u6C23\u9670\u9589\u812B",
    h164: "\u6C23\u9670\u7AED\u7D55",
    h165: "\u967D\u6C23\u4EA2\u9006",
    h166: "\u967D\u6C23\u53A5\u9006",
    h167: "\u967D\u9B30\u4E0D\u5316",
    h168: "\u967D\u6EEF\u4E0D\u5316",
    h169: "\u967D\u865B\u4E0D\u5316",
    h170: "\u967D\u6C23\u865B\u6EEF",
    h171: "\u967D\u6C23\u865B\u7D50",
    h172: "\u967D\u6C23\u865B\u9B30",
    h173: "\u967D\u6C23\u865B\u71BE",
    h174: "\u967D\u6C23\u865B\u9006",
    h175: "\u967D\u865B\u5931\u7D0D",
    h176: "\u967D\u865B\u5931\u56FA",
    h177: "\u967D\u865B\u5931\u651D",
    h178: "\u967D\u6C23\u865B\u640D",
    h179: "\u967D\u640D\u53CA\u9670",
    h180: "\u967D\u6C23\u9589\u812B",
    h181: "\u967D\u6C23\u53A5\u812B",
    h182: "\u865B\u967D\u6D6E\u8D8A",
    h183: "\u967D\u6C23\u865B\u812B",
    h184: "\u8840\u6DB2\u9B30\u7D50",
    h185: "\u8840\u6DB2\u860A\u84B8",
    h186: "\u8840\u6DB2\u9B30\u84B8",
    h187: "\u8840\u6DB2\u71D4\u707C",
    h188: "\u8840\u6DB2\u9589\u53A5",
    h189: "\u8840\u6DB2\u9589\u812B",
    h190: "\u8840\u6DB2\u9B30\u6EEF",
    h191: "\u8840\u6DB2\u865B\u71E5",
    h192: "\u8840\u6DB2\u6D88\u707C",
    h193: "\u8840\u6DB2\u6D88\u6DB8",
    h194: "\u9670\u8840\u860A\u71BE",
    h195: "\u9670\u8840\u714E\u8FEB",
    h196: "\u9670\u8840\u9589\u53A5",
    h197: "\u9670\u8840\u9589\u812B",
    h198: "\u9670\u8840\u5931\u990A",
    h199: "\u9670\u8840\u865B\u9B30",
    h200: "\u9670\u8840\u865B\u6EEF",
    h201: "\u9670\u8840\u865B\u84B8",
    h202: "\u9670\u8840\u6D88\u707C",
    h203: "\u9670\u8840\u865B\u71E5",
    h204: "\u9670\u8840\u865B\u640D",
    h205: "\u9670\u67AF\u706B\u71BE",
    h206: "\u9670\u6DB2\u714E\u8FEB",
    h207: "\u9670\u6DB2\u865B\u71E5",
    h208: "\u9670\u6DB2\u9589\u53A5",
    h209: "\u9670\u6DB2\u53A5\u812B",
    h210: "\u9670\u6DB2\u6D88\u707C",
    h211: "\u9670\u6DB2\u67AF\u6DB8",
    h212: "\u9670\u865B\u967D\u6D6E",
    h213: "\u9670\u7AED\u967D\u53A5",
    h214: "\u9670\u7AED\u967D\u8D8A",
    h215: "\u9670\u7AED\u967D\u812B",
    h216: "\u9670\u865B\u5931\u990A",
    h217: "\u9670\u865B\u967D\u5F31",
    h218: "\u9670\u865B\u967D\u9B30",
    h219: "\u9670\u865B\u4E0D\u5316",
    h220: "\u9670\u865B\u5931\u7D0D",
    h221: "\u9670\u865B\u5931\u651D",
    h222: "\u9670\u865B\u4E0D\u56FA",
    h223: "\u9670\u7CBE\u4E0D\u56FA",
    h224: "\u771F\u9670\u865B\u640D",
    h225: "\u9670\u640D\u53CA\u967D",
    h226: "\u80BA\u6C23\u5931\u5BA3",
    h227: "\u80BA\u5931\u5BA3\u964D",
    h228: "\u80BA\u6C23\u9B30\u9589",
    h229: "\u80BA\u6C23\u9B30\u75F9",
    h230: "\u80BA\u6C23\u5931\u5145",
    h231: "\u80BA\u967D\u5931\u5BA3",
    h232: "\u80BA\u967D\u4E0D\u5E03",
    h233: "\u80BA\u7D61\u5931\u5BA3",
    h234: "\u80BA\u5931\u6E05\u8085",
    h235: "\u80BA\u9670\u5931\u990A",
    h236: "\u5FC3\u795E\u5931\u5BE7",
    h237: "\u5FC3\u6C23\u4E0D\u632F",
    h238: "\u5FC3\u967D\u4EA2\u76DB",
    h239: "\u5FC3\u967D\u5931\u5BA3",
    h240: "\u5FC3\u967D\u9589\u585E",
    h241: "\u5FC3\u967D\u4E0D\u632F",
    h242: "\u5FC3\u7D61\u5931\u5BA3",
    h243: "\u5FC3\u8840\u5931\u990A",
    h244: "\u5FC3\u9670\u5931\u990A",
    h245: "\u5FC3\u9670\u865B\u6EEF",
    h246: "\u80C3\u6C23\u4E0D\u9192",
    h247: "\u80C3\u6C23\u5931\u548C",
    h248: "\u80C3\u5931\u548C\u964D",
    h249: "\u80C3\u6C23\u9B30\u7D50",
    h250: "\u80C3\u6C23\u4E0D\u632F",
    h251: "\u80C3\u967D\u5931\u548C",
    h252: "\u80C3\u967D\u865B\u9006",
    h253: "\u80C3\u967D\u4E0D\u632F",
    h254: "\u80C3\u7D61\u5931\u548C",
    h255: "\u80C3\u9670\u6D88\u6DB8",
    h256: "\u813E\u6C23\u5931\u904B",
    h257: "\u813E\u80C3\u9B30\u6EEF",
    h258: "\u4E2D\u6C23\u9B30\u7D50",
    h259: "\u4E2D\u6C23\u7A92\u9589",
    h260: "\u813E\u6C23\u4E0D\u5065",
    h261: "\u813E\u6C23\u865B\u6EEF",
    h262: "\u813E\u6C23\u865B\u7D50",
    h263: "\u813E\u80C3\u4E0D\u548C",
    h264: "\u813E\u967D\u5931\u904B",
    h265: "\u813E\u967D\u9B30\u9589",
    h266: "\u813E\u967D\u9B30\u7D50",
    h267: "\u4E2D\u967D\u9B30\u6EEF",
    h268: "\u4E2D\u967D\u9589\u585E",
    h269: "\u4E2D\u967D\u4E0D\u548C",
    h270: "\u813E\u967D\u865B\u6EEF",
    h271: "\u813E\u967D\u4E0D\u632F",
    h272: "\u813E\u9670\u6D88\u6DB8",
    h273: "\u81BD\u6C23\u9B30\u6EEF",
    h274: "\u81BD\u6C23\u9B30\u7D50",
    h275: "\u81BD\u6C23\u4E0D\u632F",
    h276: "\u6728\u706B\u9B30\u904F",
    h277: "\u6728\u706B\u9B30\u6EEF",
    h278: "\u6728\u706B\u9B30\u9589",
    h279: "\u6728\u706B\u9B30\u9006",
    h280: "\u6728\u706B\u9B30\u84B8",
    h281: "\u6728\u706B\u9B30\u71BE",
    h282: "\u6728\u706B\u860A\u71BE",
    h283: "\u6728\u706B\u5347\u9006",
    h284: "\u6728\u706B\u71BE\u9006",
    h285: "\u6728\u706B\u860A\u9589",
    h286: "\u6728\u706B\u9589\u53A5",
    h287: "\u6728\u706B\u865B\u84B8",
    h288: "\u6728\u706B\u865B\u71BE",
    h289: "\u6728\u706B\u865B\u9006",
    h290: "\u809D\u6C23\u5931\u758F",
    h291: "\u809D\u6C23\u9B30\u7D50",
    h292: "\u809D\u6C23\u6A6B\u9006",
    h293: "\u809D\u6C23\u4E0D\u632F",
    h294: "\u809D\u6C23\u5931\u8ABF",
    h295: "\u809D\u967D\u4EA2\u76DB",
    h296: "\u809D\u967D\u5931\u5BA3",
    h297: "\u809D\u967D\u9589\u585E",
    h298: "\u809D\u967D\u5931\u548C",
    h299: "\u809D\u967D\u4E0D\u632F",
    h300: "\u809D\u7D61\u5931\u5BA3",
    h301: "\u809D\u7D61\u5931\u548C",
    h302: "\u809D\u8840\u5931\u990A",
    h303: "\u809D\u9670\u865B\u6EEF",
    h304: "\u809D\u9670\u5931\u990A",
    h305: "\u814E\u6C23\u5931\u5BA3",
    h306: "\u814E\u6C23\u9B30\u7D50",
    h307: "\u814E\u6C23\u4E0D\u5145",
    h308: "\u814E\u967D\u5931\u5BA3",
    h309: "\u814E\u967D\u9589\u585E",
    h310: "\u814E\u967D\u4E0D\u632F",
    h311: "\u814E\u967D\u4E0D\u5316",
    h312: "\u814E\u967D\u865B\u7D50",
    h313: "\u814E\u967D\u865B\u9006",
    h314: "\u814E\u7D61\u5931\u5BA3",
    h315: "\u814E\u9670\u6D88\u707C",
    h316: "\u814E\u9670\u865B\u71BE",
    h317: "\u814E\u9670\u865B\u6EEF",
    h318: "\u814E\u9670\u5931\u990A",
    h319: "\u541B\u76F8\u5931\u5BE7",
    h320: "\u5FC3\u814E\u4E0D\u4EA4",
    h321: "\u9F8D\u96F7\u4E0D\u85CF",
    h322: "\u706B\u4E0D\u6B78\u5143"
  };
  var onLineText = (t, line) => {
    if (~t.indexOf("^ck")) {
      return t.replace(/\^ck(\d+)z(\d+)h(\d+)/, (m4, l, z, h) => {
        const caption = onChunkCaption(l + "z" + z + "h" + h);
        const [sick, sign] = caption.split("|");
        return m4 + " ^sick\u3010" + sick + "\u3011^sign" + h + "\u3010" + sign + "\u3011";
      });
    }
    return t;
  };
  var parseChunkId = (chunkid) => {
    const l = chunkid.slice(0, 2);
    const z = chunkid.slice(3, 5);
    const h = chunkid.slice(6);
    return { l, z, h };
  };
  var onChunkCaption = (chunkid, part) => {
    const { l, z, h } = parseChunkId(chunkid);
    const part1 = SickCauses["l" + l] + SickLocations["z" + z] + "\u8B49";
    const part2 = SickSigns["h" + h] + "\u5019";
    if (part == 1)
      return part1;
    if (part == 2)
      return part2;
    return part1 + "|" + part2;
  };
  var findPrefix = (Factors, prefix) => {
    for (let i = 0; i < Factors.length; i++) {
      if (Factors[i].prefix == prefix)
        return Factors[i].factors;
    }
    return [];
  };
  var decodeFactor = (field, code) => {
    const [m0, prefix, n] = code.split(/([a-z])(\d+)/);
    const factors = findPrefix(SickFactors[field], prefix);
    let caption = factors[n];
    if (typeof caption !== "string")
      caption = caption[0];
    return caption;
  };
  var makeButtonStates = (Factors) => {
    const out = [];
    for (let i = 0; i < Factors.length; i++) {
      const states = [];
      const { caption, factors, prefix } = Factors[i];
      for (let j2 = 0; j2 < factors.length; j2++) {
        if (typeof factors[j2] !== "string") {
          states[factors[j2][0]] = prefix + j2;
        } else
          states[factors[j2]] = prefix + j2;
      }
      out.push({ caption, states, prefix });
    }
    return out;
  };
  var icons = { symtom: "\u26A0\uFE0F", tounge: "\u{1F445}", pulse: "\u270B\u{1F3FB}" };
  var getMultiStateFilters = () => {
    return [
      { name: "symtom", caption: icons.symtom, states: makeButtonStates(symtom), newline: true },
      { name: "tounge", caption: icons.tounge, states: makeButtonStates(tounge) },
      { name: "pulse", caption: icons.pulse, states: makeButtonStates(pulse) }
    ];
  };
  var stringifyChoice = (choices, groupby = 0, groupfilter = "") => {
    let symtom2 = "", tounge2 = "", pulse2 = "";
    for (let key2 in choices) {
      if (key2 == "symtom")
        symtom2 = choices[key2].join("");
      if (key2 == "tounge")
        tounge2 = choices[key2].join("");
      if (key2 == "pulse")
        pulse2 = choices[key2].join("");
    }
    return symtom2 + "_" + tounge2 + "_" + pulse2 + "_" + groupby + "_" + groupfilter;
  };
  var humanChoice = (choices) => {
    if (typeof choices == "string")
      [choices] = parseChoice(choices);
    let out = "";
    for (let field in choices) {
      if (choices[field].length) {
        out += icons[field];
        for (let i = 0; i < choices[field].length; i++) {
          out += " " + decodeFactor(field, choices[field][i]);
        }
      }
    }
    return out;
  };
  var parseChoice = (str) => {
    const [_symtom, _tounge, _pulse, _groupby, _groupfilter] = str.split("_");
    const symtom2 = (_symtom || "").split(/([a-z]\d+)/).filter((it) => !!it) || [];
    const tounge2 = (_tounge || "").split(/([a-z]\d+)/).filter((it) => !!it) || [];
    const pulse2 = (_pulse || "").split(/([a-z]\d+)/).filter((it) => !!it) || [];
    const groupby = parseInt(_groupby) || 0;
    const groupfilter = _groupfilter;
    return [{ symtom: symtom2, tounge: tounge2, pulse: pulse2 }, groupby, groupfilter];
  };
  var factorString = (code, groupby) => {
    if (groupby == 1) {
      return SickLocations["z" + code];
    } else if (groupby == 2) {
      return SickCauses["l" + code];
    } else if (groupby == 3) {
      const [m0, z, l] = code.match(/(\d+)z(\d+)/);
      return SickLocations["z" + z] + SickCauses["l" + l];
    } else if (groupby == 4) {
      return SickSigns["h" + code];
    }
    return "";
  };
  var groupBy = (items, chunks, groupby = 1, groupfilter = "") => {
    const obj = {};
    for (let i = 0; i < items.length; i++) {
      const ck = chunks[i];
      const { l, z, h } = parseChunkId(ck.id);
      let gkey = "";
      if (groupby == 1)
        gkey = z;
      else if (groupby == 2)
        gkey = l;
      else if (groupby == 3)
        gkey = l + "z" + z;
      else if (groupby == 4)
        gkey = h;
      if (!obj[gkey])
        obj[gkey] = 0;
      obj[gkey]++;
    }
    return fromObj(obj, (code, count) => [factorString(code, groupby), count, code]);
  };
  var matchGroup = (ck, groupby, groupfilter) => {
    if (groupby && groupfilter) {
      if (groupby == 1) {
        return ~ck.id.indexOf("z" + groupfilter);
      } else if (groupby == 2) {
        return ck.id.indexOf(groupfilter) == 0;
      } else if (groupby == 3) {
        return ~ck.id.indexOf(groupfilter);
      } else if (groupby == 4) {
        return ~ck.id.indexOf("h" + groupfilter);
      }
    }
    return true;
  };
  var runFilter = (ptk, col, opts = {}) => {
    const items = [], chunks = [];
    const choices = opts.choices;
    const groupby = opts.groupby;
    const groupfilter = opts.groupfilter;
    const tag = ptk.defines[col.attrs.master];
    let choicecount = 0;
    for (let field in choices) {
      choicecount += choices[field].length;
    }
    for (let i = 0; i < tag.linepos.length; i++) {
      let hit = 0;
      for (let field in choices) {
        if (choices[field].length == 0)
          continue;
        for (let j2 = 0; j2 < choices[field].length; j2++) {
          const key2 = choices[field][j2];
          if (~col[field][i].indexOf(key2))
            hit++;
        }
        if (hit * 1.1 < choicecount)
          continue;
        const line = tag.linepos[i];
        const ck = ptk.getNearestChunk(line);
        if (groupby == 0 && groupfilter) {
          if (tag.innertext.get(i) !== groupfilter)
            continue;
        } else {
          if (!matchGroup(ck, groupby, groupfilter))
            continue;
        }
        items.push(i);
        chunks.push(ck);
      }
    }
    let groups = [], grouping = {};
    if (groupby) {
      groups = groupBy(items, chunks, groupby, groupfilter);
    } else {
      for (let i = 0; i < items.length; i++) {
        const t = tag.innertext.get(items[i]);
        if (!grouping[t])
          grouping[t] = 0;
        grouping[t]++;
      }
      groups = fromObj(grouping, (text2, count) => [text2, count, text2]);
      groups.sort((a, b) => b[1] - a[1]);
    }
    return { items, groups, mastertag: tag };
  };
  var groupStates = (format) => {
    if (format == "statebutton") {
      return { "\u540D": 0, "\u4F4D": 1, "\u56E0": 2, "\u8B49": 3, "\u5019": 4 };
    } else {
      return ["\u540D", "\u4F4D", "\u56E0", "\u8B49", "\u5019"];
    }
  };
  var factorSimilarity = (symtoms, str) => {
    const len = str.length / 2, count = symtoms.length;
    let match = 0;
    for (let i = 0; i < symtoms.length; i++) {
      if (~str.indexOf(symtoms[i]))
        match++;
    }
    const r = match * 2 / (len + count);
    if (r > 1)
      console.log(match, len, count, symtoms, str);
    return r;
  };
  var getApprox = (ptk, tagname, id) => {
    const out = [];
    const at = bsearchNumber(ptk.defines.ill.linepos, id) - 1;
    const v = ptk.columns.manifest[tagname][at];
    const values = v.split(/([a-z]\d)/).filter((it) => !!it);
    for (let i = 0; i < ptk.columns.manifest[tagname].length; i++) {
      const str = ptk.columns.manifest[tagname][i];
      if (!str || i == at)
        continue;
      const similarity = factorSimilarity(values, str);
      if (similarity > 0.5) {
        const illline = ptk.defines.ill.linepos[i];
        const at2 = bsearchNumber(ptk.defines[tagname].linepos, illline);
        const id2 = i;
        out.push({ id: id2, similarity, line: ptk.defines[tagname].linepos[at2] });
      }
      out.sort((a, b) => b.similarity - a.similarity);
    }
    return out;
  };
  addTemplate("cm", {
    filterColumn: "manifest",
    getApprox,
    parseChoice,
    stringifyChoice,
    humanChoice,
    groupStates,
    onLineText,
    onChunkCaption,
    getMultiStateFilters,
    runFilter
  });

  // ../ptk/denote/tokenizers.ts
  var isIASTToken = (w) => w.match(/^[a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+\d*$/);
  var tokenizeIAST = (str, opts = {}) => {
    const pattern = opts.pattern || /([a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+\d*)/ig;
    let o = str.split(pattern).filter((it) => !!it);
    if (opts.removeBlank)
      o = o.filter(isIASTToken);
    if (opts.tokenOnly)
      return o;
    else
      return o.map((raw) => {
        return [raw, null];
      });
  };
  tokenizeIAST.splitPunc = (str) => str;
  tokenizeIAST.isToken = isIASTToken;
  var tokenizeIASTPunc = (str, opts = {}) => {
    opts.pattern = /([“‘]*[a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+\d*[’।॥\.,;?\!…”–]* *)/ig;
    return tokenizeIAST(str, opts);
  };
  tokenizeIASTPunc.splitPunc = (token) => {
    const mlead = token.match(/^([“‘]*)/);
    let lead, tail;
    if (mlead) {
      lead = mlead[1];
      token = token.slice(lead.length);
    }
    const mtail = token.match(/(\d*[’।॥\.,;?\!…”–]* *)$/);
    if (mtail) {
      tail = mtail[1];
      token = token.slice(0, token.length - tail.length);
    }
    return [lead, token, tail];
  };
  tokenizeIASTPunc.isToken = (w) => w.match(/^([“‘]*[a-zA-Zḍṭṇñḷṃṁṣśṅṛāīūâîû]+\d*[’।॥\.,;?\!…”–]* *)$/);

  // src/ts/urlhash.ts
  var updateUrl = (lva, opts) => {
    window.location.hash = "#" + lva;
  };
  var addressFromUrl = () => {
    let hash = window.location.hash;
    if (hash[0] == "#")
      hash = hash.slice(1);
    const lva = decodeURI(hash);
    return lva;
  };

  // src/ts/store.ts
  var maintab = writable("builder");
  var activeword = writable("");
  var panepos = writable(settings.panepos);
  var pitakas = writable([]);
  var activepitaka = writable(-1);
  var lvaddr = writable(addressFromUrl());
  var deployable = writable(true);
  var errormsg = writable("");
  var comimage = writable(null);
  var palitrans = writable(settings.palitrans);
  var tosim = writable(settings.tosim);
  var fontsize = writable(settings.fontsize);
  var factorization = writable(settings.factorization);
  var tofind = writable(settings.tofind);
  var parallels = writable(settings.parallels);
  panepos.subscribe((panepos2) => updateSettings({ panepos: panepos2 }));
  tosim.subscribe((tosim2) => updateSettings({ tosim: tosim2 }));
  fontsize.subscribe((fontsize2) => updateSettings({ fontsize: fontsize2 }));
  palitrans.subscribe((palitrans2) => updateSettings({ palitrans: palitrans2 }));
  factorization.subscribe((factorization2) => updateSettings({ factorization: factorization2 }));
  tofind.subscribe((tofind2) => updateSettings({ tofind: tofind2 }));
  parallels.subscribe((parallels2) => updateSettings({ parallels: parallels2 }));
  errormsg.subscribe((msg) => {
    if (msg.length) {
      setTimeout(() => {
        errormsg.set("");
      }, 3e3);
    }
  });
  var locals = (window.accelon22?.preload || "").split(",").filter((it) => !!it);
  console.log(locals);
  var activePtkName = () => get_store_value(pitakas)[get_store_value(activepitaka)]?.name;
  lvaddr.subscribe((lva) => {
    updateUrl(lva);
  });
  fontsize.subscribe((size) => {
    document.getElementsByTagName("body")[0].style.fontSize = size + "%";
  });
  var getVerTexts = async (ptk) => {
    const linepos = ptk.defines.ver?.linepos;
    const verTexts = linepos ? linepos.map((it) => ptk.getLine(it)) : [];
    return verTexts;
  };
  async function openPitakas() {
    const out = [], jobs = [];
    for (let i = 0; i < locals.length; i++) {
      const ptk = await openPtk(locals[i]);
      const verTexts = await getVerTexts(ptk);
      const buildtime = new Date(ptk.header.buildtime);
      const eot = ptk.header.eot;
      out.push({ name: ptk.name, ptk, location: "local", verTexts, buildtime, eot });
      jobs.push(loadScript(ptk.name + "/accelon22.css"));
      console.log(ptk);
    }
    await Promise.all(jobs);
    pitakas.set(out);
    out.length && activepitaka.set(0);
  }

  // src/ts/editor.ts
  var scrollY = writable(0);
  var sources = writable([]);
  var editorClean = writable(true);
  var editorViewport = writable([0, 30]);
  var editorCursor = writable([0, 0, "", ""]);
  var scrollToLine = writable(0);
  var editing = writable(-1);
  var editingErrors = writable([]);
  var compileErrors = writable([]);

  // src/ts/editorupdate.ts
  var compiler = new Compiler2();
  var MAXEDITABLESIZE = 1024 * 1024 * 10;

  // src/ts/styling.ts
  var getLVStyle = (depth, edge) => {
    let background = "background: hsl(" + depth * 60 + ",15%,20%);";
    if (depth == 0)
      background = "";
    const style = "1px dashed hsl(" + depth * 60 + ",50%,50%);";
    if (edge == 1) {
      return background + "border-top:" + style;
    } else if (edge == 2) {
      return background + "border-bottom:" + style;
    } else if (edge == 3) {
      return background + "border:" + style;
    } else
      return background;
  };

  // src/painters/painters.ts
  var Painters = {};
  var registerPainter = (name2, component) => {
    if (Painters[name2])
      console.warn(name2 + " already registered, override");
    Painters[name2] = component;
  };
  var initPainters = (obj) => {
    for (let n in obj) {
      registerPainter(n, obj[n]);
    }
  };

  // src/lineview/offtag.svelte
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[8] = list[i];
    return child_ctx;
  }
  function create_each_block(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [
      { after: ctx[0] },
      { seq: ctx[2] },
      {
        classes: ctx[1].name + " " + ctx[8].tagname
      },
      ctx[8][1]
    ];
    var switch_value = ctx[8][0];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 15 ? get_spread_update(switch_instance_spread_levels, [
          dirty & 1 && { after: ctx2[0] },
          dirty & 4 && { seq: ctx2[2] },
          dirty & 10 && {
            classes: ctx2[1].name + " " + ctx2[8].tagname
          },
          dirty & 8 && get_spread_object(ctx2[8][1])
        ]) : {};
        if (switch_value !== (switch_value = ctx2[8][0])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_fragment(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[3];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 15) {
          each_value = ctx2[3];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance2($$self, $$props, $$invalidate) {
    let painters = [];
    let { offtext } = $$props;
    let { ntag } = $$props;
    let { after } = $$props;
    let { ptk } = $$props;
    let { firstchild } = $$props;
    let { seq } = $$props;
    const getPainters = () => {
      const tag = offtext.getTag(ntag);
      const typedef = ptk.typedefOf(tag.name);
      const fields = typedef?.fields;
      if (!fields)
        return;
      $$invalidate(3, painters.length = 0, painters);
      if (tag.active) {
        const painter = Painters[fields.type?.type];
        if (painter) {
          if (fields?.type?.type) {
            const { name: name2, keys, type, foreign } = fields.type;
            const text2 = removeBracket(offtext.tagText(tag));
            painters.push([
              painter,
              {
                name: name2,
                field: typedef.attrs.field,
                tagname: tag.name,
                masterid: tag.attrs.id,
                line: tag.line,
                keys,
                ptk,
                foreign,
                text: text2,
                firstchild
              }
            ]);
          }
        }
      }
      for (let name2 in tag.attrs) {
        if (fields[name2]) {
          const { keys, type, foreign } = fields[name2];
          let P = Painters[type];
          if (!Painters[type] && Painters[tag.name]) {
            P = Painters[tag.name];
          }
          if (!P)
            continue;
          const props = {
            name: name2,
            tagname: tag.name,
            masterid: tag.attrs.id,
            line: tag.line,
            keys,
            type,
            ptk,
            foreign,
            firstchild,
            value: tag.attrs[name2]
          };
          painters.push([P, props]);
        }
      }
      $$invalidate(3, painters);
    };
    $$self.$$set = ($$props2) => {
      if ("offtext" in $$props2)
        $$invalidate(4, offtext = $$props2.offtext);
      if ("ntag" in $$props2)
        $$invalidate(5, ntag = $$props2.ntag);
      if ("after" in $$props2)
        $$invalidate(0, after = $$props2.after);
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("firstchild" in $$props2)
        $$invalidate(6, firstchild = $$props2.firstchild);
      if ("seq" in $$props2)
        $$invalidate(2, seq = $$props2.seq);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 64) {
        $:
          getPainters(firstchild);
      }
    };
    return [after, ptk, seq, painters, offtext, ntag, firstchild];
  }
  var Offtag = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance2, create_fragment, safe_not_equal, {
        offtext: 4,
        ntag: 5,
        after: 0,
        ptk: 1,
        firstchild: 6,
        seq: 2
      });
    }
  };
  var offtag_default = Offtag;

  // src/lineview/offtags.svelte
  function get_each_context2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[5] = list[i];
    return child_ctx;
  }
  function create_each_block2(ctx) {
    let offtag;
    let t;
    let current;
    offtag = new offtag_default({
      props: {
        ptk: ctx[3],
        offtext: ctx[2].offtext,
        ntag: ctx[5],
        after: ctx[1],
        seq: ctx[4]
      }
    });
    return {
      c() {
        create_component(offtag.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        mount_component(offtag, target, anchor);
        insert(target, t, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const offtag_changes = {};
        if (dirty & 8)
          offtag_changes.ptk = ctx2[3];
        if (dirty & 4)
          offtag_changes.offtext = ctx2[2].offtext;
        if (dirty & 1)
          offtag_changes.ntag = ctx2[5];
        if (dirty & 2)
          offtag_changes.after = ctx2[1];
        if (dirty & 16)
          offtag_changes.seq = ctx2[4];
        offtag.$set(offtag_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(offtag.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(offtag.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(offtag, detaching);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [{ seq: ctx[4] }, ctx[2].extra.data];
    var switch_value = Painters[ctx[2].extra.painter];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 20 ? get_spread_update(switch_instance_spread_levels, [
          dirty & 16 && { seq: ctx2[4] },
          dirty & 4 && get_spread_object(ctx2[2].extra.data)
        ]) : {};
        if (switch_value !== (switch_value = Painters[ctx2[2].extra.painter])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_fragment2(ctx) {
    let each_1_anchor;
    let if_block_anchor;
    let current;
    let each_value = ctx[0];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block2(get_each_context2(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    let if_block = ctx[2]?.extra && ctx[1] && create_if_block(ctx);
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 31) {
          each_value = ctx2[0];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context2(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block2(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (ctx2[2]?.extra && ctx2[1]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 6) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block);
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance3($$self, $$props, $$invalidate) {
    let { ntags } = $$props;
    let { after } = $$props;
    let { ru } = $$props;
    let { ptk } = $$props;
    let { seq } = $$props;
    $$self.$$set = ($$props2) => {
      if ("ntags" in $$props2)
        $$invalidate(0, ntags = $$props2.ntags);
      if ("after" in $$props2)
        $$invalidate(1, after = $$props2.after);
      if ("ru" in $$props2)
        $$invalidate(2, ru = $$props2.ru);
      if ("ptk" in $$props2)
        $$invalidate(3, ptk = $$props2.ptk);
      if ("seq" in $$props2)
        $$invalidate(4, seq = $$props2.seq);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 6) {
        $:
          $$invalidate(0, ntags = ru && ru.tagsOf(after));
      }
    };
    return [ntags, after, ru, ptk, seq];
  }
  var Offtags = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance3, create_fragment2, safe_not_equal, {
        ntags: 0,
        after: 1,
        ru: 2,
        ptk: 3,
        seq: 4
      });
    }
  };
  var offtags_default = Offtags;

  // src/ownerdraw/ownerdraw.ts
  var Ownerdraws = {};
  var registerOwnerdraw = (name2, component) => {
    if (Ownerdraws[name2])
      console.warn(name2 + " already registered, override");
    Ownerdraws[name2] = component;
  };
  var initOwnerdraws = (obj) => {
    for (let n in obj) {
      registerOwnerdraw(n, obj[n]);
    }
  };

  // ../provident-pali/src/utils.js
  var doParts = (parts, charpat, onPart) => {
    let out = "";
    if (typeof parts == "string")
      parts = [parts];
    for (let j2 = 0; j2 < parts.length; j2++) {
      if (!parts[j2])
        continue;
      if (parts[j2][0] == "<" || parts[j2][0] == "^") {
        out += parts[j2];
        continue;
      }
      const units = parts[j2].split(charpat);
      units.forEach((s) => {
        const m4 = s.match(charpat);
        if (!m4) {
          out += s;
        } else {
          out += onPart(s);
        }
      });
    }
    return out;
  };

  // ../provident-pali/src/iast.js
  var beginVowels = {
    "a": "a",
    "\u0101": "aA",
    "i": "i",
    "\u012B": "iA",
    "u": "u",
    "\u016B": "uA",
    "o": "o",
    "e": "e"
  };
  var i2p = {
    "\u0964": "\u0964",
    "\u0965": "\u0965",
    "k": "k",
    "t": "t",
    "\xF1": "Y",
    "\u1E45": "N",
    "\u1E47": "N",
    "\u1E0D": "F",
    "\u1E6D": "W",
    "p": "p",
    "c": "c",
    "j": "j",
    "s": "s",
    "b": "b",
    "y": "y",
    "g": "g",
    "d": "d",
    "h": "h",
    "m": "m",
    "l": "l",
    "v": "v",
    "r": "r",
    "n": "n",
    "\u1E37": "L",
    "kh": "K",
    "gh": "G",
    "jh": "J",
    "ch": "C",
    "\u1E6Dh": "X",
    "\u1E0Dh": "Q",
    "th": "T",
    "dh": "D",
    "ph": "P",
    "bh": "B",
    "kk": "kVk",
    "kkh": "kVK",
    "gg": "gVg",
    "ggh": "gVG",
    "tt": "tVt",
    "tth": "tVT",
    "\u1E6D\u1E6D": "WVW",
    "\u1E6D\u1E6Dh": "WVX",
    "pp": "pVp",
    "pph": "pVP",
    "bb": "bVb",
    "bbh": "bVB",
    "jj": "jVj",
    "jjh": "jVJ",
    "cc": "cVc",
    "cch": "cVC",
    "ll": "lVl",
    "mm": "mVm",
    "nn": "nVn",
    "\xF1\xF1": "YVY",
    "dd": "dVd",
    "ddh": "dVD",
    "\u1E0D\u1E0D": "FVF",
    "\u1E0D\u1E0Dh": "FVQ",
    "ss": "sVs",
    "yy": "yVy",
    "\u1E47\u1E47": "NVN",
    "\u1E45gh": "NVG",
    "\u1E45g": "NVg",
    "\u1E45kh": "NVK",
    "\u1E45k": "NVk",
    "\u1E45khy": "NVKVy",
    "dr": "dVr",
    "dv": "dVv",
    "ndr": "nVdVr",
    "br": "bVr",
    "khv": "KVv",
    "hm": "hVm",
    "ly": "lVy",
    "mbh": "mVB",
    "mh": "mVh",
    "mp": "mVp",
    "mb": "mVb",
    "nd": "nVd",
    "ndh": "nVD",
    "\u1E47\u1E6Dh": "NVX",
    "\xF1c": "YVc",
    "\xF1j": "YVj",
    "\xF1jh": "YVJ",
    "\u1E47\u1E6D": "NVW",
    "nt": "nVt",
    "\u1E47\u1E0D": "NVF",
    "sv": "sVv",
    "sm": "sVm",
    "tv": "tVv",
    "\u1E37h": "LVh",
    "nth": "nVT",
    "yh": "yVh",
    "tr": "tVr",
    "mph": "mVP",
    "nh": "nVh",
    "\xF1ch": "YVC",
    "vh": "vVh",
    "nv": "nVv",
    "ky": "kVy",
    "gy": "gVy",
    "ntv": "nVtVv",
    "my": "mVy",
    "ty": "tVy",
    "gr": "gVr",
    "kr": "kVr",
    "sn": "sVn",
    "kl": "kVl",
    "st": "sVt",
    "khy": "KVy",
    "pl": "pVl",
    "nty": "nVtVy",
    "hv": "hVv",
    "sy": "sVy",
    "dm": "dVm",
    "\u1E47y": "NVy",
    "kv": "kVv",
    "\u1E47h": "NVh",
    "\xF1h": "YVh",
    "vy": "vVy",
    "by": "bVy",
    "py": "pVy",
    "yv": "yVv",
    "\u1E6Dy": "WVy",
    "bhy": "BVy",
    "tthy": "tVTVy",
    "tn": "tVn",
    "dhv": "DVv",
    "dhy": "DVy",
    "ny": "nVy",
    "gv": "gVv",
    "nky": "nVkVy",
    "hy": "hVy",
    "\u1E47v": "NVv",
    "kkhy": "kVKVy",
    "ntr": "nVtVr",
    "bhm": "BVm",
    "dy": "dVy",
    "sp": "sVp"
  };
  var p2i = {};
  for (let key2 in i2p)
    p2i[i2p[key2]] = key2;
  for (let key2 in beginVowels)
    p2i[beginVowels[key2]] = key2;
  var toIASTWord = (p2) => {
    let ch = "", out = "", i = 0;
    ch = p2[0];
    const leadv = "aeiou".indexOf(ch);
    if (leadv > -1) {
      if (p2[0] == "a" && p2[1] == "A") {
        out += "\u0101";
        i++;
      } else if (p2[0] == "i" && p2[1] == "A") {
        out += "\u012B";
        i++;
      } else if (p2[0] == "u" && p2[1] == "A") {
        out += "\u016B";
        i++;
      } else
        out += ch;
      i++;
      ch = p2[i];
    }
    let needvowel = false, noEndingA = false;
    if (p2.charAt(p2.length - 1) == "V") {
      noEndingA = true;
      p2 = p2.slice(0, p2.length - 1);
    }
    while (i < p2.length) {
      ch = p2[i];
      const v = "MAEIOU".indexOf(ch);
      if (v > -1) {
        if (v == 0 && needvowel)
          out += "a";
        if (p2[i + 1] == "A") {
          i++;
          if (v == 1)
            out += "\u0101";
          else if (v == 2)
            out += "\u0113";
          else if (v == 3)
            out += "\u012B";
          else if (v == 4)
            out += "\u014D";
          else if (v == 5)
            out += "\u016B";
          else
            console.log("wrong vowel");
        } else
          out += "\u1E43\u0101eiou"[v] || "";
        i++;
        needvowel = false;
      } else {
        if (needvowel)
          out += "a";
        let cons = p2[i];
        if (cons == "V")
          return out + "??1" + p2;
        while (i < p2.length && p2[i + 1] == "V") {
          cons += "V" + p2[i + 2];
          needvowel = true;
          i += 2;
        }
        const c2 = p2i[cons];
        if (!c2) {
          if (isNaN(parseInt(cons))) {
            return out + "??2" + p2;
          } else {
            return out + cons;
          }
        } else {
          needvowel = "aeiou\u0964\u0965".indexOf(c2) == -1;
          if (c2 == "a" && p2[i + 1] == "A") {
            i++;
            out += "\u0101";
          } else {
            out += c2;
          }
          i++;
        }
      }
    }
    if (needvowel && !noEndingA)
      out += "a";
    return out;
  };
  var toIAST = (parts) => {
    if (!parts)
      return "";
    if (typeof parts === "string")
      parts = parts.split(/(<[^<]+>)/);
    return doParts(parts, /([a-zA-Z]+)/, toIASTWord).replace(/।/g, ".").replace(/॥/g, ".");
  };

  // ../provident-pali/src/order.js
  var CharOrder = [];
  var Order = "aiueokKgGMcCjJYWXFQNtTdDnpPbBmhHyrRlLvsSZAIUEOV";
  for (let i = 0; i < Order.length; i++) {
    CharOrder[Order.charCodeAt(i)] = i + 1;
  }

  // ../provident-pali/src/lexeme.js
  var NormLexeme = {
    "bODI": "bOjVJ",
    "smVbODI": "smVbOjVJ"
  };
  var DeNormLexeme = {};
  var samecount = (s1, s2) => {
    let c2 = 0, i1 = 0, i2 = 0;
    while (i1 < s1.length && i2 < s2.length) {
      if (s1[i1] == s2[i2])
        c2++;
      else
        break;
      i1++;
      i2++;
    }
    return c2;
  };
  var sameendcount = (s1, s2) => {
    let c2 = 0, i1 = s1.length - 1, i2 = s2.length - 1;
    while (i1 > 0 && i2 > 0) {
      if (s1[i1] == s2[i2])
        c2++;
      else
        break;
      i1--;
      i2--;
    }
    return c2;
  };
  for (let key2 in NormLexeme) {
    const rkey = NormLexeme[key2];
    if (key2.indexOf(">") > -1)
      continue;
    const cnt = samecount(rkey, key2);
    if (cnt) {
      DeNormLexeme[rkey] = cnt ? key2.slice(0, cnt) + "<" + key2.slice(cnt) : key2;
    } else {
      const cnt2 = sameendcount(rkey, key2);
      DeNormLexeme[rkey] = cnt2 ? key2.slice(0, key2.length - cnt2) + ">" + key2.slice(key2.length - cnt2) : key2;
    }
  }

  // ../provident-pali/src/sandhi.js
  var InsertRules = { "65": "A" };
  var InsertRuleReverse = {};
  var Rules = {
    "a<A=A": "3",
    "a<A=m": "4",
    "a<A=Vv": "5",
    "a<A=d": "6",
    "a-A=r": "7",
    "a<A=t": "9",
    "a-AA=r": "3",
    "a<I=E": "3",
    "a<I=A": "4",
    "a<I=IA": "5",
    "a-I=y": "6",
    "a-I=m": "7",
    "a<E=E": "3",
    "a<E=A": "4",
    "a-E=d": "5",
    "a-E=m": "6",
    "a-E=y": "7",
    "a<E=": "8",
    "a<g=gVg": "3",
    "a<g=NVg": "4",
    "a<p=pVp": "3",
    "a<U=O": "3",
    "a<U=A": "4",
    "a<U=U": "5",
    "a<U=UA": "6",
    "a<O=U": "3",
    "a<\u016A=UA": "3",
    "a<\u012A=IA": "4",
    "a<\u012A=E": "5",
    "a<t=nVt": "4",
    "a<v=bVb": "5",
    "A<AA=": "3",
    "A+U=UA": "3",
    "A+I=IA": "3",
    "A+I=E": "4",
    "A-I=y": "5",
    "A-I=r": "6",
    "A-I=t": "7",
    "A-E=y": "4",
    "A<A=y": "3",
    "A<A=m": "4",
    "A+A=E": "5",
    "A+A=A": "6",
    "A+A=": "7",
    "M>AA=m": "3",
    "M+A=A": "3",
    "M+A=m": "4",
    "M+A=d": "5",
    "M+A=": "6",
    "M+A=nA": "7",
    "M+E=A": "3",
    "M+b=bVb": "3",
    "M+U=UA": "3",
    "M+I=IA": "3",
    "M+I=I": "4",
    "M>I=y": "5",
    "M+I=": "6",
    "M+\u012A=A": "3",
    "M+g=NVg": "3",
    "M+p=pVp": "3",
    "M+k=NVk": "3",
    "M+J=jVJ": "3",
    "M+X=WVX": "3",
    "M+y=YVY": "3",
    "I+I=IA": "3",
    "I+I=E": "4",
    "I-I=y": "5",
    "I-I=r": "6",
    "I+A=jVJ": "2",
    "I+A=IA": "3",
    "I+A=A": "4",
    "I+A=Vy": "6",
    "I<A=m": "7",
    "I<A=y": "8",
    "I<A=r": "9",
    "I+A=": "10",
    "I<d=nVd": "3",
    "I+U=UA": "3",
    "I+AA=I": "4",
    "I-AA=r": "5",
    "I<AA=": "6",
    "I>E=Vv": "3",
    "I>E=Vp": "4",
    "I-E=d": "5",
    "I-E=m": "7",
    "I-E=r": "8",
    "I<D=nVD": "3",
    "I>t=IA": "3",
    "I>k=IA": "3",
    "\u012A+A=A": "3",
    "\u012A+U=UA": "3",
    "U+A=UA": "3",
    "U+A=Vv": "4",
    "U+A=A": "5",
    "U+A=VvA": "6",
    "U+A=O": "7",
    "U+A=": "8",
    "U+I=U": "3",
    "U+I=O": "4",
    "U+I=UA": "5",
    "U+U=UA": "3",
    "U-U=h": "4",
    "U>E=Vv": "3",
    "U-E=d": "4",
    "U-E=r": "5",
    "U>AA=Vv": "3",
    "U<v=bVb": "3",
    "U<D=nVD": "3",
    "U>t=UA": "3",
    "U<t=tVt": "4",
    "U<tA=tVt": "4",
    "E+A=A": "3",
    "E+A=Vy": "4",
    "E+A=VyA": "5",
    "E>AA=Vy": "5",
    "E+A=": "6",
    "E+U=UA": "3",
    "E-I=r": "3",
    "O+A=": "3",
    "O+A=Vv": "4",
    "O+A=A": "5",
    "O+A=VvA": "6",
    "O>I=Vv": "3",
    "O-I=r": "4",
    "O>E=Vv": "3",
    "O-E=y": "4",
    "O-E=v": "5",
    "O>AA=Vv": "3",
    "O-U=v": "3",
    "V+A=": "3",
    "V+A=A": "4",
    "V+U=UA": "3",
    "V+v=": "4",
    "M+v=m": "4",
    "a<s=r": "9"
  };
  var PAIRING = "|";
  var EQUAL = "=";
  var ELIDENONE = 0;
  var ELIDELEFT = 1;
  var ELIDERIGHT = 2;
  var ELIDEBOTH = 3;
  var RuleKeys = { [ELIDENONE]: "-", [ELIDELEFT]: ">", [ELIDERIGHT]: "<", [ELIDEBOTH]: "+" };
  var RuleKeysRegEx = /([<>\-+])/;
  var JoinTypes = {};
  var BuildRules = () => {
    for (let rule in Rules) {
      const joiner = Rules[rule];
      if (!JoinTypes[joiner])
        JoinTypes[joiner] = {};
      const at = rule.indexOf(EQUAL);
      const sandhi = rule.slice(at + 1);
      const [left, elision, right] = rule.slice(0, at).split(RuleKeysRegEx);
      const pair = left + PAIRING + right;
      if (JoinTypes[joiner][pair])
        console.log("key ", pair, "exists");
      JoinTypes[joiner][pair] = elision + sandhi;
    }
    for (let joiner in InsertRules) {
      InsertRuleReverse[InsertRules[joiner]] = joiner;
    }
  };
  BuildRules();

  // ../provident-pali/src/tables.js
  var devanagari = {
    "\u0915": "k",
    "\u0916": "K",
    "\u0917": "g",
    "\u0918": "G",
    "\u0919": "NG",
    "\u0939": "h",
    "\u091A": "c",
    "\u091B": "C",
    "\u091C": "j",
    "\u091D": "J",
    "\u091E": "Y",
    "\u092F": "y",
    "\u0936": "Z",
    "\u091F": "W",
    "\u0920": "X",
    "\u0921": "F",
    "\u0922": "Q",
    "\u0923": "N",
    "\u0930": "r",
    "\u0937": "S",
    "\u0924": "t",
    "\u0925": "T",
    "\u0926": "d",
    "\u0927": "D",
    "\u0928": "n",
    "\u0932": "l",
    "\u0938": "s",
    "\u092A": "p",
    "\u092B": "P",
    "\u092C": "b",
    "\u092D": "B",
    "\u092E": "m",
    "\u0935": "v",
    "\u0933": "L",
    "\u0902": "M",
    "\u0970": "",
    "\u0905": "a",
    "\u0907": "i",
    "\u0909": "u",
    "\u090F": "e",
    "\u0913": "o",
    "\u0906": "aA",
    "\u0908": "iI",
    "\u090A": "uU",
    "\u0910": "ai",
    "\u0914": "au",
    "\u093E": "A",
    "\u093F": "I",
    "\u0940": "IA",
    "\u0941": "U",
    "\u0942": "UA",
    "\u0947": "E",
    "\u094B": "O",
    "\u094D": "V",
    "\u0966": "0",
    "\u0967": "1",
    "\u0968": "2",
    "\u0969": "3",
    "\u096A": "4",
    "\u096B": "5",
    "\u096C": "6",
    "\u096D": "7",
    "\u096E": "8",
    "\u096F": "9",
    "\u0964": "\u0964",
    "\u0965": "\u0965",
    "\u094C": "aU",
    "\u0948": "aI",
    "\u090B": "R",
    "\u0903": "H"
  };
  var sinhala = {
    "\u0D9A": "k",
    "\u0D9B": "K",
    "\u0D9C": "g",
    "\u0D9D": "G",
    "\u0D9E": "NG",
    "\u0DC4": "h",
    "\u0DA0": "c",
    "\u0DA1": "C",
    "\u0DA2": "j",
    "\u0DA3": "J",
    "\u0DA4": "Y",
    "\u0DBA": "y",
    "\u0936": "Z",
    "\u0DA7": "W",
    "\u0DA8": "X",
    "\u0DA9": "F",
    "\u0DAA": "Q",
    "\u0DAB": "N",
    "\u0DBB": "r",
    "\u0937": "S",
    "\u0DAD": "t",
    "\u0DAE": "T",
    "\u0DAF": "d",
    "\u0DB0": "D",
    "\u0DB1": "n",
    "\u0DBD": "l",
    "\u0DC3": "s",
    "\u0DB4": "p",
    "\u0DB5": "P",
    "\u0DB6": "b",
    "\u0DB7": "B",
    "\u0DB8": "m",
    "\u0DC0": "v",
    "\u0DC5": "L",
    "\u0D82": "M",
    "\u0D85": "a",
    "\u0D89": "i",
    "\u0D8B": "u",
    "\u0D91": "e",
    "\u0D94": "o",
    "\u0D86": "aA",
    "\u0D8A": "iI",
    "\u0D8C": "uU",
    "\u0DCF": "A",
    "\u0DD2": "I",
    "\u0DD3": "II",
    "\u0DD4": "U",
    "\u0DD6": "UU",
    "\u0DD9": "E",
    "\u0DDC": "O",
    "\u0DCA": "V"
  };
  var myanmar = {
    "\u1000": "k",
    "\u1001": "K",
    "\u1002": "g",
    "\u1003": "G",
    "\u1004": "NG",
    "\u101F": "h",
    "\u1005": "c",
    "\u1006": "C",
    "\u1007": "j",
    "\u1008": "J",
    "\u1009": "Y",
    "\u101A": "y",
    "\u0936": "Z",
    "\u100B": "W",
    "\u100C": "X",
    "\u100D": "F",
    "\u100E": "Q",
    "\u100F": "N",
    "\u101B": "r",
    "\u0937": "S",
    "\u1010": "t",
    "\u1011": "T",
    "\u1012": "d",
    "\u1013": "D",
    "\u1014": "n",
    "\u101C": "l",
    "\u101E": "s",
    "\u1015": "p",
    "\u1016": "P",
    "\u1017": "b",
    "\u1018": "B",
    "\u1019": "m",
    "\u101D": "v",
    "\u1020": "L",
    "\u1036": "M",
    "\u1021": "a",
    "\u1023": "i",
    "\u1025": "u",
    "\u1027": "e",
    "\u1029": "o",
    "\u1021\u102C": "aA",
    "\u1024": "iI",
    "\u1026": "uU",
    "\u102C": "A",
    "\u102D": "I",
    "\u102E": "II",
    "\u102F": "U",
    "\u1030": "UU",
    "\u1031": "E",
    "\u1031\u102C": "O",
    "\u1039": "V",
    "\u1040": "0",
    "\u1041": "1",
    "\u1042": "2",
    "\u1043": "3",
    "\u1044": "4",
    "\u1045": "5",
    "\u1046": "6",
    "\u1047": "7",
    "\u1048": "8",
    "\u1049": "9",
    " \u103A": "",
    "\u104A": "\u0964",
    "\u104B": "\u0965"
  };
  var thai = {
    "\u0E01": "k",
    "\u0E02": "K",
    "\u0E04": "g",
    "\u0E06": "G",
    "\u0E07": "NG",
    "\u0E2B": "h",
    "\u0E08": "c",
    "\u0E09": "C",
    "\u0E0A": "j",
    "\u0E0C": "J",
    "\u0E0D": "Y",
    "\u0E22": "y",
    "\u0936": "Z",
    "\u0E0F": "W",
    "\u0E10": "X",
    "\u0E11": "F",
    "\u0E12": "Q",
    "\u0E13": "N",
    "\u0E23": "r",
    "\u0937": "S",
    "\u0E15": "t",
    "\u0E16": "T",
    "\u0E17": "d",
    "\u0E18": "D",
    "\u0E19": "n",
    "\u0E25": "l",
    "\u0E2A": "s",
    "\u0E1B": "p",
    "\u0E1C": "P",
    "\u0E1E": "b",
    "\u0E20": "B",
    "\u0E21": "m",
    "\u0E27": "v",
    "\u0E2C": "L",
    "\u0E4D": "M",
    "\u0E2D": "a",
    "\u0E2D\u0E34": "i",
    "\u0E2D\u0E38": "u",
    "\u0E40\u0E2D": "e",
    "\u0E42\u0E2D": "o",
    "\u0E2D\u0E32": "aA",
    "\u0E2D\u0E35": "iI",
    "\u0E2D\u0E39": "uU",
    "\u0E32": "A",
    "\u0E34": "I",
    "\u0E35": "II",
    "\u0E38": "U",
    "\u0E39": "UU",
    "\u0E40": "E",
    "\u0E42": "O",
    "\u0E3A": "V",
    "\u0E50": "0",
    "\u0E51": "1",
    "\u0E52": "2",
    "\u0E53": "3",
    "\u0E54": "4",
    "\u0E55": "5",
    "\u0E56": "6",
    "\u0E57": "7",
    "\u0E58": "8",
    "\u0E59": "9"
  };
  var khmer = {
    "\u1780": "k",
    "\u1781": "K",
    "\u1782": "g",
    "\u1783": "G",
    "\u1784": "NG",
    "\u17A0": "h",
    "\u1785": "c",
    "\u1786": "C",
    "\u1787": "j",
    "\u1788": "J",
    "\u1789": "Y",
    "\u1799": "y",
    "\u0936": "Z",
    "\u178A": "W",
    "\u178B": "X",
    "\u178C": "F",
    "\u178D": "Q",
    "\u178E": "N",
    "\u179A": "r",
    "\u0937": "S",
    "\u178F": "t",
    "\u1790": "T",
    "\u1791": "d",
    "\u1792": "D",
    "\u1793": "n",
    "\u179B": "l",
    "\u179F": "s",
    "\u1794": "p",
    "\u1795": "P",
    "\u1796": "b",
    "\u1797": "B",
    "\u1798": "m",
    "\u179C": "v",
    "\u17A1": "L",
    "\u17C6": "M",
    "\u17A2": "a",
    "\u17A5": "i",
    "\u17A7": "u",
    "\u17AF": "e",
    "\u17B1": "o",
    "\u17A2\u17B6": "aA",
    "\u17A6": "iI",
    "\u17A9": "uU",
    "\u17B6": "A",
    "\u17B7": "I",
    "\u17B8": "II",
    "\u17BB": "U",
    "\u17BC": "UU",
    "\u17C1": "E",
    "\u17C4": "O",
    "\u17D2": "V",
    "\u17E0": "0",
    "\u17E1": "1",
    "\u17E2": "2",
    "\u17E3": "3",
    "\u17E4": "4",
    "\u17E5": "5",
    "\u17E6": "6",
    "\u17E7": "7",
    "\u17E8": "8",
    "\u17E9": "9"
  };
  var laos = {
    "\u0E81": "k",
    "\u0E82": "K",
    "\u0E84": "g",
    "\u0E86": "G",
    "\u0E87": "NG",
    "\u0EAB": "h",
    "\u0E88": "c",
    "\u0E89": "C",
    "\u0E8A": "j",
    "\u0E8C": "J",
    "\u0E8E": "Y",
    "\u0E8D": "y",
    "\u0936": "Z",
    "\u0E8F": "W",
    "\u0E90": "X",
    "\u0E91": "F",
    "\u0E92": "Q",
    "\u0E93": "N",
    "\u0EA3": "r",
    "\u0937": "S",
    "\u0E95": "t",
    "\u0E96": "T",
    "\u0E97": "d",
    "\u0E98": "D",
    "\u0E99": "n",
    "\u0EA5": "l",
    "\u0EAA": "s",
    "\u0E9B": "p",
    "\u0E9C": "P",
    "\u0E9E": "b",
    "\u0EA0": "B",
    "\u0EA1": "m",
    "\u0EA7": "v",
    "\u0EAC": "L",
    "\u0ECD": "M",
    "\u0EAD": "a",
    "\u0EAD\u0EB4": "i",
    "\u0EAD\u0EB8": "u",
    "\u0EC0\u0EAD": "e",
    "\u0EC2\u0EAD": "o",
    "\u0EAD\u0EB2": "aA",
    "\u0EAD\u0EB5": "iI",
    "\u0EAD\u0EB9": "uU",
    "\u0EB2": "A",
    "\u0EB4": "I",
    "\u0EB5": "II",
    "\u0EB8": "U",
    "\u0EB9": "UU",
    "\u0EC0": "E",
    "\u0EC2": "O",
    "\u0EBA": "V",
    "\u0ED0": "0",
    "\u0ED1": "1",
    "\u0ED2": "2",
    "\u0ED3": "3",
    "\u0ED4": "4",
    "\u0ED5": "5",
    "\u0ED6": "6",
    "\u0ED7": "7",
    "\u0ED8": "8",
    "\u0ED9": "9"
  };
  var tibetan = {
    "\u0F40": "k",
    "\u0F41": "K",
    "\u0F42": "g",
    "\u0F43": "G",
    "\u0F44": "NG",
    "\u0F67": "h",
    "\u0F59": "c",
    "\u0F5A": "C",
    "\u0F5B": "j",
    "\u0F5C": "J",
    "\u0F49": "Y",
    "\u0F61": "y",
    "\u0936": "Z",
    "\u0F4A": "W",
    "\u0F4B": "X",
    "\u0F4C": "F",
    "\u0F4D": "Q",
    "\u0F4E": "N",
    "\u0F62": "r",
    "\u0937": "S",
    "\u0F4F": "t",
    "\u0F50": "T",
    "\u0F51": "d",
    "\u0F52": "D",
    "\u0F53": "n",
    "\u0F63": "l",
    "\u0F66": "s",
    "\u0F54": "p",
    "\u0F55": "P",
    "\u0F56": "b",
    "\u0F57": "B",
    "\u0F58": "m",
    "\u0F5D": "v",
    "\u0F63\u0F39": "L",
    "\u0F7E": "M",
    "\u0F68": "a",
    "\u0F68\u0F72": "i",
    "\u0F68\u0F74": "u",
    "\u0F68\u0F7A": "e",
    "\u0F68\u0F7C": "o",
    "\u0F68\u0F71": "aA",
    "\u0F68\u0F71\u0F72": "iI",
    "\u0F68\u0F71\u0F74": "uU",
    "\u0F71": "A",
    "\u0F72": "I",
    "\u0F71\u0F72": "II",
    "\u0F74": "U",
    "\u0F71\u0F74": "UU",
    "\u0F7A": "E",
    "\u0F7C": "O",
    "\u0F84": "V",
    "\u0F20": "0",
    "\u0F21": "1",
    "\u0F22": "2",
    "\u0F23": "3",
    "\u0F24": "4",
    "\u0F25": "5",
    "\u0F26": "6",
    "\u0F27": "7",
    "\u0F28": "8",
    "\u0F29": "9",
    "\u0F90": "Vk",
    "\u0F91": "VK",
    "\u0F92": "Vg",
    "\u0F93": "VG",
    "\u0F94": "VN",
    "\u0F95\u0F96\u0F97": "Vc",
    "\u0F96": "VC",
    "\u0F97": "Vj",
    "\u0F99": "VY",
    "\u0F9A": "tVt",
    "\u0F9B": "tVT",
    "\u0F9C": "dVd",
    "\u0F9D": "dVD",
    "\u0F9E": "nVN",
    "\u0F9F": "Vt",
    "\u0FA0": "VT",
    "\u0FA1": "Vd",
    "\u0FA2": "VD",
    "\u0FA3": "Vn",
    "\u0FA4": "Vp",
    "\u0FA5": "VP",
    "\u0FA6": "Vb",
    "\u0FA7": "VB",
    "\u0FA8": "Vm",
    "\u0F0D": "\u0964",
    "\u0F0E": "\u0965"
  };

  // ../provident-pali/src/indic.js
  var inverseTable = (tbl) => {
    const out = {};
    for (let key2 in tbl)
      out[tbl[key2]] = key2;
    return out;
  };
  var tables = {
    hi: inverseTable(devanagari),
    my: inverseTable(myanmar),
    th: inverseTable(thai),
    km: inverseTable(khmer),
    lo: inverseTable(laos),
    si: inverseTable(sinhala),
    tb: inverseTable(tibetan)
  };
  var convertToIndic = (content, table) => {
    let i = 0, out = [];
    if (!content)
      return "";
    while (i < content.length) {
      let o = table[content[i] + content[i + 1]];
      if (o) {
        i++;
      } else
        o = table[content[i]];
      if (o) {
        if (content[i] === "N" && content[i + 1] === "V") {
          const c2 = content[i + 2];
          if (c2 === "k" || c2 == "K" || c2 == "g" || c2 === "G") {
            o = table.NG;
            if (table == tables.my) {
              o += String.fromCharCode(4154);
            }
          }
        }
        out += o;
      } else
        out += content[i];
      i++;
    }
    return out;
  };
  var toIndic = (content, lang = "hi") => {
    const table = tables[lang];
    return table ? convertToIndic(content, table) : content;
  };

  // ../provident-pali/index.js
  var offtext2indic = (str, script = "") => {
    if (!script)
      return str;
    if (script === "iast" || script === "romn" || script === "ro")
      return toIAST(str);
    else
      return toIndic(str, script);
  };

  // src/ts/textout.ts
  var textClasses = (ptk) => {
    if (!ptk)
      return "";
    let out = " " + ptk.name;
    if (ptk.lang == "pp") {
      const trans = get_store_value(palitrans);
      if (trans == "iast")
        out += " " + ptk.name + "-iast";
    }
    return out;
  };
  var _ = (text2, lang = "zh", _sim, _palitrans) => {
    if (lang === "zh") {
      const sim = typeof _sim == "undefined" ? get_store_value(tosim) : _sim;
      if (parseInt(sim))
        return toSim(text2, sim);
    } else if (lang === "pp") {
      const trans = typeof _palitrans == "undefined" ? get_store_value(palitrans) : _palitrans;
      return offtext2indic(text2, trans);
    }
    return text2;
  };

  // src/painters/renderunit.svelte
  function create_fragment3(ctx) {
    let switch_instance0;
    let t1;
    let t0_value = _(ctx[0].text, ctx[2]?.lang, ctx[7], ctx[8]) + "";
    let t0;
    let t1_class_value;
    let switch_instance1;
    let switch_instance1_anchor;
    let current;
    let mounted;
    let dispose;
    var switch_value = ctx[4];
    function switch_props(ctx2) {
      return {
        props: {
          ru: ctx2[0],
          seq: ctx2[3],
          ptk: ctx2[2]
        }
      };
    }
    if (switch_value) {
      switch_instance0 = new switch_value(switch_props(ctx));
    }
    var switch_value_1 = ctx[5];
    function switch_props_1(ctx2) {
      return {
        props: {
          seq: ctx2[3],
          ru: ctx2[0],
          ptk: ctx2[2],
          after: true
        }
      };
    }
    if (switch_value_1) {
      switch_instance1 = new switch_value_1(switch_props_1(ctx));
    }
    return {
      c() {
        if (switch_instance0)
          create_component(switch_instance0.$$.fragment);
        t1 = element("t");
        t0 = text(t0_value);
        if (switch_instance1)
          create_component(switch_instance1.$$.fragment);
        switch_instance1_anchor = empty();
        attr(t1, "class", t1_class_value = getRenderUnitClasses(ctx[0], textClasses(ctx[2]), ctx[6]));
        attr(t1, "idx", ctx[3]);
        toggle_class(t1, "activeword", ctx[1]);
      },
      m(target, anchor) {
        if (switch_instance0) {
          mount_component(switch_instance0, target, anchor);
        }
        insert(target, t1, anchor);
        append(t1, t0);
        if (switch_instance1) {
          mount_component(switch_instance1, target, anchor);
        }
        insert(target, switch_instance1_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = listen(t1, "click", ctx[11]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        const switch_instance0_changes = {};
        if (dirty & 1)
          switch_instance0_changes.ru = ctx2[0];
        if (dirty & 8)
          switch_instance0_changes.seq = ctx2[3];
        if (dirty & 4)
          switch_instance0_changes.ptk = ctx2[2];
        if (switch_value !== (switch_value = ctx2[4])) {
          if (switch_instance0) {
            group_outros();
            const old_component = switch_instance0;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance0 = new switch_value(switch_props(ctx2));
            create_component(switch_instance0.$$.fragment);
            transition_in(switch_instance0.$$.fragment, 1);
            mount_component(switch_instance0, t1.parentNode, t1);
          } else {
            switch_instance0 = null;
          }
        } else if (switch_value) {
          switch_instance0.$set(switch_instance0_changes);
        }
        if ((!current || dirty & 389) && t0_value !== (t0_value = _(ctx2[0].text, ctx2[2]?.lang, ctx2[7], ctx2[8]) + ""))
          set_data(t0, t0_value);
        if (!current || dirty & 69 && t1_class_value !== (t1_class_value = getRenderUnitClasses(ctx2[0], textClasses(ctx2[2]), ctx2[6]))) {
          attr(t1, "class", t1_class_value);
        }
        if (!current || dirty & 8) {
          attr(t1, "idx", ctx2[3]);
        }
        if (dirty & 71) {
          toggle_class(t1, "activeword", ctx2[1]);
        }
        const switch_instance1_changes = {};
        if (dirty & 8)
          switch_instance1_changes.seq = ctx2[3];
        if (dirty & 1)
          switch_instance1_changes.ru = ctx2[0];
        if (dirty & 4)
          switch_instance1_changes.ptk = ctx2[2];
        if (switch_value_1 !== (switch_value_1 = ctx2[5])) {
          if (switch_instance1) {
            group_outros();
            const old_component = switch_instance1;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value_1) {
            switch_instance1 = new switch_value_1(switch_props_1(ctx2));
            create_component(switch_instance1.$$.fragment);
            transition_in(switch_instance1.$$.fragment, 1);
            mount_component(switch_instance1, switch_instance1_anchor.parentNode, switch_instance1_anchor);
          } else {
            switch_instance1 = null;
          }
        } else if (switch_value_1) {
          switch_instance1.$set(switch_instance1_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance0)
          transition_in(switch_instance0.$$.fragment, local);
        if (switch_instance1)
          transition_in(switch_instance1.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance0)
          transition_out(switch_instance0.$$.fragment, local);
        if (switch_instance1)
          transition_out(switch_instance1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (switch_instance0)
          destroy_component(switch_instance0, detaching);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(switch_instance1_anchor);
        if (switch_instance1)
          destroy_component(switch_instance1, detaching);
        mounted = false;
        dispose();
      }
    };
  }
  function instance4($$self, $$props, $$invalidate) {
    let { ru } = $$props;
    let { active } = $$props;
    let { ptk } = $$props;
    let { seq } = $$props;
    let { before } = $$props;
    let { after } = $$props;
    let { onUpdate } = $$props;
    let { extraclass } = $$props;
    let { tosim: tosim2 } = $$props;
    let { palitrans: palitrans2 } = $$props;
    const LV = getContext("LV");
    const click = () => {
      LV.toggleActiveword(ru.text);
      const tag = ru.closestTag();
      if (!tag)
        return;
      tag.active = !tag.active;
      onUpdate && onUpdate();
    };
    const click_handler = () => click();
    $$self.$$set = ($$props2) => {
      if ("ru" in $$props2)
        $$invalidate(0, ru = $$props2.ru);
      if ("active" in $$props2)
        $$invalidate(1, active = $$props2.active);
      if ("ptk" in $$props2)
        $$invalidate(2, ptk = $$props2.ptk);
      if ("seq" in $$props2)
        $$invalidate(3, seq = $$props2.seq);
      if ("before" in $$props2)
        $$invalidate(4, before = $$props2.before);
      if ("after" in $$props2)
        $$invalidate(5, after = $$props2.after);
      if ("onUpdate" in $$props2)
        $$invalidate(10, onUpdate = $$props2.onUpdate);
      if ("extraclass" in $$props2)
        $$invalidate(6, extraclass = $$props2.extraclass);
      if ("tosim" in $$props2)
        $$invalidate(7, tosim2 = $$props2.tosim);
      if ("palitrans" in $$props2)
        $$invalidate(8, palitrans2 = $$props2.palitrans);
    };
    return [
      ru,
      active,
      ptk,
      seq,
      before,
      after,
      extraclass,
      tosim2,
      palitrans2,
      click,
      onUpdate,
      click_handler
    ];
  }
  var Renderunit = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance4, create_fragment3, safe_not_equal, {
        ru: 0,
        active: 1,
        ptk: 2,
        seq: 3,
        before: 4,
        after: 5,
        onUpdate: 10,
        extraclass: 6,
        tosim: 7,
        palitrans: 8
      });
    }
  };
  var renderunit_default = Renderunit;

  // src/painters/inlinetext.svelte
  function get_each_context3(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[19] = list[i];
    return child_ctx;
  }
  function create_each_block3(ctx) {
    let renderunit;
    let current;
    renderunit = new renderunit_default({
      props: {
        ptk: ctx[0],
        before: ctx[2],
        palitrans: ctx[7],
        tosim: ctx[8] + "}",
        after: ctx[3],
        ru: ctx[19],
        active: ctx[19].text == ctx[1],
        seq: ctx[5],
        onUpdate: ctx[10],
        extraclass: ctx[4]
      }
    });
    return {
      c() {
        create_component(renderunit.$$.fragment);
      },
      m(target, anchor) {
        mount_component(renderunit, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const renderunit_changes = {};
        if (dirty & 1)
          renderunit_changes.ptk = ctx2[0];
        if (dirty & 4)
          renderunit_changes.before = ctx2[2];
        if (dirty & 128)
          renderunit_changes.palitrans = ctx2[7];
        if (dirty & 256)
          renderunit_changes.tosim = ctx2[8] + "}";
        if (dirty & 8)
          renderunit_changes.after = ctx2[3];
        if (dirty & 512)
          renderunit_changes.ru = ctx2[19];
        if (dirty & 514)
          renderunit_changes.active = ctx2[19].text == ctx2[1];
        if (dirty & 32)
          renderunit_changes.seq = ctx2[5];
        if (dirty & 16)
          renderunit_changes.extraclass = ctx2[4];
        renderunit.$set(renderunit_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(renderunit.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(renderunit.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(renderunit, detaching);
      }
    };
  }
  function create_key_block(ctx) {
    let span;
    let current;
    let each_value = ctx[9];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block3(get_each_context3(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        span = element("span");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
      },
      m(target, anchor) {
        insert(target, span, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(span, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 1983) {
          each_value = ctx2[9];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context3(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block3(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(span, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_fragment4(ctx) {
    let previous_key = ctx[6];
    let key_block_anchor;
    let current;
    let key_block = create_key_block(ctx);
    return {
      c() {
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 64 && safe_not_equal(previous_key, previous_key = ctx2[6])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
      }
    };
  }
  function instance5($$self, $$props, $$invalidate) {
    let runits;
    let _tosim;
    let _palitrans;
    let $palitrans;
    let $tosim;
    component_subscribe($$self, palitrans, ($$value) => $$invalidate(17, $palitrans = $$value));
    component_subscribe($$self, tosim, ($$value) => $$invalidate(18, $tosim = $$value));
    let { ptk } = $$props;
    let { hits = [] } = $$props;
    let { extra } = $$props;
    let { phraselength = [] } = $$props;
    let { text: text2 = "" } = $$props;
    let { units } = $$props;
    let { activeword: activeword2 } = $$props;
    let { before, after } = $$props;
    let { extraclass = "" } = $$props;
    let { seq } = $$props;
    let { line } = $$props;
    let refreshcount = 1;
    const onUpdate = () => $$invalidate(6, refreshcount++, refreshcount);
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("hits" in $$props2)
        $$invalidate(11, hits = $$props2.hits);
      if ("extra" in $$props2)
        $$invalidate(12, extra = $$props2.extra);
      if ("phraselength" in $$props2)
        $$invalidate(13, phraselength = $$props2.phraselength);
      if ("text" in $$props2)
        $$invalidate(14, text2 = $$props2.text);
      if ("units" in $$props2)
        $$invalidate(15, units = $$props2.units);
      if ("activeword" in $$props2)
        $$invalidate(1, activeword2 = $$props2.activeword);
      if ("before" in $$props2)
        $$invalidate(2, before = $$props2.before);
      if ("after" in $$props2)
        $$invalidate(3, after = $$props2.after);
      if ("extraclass" in $$props2)
        $$invalidate(4, extraclass = $$props2.extraclass);
      if ("seq" in $$props2)
        $$invalidate(5, seq = $$props2.seq);
      if ("line" in $$props2)
        $$invalidate(16, line = $$props2.line);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 129024) {
        $:
          $$invalidate(9, [runits] = units ? [units] : renderOfftext(text2, { line, hits, extra, phraselength }), runits);
      }
      if ($$self.$$.dirty & 262144) {
        $:
          $$invalidate(8, _tosim = $tosim);
      }
      if ($$self.$$.dirty & 131072) {
        $:
          $$invalidate(7, _palitrans = $palitrans);
      }
    };
    return [
      ptk,
      activeword2,
      before,
      after,
      extraclass,
      seq,
      refreshcount,
      _palitrans,
      _tosim,
      runits,
      onUpdate,
      hits,
      extra,
      phraselength,
      text2,
      units,
      line,
      $palitrans,
      $tosim
    ];
  }
  var Inlinetext = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance5, create_fragment4, safe_not_equal, {
        ptk: 0,
        hits: 11,
        extra: 12,
        phraselength: 13,
        text: 14,
        units: 15,
        activeword: 1,
        before: 2,
        after: 3,
        extraclass: 4,
        seq: 5,
        line: 16
      });
    }
  };
  var inlinetext_default = Inlinetext;

  // src/lineview/parallelmenu.svelte
  function get_each_context4(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[7] = list[i][0];
    return child_ctx;
  }
  function create_each_block4(ctx) {
    let span;
    let t_value = ctx[7]?.name + " ";
    let t;
    let mounted;
    let dispose;
    function click_handler(...args) {
      return ctx[5](ctx[7], ...args);
    }
    return {
      c() {
        span = element("span");
        t = text(t_value);
        attr(span, "class", "clickable");
        toggle_class(span, "closelink", ctx[0].parallels[ctx[7].name]);
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 3) {
          toggle_class(span, "closelink", ctx[0].parallels[ctx[7].name]);
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment5(ctx) {
    let each_1_anchor;
    let each_value = ctx[1];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block4(get_each_context4(ctx, each_value, i));
    }
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (dirty & 7) {
          each_value = ctx2[1];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context4(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block4(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance6($$self, $$props, $$invalidate) {
    let { ptk } = $$props;
    let { update: update2 } = $$props;
    let { division } = $$props;
    const parallels2 = division?.getParallelWithDiff();
    const LV = getContext("LV");
    const toggleParallel = async (e, ptkname) => {
      setTimeout(async function() {
        const v = ptk.parallels[ptkname] ? 0 : new Date().valueOf();
        $$invalidate(0, ptk.parallels[ptkname] = v, ptk);
        LV.setParallel(ptk.name, ptkname, v);
        update2();
      });
      e.stopPropagation();
    };
    const click_handler = (pptk, e) => toggleParallel(e, pptk.name);
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("update" in $$props2)
        $$invalidate(3, update2 = $$props2.update);
      if ("division" in $$props2)
        $$invalidate(4, division = $$props2.division);
    };
    return [ptk, parallels2, toggleParallel, update2, division, click_handler];
  }
  var Parallelmenu = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance6, create_fragment5, safe_not_equal, { ptk: 0, update: 3, division: 4 });
    }
  };
  var parallelmenu_default = Parallelmenu;

  // src/lineview/paralleltexts.svelte
  function get_each_context5(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[9] = list[i][0];
    child_ctx[10] = list[i][1];
    child_ctx[11] = list[i][2];
    return child_ctx;
  }
  function create_if_block2(ctx) {
    let br;
    let span;
    let t0_value = ctx[9].humanName(true) + "";
    let t0;
    let span_class_value;
    let t1;
    let await_block_anchor;
    let promise;
    let current;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[7](ctx[9], ctx[10]);
    }
    let info = {
      ctx,
      current: null,
      token: null,
      hasCatch: false,
      pending: create_pending_block,
      then: create_then_block,
      catch: create_catch_block,
      blocks: [, , ,]
    };
    handle_promise(promise = ctx[9].loadLines([
      [
        ctx[1] + ctx[10],
        ctx[1] + ctx[10] + 1
      ]
    ]), info);
    return {
      c() {
        br = element("br");
        span = element("span");
        t0 = text(t0_value);
        t1 = space();
        await_block_anchor = empty();
        info.block.c();
        attr(span, "class", span_class_value = "parallelptk clickable");
      },
      m(target, anchor) {
        insert(target, br, anchor);
        insert(target, span, anchor);
        append(span, t0);
        insert(target, t1, anchor);
        insert(target, await_block_anchor, anchor);
        info.block.m(target, info.anchor = anchor);
        info.mount = () => await_block_anchor.parentNode;
        info.anchor = await_block_anchor;
        current = true;
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        info.ctx = ctx;
        if (dirty & 2 && promise !== (promise = ctx[9].loadLines([
          [
            ctx[1] + ctx[10],
            ctx[1] + ctx[10] + 1
          ]
        ])) && handle_promise(promise, info)) {
        } else {
          update_await_block_branch(info, ctx, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(info.block);
        current = true;
      },
      o(local) {
        for (let i = 0; i < 3; i += 1) {
          const block = info.blocks[i];
          transition_out(block);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(br);
        if (detaching)
          detach(span);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(await_block_anchor);
        info.block.d(detaching);
        info.token = null;
        info = null;
        mounted = false;
        dispose();
      }
    };
  }
  function create_catch_block(ctx) {
    return {
      c: noop,
      m: noop,
      p: noop,
      i: noop,
      o: noop,
      d: noop
    };
  }
  function create_then_block(ctx) {
    let inlinetext;
    let t;
    let current;
    inlinetext = new inlinetext_default({
      props: {
        extraclass: "parallel",
        active: "true",
        ptk: ctx[9],
        seq: ctx[0],
        text: ctx[9].getLine(ctx[1] + ctx[10])
      }
    });
    return {
      c() {
        create_component(inlinetext.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        mount_component(inlinetext, target, anchor);
        insert(target, t, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const inlinetext_changes = {};
        if (dirty & 1)
          inlinetext_changes.seq = ctx2[0];
        if (dirty & 2)
          inlinetext_changes.text = ctx2[9].getLine(ctx2[1] + ctx2[10]);
        inlinetext.$set(inlinetext_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(inlinetext, detaching);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_pending_block(ctx) {
    let t;
    return {
      c() {
        t = text("Loading...\r\n");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block5(ctx) {
    let if_block_anchor;
    let current;
    let if_block = ctx[11] && create_if_block2(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (ctx2[11])
          if_block.p(ctx2, dirty);
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_fragment6(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[2];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block5(get_each_context5(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 15) {
          each_value = ctx2[2];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context5(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block5(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance7($$self, $$props, $$invalidate) {
    let { ptk } = $$props;
    let { seq } = $$props;
    let { line } = $$props;
    let { parallels_linediff } = $$props;
    let { division } = $$props;
    const items = parallels_linediff.map((it) => [it[0], it[1], ptk.parallels[it[0].name] || 0]).sort((a, b) => b[2] - a[2]);
    const LV = getContext("LV");
    const addDivision = (pptkname, line2, linediff) => {
      const highlightline = line2 - division.first;
      let from = highlightline;
      if (from < 0)
        from = 0;
      const address = division.action + ">" + from + ":" + highlightline;
      LV.insertAddress(pptkname + ":" + address, seq);
    };
    const click_handler = (pptk, linediff) => addDivision(pptk.name, line, linediff);
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(4, ptk = $$props2.ptk);
      if ("seq" in $$props2)
        $$invalidate(0, seq = $$props2.seq);
      if ("line" in $$props2)
        $$invalidate(1, line = $$props2.line);
      if ("parallels_linediff" in $$props2)
        $$invalidate(5, parallels_linediff = $$props2.parallels_linediff);
      if ("division" in $$props2)
        $$invalidate(6, division = $$props2.division);
    };
    return [
      seq,
      line,
      items,
      addDivision,
      ptk,
      parallels_linediff,
      division,
      click_handler
    ];
  }
  var Paralleltexts = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance7, create_fragment6, safe_not_equal, {
        ptk: 4,
        seq: 0,
        line: 1,
        parallels_linediff: 5,
        division: 6
      });
    }
  };
  var paralleltexts_default = Paralleltexts;

  // src/lineview/activelinemenu.svelte
  function get_each_context6(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[13] = list[i];
    return child_ctx;
  }
  function create_each_block6(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [{ seq: ctx[1] }, ctx[13]];
    var switch_value = Painters[ctx[13].painter];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 66 ? get_spread_update(switch_instance_spread_levels, [
          dirty & 2 && { seq: ctx2[1] },
          dirty & 64 && get_spread_object(ctx2[13])
        ]) : {};
        if (switch_value !== (switch_value = Painters[ctx2[13].painter])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_if_block_1(ctx) {
    let parallelmenu;
    let current;
    parallelmenu = new parallelmenu_default({
      props: {
        division: ctx[3],
        ptk: ctx[0],
        seq: ctx[1],
        key: ctx[4],
        update: ctx[11]
      }
    });
    return {
      c() {
        create_component(parallelmenu.$$.fragment);
      },
      m(target, anchor) {
        mount_component(parallelmenu, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const parallelmenu_changes = {};
        if (dirty & 8)
          parallelmenu_changes.division = ctx2[3];
        if (dirty & 1)
          parallelmenu_changes.ptk = ctx2[0];
        if (dirty & 2)
          parallelmenu_changes.seq = ctx2[1];
        if (dirty & 16)
          parallelmenu_changes.key = ctx2[4];
        parallelmenu.$set(parallelmenu_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(parallelmenu.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(parallelmenu.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(parallelmenu, detaching);
      }
    };
  }
  function create_if_block3(ctx) {
    let span;
    let t_value = _(ctx[5], ctx[0]?.lang) + "";
    let t;
    let span_class_value;
    return {
      c() {
        span = element("span");
        t = text(t_value);
        attr(span, "class", span_class_value = null_to_empty(textClasses(ctx[0])) + " svelte-v327pe");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
      },
      p(ctx2, dirty) {
        if (dirty & 33 && t_value !== (t_value = _(ctx2[5], ctx2[0]?.lang) + ""))
          set_data(t, t_value);
        if (dirty & 1 && span_class_value !== (span_class_value = null_to_empty(textClasses(ctx2[0])) + " svelte-v327pe")) {
          attr(span, "class", span_class_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
      }
    };
  }
  function create_key_block2(ctx) {
    let t;
    let paralleltexts;
    let current;
    let if_block = ctx[5] && create_if_block3(ctx);
    paralleltexts = new paralleltexts_default({
      props: {
        division: ctx[3],
        seq: ctx[1],
        line: ctx[2],
        ptk: ctx[0],
        parallels_linediff: ctx[9],
        updatecount: ctx[7]
      }
    });
    return {
      c() {
        if (if_block)
          if_block.c();
        t = space();
        create_component(paralleltexts.$$.fragment);
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t, anchor);
        mount_component(paralleltexts, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (ctx2[5]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block3(ctx2);
            if_block.c();
            if_block.m(t.parentNode, t);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        const paralleltexts_changes = {};
        if (dirty & 8)
          paralleltexts_changes.division = ctx2[3];
        if (dirty & 2)
          paralleltexts_changes.seq = ctx2[1];
        if (dirty & 4)
          paralleltexts_changes.line = ctx2[2];
        if (dirty & 1)
          paralleltexts_changes.ptk = ctx2[0];
        if (dirty & 512)
          paralleltexts_changes.parallels_linediff = ctx2[9];
        if (dirty & 128)
          paralleltexts_changes.updatecount = ctx2[7];
        paralleltexts.$set(paralleltexts_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(paralleltexts.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(paralleltexts.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t);
        destroy_component(paralleltexts, detaching);
      }
    };
  }
  function create_fragment7(ctx) {
    let t0;
    let span;
    let t1_value = ctx[8] ? "\u25B8" : "\u25BE";
    let t1;
    let t2;
    let t3;
    let previous_key = ctx[7];
    let key_block_anchor;
    let current;
    let mounted;
    let dispose;
    let each_value = ctx[6];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block6(get_each_context6(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    let if_block = ctx[8] && create_if_block_1(ctx);
    let key_block = create_key_block2(ctx);
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t0 = space();
        span = element("span");
        t1 = text(t1_value);
        t2 = space();
        if (if_block)
          if_block.c();
        t3 = space();
        key_block.c();
        key_block_anchor = empty();
        attr(span, "class", "menu clickable svelte-v327pe");
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, t0, anchor);
        insert(target, span, anchor);
        append(span, t1);
        insert(target, t2, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t3, anchor);
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = listen(span, "click", ctx[10]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 66) {
          each_value = ctx2[6];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context6(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block6(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(t0.parentNode, t0);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if ((!current || dirty & 256) && t1_value !== (t1_value = ctx2[8] ? "\u25B8" : "\u25BE"))
          set_data(t1, t1_value);
        if (ctx2[8]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 256) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block_1(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(t3.parentNode, t3);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        if (dirty & 128 && safe_not_equal(previous_key, previous_key = ctx2[7])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block2(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block);
        transition_in(key_block);
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block);
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t0);
        if (detaching)
          detach(span);
        if (detaching)
          detach(t2);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
        mounted = false;
        dispose();
      }
    };
  }
  function instance8($$self, $$props, $$invalidate) {
    let show2;
    let parallels_linediff;
    let updatecount;
    let { seq } = $$props;
    let { line } = $$props;
    let { division } = $$props;
    let { ptk } = $$props;
    let { key: key2 } = $$props;
    let { explainword } = $$props;
    let { activelinemenu } = $$props;
    const LV = getContext("LV");
    if (ptk)
      ptk.parallels = JSON.parse(get_store_value(LV.parallels))[ptk.name] || {};
    const toggleshow = (e) => {
      $$invalidate(9, parallels_linediff = division?.getParallelWithDiff());
      e.stopPropagation();
      $$invalidate(8, show2 = !show2);
    };
    const update2 = () => {
      $$invalidate(8, show2 = false);
      $$invalidate(7, updatecount++, updatecount);
    };
    $$self.$$set = ($$props2) => {
      if ("seq" in $$props2)
        $$invalidate(1, seq = $$props2.seq);
      if ("line" in $$props2)
        $$invalidate(2, line = $$props2.line);
      if ("division" in $$props2)
        $$invalidate(3, division = $$props2.division);
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("key" in $$props2)
        $$invalidate(4, key2 = $$props2.key);
      if ("explainword" in $$props2)
        $$invalidate(5, explainword = $$props2.explainword);
      if ("activelinemenu" in $$props2)
        $$invalidate(6, activelinemenu = $$props2.activelinemenu);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 8) {
        $:
          $$invalidate(9, parallels_linediff = division?.getParallelWithDiff());
      }
    };
    $:
      $$invalidate(8, show2 = false);
    $:
      $$invalidate(7, updatecount = 0);
    return [
      ptk,
      seq,
      line,
      division,
      key2,
      explainword,
      activelinemenu,
      updatecount,
      show2,
      parallels_linediff,
      toggleshow,
      update2
    ];
  }
  var Activelinemenu = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance8, create_fragment7, safe_not_equal, {
        seq: 1,
        line: 2,
        division: 3,
        ptk: 0,
        key: 4,
        explainword: 5,
        activelinemenu: 6
      });
    }
  };
  var activelinemenu_default = Activelinemenu;

  // src/ts/painters.ts
  var getExtraPainter = (ptk, ot, extra, parselinetext = false) => {
    const extraclass = getOfftextLineClass(ptk, ot, extra);
    const out = [];
    for (let i = 0; i < extraclass.length; i++) {
      const cls = extraclass[i];
      const col = ptk.columns[cls.backref];
      const foreign = ptk.columns[cls.backref]?.fieldsdef[0].foreign;
      const keys = foreign ? ptk.columns[foreign].keys : col?.keys;
      if (parselinetext && keys) {
        out.push(...keys.findMatches(ot.plain).map((it) => {
          key = keys.find(it[1]);
          return {
            painter: extra,
            choff: it[0],
            text: it[1],
            data: {
              ptk,
              key,
              keys,
              backref: cls.value,
              name: foreign,
              tagname: "*",
              togglebutton: true
            },
            id: cls.id
          };
        }));
      } else {
        out.push({
          ptk,
          painter: cls.value,
          choff: cls.choff,
          data: {
            ptk,
            tagname: cls.tagname,
            foreign,
            backref: cls.backref,
            id: cls.id,
            attrs: cls.attrs,
            defattrs: cls.defattrs
          }
        });
      }
    }
    out.sort((a, b) => a.choff - b.choff);
    return out;
  };

  // src/lineview/lineviewitem.svelte
  function create_else_block(ctx) {
    let if_block0_anchor;
    let if_block1_anchor;
    let inlinetext;
    let t;
    let if_block2_anchor;
    let current;
    let if_block0 = ctx[4] && create_if_block_3(ctx);
    let if_block1 = ctx[6] > -1 && create_if_block_2(ctx);
    inlinetext = new inlinetext_default({
      props: {
        ptk: ctx[11],
        line: ctx[5],
        seq: ctx[8],
        extra: ctx[16],
        text: ctx[2],
        active: ctx[14],
        activeword: ctx[12],
        before: offtags_default,
        after: offtags_default
      }
    });
    let if_block2 = ctx[14] && create_if_block_12(ctx);
    return {
      c() {
        if (if_block0)
          if_block0.c();
        if_block0_anchor = empty();
        if (if_block1)
          if_block1.c();
        if_block1_anchor = empty();
        create_component(inlinetext.$$.fragment);
        t = space();
        if (if_block2)
          if_block2.c();
        if_block2_anchor = empty();
      },
      m(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert(target, if_block0_anchor, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
        mount_component(inlinetext, target, anchor);
        insert(target, t, anchor);
        if (if_block2)
          if_block2.m(target, anchor);
        insert(target, if_block2_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (ctx2[4]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_3(ctx2);
            if_block0.c();
            if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (ctx2[6] > -1) {
          if (if_block1) {
          } else {
            if_block1 = create_if_block_2(ctx2);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        const inlinetext_changes = {};
        if (dirty & 2048)
          inlinetext_changes.ptk = ctx2[11];
        if (dirty & 32)
          inlinetext_changes.line = ctx2[5];
        if (dirty & 256)
          inlinetext_changes.seq = ctx2[8];
        if (dirty & 65536)
          inlinetext_changes.extra = ctx2[16];
        if (dirty & 4)
          inlinetext_changes.text = ctx2[2];
        if (dirty & 16384)
          inlinetext_changes.active = ctx2[14];
        if (dirty & 4096)
          inlinetext_changes.activeword = ctx2[12];
        inlinetext.$set(inlinetext_changes);
        if (ctx2[14]) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & 16384) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block_12(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach(if_block0_anchor);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach(if_block1_anchor);
        destroy_component(inlinetext, detaching);
        if (detaching)
          detach(t);
        if (if_block2)
          if_block2.d(detaching);
        if (detaching)
          detach(if_block2_anchor);
      }
    };
  }
  function create_if_block4(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [
      ctx[10].data,
      { seq: ctx[8] },
      { dividx: ctx[9] }
    ];
    var switch_value = Ownerdraws[ctx[10].painter];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 1792 ? get_spread_update(switch_instance_spread_levels, [
          dirty & 1024 && get_spread_object(ctx2[10].data),
          dirty & 256 && { seq: ctx2[8] },
          dirty & 512 && { dividx: ctx2[9] }
        ]) : {};
        if (switch_value !== (switch_value = Ownerdraws[ctx2[10].painter])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_if_block_3(ctx) {
    let span;
    return {
      c() {
        span = element("span");
        attr(span, "class", "sponser");
        attr(span, "sponser", ctx[4]);
      },
      m(target, anchor) {
        insert(target, span, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 16) {
          attr(span, "sponser", ctx2[4]);
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
      }
    };
  }
  function create_if_block_2(ctx) {
    let br;
    return {
      c() {
        br = element("br");
      },
      m(target, anchor) {
        insert(target, br, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(br);
      }
    };
  }
  function create_if_block_12(ctx) {
    let activelinemenu_1;
    let current;
    activelinemenu_1 = new activelinemenu_default({
      props: {
        explainword: ctx[17],
        key: ctx[3],
        lva: ctx[7],
        ptk: ctx[11],
        seq: ctx[8],
        line: ctx[5],
        dividx: ctx[9],
        activelinemenu: ctx[15],
        division: ctx[7].getNode(ctx[9])
      }
    });
    return {
      c() {
        create_component(activelinemenu_1.$$.fragment);
      },
      m(target, anchor) {
        mount_component(activelinemenu_1, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const activelinemenu_1_changes = {};
        if (dirty & 131072)
          activelinemenu_1_changes.explainword = ctx2[17];
        if (dirty & 8)
          activelinemenu_1_changes.key = ctx2[3];
        if (dirty & 128)
          activelinemenu_1_changes.lva = ctx2[7];
        if (dirty & 2048)
          activelinemenu_1_changes.ptk = ctx2[11];
        if (dirty & 256)
          activelinemenu_1_changes.seq = ctx2[8];
        if (dirty & 32)
          activelinemenu_1_changes.line = ctx2[5];
        if (dirty & 512)
          activelinemenu_1_changes.dividx = ctx2[9];
        if (dirty & 32768)
          activelinemenu_1_changes.activelinemenu = ctx2[15];
        if (dirty & 640)
          activelinemenu_1_changes.division = ctx2[7].getNode(ctx2[9]);
        activelinemenu_1.$set(activelinemenu_1_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(activelinemenu_1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(activelinemenu_1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(activelinemenu_1, detaching);
      }
    };
  }
  function create_fragment8(ctx) {
    let div;
    let current_block_type_index;
    let if_block;
    let div_style_value;
    let current;
    const if_block_creators = [create_if_block4, create_else_block];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[10])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        div = element("div");
        if_block.c();
        attr(div, "key", ctx[3]);
        attr(div, "style", div_style_value = "contain: content;" + getLVStyle(ctx[1], ctx[0]));
        attr(div, "class", "lineviewitem");
        toggle_class(div, "highlightline", ctx[13]);
        toggle_class(div, "activeline", ctx[14]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if_blocks[current_block_type_index].m(div, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
        if (!current || dirty & 8) {
          attr(div, "key", ctx2[3]);
        }
        if (!current || dirty & 3 && div_style_value !== (div_style_value = "contain: content;" + getLVStyle(ctx2[1], ctx2[0]))) {
          attr(div, "style", div_style_value);
        }
        if (dirty & 8192) {
          toggle_class(div, "highlightline", ctx2[13]);
        }
        if (dirty & 16384) {
          toggle_class(div, "activeline", ctx2[14]);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if_blocks[current_block_type_index].d();
      }
    };
  }
  function instance9($$self, $$props, $$invalidate) {
    let explainword;
    let { edge } = $$props;
    let { depth } = $$props;
    let { text: text2 } = $$props;
    let { key: key2 } = $$props;
    let { sponser = "" } = $$props;
    let { line } = $$props;
    let { idx: idx2 } = $$props;
    let { lva } = $$props;
    let { seq } = $$props;
    let { dividx } = $$props;
    let { ownerdraw } = $$props;
    let { ptk } = $$props;
    let { activeword: activeword2 } = $$props;
    let { highlight } = $$props;
    let { active } = $$props;
    let units, activelinemenu, extra;
    const render = (text3, line2) => {
      const [units2, ot] = renderOfftext(text3, { line: line2 });
      $$invalidate(16, extra = getExtraPainter(ptk, ot, "backref", true).concat(getExtraPainter(ptk, ot, "backlink")));
      $$invalidate(15, activelinemenu = getExtraPainter(ot, "activelinemenu"));
      return units2;
    };
    $$self.$$set = ($$props2) => {
      if ("edge" in $$props2)
        $$invalidate(0, edge = $$props2.edge);
      if ("depth" in $$props2)
        $$invalidate(1, depth = $$props2.depth);
      if ("text" in $$props2)
        $$invalidate(2, text2 = $$props2.text);
      if ("key" in $$props2)
        $$invalidate(3, key2 = $$props2.key);
      if ("sponser" in $$props2)
        $$invalidate(4, sponser = $$props2.sponser);
      if ("line" in $$props2)
        $$invalidate(5, line = $$props2.line);
      if ("idx" in $$props2)
        $$invalidate(6, idx2 = $$props2.idx);
      if ("lva" in $$props2)
        $$invalidate(7, lva = $$props2.lva);
      if ("seq" in $$props2)
        $$invalidate(8, seq = $$props2.seq);
      if ("dividx" in $$props2)
        $$invalidate(9, dividx = $$props2.dividx);
      if ("ownerdraw" in $$props2)
        $$invalidate(10, ownerdraw = $$props2.ownerdraw);
      if ("ptk" in $$props2)
        $$invalidate(11, ptk = $$props2.ptk);
      if ("activeword" in $$props2)
        $$invalidate(12, activeword2 = $$props2.activeword);
      if ("highlight" in $$props2)
        $$invalidate(13, highlight = $$props2.highlight);
      if ("active" in $$props2)
        $$invalidate(14, active = $$props2.active);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 36) {
        $:
          $$invalidate(18, units = render(text2, line));
      }
      if ($$self.$$.dirty & 282624) {
        $:
          $$invalidate(17, explainword = active && units.filter((ru) => ru.text == activeword2).length > 0 ? activeword2 : "");
      }
    };
    return [
      edge,
      depth,
      text2,
      key2,
      sponser,
      line,
      idx2,
      lva,
      seq,
      dividx,
      ownerdraw,
      ptk,
      activeword2,
      highlight,
      active,
      activelinemenu,
      extra,
      explainword,
      units
    ];
  }
  var Lineviewitem = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance9, create_fragment8, safe_not_equal, {
        edge: 0,
        depth: 1,
        text: 2,
        key: 3,
        sponser: 4,
        line: 5,
        idx: 6,
        lva: 7,
        seq: 8,
        dividx: 9,
        ownerdraw: 10,
        ptk: 11,
        activeword: 12,
        highlight: 13,
        active: 14
      });
    }
  };
  var lineviewitem_default = Lineviewitem;

  // src/lineview/lineviewmenu.svelte
  function create_if_block5(ctx) {
    let show_if_3 = ctx[4].canless(ctx[2]);
    let t0;
    let show_if_2 = ctx[4].canmore(ctx[2]);
    let t1;
    let show_if_1 = ctx[4].canprev(ctx[2]);
    let t2;
    let show_if = ctx[4].cannext(ctx[2]);
    let t3;
    let span;
    let t4_value = _(ctx[3], ctx[1]?.lang) + "";
    let t4;
    let span_class_value;
    let mounted;
    let dispose;
    let if_block0 = show_if_3 && create_if_block_4(ctx);
    let if_block1 = show_if_2 && create_if_block_32(ctx);
    let if_block2 = show_if_1 && create_if_block_22(ctx);
    let if_block3 = show_if && create_if_block_13(ctx);
    return {
      c() {
        if (if_block0)
          if_block0.c();
        t0 = space();
        if (if_block1)
          if_block1.c();
        t1 = space();
        if (if_block2)
          if_block2.c();
        t2 = space();
        if (if_block3)
          if_block3.c();
        t3 = space();
        span = element("span");
        t4 = text(t4_value);
        attr(span, "class", span_class_value = "clickable lineviewheading" + textClasses(ctx[1]));
      },
      m(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert(target, t0, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert(target, t1, anchor);
        if (if_block2)
          if_block2.m(target, anchor);
        insert(target, t2, anchor);
        if (if_block3)
          if_block3.m(target, anchor);
        insert(target, t3, anchor);
        insert(target, span, anchor);
        append(span, t4);
        if (!mounted) {
          dispose = listen(span, "click", ctx[10]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 4)
          show_if_3 = ctx2[4].canless(ctx2[2]);
        if (show_if_3) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_4(ctx2);
            if_block0.c();
            if_block0.m(t0.parentNode, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (dirty & 4)
          show_if_2 = ctx2[4].canmore(ctx2[2]);
        if (show_if_2) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_32(ctx2);
            if_block1.c();
            if_block1.m(t1.parentNode, t1);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        if (dirty & 4)
          show_if_1 = ctx2[4].canprev(ctx2[2]);
        if (show_if_1) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
          } else {
            if_block2 = create_if_block_22(ctx2);
            if_block2.c();
            if_block2.m(t2.parentNode, t2);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }
        if (dirty & 4)
          show_if = ctx2[4].cannext(ctx2[2]);
        if (show_if) {
          if (if_block3) {
            if_block3.p(ctx2, dirty);
          } else {
            if_block3 = create_if_block_13(ctx2);
            if_block3.c();
            if_block3.m(t3.parentNode, t3);
          }
        } else if (if_block3) {
          if_block3.d(1);
          if_block3 = null;
        }
        if (dirty & 10 && t4_value !== (t4_value = _(ctx2[3], ctx2[1]?.lang) + ""))
          set_data(t4, t4_value);
        if (dirty & 2 && span_class_value !== (span_class_value = "clickable lineviewheading" + textClasses(ctx2[1]))) {
          attr(span, "class", span_class_value);
        }
      },
      d(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach(t0);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach(t1);
        if (if_block2)
          if_block2.d(detaching);
        if (detaching)
          detach(t2);
        if (if_block3)
          if_block3.d(detaching);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_4(ctx) {
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        attr(span, "class", "clickable lesstext");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", ctx[6]);
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_32(ctx) {
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        attr(span, "class", "clickable moretext");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", ctx[7]);
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_22(ctx) {
    let span;
    let t0_value = ctx[2]?.from + 1 + "";
    let t0;
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = text("/");
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
        if (!mounted) {
          dispose = listen(span, "click", ctx[8]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t0_value !== (t0_value = ctx2[2]?.from + 1 + ""))
          set_data(t0, t0_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_13(ctx) {
    let span;
    let t_value = ctx[2].last - ctx[2].first + "";
    let t;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t = text(t_value);
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", ctx[9]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t_value !== (t_value = ctx2[2].last - ctx2[2].first + ""))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment9(ctx) {
    let span1;
    let t0;
    let span0;
    let mounted;
    let dispose;
    let if_block = ctx[3] && !ctx[2]?.singleton && create_if_block5(ctx);
    return {
      c() {
        span1 = element("span");
        if (if_block)
          if_block.c();
        t0 = space();
        span0 = element("span");
        span0.textContent = "\u2A2F";
        attr(span0, "class", "clickable");
        attr(span1, "class", "lineviewmenu");
      },
      m(target, anchor) {
        insert(target, span1, anchor);
        if (if_block)
          if_block.m(span1, null);
        append(span1, t0);
        append(span1, span0);
        if (!mounted) {
          dispose = listen(span0, "click", ctx[11]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (ctx2[3] && !ctx2[2]?.singleton) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block5(ctx2);
            if_block.c();
            if_block.m(span1, t0);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span1);
        if (if_block)
          if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function instance10($$self, $$props, $$invalidate) {
    let caption;
    let division;
    let { item } = $$props;
    let { ptk, lva } = $$props;
    const LV = getContext("LV");
    const click_handler = () => LV.onless(division);
    const click_handler_1 = () => LV.onmore(division);
    const click_handler_2 = () => LV.onprev(division);
    const click_handler_3 = () => LV.onnext(division);
    const click_handler_4 = () => LV.onpromote(item.idx);
    const click_handler_5 = () => LV.onremove(division);
    $$self.$$set = ($$props2) => {
      if ("item" in $$props2)
        $$invalidate(0, item = $$props2.item);
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("lva" in $$props2)
        $$invalidate(5, lva = $$props2.lva);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 3) {
        $:
          if (item.idx !== -1)
            $$invalidate(3, caption = ptk?.getHeading(item.line + 1).caption);
      }
      if ($$self.$$.dirty & 33) {
        $:
          $$invalidate(2, division = lva.getNode(item.idx));
      }
    };
    $:
      $$invalidate(3, caption = "");
    return [
      item,
      ptk,
      division,
      caption,
      LV,
      lva,
      click_handler,
      click_handler_1,
      click_handler_2,
      click_handler_3,
      click_handler_4,
      click_handler_5
    ];
  }
  var Lineviewmenu = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance10, create_fragment9, safe_not_equal, { item: 0, ptk: 1, lva: 5 });
    }
  };
  var lineviewmenu_default = Lineviewmenu;

  // src/lineview/lineview.svelte
  function get_each_context7(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[7] = list[i];
    return child_ctx;
  }
  function create_if_block6(ctx) {
    let lineviewmenu;
    let current;
    lineviewmenu = new lineviewmenu_default({
      props: {
        lva: ctx[0],
        item: ctx[7],
        ptk: usePtk(ctx[7].key.replace(/:.+/, ""))
      }
    });
    return {
      c() {
        create_component(lineviewmenu.$$.fragment);
      },
      m(target, anchor) {
        mount_component(lineviewmenu, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const lineviewmenu_changes = {};
        if (dirty & 1)
          lineviewmenu_changes.lva = ctx2[0];
        if (dirty & 2)
          lineviewmenu_changes.item = ctx2[7];
        if (dirty & 2)
          lineviewmenu_changes.ptk = usePtk(ctx2[7].key.replace(/:.+/, ""));
        lineviewmenu.$set(lineviewmenu_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(lineviewmenu.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(lineviewmenu.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(lineviewmenu, detaching);
      }
    };
  }
  function create_each_block7(ctx) {
    let div;
    let t0;
    let lineviewitem;
    let t1;
    let current;
    let mounted;
    let dispose;
    let if_block = ctx[7].closable && create_if_block6(ctx);
    const lineviewitem_spread_levels = [
      ctx[7],
      { lva: ctx[0] },
      { activeword: ctx[2] },
      {
        dividx: ctx[3](ctx[7].seq)
      },
      {
        ptk: usePtk(ctx[7].key.replace(/:.+/, ""))
      }
    ];
    let lineviewitem_props = {};
    for (let i = 0; i < lineviewitem_spread_levels.length; i += 1) {
      lineviewitem_props = assign(lineviewitem_props, lineviewitem_spread_levels[i]);
    }
    lineviewitem = new lineviewitem_default({ props: lineviewitem_props });
    function click_handler() {
      return ctx[5](ctx[7]);
    }
    return {
      c() {
        div = element("div");
        if (if_block)
          if_block.c();
        t0 = space();
        create_component(lineviewitem.$$.fragment);
        t1 = space();
        toggle_class(div, "lineviewitem", ctx[7].closable && !ctx[7].depth);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (if_block)
          if_block.m(div, null);
        append(div, t0);
        mount_component(lineviewitem, div, null);
        append(div, t1);
        current = true;
        if (!mounted) {
          dispose = listen(div, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (ctx[7].closable) {
          if (if_block) {
            if_block.p(ctx, dirty);
            if (dirty & 2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block6(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div, t0);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        const lineviewitem_changes = dirty & 15 ? get_spread_update(lineviewitem_spread_levels, [
          dirty & 2 && get_spread_object(ctx[7]),
          dirty & 1 && { lva: ctx[0] },
          dirty & 4 && { activeword: ctx[2] },
          dirty & 10 && {
            dividx: ctx[3](ctx[7].seq)
          },
          dirty & 2 && {
            ptk: usePtk(ctx[7].key.replace(/:.+/, ""))
          }
        ]) : {};
        lineviewitem.$set(lineviewitem_changes);
        if (dirty & 2) {
          toggle_class(div, "lineviewitem", ctx[7].closable && !ctx[7].depth);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        transition_in(lineviewitem.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        transition_out(lineviewitem.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if (if_block)
          if_block.d();
        destroy_component(lineviewitem);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment10(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[1];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block7(get_each_context7(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 31) {
          each_value = ctx2[1];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context7(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block7(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance11($$self, $$props, $$invalidate) {
    const LV = getContext("LV");
    let { lva } = $$props;
    let { items = [] } = $$props;
    let { activeword: activeword2 } = $$props;
    const findDivisionIndex = (seq) => {
      let idx2 = items[seq].idx;
      while (idx2 == -1 && seq) {
        seq--;
        idx2 = items[seq].idx;
      }
      return idx2;
    };
    const setActive = (item) => {
      LV.setActive(item);
    };
    const click_handler = (item) => setActive(item);
    $$self.$$set = ($$props2) => {
      if ("lva" in $$props2)
        $$invalidate(0, lva = $$props2.lva);
      if ("items" in $$props2)
        $$invalidate(1, items = $$props2.items);
      if ("activeword" in $$props2)
        $$invalidate(2, activeword2 = $$props2.activeword);
    };
    return [lva, items, activeword2, findDivisionIndex, setActive, click_handler];
  }
  var Lineview = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance11, create_fragment10, safe_not_equal, { lva: 0, items: 1, activeword: 2 });
    }
  };
  var lineview_default = Lineview;

  // src/pitakas.svelte
  function get_each_context8(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[6] = list[i];
    child_ctx[8] = i;
    return child_ctx;
  }
  function create_each_block8(ctx) {
    let t0_value = ctx[8] ? "|" : "";
    let t0;
    let span;
    let t1_value = ctx[6].ptk.inMem() ? "*" : "";
    let t1;
    let t2_value = ctx[6].ptk.humanName(true) + "";
    let t2;
    let span_title_value;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[5](ctx[8]);
    }
    return {
      c() {
        t0 = text(t0_value);
        span = element("span");
        t1 = text(t1_value);
        t2 = text(t2_value);
        attr(span, "class", "clickable");
        attr(span, "title", span_title_value = ctx[6].ptk.name);
        toggle_class(span, "active_clickable", ctx[8] == ctx[1]);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, span, anchor);
        append(span, t1);
        append(span, t2);
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 1 && t1_value !== (t1_value = ctx[6].ptk.inMem() ? "*" : ""))
          set_data(t1, t1_value);
        if (dirty & 1 && t2_value !== (t2_value = ctx[6].ptk.humanName(true) + ""))
          set_data(t2, t2_value);
        if (dirty & 1 && span_title_value !== (span_title_value = ctx[6].ptk.name)) {
          attr(span, "title", span_title_value);
        }
        if (dirty & 2) {
          toggle_class(span, "active_clickable", ctx[8] == ctx[1]);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment11(ctx) {
    let each_1_anchor;
    let each_value = ctx[0];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block8(get_each_context8(ctx, each_value, i));
    }
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (dirty & 7) {
          each_value = ctx2[0];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context8(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block8(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance12($$self, $$props, $$invalidate) {
    let $pitakas;
    let $activepitaka;
    component_subscribe($$self, pitakas, ($$value) => $$invalidate(0, $pitakas = $$value));
    component_subscribe($$self, activepitaka, ($$value) => $$invalidate(1, $activepitaka = $$value));
    let { ptkname } = $$props;
    let { oninsert } = $$props;
    const setActive = (n) => {
      if (get_store_value(activepitaka) == n) {
        oninsert({
          detail: {
            seq: -1,
            address: ptkname + ":!",
            singleton: true
          }
        });
        return;
      }
      activepitaka.set(n);
      $$invalidate(3, ptkname = get_store_value(pitakas)[n].name);
    };
    const click_handler = (idx2) => setActive(idx2);
    $$self.$$set = ($$props2) => {
      if ("ptkname" in $$props2)
        $$invalidate(3, ptkname = $$props2.ptkname);
      if ("oninsert" in $$props2)
        $$invalidate(4, oninsert = $$props2.oninsert);
    };
    return [$pitakas, $activepitaka, setActive, ptkname, oninsert, click_handler];
  }
  var Pitakas = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance12, create_fragment11, safe_not_equal, { ptkname: 3, oninsert: 4 });
    }
  };
  var pitakas_default = Pitakas;

  // src/librarytoolbar.svelte
  function get_each_context9(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[21] = list[i];
    child_ctx[23] = i;
    return child_ctx;
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[21] = list[i];
    child_ctx[23] = i;
    return child_ctx;
  }
  function create_if_block_14(ctx) {
    let span0;
    let t0_value = ctx[21].caption + "";
    let t0;
    let t1_value = ctx[21].start.length + "";
    let t1;
    let t2;
    let span1;
    let t3;
    let t4_value = ctx[21].middle.length + "";
    let t4;
    let t5;
    let span2;
    let t6_value = ctx[21].end.length + "";
    let t6;
    let t7_value = " ";
    let t7;
    let mounted;
    let dispose;
    function click_handler_1() {
      return ctx[15](ctx[21]);
    }
    function click_handler_2() {
      return ctx[16](ctx[21]);
    }
    function click_handler_3() {
      return ctx[17](ctx[21]);
    }
    return {
      c() {
        span0 = element("span");
        t0 = text(t0_value);
        t1 = text(t1_value);
        t2 = space();
        span1 = element("span");
        t3 = text("\xB7");
        t4 = text(t4_value);
        t5 = text("\xB7\r\n");
        span2 = element("span");
        t6 = text(t6_value);
        t7 = text(t7_value);
        attr(span0, "class", "clickable");
        attr(span0, "title", "beginsWith \u5F00\u5934\u7B26\u5408");
        attr(span1, "title", "inMiddle \u4E2D\u95F4\u7B26\u5408");
        attr(span1, "class", "clickable");
        attr(span2, "title", "endsWith \u7ED3\u5C3E\u7B26\u5408");
        attr(span2, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span0, anchor);
        append(span0, t0);
        append(span0, t1);
        insert(target, t2, anchor);
        insert(target, span1, anchor);
        append(span1, t3);
        append(span1, t4);
        append(span1, t5);
        insert(target, span2, anchor);
        append(span2, t6);
        append(span2, t7);
        if (!mounted) {
          dispose = [
            listen(span0, "click", click_handler_1),
            listen(span1, "click", click_handler_2),
            listen(span2, "click", click_handler_3)
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 16 && t0_value !== (t0_value = ctx[21].caption + ""))
          set_data(t0, t0_value);
        if (dirty & 16 && t1_value !== (t1_value = ctx[21].start.length + ""))
          set_data(t1, t1_value);
        if (dirty & 16 && t4_value !== (t4_value = ctx[21].middle.length + ""))
          set_data(t4, t4_value);
        if (dirty & 16 && t6_value !== (t6_value = ctx[21].end.length + ""))
          set_data(t6, t6_value);
      },
      d(detaching) {
        if (detaching)
          detach(span0);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(span1);
        if (detaching)
          detach(span2);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_each_block_1(ctx) {
    let if_block_anchor;
    let if_block = ctx[21].start.length + ctx[21].middle.length + ctx[21].end.length && create_if_block_14(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, dirty) {
        if (ctx2[21].start.length + ctx2[21].middle.length + ctx2[21].end.length) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_14(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_else_block2(ctx) {
    let t;
    return {
      c() {
        t = text("0|");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block7(ctx) {
    let span;
    let t_value = " " + ctx[21].count + "|";
    let t;
    let mounted;
    let dispose;
    function click_handler_5() {
      return ctx[19](ctx[21]);
    }
    return {
      c() {
        span = element("span");
        t = text(t_value);
        attr(span, "class", "clickable hitcount");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", click_handler_5);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 8 && t_value !== (t_value = " " + ctx[21].count + "|"))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block9(ctx) {
    let span;
    let t0_value = ctx[21].caption + "";
    let t0;
    let t1_value = " ";
    let t1;
    let mounted;
    let dispose;
    function click_handler_4() {
      return ctx[18](ctx[21]);
    }
    function select_block_type(ctx2, dirty) {
      if (ctx2[21].count)
        return create_if_block7;
      return create_else_block2;
    }
    let current_block_type = select_block_type(ctx, -1);
    let if_block = current_block_type(ctx);
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        if_block.c();
        t1 = text(t1_value);
        attr(span, "class", "clickable");
        attr(span, "title", "fulltext \u5168\u6587");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        if_block.m(target, anchor);
        insert(target, t1, anchor);
        if (!mounted) {
          dispose = listen(span, "click", click_handler_4);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 8 && t0_value !== (t0_value = ctx[21].caption + ""))
          set_data(t0, t0_value);
        if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block.d(1);
          if_block = current_block_type(ctx);
          if (if_block) {
            if_block.c();
            if_block.m(t1.parentNode, t1);
          }
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if_block.d(detaching);
        if (detaching)
          detach(t1);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment12(ctx) {
    let div;
    let span0;
    let t0;
    let selectpitakas;
    let updating_ptkname;
    let t1;
    let input;
    let t2;
    let t3;
    let t4;
    let span1;
    let current;
    let mounted;
    let dispose;
    function selectpitakas_ptkname_binding(value) {
      ctx[13](value);
    }
    let selectpitakas_props = { oninsert: ctx[1] };
    if (ctx[2] !== void 0) {
      selectpitakas_props.ptkname = ctx[2];
    }
    selectpitakas = new pitakas_default({ props: selectpitakas_props });
    binding_callbacks.push(() => bind(selectpitakas, "ptkname", selectpitakas_ptkname_binding));
    let each_value_1 = ctx[4];
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }
    let each_value = ctx[3];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block9(get_each_context9(ctx, each_value, i));
    }
    return {
      c() {
        div = element("div");
        span0 = element("span");
        t0 = space();
        create_component(selectpitakas.$$.fragment);
        t1 = space();
        input = element("input");
        t2 = space();
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t3 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t4 = space();
        span1 = element("span");
        span1.textContent = "\u{1F6E0}\uFE0F";
        attr(span0, "class", "clickable");
        attr(input, "size", "5");
        attr(input, "class", "svelte-10loswm");
        attr(span1, "class", "setting clickble svelte-10loswm");
        attr(div, "class", "toolbar");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, span0);
        append(div, t0);
        mount_component(selectpitakas, div, null);
        append(div, t1);
        append(div, input);
        set_input_value(input, ctx[0]);
        append(div, t2);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].m(div, null);
        }
        append(div, t3);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }
        append(div, t4);
        append(div, span1);
        current = true;
        if (!mounted) {
          dispose = [
            listen(span0, "click", ctx[12]),
            listen(input, "input", ctx[14]),
            listen(input, "input", debounce(ctx[5], 500)),
            listen(span1, "click", ctx[20])
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        const selectpitakas_changes = {};
        if (dirty & 2)
          selectpitakas_changes.oninsert = ctx2[1];
        if (!updating_ptkname && dirty & 4) {
          updating_ptkname = true;
          selectpitakas_changes.ptkname = ctx2[2];
          add_flush_callback(() => updating_ptkname = false);
        }
        selectpitakas.$set(selectpitakas_changes);
        if (dirty & 1 && input.value !== ctx2[0]) {
          set_input_value(input, ctx2[0]);
        }
        if (dirty & 80) {
          each_value_1 = ctx2[4];
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1(ctx2, each_value_1, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
            } else {
              each_blocks_1[i] = create_each_block_1(child_ctx);
              each_blocks_1[i].c();
              each_blocks_1[i].m(div, t3);
            }
          }
          for (; i < each_blocks_1.length; i += 1) {
            each_blocks_1[i].d(1);
          }
          each_blocks_1.length = each_value_1.length;
        }
        if (dirty & 392) {
          each_value = ctx2[3];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context9(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block9(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(div, t4);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(selectpitakas.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(selectpitakas.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(selectpitakas);
        destroy_each(each_blocks_1, detaching);
        destroy_each(each_blocks, detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance13($$self, $$props, $$invalidate) {
    let items;
    let ftsitems;
    let { oninsert } = $$props;
    let { setTofind } = $$props;
    let ptkname = activePtkName();
    let { value = "" } = $$props;
    const dosearch = async () => {
      const ptk = usePtk(ptkname);
      if (!ptk)
        return;
      $$invalidate(4, items = ptk.scanPrimaryKeys(value));
      setTimeout(() => {
        ptk.scanText(value).then((res) => {
          $$invalidate(3, ftsitems = res);
        });
      });
      if (items.length > 0 || ftsitems.length > 0)
        setTofind(value);
    };
    const insert2 = (keyname, mode = 0) => {
      let tofind2 = value;
      if (mode == 0)
        tofind2 = "$" + value;
      else if (mode == 2)
        tofind2 = value + "$";
      oninsert({
        detail: {
          seq: -1,
          address: ptkname + ":" + keyname + "=" + tofind2
        }
      });
    };
    const fulltext = (sectionname) => {
      let tofind2 = value;
      oninsert({
        detail: {
          seq: -1,
          address: ptkname + ":*" + sectionname + "=" + tofind2
        }
      });
    };
    const listchunk = (sectionname) => {
      let tofind2 = value;
      oninsert({
        detail: {
          seq: -1,
          address: ptkname + ":~" + sectionname + "=" + tofind2
        }
      });
    };
    const systeminfo = () => {
      oninsert({
        detail: {
          seq: -1,
          address: "@systeminfo",
          singleton: true
        }
      });
    };
    const opensetting = () => {
      oninsert({
        detail: {
          seq: -1,
          address: "@setting",
          singleton: true
        }
      });
    };
    const click_handler = () => systeminfo();
    function selectpitakas_ptkname_binding(value2) {
      ptkname = value2;
      $$invalidate(2, ptkname);
    }
    function input_input_handler() {
      value = this.value;
      $$invalidate(0, value);
    }
    const click_handler_1 = (item) => item.start.length && insert2(item.name, 0);
    const click_handler_2 = (item) => item.middle.length && insert2(item.name, 1);
    const click_handler_3 = (item) => item.end.length && insert2(item.name, 2);
    const click_handler_4 = (item) => listchunk(item.scope);
    const click_handler_5 = (item) => fulltext(item.scope);
    const click_handler_6 = () => opensetting();
    $$self.$$set = ($$props2) => {
      if ("oninsert" in $$props2)
        $$invalidate(1, oninsert = $$props2.oninsert);
      if ("setTofind" in $$props2)
        $$invalidate(11, setTofind = $$props2.setTofind);
      if ("value" in $$props2)
        $$invalidate(0, value = $$props2.value);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 5) {
        $:
          dosearch(ptkname, value);
      }
    };
    $:
      $$invalidate(4, items = []);
    $:
      $$invalidate(3, ftsitems = []);
    return [
      value,
      oninsert,
      ptkname,
      ftsitems,
      items,
      dosearch,
      insert2,
      fulltext,
      listchunk,
      systeminfo,
      opensetting,
      setTofind,
      click_handler,
      selectpitakas_ptkname_binding,
      input_input_handler,
      click_handler_1,
      click_handler_2,
      click_handler_3,
      click_handler_4,
      click_handler_5,
      click_handler_6
    ];
  }
  var Librarytoolbar = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance13, create_fragment12, safe_not_equal, { oninsert: 1, setTofind: 11, value: 0 });
    }
  };
  var librarytoolbar_default = Librarytoolbar;

  // src/librarymain.svelte
  function create_if_block8(ctx) {
    let librarytoolbar;
    let current;
    librarytoolbar = new librarytoolbar_default({
      props: {
        value: ctx[0],
        oninsert: ctx[5],
        setTofind: ctx[6]
      }
    });
    return {
      c() {
        create_component(librarytoolbar.$$.fragment);
      },
      m(target, anchor) {
        mount_component(librarytoolbar, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const librarytoolbar_changes = {};
        if (dirty & 1)
          librarytoolbar_changes.value = ctx2[0];
        librarytoolbar.$set(librarytoolbar_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(librarytoolbar.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(librarytoolbar.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(librarytoolbar, detaching);
      }
    };
  }
  function create_fragment13(ctx) {
    let t;
    let lineview;
    let current;
    let if_block = ctx[3] && create_if_block8(ctx);
    lineview = new lineview_default({
      props: {
        items: ctx[2],
        lva: ctx[1],
        activeword: ctx[4]
      }
    });
    return {
      c() {
        if (if_block)
          if_block.c();
        t = space();
        create_component(lineview.$$.fragment);
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t, anchor);
        mount_component(lineview, target, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[3]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 8) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block8(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(t.parentNode, t);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        const lineview_changes = {};
        if (dirty & 4)
          lineview_changes.items = ctx2[2];
        if (dirty & 2)
          lineview_changes.lva = ctx2[1];
        if (dirty & 16)
          lineview_changes.activeword = ctx2[4];
        lineview.$set(lineview_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        transition_in(lineview.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        transition_out(lineview.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t);
        destroy_component(lineview, detaching);
      }
    };
  }
  function instance14($$self, $$props, $$invalidate) {
    let loaded;
    let $tosim;
    let $palitrans;
    let $lvaddr;
    let $activeword;
    component_subscribe($$self, tosim, ($$value) => $$invalidate(7, $tosim = $$value));
    component_subscribe($$self, palitrans, ($$value) => $$invalidate(8, $palitrans = $$value));
    component_subscribe($$self, lvaddr, ($$value) => $$invalidate(9, $lvaddr = $$value));
    component_subscribe($$self, activeword, ($$value) => $$invalidate(4, $activeword = $$value));
    let value = get_store_value(tofind);
    let lva, items;
    const updateLVA = async (address) => {
      $$invalidate(1, lva = new LVA2(address));
      $$invalidate(2, items = await lva.load());
      $$invalidate(3, loaded = true);
    };
    const getLVA = () => lva;
    const oninsert = ({ detail }) => {
      let nearest = detail.seq;
      const lineoff = detail.lineoff;
      if (detail.singleton) {
        const at = lva.findAction(detail.address);
        if (~at) {
          lva.remove(at);
          lvaddr.set(lva.stringify());
          if (at == 0)
            return;
        }
      }
      while (nearest > 0 && items[nearest] && items[nearest].idx == -1)
        nearest--;
      const nearestItem = items[nearest];
      if (nearestItem?.ownerdraw || detail.seq == -1) {
        let insertat = nearestItem?.idx;
        if (detail.seq == -1)
          insertat = -1;
        lva.insert(detail.address, insertat + 1);
      } else {
        breakat = detail.seq - nearest;
        lva.dig(detail.address, nearestItem?.idx || 0, breakat);
      }
      lvaddr.set(lva.stringify());
    };
    const onremove = (idx2) => {
      clearActive();
      if (idx2.detail)
        idx2 = idx2.detail;
      if (typeof idx2 == "number") {
        lva.remove(idx2);
      } else {
        lva.remove(idx2);
      }
      lvaddr.set(lva.stringify());
    };
    const onnext = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.next(idx2).stringify());
    };
    const onprev = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.prev(idx2).stringify());
    };
    const onmore = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.more(idx2).stringify());
    };
    const onless = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.less(idx2).stringify());
    };
    const ontop = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.top(idx2).stringify());
    };
    const onpromote = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.promote(idx2).stringify());
    };
    const canless = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      return lva.canless(idx2);
    };
    const canpromote = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      return lva.canpromote(idx2);
    };
    const canmore = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      return lva.canmore(idx2);
    };
    const cannext = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      return lva.cannext(idx2);
    };
    const canprev = (idx2) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      return lva.canprev(idx2);
    };
    const setFrom = (idx2, from) => {
      lvaddr.set(lva.setFrom(idx2, from).stringify());
    };
    const insertAddress = (address, seq) => {
      oninsert({ detail: { address, seq } });
    };
    const setActive = (item) => {
      if (!item.text)
        return;
      clearActive();
      item.active = true;
    };
    const clearActive = () => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].active)
          $$invalidate(2, items[i].active = false, items);
      }
    };
    const setTofind = (tf) => {
      $$invalidate(0, value = tf);
      tofind.set(value);
    };
    const setParallel = (ptkname, foreign, onoff) => {
      try {
        p = JSON.parse(get_store_value(parallels));
      } catch {
        p = {};
      }
      if (!p[ptkname])
        p[ptkname] = {};
      p[ptkname][foreign] = onoff;
      parallels.set(JSON.stringify(p));
    };
    const toggleActiveword = (w) => {
      const tokens = tokenize(w);
      if (tokens.length && tokens[0].type <= 16 /* SEARCHABLE */)
        return;
      if (get_store_value(activeword) == w)
        activeword.set("");
      else
        activeword.set(w);
    };
    const changeAction = (idx2, newaction) => {
      if (idx2?.detail)
        idx2 = idx2.detail;
      lvaddr.set(lva.changeAction(newaction, idx2).stringify());
    };
    setContext("LV", {
      insertAddress,
      setFrom,
      parallels,
      getLVA,
      changeAction,
      setActive,
      toggleActiveword,
      setTofind,
      setParallel,
      clearActive,
      canpromote,
      canless,
      canmore,
      cannext,
      canprev,
      onremove,
      onnext,
      onprev,
      ontop,
      onmore,
      onless,
      onpromote
    });
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 896) {
        $:
          updateLVA($lvaddr, $palitrans, $tosim);
      }
    };
    $:
      $$invalidate(3, loaded = false);
    return [
      value,
      lva,
      items,
      loaded,
      $activeword,
      oninsert,
      setTofind,
      $tosim,
      $palitrans,
      $lvaddr
    ];
  }
  var Librarymain = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance14, create_fragment13, safe_not_equal, {});
    }
  };
  var librarymain_default = Librarymain;

  // src/painters/note.svelte
  function create_if_block9(ctx) {
    let span;
    let inlinetext;
    let current;
    inlinetext = new inlinetext_default({
      props: {
        ptk: ctx[0],
        text: ctx[1]
      }
    });
    return {
      c() {
        span = element("span");
        create_component(inlinetext.$$.fragment);
        attr(span, "class", "inlinenote");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        mount_component(inlinetext, span, null);
        current = true;
      },
      p(ctx2, dirty) {
        const inlinetext_changes = {};
        if (dirty & 1)
          inlinetext_changes.ptk = ctx2[0];
        if (dirty & 2)
          inlinetext_changes.text = ctx2[1];
        inlinetext.$set(inlinetext_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        destroy_component(inlinetext);
      }
    };
  }
  function create_fragment14(ctx) {
    let if_block_anchor;
    let current;
    let if_block = ctx[1] && create_if_block9(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[1]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block9(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance15($$self, $$props, $$invalidate) {
    let notetext;
    let { text: text2 } = $$props;
    let { ptk } = $$props;
    let { tagname } = $$props;
    let { after } = $$props;
    onMount(async () => {
      if (!after)
        return;
      $$invalidate(1, notetext = await ptk.inlineNote(tagname, text2));
    });
    $$self.$$set = ($$props2) => {
      if ("text" in $$props2)
        $$invalidate(2, text2 = $$props2.text);
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("tagname" in $$props2)
        $$invalidate(3, tagname = $$props2.tagname);
      if ("after" in $$props2)
        $$invalidate(4, after = $$props2.after);
    };
    $:
      $$invalidate(1, notetext = "");
    return [ptk, notetext, text2, tagname, after];
  }
  var Note = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance15, create_fragment14, safe_not_equal, { text: 2, ptk: 0, tagname: 3, after: 4 });
    }
  };
  var note_default = Note;

  // src/painters/f.svelte
  function create_if_block10(ctx) {
    let div;
    let span;
    let inlinetext;
    let current;
    inlinetext = new inlinetext_default({
      props: {
        ptk: ctx[0],
        text: ctx[2]
      }
    });
    return {
      c() {
        div = element("div");
        span = element("span");
        create_component(inlinetext.$$.fragment);
        attr(span, "class", "footnote");
        attr(div, "class", "footnotepopup");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, span);
        mount_component(inlinetext, span, null);
        current = true;
      },
      p(ctx2, dirty) {
        const inlinetext_changes = {};
        if (dirty & 1)
          inlinetext_changes.ptk = ctx2[0];
        if (dirty & 4)
          inlinetext_changes.text = ctx2[2];
        inlinetext.$set(inlinetext_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(inlinetext);
      }
    };
  }
  function create_key_block3(ctx) {
    let span;
    let t0;
    let t1;
    let if_block_anchor;
    let current;
    let mounted;
    let dispose;
    let if_block = show && create_if_block10(ctx);
    return {
      c() {
        span = element("span");
        t0 = text(ctx[1]);
        t1 = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(span, "class", "footnotebutton clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        insert(target, t1, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = listen(span, "click", ctx[3]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (!current || dirty & 2)
          set_data(t0, ctx2[1]);
        if (show)
          if_block.p(ctx2, dirty);
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t1);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment15(ctx) {
    let previous_key = ctx[2];
    let key_block_anchor;
    let current;
    let key_block = create_key_block3(ctx);
    return {
      c() {
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 4 && safe_not_equal(previous_key, previous_key = ctx2[2])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block3(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
      }
    };
  }
  var show = false;
  function instance16($$self, $$props, $$invalidate) {
    let notetext;
    let { ptk } = $$props;
    let { masterid } = $$props;
    let { line } = $$props;
    let { seq } = $$props;
    const LV = getContext("LV");
    const shownote = () => {
      LV.insertAddress(ptk.footNoteAddress(masterid, line), seq);
    };
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("masterid" in $$props2)
        $$invalidate(1, masterid = $$props2.masterid);
      if ("line" in $$props2)
        $$invalidate(4, line = $$props2.line);
      if ("seq" in $$props2)
        $$invalidate(5, seq = $$props2.seq);
    };
    $:
      $$invalidate(2, notetext = "");
    return [ptk, masterid, notetext, shownote, line, seq];
  }
  var F = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance16, create_fragment15, safe_not_equal, { ptk: 0, masterid: 1, line: 4, seq: 5 });
    }
  };
  var f_default = F;

  // src/painters/fn.svelte
  function create_fragment16(ctx) {
    let span;
    let t;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t = text(ctx[0]);
        attr(span, "class", "clickable footnote");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", ctx[1]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 1)
          set_data(t, ctx2[0]);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function instance17($$self, $$props, $$invalidate) {
    let { ptk } = $$props;
    let { masterid } = $$props;
    let { line } = $$props;
    let { seq } = $$props;
    const LV = getContext("LV");
    const showmaintext = () => {
      LV.insertAddress(ptk.footNoteByAddress(masterid, line), seq);
    };
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(2, ptk = $$props2.ptk);
      if ("masterid" in $$props2)
        $$invalidate(0, masterid = $$props2.masterid);
      if ("line" in $$props2)
        $$invalidate(3, line = $$props2.line);
      if ("seq" in $$props2)
        $$invalidate(4, seq = $$props2.seq);
    };
    return [masterid, showmaintext, ptk, line, seq];
  }
  var Fn = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance17, create_fragment16, safe_not_equal, { ptk: 2, masterid: 0, line: 3, seq: 4 });
    }
  };
  var fn_default = Fn;

  // src/painters/togglelink.svelte
  function create_else_block3(ctx) {
    let span;
    let span_class_value;
    return {
      c() {
        span = element("span");
        attr(span, "class", span_class_value = ctx[0] + " unclickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        span.innerHTML = ctx[2];
      },
      p(ctx2, dirty) {
        if (dirty & 4)
          span.innerHTML = ctx2[2];
        ;
        if (dirty & 1 && span_class_value !== (span_class_value = ctx2[0] + " unclickable")) {
          attr(span, "class", span_class_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
      }
    };
  }
  function create_if_block11(ctx) {
    let span;
    let span_class_value;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        attr(span, "class", span_class_value = ctx[0] + " clickable ");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        span.innerHTML = ctx[2];
        if (!mounted) {
          dispose = listen(span, "click", function() {
            if (is_function(ctx[3]))
              ctx[3].apply(this, arguments);
          });
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 4)
          span.innerHTML = ctx[2];
        ;
        if (dirty & 1 && span_class_value !== (span_class_value = ctx[0] + " clickable ")) {
          attr(span, "class", span_class_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment17(ctx) {
    let if_block_anchor;
    function select_block_type(ctx2, dirty) {
      if (ctx2[1])
        return create_if_block11;
      return create_else_block3;
    }
    let current_block_type = select_block_type(ctx, -1);
    let if_block = current_block_type(ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block.d(1);
          if_block = current_block_type(ctx2);
          if (if_block) {
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance18($$self, $$props, $$invalidate) {
    let { classes = "" } = $$props;
    let { clickable } = $$props;
    let { text: text2 = "" } = $$props;
    let { onclick } = $$props;
    $$self.$$set = ($$props2) => {
      if ("classes" in $$props2)
        $$invalidate(0, classes = $$props2.classes);
      if ("clickable" in $$props2)
        $$invalidate(1, clickable = $$props2.clickable);
      if ("text" in $$props2)
        $$invalidate(2, text2 = $$props2.text);
      if ("onclick" in $$props2)
        $$invalidate(3, onclick = $$props2.onclick);
    };
    return [classes, clickable, text2, onclick];
  }
  var Togglelink = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance18, create_fragment17, safe_not_equal, {
        classes: 0,
        clickable: 1,
        text: 2,
        onclick: 3
      });
    }
  };
  var togglelink_default = Togglelink;

  // src/painters/reversekeys.svelte
  function get_each_context10(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[13] = list[i];
    child_ctx[15] = i;
    return child_ctx;
  }
  function create_if_block_15(ctx) {
    let span;
    let span_class_value;
    let current;
    let each_value = ctx[6];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block10(get_each_context10(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        span = element("span");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(span, "class", span_class_value = ctx[1].name + " " + ctx[2] + " " + (ctx[0] ? ctx[0] : "") + " keys_start");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(span, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 200) {
          each_value = ctx2[6];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context10(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block10(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(span, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (!current || dirty & 7 && span_class_value !== (span_class_value = ctx2[1].name + " " + ctx2[2] + " " + (ctx2[0] ? ctx2[0] : "") + " keys_start")) {
          attr(span, "class", span_class_value);
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_each_block10(ctx) {
    let t_value = ctx[15] ? " " : "";
    let t;
    let togglelink;
    let current;
    function func() {
      return ctx[10](ctx[13]);
    }
    togglelink = new togglelink_default({
      props: {
        onclick: func,
        clickable: true,
        text: ctx[3].get(ctx[13])
      }
    });
    return {
      c() {
        t = text(t_value);
        create_component(togglelink.$$.fragment);
      },
      m(target, anchor) {
        insert(target, t, anchor);
        mount_component(togglelink, target, anchor);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const togglelink_changes = {};
        if (dirty & 64)
          togglelink_changes.onclick = func;
        if (dirty & 72)
          togglelink_changes.text = ctx[3].get(ctx[13]);
        togglelink.$set(togglelink_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(togglelink.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(togglelink.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t);
        destroy_component(togglelink, detaching);
      }
    };
  }
  function create_if_block12(ctx) {
    let span;
    let t0;
    let t1_value = ctx[4].length - ctx[5] + "";
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t0 = text("+");
        t1 = text(t1_value);
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
        if (!mounted) {
          dispose = listen(span, "click", ctx[11]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 48 && t1_value !== (t1_value = ctx2[4].length - ctx2[5] + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment18(ctx) {
    let if_block0_anchor;
    let span;
    let span_class_value;
    let current;
    let if_block0 = ctx[6].length && create_if_block_15(ctx);
    let if_block1 = ctx[5] < ctx[4].length && create_if_block12(ctx);
    return {
      c() {
        if (if_block0)
          if_block0.c();
        if_block0_anchor = empty();
        if (if_block1)
          if_block1.c();
        span = element("span");
        attr(span, "class", span_class_value = ctx[1].name + " " + ctx[2] + " " + ctx[0] + " keys_end");
      },
      m(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert(target, if_block0_anchor, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert(target, span, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[6].length) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
            if (dirty & 64) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_15(ctx2);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });
          check_outros();
        }
        if (ctx2[5] < ctx2[4].length) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block12(ctx2);
            if_block1.c();
            if_block1.m(span.parentNode, span);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        if (!current || dirty & 7 && span_class_value !== (span_class_value = ctx2[1].name + " " + ctx2[2] + " " + ctx2[0] + " keys_end")) {
          attr(span, "class", span_class_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block0);
        current = true;
      },
      o(local) {
        transition_out(if_block0);
        current = false;
      },
      d(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach(if_block0_anchor);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach(span);
      }
    };
  }
  var ITEMPERPAGE = 10;
  function instance19($$self, $$props, $$invalidate) {
    let displayitems;
    let { name: name2 } = $$props;
    let { seq } = $$props;
    let { ptk } = $$props;
    let { tagname } = $$props;
    let { keys } = $$props;
    let { items } = $$props;
    const LV = getContext("LV");
    const onclick = (id) => {
      LV.insertAddress(tagname + id, seq);
    };
    let showcount = ITEMPERPAGE;
    const showmore = () => {
      $$invalidate(5, showcount += ITEMPERPAGE);
    };
    const func = (key2) => onclick(key2);
    const click_handler = () => showmore();
    $$self.$$set = ($$props2) => {
      if ("name" in $$props2)
        $$invalidate(0, name2 = $$props2.name);
      if ("seq" in $$props2)
        $$invalidate(9, seq = $$props2.seq);
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("tagname" in $$props2)
        $$invalidate(2, tagname = $$props2.tagname);
      if ("keys" in $$props2)
        $$invalidate(3, keys = $$props2.keys);
      if ("items" in $$props2)
        $$invalidate(4, items = $$props2.items);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 48) {
        $:
          $$invalidate(6, displayitems = items.slice(0, showcount));
      }
    };
    return [
      name2,
      ptk,
      tagname,
      keys,
      items,
      showcount,
      displayitems,
      onclick,
      showmore,
      seq,
      func,
      click_handler
    ];
  }
  var Reversekeys = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance19, create_fragment18, safe_not_equal, {
        name: 0,
        seq: 9,
        ptk: 1,
        tagname: 2,
        keys: 3,
        items: 4
      });
    }
  };
  var reversekeys_default = Reversekeys;

  // src/painters/columnrow.svelte
  function get_each_context11(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[9] = list[i];
    return child_ctx;
  }
  function create_if_block13(ctx) {
    let reversekeys;
    let current;
    reversekeys = new reversekeys_default({
      props: {
        ptk: ctx[3],
        tagname: ctx[4],
        classes: ctx[2],
        seq: ctx[1],
        keys: ctx[3].columns[ctx[9].typedef.foreign || ctx[0]].keys,
        name: ctx[9].name,
        items: ctx[6](ctx[9].value)
      }
    });
    return {
      c() {
        create_component(reversekeys.$$.fragment);
      },
      m(target, anchor) {
        mount_component(reversekeys, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const reversekeys_changes = {};
        if (dirty & 8)
          reversekeys_changes.ptk = ctx2[3];
        if (dirty & 16)
          reversekeys_changes.tagname = ctx2[4];
        if (dirty & 4)
          reversekeys_changes.classes = ctx2[2];
        if (dirty & 2)
          reversekeys_changes.seq = ctx2[1];
        if (dirty & 41)
          reversekeys_changes.keys = ctx2[3].columns[ctx2[9].typedef.foreign || ctx2[0]].keys;
        if (dirty & 32)
          reversekeys_changes.name = ctx2[9].name;
        if (dirty & 32)
          reversekeys_changes.items = ctx2[6](ctx2[9].value);
        reversekeys.$set(reversekeys_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(reversekeys.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(reversekeys.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(reversekeys, detaching);
      }
    };
  }
  function create_each_block11(ctx) {
    let if_block_anchor;
    let current;
    let if_block = ctx[9].type !== "number" && ctx[9].value && ctx[9].value.length && create_if_block13(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (ctx2[9].type !== "number" && ctx2[9].value && ctx2[9].value.length) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 32) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block13(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_fragment19(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[5];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block11(get_each_context11(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 127) {
          each_value = ctx2[5];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context11(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block11(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance20($$self, $$props, $$invalidate) {
    let { name: name2 } = $$props;
    let { seq } = $$props;
    let { classes = "" } = $$props;
    let { key: key2 } = $$props;
    let { ptk } = $$props;
    let { tagname } = $$props;
    let { masterid } = $$props;
    let row = [];
    onMount(() => {
      $$invalidate(5, row = name2 && key2 && ptk.rowOf(name2, key2) || []);
    });
    const displayItem = (items) => {
      return items && items.filter && items.filter((it) => it != masterid) || [];
    };
    $$self.$$set = ($$props2) => {
      if ("name" in $$props2)
        $$invalidate(0, name2 = $$props2.name);
      if ("seq" in $$props2)
        $$invalidate(1, seq = $$props2.seq);
      if ("classes" in $$props2)
        $$invalidate(2, classes = $$props2.classes);
      if ("key" in $$props2)
        $$invalidate(7, key2 = $$props2.key);
      if ("ptk" in $$props2)
        $$invalidate(3, ptk = $$props2.ptk);
      if ("tagname" in $$props2)
        $$invalidate(4, tagname = $$props2.tagname);
      if ("masterid" in $$props2)
        $$invalidate(8, masterid = $$props2.masterid);
    };
    return [name2, seq, classes, ptk, tagname, row, displayItem, key2, masterid];
  }
  var Columnrow = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance20, create_fragment19, safe_not_equal, {
        name: 0,
        seq: 1,
        classes: 2,
        key: 7,
        ptk: 3,
        tagname: 4,
        masterid: 8
      });
    }
  };
  var columnrow_default = Columnrow;

  // src/comps/morelink.svelte
  function get_each_context12(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[8] = list[i];
    return child_ctx;
  }
  function create_else_block4(ctx) {
    let t0_value = " " + ctx[8][0];
    let t0;
    let t1;
    let t2_value = ctx[8][1] + "";
    let t2;
    let t3;
    return {
      c() {
        t0 = text(t0_value);
        t1 = text("(");
        t2 = text(t2_value);
        t3 = text(")");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, t2, anchor);
        insert(target, t3, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 32 && t0_value !== (t0_value = " " + ctx2[8][0]))
          set_data(t0, t0_value);
        if (dirty & 32 && t2_value !== (t2_value = ctx2[8][1] + ""))
          set_data(t2, t2_value);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(t3);
      }
    };
  }
  function create_if_block_16(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [{ ptk: ctx[1] }, ctx[8], { onclick: ctx[3] }];
    var switch_value = ctx[4];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 42 ? get_spread_update(switch_instance_spread_levels, [
          dirty & 2 && { ptk: ctx2[1] },
          dirty & 32 && get_spread_object(ctx2[8]),
          dirty & 8 && { onclick: ctx2[3] }
        ]) : {};
        if (switch_value !== (switch_value = ctx2[4])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_each_block12(ctx) {
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block_16, create_else_block4];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[4])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_if_block14(ctx) {
    let span;
    let t0;
    let t1_value = ctx[2].length - ctx[0] + "";
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t0 = text("+");
        t1 = text(t1_value);
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
        if (!mounted) {
          dispose = listen(span, "click", ctx[7]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 5 && t1_value !== (t1_value = ctx2[2].length - ctx2[0] + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment20(ctx) {
    let t;
    let if_block_anchor;
    let current;
    let each_value = ctx[5];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block12(get_each_context12(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    let if_block = ctx[0] < ctx[2].length && create_if_block14(ctx);
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, t, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 58) {
          each_value = ctx2[5];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context12(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block12(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(t.parentNode, t);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (ctx2[0] < ctx2[2].length) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block14(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  var ITEMPERPAGE2 = 5;
  function instance21($$self, $$props, $$invalidate) {
    let displayitems;
    let { ptk } = $$props;
    let { items = [] } = $$props;
    let { onclick } = $$props;
    let { itemRenderer } = $$props;
    let { showcount = ITEMPERPAGE2 } = $$props;
    const showmore = () => {
      $$invalidate(0, showcount += ITEMPERPAGE2);
    };
    const click_handler = () => showmore();
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("items" in $$props2)
        $$invalidate(2, items = $$props2.items);
      if ("onclick" in $$props2)
        $$invalidate(3, onclick = $$props2.onclick);
      if ("itemRenderer" in $$props2)
        $$invalidate(4, itemRenderer = $$props2.itemRenderer);
      if ("showcount" in $$props2)
        $$invalidate(0, showcount = $$props2.showcount);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 5) {
        $:
          $$invalidate(5, displayitems = items.slice(0, showcount));
      }
    };
    return [
      showcount,
      ptk,
      items,
      onclick,
      itemRenderer,
      displayitems,
      showmore,
      click_handler
    ];
  }
  var Morelink = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance21, create_fragment20, safe_not_equal, {
        ptk: 1,
        items: 2,
        onclick: 3,
        itemRenderer: 4,
        showcount: 0
      });
    }
  };
  var morelink_default = Morelink;

  // src/painters/reflistitem.svelte
  function create_if_block15(ctx) {
    let t0;
    let switch_instance;
    let t1;
    let current;
    var switch_value = Painters.backreflist;
    function switch_props(ctx2) {
      return {
        props: {
          ptk: ctx2[0],
          name: ctx2[4],
          tagname: ctx2[3],
          backref: ctx2[5],
          seq: ctx2[6],
          tofind: ctx2[8]
        }
      };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        t0 = text("(");
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        t1 = text(")");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, t1, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = {};
        if (dirty & 1)
          switch_instance_changes.ptk = ctx2[0];
        if (dirty & 16)
          switch_instance_changes.name = ctx2[4];
        if (dirty & 8)
          switch_instance_changes.tagname = ctx2[3];
        if (dirty & 32)
          switch_instance_changes.backref = ctx2[5];
        if (dirty & 64)
          switch_instance_changes.seq = ctx2[6];
        if (dirty & 256)
          switch_instance_changes.tofind = ctx2[8];
        if (switch_value !== (switch_value = Painters.backreflist)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, t1.parentNode, t1);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
        if (detaching)
          detach(t1);
      }
    };
  }
  function create_fragment21(ctx) {
    let span0;
    let t0;
    let span1;
    let t1_value = ctx[1] + " ";
    let t1;
    let if_block_anchor;
    let current;
    let mounted;
    let dispose;
    let if_block = ctx[7] && create_if_block15(ctx);
    return {
      c() {
        span0 = element("span");
        t0 = text(ctx[2]);
        span1 = element("span");
        t1 = text(t1_value);
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(span0, "class", "clickable refhitcount");
        attr(span1, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span0, anchor);
        append(span0, t0);
        insert(target, span1, anchor);
        append(span1, t1);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = [
            listen(span0, "click", ctx[13]),
            listen(span1, "click", ctx[14])
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (!current || dirty & 4)
          set_data(t0, ctx2[2]);
        if ((!current || dirty & 2) && t1_value !== (t1_value = ctx2[1] + " "))
          set_data(t1, t1_value);
        if (ctx2[7]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 128) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block15(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span0);
        if (detaching)
          detach(span1);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance22($$self, $$props, $$invalidate) {
    let opened;
    let tofind2;
    let { ptk } = $$props;
    let { caption } = $$props;
    let { count } = $$props;
    let { tofind: tofind3 } = $$props;
    let { foreign } = $$props;
    let { tagname } = $$props;
    let { name: name2 } = $$props;
    let { backref } = $$props;
    let { seq } = $$props;
    const LV = getContext("LV");
    const listref = () => {
      LV.insertAddress(ptk.name + ":*" + foreign + "@" + name2 + "=" + tofind2, seq);
    };
    const addCriteria = () => {
      $$invalidate(7, opened = !opened);
    };
    const click_handler = () => listref();
    const click_handler_1 = () => addCriteria();
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("caption" in $$props2)
        $$invalidate(1, caption = $$props2.caption);
      if ("count" in $$props2)
        $$invalidate(2, count = $$props2.count);
      if ("tofind" in $$props2)
        $$invalidate(11, tofind3 = $$props2.tofind);
      if ("foreign" in $$props2)
        $$invalidate(12, foreign = $$props2.foreign);
      if ("tagname" in $$props2)
        $$invalidate(3, tagname = $$props2.tagname);
      if ("name" in $$props2)
        $$invalidate(4, name2 = $$props2.name);
      if ("backref" in $$props2)
        $$invalidate(5, backref = $$props2.backref);
      if ("seq" in $$props2)
        $$invalidate(6, seq = $$props2.seq);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 2050) {
        $:
          $$invalidate(8, tofind2 = tofind3 + "," + caption);
      }
    };
    $:
      $$invalidate(7, opened = false);
    return [
      ptk,
      caption,
      count,
      tagname,
      name2,
      backref,
      seq,
      opened,
      tofind2,
      listref,
      addCriteria,
      tofind3,
      foreign,
      click_handler,
      click_handler_1
    ];
  }
  var Reflistitem = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance22, create_fragment21, safe_not_equal, {
        ptk: 0,
        caption: 1,
        count: 2,
        tofind: 11,
        foreign: 12,
        tagname: 3,
        name: 4,
        backref: 5,
        seq: 6
      });
    }
  };
  var reflistitem_default = Reflistitem;

  // src/painters/reflist.svelte
  function create_if_block16(ctx) {
    let morelink;
    let current;
    morelink = new morelink_default({
      props: {
        ptk: ctx[0],
        items: ctx[2],
        itemRenderer: reflistitem_default
      }
    });
    return {
      c() {
        create_component(morelink.$$.fragment);
      },
      m(target, anchor) {
        mount_component(morelink, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const morelink_changes = {};
        if (dirty & 1)
          morelink_changes.ptk = ctx2[0];
        if (dirty & 4)
          morelink_changes.items = ctx2[2];
        morelink.$set(morelink_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(morelink.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(morelink.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(morelink, detaching);
      }
    };
  }
  function create_fragment22(ctx) {
    let span;
    let t0;
    let t1;
    let if_block_anchor;
    let current;
    let if_block = ctx[2].length && create_if_block16(ctx);
    return {
      c() {
        span = element("span");
        t0 = text(ctx[1]);
        t1 = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(span, "class", "tofind");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        insert(target, t1, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (!current || dirty & 2)
          set_data(t0, ctx2[1]);
        if (ctx2[2].length) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 4) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block16(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t1);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance23($$self, $$props, $$invalidate) {
    let items2;
    let { ptk } = $$props;
    let { items = [] } = $$props;
    let { name: name2 } = $$props;
    let { foreign } = $$props;
    let { tofind: tofind2 = "" } = $$props;
    let { tagname } = $$props;
    let { backref } = $$props;
    let { seq } = $$props;
    const statMembers = (items3, foreigncol) => {
      const col = ptk.columns[name2];
      const arr = countMembers(items3, foreigncol, tofind2, col).map((it) => {
        const n = it[0];
        const caption = col.keys.get(n);
        return {
          name: name2,
          seq,
          n,
          foreign,
          caption,
          count: it[1],
          tofind: tofind2,
          tagname,
          backref
        };
      });
      return arr;
    };
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("items" in $$props2)
        $$invalidate(3, items = $$props2.items);
      if ("name" in $$props2)
        $$invalidate(4, name2 = $$props2.name);
      if ("foreign" in $$props2)
        $$invalidate(5, foreign = $$props2.foreign);
      if ("tofind" in $$props2)
        $$invalidate(1, tofind2 = $$props2.tofind);
      if ("tagname" in $$props2)
        $$invalidate(6, tagname = $$props2.tagname);
      if ("backref" in $$props2)
        $$invalidate(7, backref = $$props2.backref);
      if ("seq" in $$props2)
        $$invalidate(8, seq = $$props2.seq);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 41) {
        $:
          $$invalidate(2, items2 = statMembers(items, ptk.columns[foreign]));
      }
    };
    return [ptk, tofind2, items2, items, name2, foreign, tagname, backref, seq];
  }
  var Reflist = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance23, create_fragment22, safe_not_equal, {
        ptk: 0,
        items: 3,
        name: 4,
        foreign: 5,
        tofind: 1,
        tagname: 6,
        backref: 7,
        seq: 8
      });
    }
  };
  var reflist_default = Reflist;

  // src/painters/backreflist.svelte
  function create_if_block17(ctx) {
    let t_value = ctx[7].length + "";
    let t;
    return {
      c() {
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 128 && t_value !== (t_value = ctx2[7].length + ""))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_fragment23(ctx) {
    let t;
    let reflist;
    let current;
    let if_block = ctx[6] && create_if_block17(ctx);
    reflist = new reflist_default({
      props: {
        seq: ctx[1],
        ptk: ctx[2],
        name: ctx[3],
        backref: ctx[4],
        tagname: ctx[5],
        items: ctx[7],
        foreign: ctx[8],
        tofind: ctx[0]
      }
    });
    return {
      c() {
        if (if_block)
          if_block.c();
        t = space();
        create_component(reflist.$$.fragment);
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t, anchor);
        mount_component(reflist, target, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[6]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block17(ctx2);
            if_block.c();
            if_block.m(t.parentNode, t);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        const reflist_changes = {};
        if (dirty & 2)
          reflist_changes.seq = ctx2[1];
        if (dirty & 4)
          reflist_changes.ptk = ctx2[2];
        if (dirty & 8)
          reflist_changes.name = ctx2[3];
        if (dirty & 16)
          reflist_changes.backref = ctx2[4];
        if (dirty & 32)
          reflist_changes.tagname = ctx2[5];
        if (dirty & 128)
          reflist_changes.items = ctx2[7];
        if (dirty & 1)
          reflist_changes.tofind = ctx2[0];
        reflist.$set(reflist_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(reflist.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(reflist.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t);
        destroy_component(reflist, detaching);
      }
    };
  }
  function instance24($$self, $$props, $$invalidate) {
    let items;
    let { tofind: tofind2 = "" } = $$props;
    let { seq, ptk, name: name2, backref, tagname, showitemlength } = $$props;
    const backrefcol = ptk.columns[backref];
    const foreign = backrefcol.fieldsdef[1].foreign;
    const getItems = (tofind3) => {
      const tofinds = tofind3.split(",");
      const out = intersects(tofinds.map((it) => lookupKeyColumn(ptk, backref, it, name2)));
      return out;
    };
    $$self.$$set = ($$props2) => {
      if ("tofind" in $$props2)
        $$invalidate(0, tofind2 = $$props2.tofind);
      if ("seq" in $$props2)
        $$invalidate(1, seq = $$props2.seq);
      if ("ptk" in $$props2)
        $$invalidate(2, ptk = $$props2.ptk);
      if ("name" in $$props2)
        $$invalidate(3, name2 = $$props2.name);
      if ("backref" in $$props2)
        $$invalidate(4, backref = $$props2.backref);
      if ("tagname" in $$props2)
        $$invalidate(5, tagname = $$props2.tagname);
      if ("showitemlength" in $$props2)
        $$invalidate(6, showitemlength = $$props2.showitemlength);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 1) {
        $:
          $$invalidate(7, items = getItems(tofind2));
      }
    };
    return [tofind2, seq, ptk, name2, backref, tagname, showitemlength, items, foreign];
  }
  var Backreflist = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance24, create_fragment23, safe_not_equal, {
        tofind: 0,
        seq: 1,
        ptk: 2,
        name: 3,
        backref: 4,
        tagname: 5,
        showitemlength: 6
      });
    }
  };
  var backreflist_default = Backreflist;

  // src/painters/backref.svelte
  function create_if_block_17(ctx) {
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        span.textContent = "\u26D3\uFE0F";
        attr(span, "class", "clickable");
        toggle_class(span, "active", ctx[10] == ctx[7]);
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", ctx[14]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 1152) {
          toggle_class(span, "active", ctx2[10] == ctx2[7]);
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block18(ctx) {
    let t0;
    let switch_instance;
    let t1;
    let current;
    var switch_value = ctx[11];
    function switch_props(ctx2) {
      return {
        props: {
          tagname: ctx2[4],
          seq: ctx2[8],
          key: ctx2[7],
          showitemlength: true,
          name: ctx2[2],
          ptk: ctx2[1],
          masterid: ctx2[6],
          keys: ctx2[0],
          classes: ctx2[3],
          backref: ctx2[5],
          tofind: ctx2[12]
        }
      };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        t0 = text("(");
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        t1 = text(")");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, t1, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = {};
        if (dirty & 16)
          switch_instance_changes.tagname = ctx2[4];
        if (dirty & 256)
          switch_instance_changes.seq = ctx2[8];
        if (dirty & 128)
          switch_instance_changes.key = ctx2[7];
        if (dirty & 4)
          switch_instance_changes.name = ctx2[2];
        if (dirty & 2)
          switch_instance_changes.ptk = ctx2[1];
        if (dirty & 64)
          switch_instance_changes.masterid = ctx2[6];
        if (dirty & 1)
          switch_instance_changes.keys = ctx2[0];
        if (dirty & 8)
          switch_instance_changes.classes = ctx2[3];
        if (dirty & 32)
          switch_instance_changes.backref = ctx2[5];
        if (dirty & 4096)
          switch_instance_changes.tofind = ctx2[12];
        if (switch_value !== (switch_value = ctx2[11])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, t1.parentNode, t1);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
        if (detaching)
          detach(t1);
      }
    };
  }
  function create_fragment24(ctx) {
    let if_block0_anchor;
    let if_block1_anchor;
    let current;
    let if_block0 = ctx[9] && create_if_block_17(ctx);
    let if_block1 = ctx[10] == ctx[7] && create_if_block18(ctx);
    return {
      c() {
        if (if_block0)
          if_block0.c();
        if_block0_anchor = empty();
        if (if_block1)
          if_block1.c();
        if_block1_anchor = empty();
      },
      m(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert(target, if_block0_anchor, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[9]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_17(ctx2);
            if_block0.c();
            if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (ctx2[10] == ctx2[7]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty & 1152) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block18(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block1);
        current = true;
      },
      o(local) {
        transition_out(if_block1);
        current = false;
      },
      d(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach(if_block0_anchor);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach(if_block1_anchor);
      }
    };
  }
  function instance25($$self, $$props, $$invalidate) {
    let tofind2;
    let painter;
    let { keys } = $$props;
    let { ptk } = $$props;
    let { name: name2 } = $$props;
    let { classes } = $$props;
    let { tagname } = $$props;
    let { backref } = $$props;
    let { masterid } = $$props;
    let { key: key2 } = $$props;
    let { seq } = $$props;
    let { togglebutton = false } = $$props;
    let showing;
    const forward = (keyidx) => {
      if (showing == keyidx)
        $$invalidate(10, showing = -1);
      else {
        $$invalidate(10, showing = keyidx);
      }
    };
    const click_handler = () => forward(key2);
    $$self.$$set = ($$props2) => {
      if ("keys" in $$props2)
        $$invalidate(0, keys = $$props2.keys);
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("name" in $$props2)
        $$invalidate(2, name2 = $$props2.name);
      if ("classes" in $$props2)
        $$invalidate(3, classes = $$props2.classes);
      if ("tagname" in $$props2)
        $$invalidate(4, tagname = $$props2.tagname);
      if ("backref" in $$props2)
        $$invalidate(5, backref = $$props2.backref);
      if ("masterid" in $$props2)
        $$invalidate(6, masterid = $$props2.masterid);
      if ("key" in $$props2)
        $$invalidate(7, key2 = $$props2.key);
      if ("seq" in $$props2)
        $$invalidate(8, seq = $$props2.seq);
      if ("togglebutton" in $$props2)
        $$invalidate(9, togglebutton = $$props2.togglebutton);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 129) {
        $:
          $$invalidate(12, tofind2 = keys.get(key2));
      }
      if ($$self.$$.dirty & 16) {
        $:
          $$invalidate(11, painter = tagname === "*" ? backreflist_default : columnrow_default);
      }
    };
    return [
      keys,
      ptk,
      name2,
      classes,
      tagname,
      backref,
      masterid,
      key2,
      seq,
      togglebutton,
      showing,
      painter,
      tofind2,
      forward,
      click_handler
    ];
  }
  var Backref = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance25, create_fragment24, safe_not_equal, {
        keys: 0,
        ptk: 1,
        name: 2,
        classes: 3,
        tagname: 4,
        backref: 5,
        masterid: 6,
        key: 7,
        seq: 8,
        togglebutton: 9
      });
    }
  };
  var backref_default = Backref;

  // src/painters/keys.svelte
  function get_each_context13(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[17] = list[i];
    child_ctx[19] = i;
    return child_ctx;
  }
  function create_if_block19(ctx) {
    let span0;
    let span0_class_value;
    let span1;
    let span1_class_value;
    let current;
    let each_value = ctx[0];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block13(get_each_context13(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        span0 = element("span");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        span1 = element("span");
        attr(span0, "class", span0_class_value = ctx[7].name + " " + ctx[8] + " " + ctx[1] + " keys_start");
        attr(span1, "class", span1_class_value = ctx[7].name + " " + ctx[8] + " " + ctx[1] + " keys_end");
      },
      m(target, anchor) {
        insert(target, span0, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, span1, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (!current || dirty & 386 && span0_class_value !== (span0_class_value = ctx2[7].name + " " + ctx2[8] + " " + ctx2[1] + " keys_start")) {
          attr(span0, "class", span0_class_value);
        }
        if (dirty & 16343) {
          each_value = ctx2[0];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context13(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block13(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(span1.parentNode, span1);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (!current || dirty & 386 && span1_class_value !== (span1_class_value = ctx2[7].name + " " + ctx2[8] + " " + ctx2[1] + " keys_end")) {
          attr(span1, "class", span1_class_value);
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span0);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(span1);
      }
    };
  }
  function create_else_block5(ctx) {
    let t_value = " ";
    let t;
    return {
      c() {
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_18(ctx) {
    let backref;
    let current;
    backref = new backref_default({
      props: {
        ptk: ctx[7],
        seq: ctx[2],
        name: ctx[4],
        masterid: ctx[9],
        foreign: ctx[4],
        tagname: ctx[8],
        keys: ctx[6],
        key: ctx[17]
      }
    });
    return {
      c() {
        create_component(backref.$$.fragment);
      },
      m(target, anchor) {
        mount_component(backref, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const backref_changes = {};
        if (dirty & 128)
          backref_changes.ptk = ctx2[7];
        if (dirty & 4)
          backref_changes.seq = ctx2[2];
        if (dirty & 16)
          backref_changes.name = ctx2[4];
        if (dirty & 512)
          backref_changes.masterid = ctx2[9];
        if (dirty & 16)
          backref_changes.foreign = ctx2[4];
        if (dirty & 256)
          backref_changes.tagname = ctx2[8];
        if (dirty & 64)
          backref_changes.keys = ctx2[6];
        if (dirty & 1)
          backref_changes.key = ctx2[17];
        backref.$set(backref_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(backref.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(backref.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(backref, detaching);
      }
    };
  }
  function create_each_block13(ctx) {
    let togglelink;
    let show_if;
    let current_block_type_index;
    let if_block;
    let t;
    let current;
    function func() {
      return ctx[14](ctx[17]);
    }
    togglelink = new togglelink_default({
      props: {
        onclick: func,
        clickable: ctx[12](ctx[17]),
        tagname: ctx[8],
        classes: ctx[10],
        name: ctx[1],
        text: ctx[6].get(ctx[17])
      }
    });
    const if_block_creators = [create_if_block_18, create_else_block5];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (dirty & 1)
        show_if = null;
      if (show_if == null)
        show_if = !!ctx2[13](ctx2[17]);
      if (show_if)
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        create_component(togglelink.$$.fragment);
        if_block.c();
        t = space();
      },
      m(target, anchor) {
        mount_component(togglelink, target, anchor);
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, t, anchor);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const togglelink_changes = {};
        if (dirty & 1)
          togglelink_changes.onclick = func;
        if (dirty & 1)
          togglelink_changes.clickable = ctx[12](ctx[17]);
        if (dirty & 256)
          togglelink_changes.tagname = ctx[8];
        if (dirty & 1024)
          togglelink_changes.classes = ctx[10];
        if (dirty & 2)
          togglelink_changes.name = ctx[1];
        if (dirty & 65)
          togglelink_changes.text = ctx[6].get(ctx[17]);
        togglelink.$set(togglelink_changes);
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
            if_block.c();
          } else {
            if_block.p(ctx, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(t.parentNode, t);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(togglelink.$$.fragment, local);
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(togglelink.$$.fragment, local);
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        destroy_component(togglelink, detaching);
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_fragment25(ctx) {
    let if_block_anchor;
    let current;
    let if_block = (ctx[3] || !ctx[5]) && create_if_block19(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[3] || !ctx2[5]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 40) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block19(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance26($$self, $$props, $$invalidate) {
    let { name: name2 = "" } = $$props;
    let { seq } = $$props;
    let { after } = $$props;
    let { foreign } = $$props;
    let { items } = $$props;
    let { value } = $$props;
    let { keys } = $$props;
    let { ptk } = $$props;
    let { tagname } = $$props;
    let { masterid } = $$props;
    let { classes = "" } = $$props;
    const LV = getContext("LV");
    let showing = -1;
    items = items || value.split(",");
    const onclick = (id) => {
      LV.insertAddress(tagname + id, seq);
    };
    const isclickable = (id) => {
      return ptk.validId(tagname, id);
    };
    const hasColumnRow = (key2) => {
      const row = ptk.rowOf(foreign, key2);
      return row.reduce((prev, item) => item.value.filter((it) => it != masterid).length + prev, 0);
    };
    const func = (key2) => onclick(key2);
    $$self.$$set = ($$props2) => {
      if ("name" in $$props2)
        $$invalidate(1, name2 = $$props2.name);
      if ("seq" in $$props2)
        $$invalidate(2, seq = $$props2.seq);
      if ("after" in $$props2)
        $$invalidate(3, after = $$props2.after);
      if ("foreign" in $$props2)
        $$invalidate(4, foreign = $$props2.foreign);
      if ("items" in $$props2)
        $$invalidate(0, items = $$props2.items);
      if ("value" in $$props2)
        $$invalidate(5, value = $$props2.value);
      if ("keys" in $$props2)
        $$invalidate(6, keys = $$props2.keys);
      if ("ptk" in $$props2)
        $$invalidate(7, ptk = $$props2.ptk);
      if ("tagname" in $$props2)
        $$invalidate(8, tagname = $$props2.tagname);
      if ("masterid" in $$props2)
        $$invalidate(9, masterid = $$props2.masterid);
      if ("classes" in $$props2)
        $$invalidate(10, classes = $$props2.classes);
    };
    return [
      items,
      name2,
      seq,
      after,
      foreign,
      value,
      keys,
      ptk,
      tagname,
      masterid,
      classes,
      onclick,
      isclickable,
      hasColumnRow,
      func
    ];
  }
  var Keys = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance26, create_fragment25, safe_not_equal, {
        name: 1,
        seq: 2,
        after: 3,
        foreign: 4,
        items: 0,
        value: 5,
        keys: 6,
        ptk: 7,
        tagname: 8,
        masterid: 9,
        classes: 10
      });
    }
  };
  var keys_default = Keys;

  // src/painters/key.svelte
  function create_if_block20(ctx) {
    let reversekeys;
    let current;
    reversekeys = new reversekeys_default({
      props: {
        name: ctx[1],
        seq: ctx[3],
        tagname: "ck",
        ptk: ctx[2],
        keys: ctx[2].columns[ctx[5]].keys,
        items: ctx[4]
      }
    });
    return {
      c() {
        create_component(reversekeys.$$.fragment);
      },
      m(target, anchor) {
        mount_component(reversekeys, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const reversekeys_changes = {};
        if (dirty & 2)
          reversekeys_changes.name = ctx2[1];
        if (dirty & 8)
          reversekeys_changes.seq = ctx2[3];
        if (dirty & 4)
          reversekeys_changes.ptk = ctx2[2];
        if (dirty & 36)
          reversekeys_changes.keys = ctx2[2].columns[ctx2[5]].keys;
        if (dirty & 16)
          reversekeys_changes.items = ctx2[4];
        reversekeys.$set(reversekeys_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(reversekeys.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(reversekeys.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(reversekeys, detaching);
      }
    };
  }
  function create_fragment26(ctx) {
    let if_block_anchor;
    let current;
    let if_block = ctx[0] && create_if_block20(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[0]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 1) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block20(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance27($$self, $$props, $$invalidate) {
    let { after } = $$props;
    let { foreign } = $$props;
    let { field } = $$props;
    let { text: text2 } = $$props;
    let { keys } = $$props;
    let { ptk } = $$props;
    let { seq } = $$props;
    let items = [], master;
    const getRow = () => {
      const at = keys.find(text2.replace(/．.+/, ""));
      const row = ptk.rowOf(foreign, at, field)[0];
      $$invalidate(4, items = row.value || []);
      $$invalidate(5, master = row.typedef.foreign);
    };
    getRow();
    $$self.$$set = ($$props2) => {
      if ("after" in $$props2)
        $$invalidate(0, after = $$props2.after);
      if ("foreign" in $$props2)
        $$invalidate(1, foreign = $$props2.foreign);
      if ("field" in $$props2)
        $$invalidate(6, field = $$props2.field);
      if ("text" in $$props2)
        $$invalidate(7, text2 = $$props2.text);
      if ("keys" in $$props2)
        $$invalidate(8, keys = $$props2.keys);
      if ("ptk" in $$props2)
        $$invalidate(2, ptk = $$props2.ptk);
      if ("seq" in $$props2)
        $$invalidate(3, seq = $$props2.seq);
    };
    return [after, foreign, ptk, seq, items, master, field, text2, keys];
  }
  var Key = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance27, create_fragment26, safe_not_equal, {
        after: 0,
        foreign: 1,
        field: 6,
        text: 7,
        keys: 8,
        ptk: 2,
        seq: 3
      });
    }
  };
  var key_default = Key;

  // src/painters/confer.svelte
  function create_if_block21(ctx) {
    let t;
    return {
      c() {
        t = text("confer");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_fragment27(ctx) {
    let if_block_anchor;
    let if_block = ctx[0] && create_if_block21(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (ctx2[0]) {
          if (if_block) {
          } else {
            if_block = create_if_block21(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance28($$self, $$props, $$invalidate) {
    let { after } = $$props;
    $$self.$$set = ($$props2) => {
      if ("after" in $$props2)
        $$invalidate(0, after = $$props2.after);
    };
    return [after];
  }
  var Confer = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance28, create_fragment27, safe_not_equal, { after: 0 });
    }
  };
  var confer_default = Confer;

  // src/painters/approxbackref.svelte
  function create_fragment28(ctx) {
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        span.textContent = "\u2248";
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", ctx[5]);
          mounted = true;
        }
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function instance29($$self, $$props, $$invalidate) {
    const LV = getContext("LV");
    let { seq } = $$props;
    let { id } = $$props;
    let { line } = $$props;
    let { tagname } = $$props;
    const onclick = () => {
      LV.insertAddress("*" + tagname + "=~" + (id ? id : line), seq);
    };
    const click_handler = () => onclick();
    $$self.$$set = ($$props2) => {
      if ("seq" in $$props2)
        $$invalidate(1, seq = $$props2.seq);
      if ("id" in $$props2)
        $$invalidate(2, id = $$props2.id);
      if ("line" in $$props2)
        $$invalidate(3, line = $$props2.line);
      if ("tagname" in $$props2)
        $$invalidate(4, tagname = $$props2.tagname);
    };
    return [onclick, seq, id, line, tagname, click_handler];
  }
  var Approxbackref = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance29, create_fragment28, safe_not_equal, { seq: 1, id: 2, line: 3, tagname: 4 });
    }
  };
  var approxbackref_default = Approxbackref;

  // src/painters/partialchunkid.svelte
  function get_each_context14(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[13] = list[i];
    return child_ctx;
  }
  function create_if_block22(ctx) {
    let span;
    let t0_value = ctx[0].caption + "";
    let t0;
    let t1_value = ctx[2].length + "";
    let t1;
    let t2;
    let if_block_anchor;
    let mounted;
    let dispose;
    let if_block = ctx[1] && create_if_block_19(ctx);
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = text(t1_value);
        t2 = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
        insert(target, t2, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        if (!mounted) {
          dispose = listen(span, "click", ctx[8]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t0_value !== (t0_value = ctx2[0].caption + ""))
          set_data(t0, t0_value);
        if (dirty & 4 && t1_value !== (t1_value = ctx2[2].length + ""))
          set_data(t1, t1_value);
        if (ctx2[1]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_19(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t2);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_19(ctx) {
    let t0;
    let t1;
    let each_value = ctx[2];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block14(get_each_context14(ctx, each_value, i));
    }
    return {
      c() {
        t0 = text("\uFF08");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = text("\uFF09");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, t1, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 28) {
          each_value = ctx2[2];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context14(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block14(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(t1.parentNode, t1);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t1);
      }
    };
  }
  function create_each_block14(ctx) {
    let span;
    let t0_value = ctx[3](ctx[13]) + " ";
    let t0;
    let t1;
    let mounted;
    let dispose;
    function click_handler_1() {
      return ctx[9](ctx[13]);
    }
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = space();
        attr(span, "class", "clickable backref");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        insert(target, t1, anchor);
        if (!mounted) {
          dispose = listen(span, "click", click_handler_1);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 4 && t0_value !== (t0_value = ctx[3](ctx[13]) + " "))
          set_data(t0, t0_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t1);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment29(ctx) {
    let if_block_anchor;
    let if_block = ctx[2].length && create_if_block22(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (ctx2[2].length) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block22(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance30($$self, $$props, $$invalidate) {
    let items;
    let { ptk } = $$props;
    let { defattrs } = $$props;
    let { id } = $$props;
    let { seq } = $$props;
    let showing;
    const LV = getContext("LV");
    const tf = (defattrs.prefix || "") + id + (defattrs.suffix || "");
    const ck = ptk.defines.ck;
    onMount(() => {
      for (let i = 0; i < ck.fields.id.values.length; i++) {
        const v = ck.fields.id.values[i];
        if (~v.indexOf(tf)) {
          items.push(i);
        }
      }
      $$invalidate(2, items);
    });
    const sickname = (n) => {
      let text2 = ck.innertext.get(n);
      if (!text2) {
        text2 = ptk.template.onChunkCaption(ck.fields.id.values[n], 1);
      }
      return text2;
    };
    const openChunk = (n) => {
      const id2 = ck.fields.id.values[n];
      const address = "ck" + (parseInt(id2) ? id2 : "#" + id2);
      LV.insertAddress(address, seq);
    };
    const click_handler = () => $$invalidate(1, showing = !showing);
    const click_handler_1 = (item) => openChunk(item);
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(5, ptk = $$props2.ptk);
      if ("defattrs" in $$props2)
        $$invalidate(0, defattrs = $$props2.defattrs);
      if ("id" in $$props2)
        $$invalidate(6, id = $$props2.id);
      if ("seq" in $$props2)
        $$invalidate(7, seq = $$props2.seq);
    };
    $:
      $$invalidate(2, items = []);
    return [
      defattrs,
      showing,
      items,
      sickname,
      openChunk,
      ptk,
      id,
      seq,
      click_handler,
      click_handler_1
    ];
  }
  var Partialchunkid = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance30, create_fragment29, safe_not_equal, { ptk: 5, defattrs: 0, id: 6, seq: 7 });
    }
  };
  var partialchunkid_default = Partialchunkid;

  // src/painters/chunk.svelte
  function create_fragment30(ctx) {
    let t;
    return {
      c() {
        t = text("chunk");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  var Chunk = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment30, safe_not_equal, {});
    }
  };
  var chunk_default = Chunk;

  // src/ownerdraw/abridge.svelte
  function get_each_context15(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[15] = list[i];
    child_ctx[17] = i;
    return child_ctx;
  }
  function create_else_block6(ctx) {
    let renderunit;
    let current;
    renderunit = new renderunit_default({
      props: {
        ptk: ctx[0],
        before: ctx[1],
        after: ctx[2],
        ru: ctx[15],
        onUpdate: ctx[6],
        extraclass: ctx[3]
      }
    });
    return {
      c() {
        create_component(renderunit.$$.fragment);
      },
      m(target, anchor) {
        mount_component(renderunit, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const renderunit_changes = {};
        if (dirty & 1)
          renderunit_changes.ptk = ctx2[0];
        if (dirty & 2)
          renderunit_changes.before = ctx2[1];
        if (dirty & 4)
          renderunit_changes.after = ctx2[2];
        if (dirty & 32)
          renderunit_changes.ru = ctx2[15];
        if (dirty & 8)
          renderunit_changes.extraclass = ctx2[3];
        renderunit.$set(renderunit_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(renderunit.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(renderunit.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(renderunit, detaching);
      }
    };
  }
  function create_if_block23(ctx) {
    let span;
    let t_value = ctx[15][0] + "";
    let t;
    let if_block1_anchor;
    let mounted;
    let dispose;
    let if_block0 = ctx[15][1] && ctx[15][0] > 10 && create_if_block_23(ctx);
    function click_handler_1() {
      return ctx[13](ctx[17]);
    }
    let if_block1 = !ctx[15][2] && create_if_block_110(ctx);
    return {
      c() {
        if (if_block0)
          if_block0.c();
        span = element("span");
        t = text(t_value);
        if (if_block1)
          if_block1.c();
        if_block1_anchor = empty();
        attr(span, "class", "clickable abridged");
      },
      m(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert(target, span, anchor);
        append(span, t);
        if (if_block1)
          if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
        if (!mounted) {
          dispose = listen(span, "click", click_handler_1);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (ctx[15][1] && ctx[15][0] > 10) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_23(ctx);
            if_block0.c();
            if_block0.m(span.parentNode, span);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (dirty & 32 && t_value !== (t_value = ctx[15][0] + ""))
          set_data(t, t_value);
        if (!ctx[15][2]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_110(ctx);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach(span);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach(if_block1_anchor);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_23(ctx) {
    let span;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[12](ctx[17]);
    }
    return {
      c() {
        span = element("span");
        span.textContent = "\u2026";
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_110(ctx) {
    let span;
    let mounted;
    let dispose;
    function click_handler_2() {
      return ctx[14](ctx[17]);
    }
    return {
      c() {
        span = element("span");
        span.textContent = "\u2026";
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", click_handler_2);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block15(ctx) {
    let show_if;
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block23, create_else_block6];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (dirty & 32)
        show_if = null;
      if (show_if == null)
        show_if = !!Array.isArray(ctx2[15]);
      if (show_if)
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_key_block4(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[5];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block15(get_each_context15(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 239) {
          each_value = ctx2[5];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context15(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block15(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function create_fragment31(ctx) {
    let previous_key = ctx[4];
    let key_block_anchor;
    let current;
    let key_block = create_key_block4(ctx);
    return {
      c() {
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 16 && safe_not_equal(previous_key, previous_key = ctx2[4])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block4(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
      }
    };
  }
  function instance31($$self, $$props, $$invalidate) {
    let runits;
    let abridges;
    let { ptk } = $$props;
    let { hits = [] } = $$props;
    let { phraselength } = $$props;
    let { text: text2 = "" } = $$props;
    let { before, after } = $$props;
    let { extraclass = "" } = $$props;
    let refreshcount = 1;
    const onUpdate = () => $$invalidate(4, refreshcount++, refreshcount);
    const expand = (idx2, direction = 0) => {
      const R = runits;
      const [len, from] = abridges[idx2];
      const start = from + (direction == -1 ? len : 0);
      let j2 = start;
      if (direction == -1) {
        while (j2 > 0 && (R[j2].token.type >= 16 /* SEARCHABLE */ || start - j2 < MIN_ABRIDGE))
          j2--;
        for (let i = j2; i < start; i++)
          R[i].luminate++;
      } else if (direction == 1) {
        while (j2 < R.length && (R[j2].token.type >= 16 /* SEARCHABLE */ || j2 - start < MIN_ABRIDGE))
          j2++;
        for (let i = start; i < j2; i++)
          R[i].luminate++;
      } else {
        for (let i = from; i < from + len; i++)
          R[i].luminate++;
      }
      $$invalidate(4, refreshcount++, refreshcount);
    };
    const click_handler = (idx2) => expand(idx2, 1);
    const click_handler_1 = (idx2) => expand(idx2);
    const click_handler_2 = (idx2) => expand(idx2, -1);
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("hits" in $$props2)
        $$invalidate(8, hits = $$props2.hits);
      if ("phraselength" in $$props2)
        $$invalidate(9, phraselength = $$props2.phraselength);
      if ("text" in $$props2)
        $$invalidate(10, text2 = $$props2.text);
      if ("before" in $$props2)
        $$invalidate(1, before = $$props2.before);
      if ("after" in $$props2)
        $$invalidate(2, after = $$props2.after);
      if ("extraclass" in $$props2)
        $$invalidate(3, extraclass = $$props2.extraclass);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 1792) {
        $:
          $$invalidate(11, [runits] = renderOfftext(text2, { hits, phraselength }), runits);
      }
      if ($$self.$$.dirty & 2320) {
        $:
          $$invalidate(5, abridges = hits?.length ? abridgeRenderUnits(runits, 30, refreshcount) : runits);
      }
    };
    return [
      ptk,
      before,
      after,
      extraclass,
      refreshcount,
      abridges,
      onUpdate,
      expand,
      hits,
      phraselength,
      text2,
      runits,
      click_handler,
      click_handler_1,
      click_handler_2
    ];
  }
  var Abridge = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance31, create_fragment31, safe_not_equal, {
        ptk: 0,
        hits: 8,
        phraselength: 9,
        text: 10,
        before: 1,
        after: 2,
        extraclass: 3
      });
    }
  };
  var abridge_default = Abridge;

  // src/ownerdraw/excerptbar.svelte
  function create_if_block_33(ctx) {
    let span;
    let t;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t = text(ctx[3]);
        attr(span, "class", "tofind clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", ctx[15]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 8)
          set_data(t, ctx2[3]);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_24(ctx) {
    let span;
    let t;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t = text(ctx[2]);
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", ctx[16]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 4)
          set_data(t, ctx2[2]);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_111(ctx) {
    let span;
    let t;
    return {
      c() {
        span = element("span");
        t = text(ctx[5]);
        attr(span, "class", "hitcount");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
      },
      p(ctx2, dirty) {
        if (dirty & 32)
          set_data(t, ctx2[5]);
      },
      d(detaching) {
        if (detaching)
          detach(span);
      }
    };
  }
  function create_if_block24(ctx) {
    let t0_value = ctx[6].id + "";
    let t0;
    let t1;
    let span;
    let t2_value = ctx[6].caption + "";
    let t2;
    let mounted;
    let dispose;
    return {
      c() {
        t0 = text(t0_value);
        t1 = text(".");
        span = element("span");
        t2 = text(t2_value);
        attr(span, "class", "excerptheading clickable");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, span, anchor);
        append(span, t2);
        if (!mounted) {
          dispose = listen(span, "click", ctx[17]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 64 && t0_value !== (t0_value = ctx2[6].id + ""))
          set_data(t0, t0_value);
        if (dirty & 64 && t2_value !== (t2_value = ctx2[6].caption + ""))
          set_data(t2, t2_value);
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment32(ctx) {
    let div;
    let span0;
    let t0_value = ctx[1].humanName(true) + "";
    let t0;
    let span0_title_value;
    let t1;
    let t2;
    let t3;
    let t4;
    let t5;
    let span1;
    let t6_value = ctx[0] + 1 + "";
    let t6;
    let t7;
    let span2;
    let t8;
    let mounted;
    let dispose;
    let if_block0 = ctx[3] && create_if_block_33(ctx);
    let if_block1 = ctx[2] && create_if_block_24(ctx);
    let if_block2 = ctx[5] && create_if_block_111(ctx);
    let if_block3 = ctx[6] && create_if_block24(ctx);
    return {
      c() {
        div = element("div");
        span0 = element("span");
        t0 = text(t0_value);
        t1 = space();
        if (if_block0)
          if_block0.c();
        t2 = space();
        if (if_block1)
          if_block1.c();
        t3 = space();
        if (if_block2)
          if_block2.c();
        t4 = space();
        if (if_block3)
          if_block3.c();
        t5 = space();
        span1 = element("span");
        t6 = text(t6_value);
        t7 = text("/");
        span2 = element("span");
        t8 = text(ctx[4]);
        attr(span0, "title", span0_title_value = ctx[1].humanName());
        attr(span1, "class", "clickable");
        attr(span2, "class", "clickable");
        attr(div, "class", "toolbar excerptheader");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, span0);
        append(span0, t0);
        append(div, t1);
        if (if_block0)
          if_block0.m(div, null);
        append(div, t2);
        if (if_block1)
          if_block1.m(div, null);
        append(div, t3);
        if (if_block2)
          if_block2.m(div, null);
        append(div, t4);
        if (if_block3)
          if_block3.m(div, null);
        append(div, t5);
        append(div, span1);
        append(span1, t6);
        append(span1, t7);
        append(div, span2);
        append(span2, t8);
        if (!mounted) {
          dispose = [
            listen(span1, "click", ctx[8]),
            listen(span2, "click", ctx[7])
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 2 && t0_value !== (t0_value = ctx2[1].humanName(true) + ""))
          set_data(t0, t0_value);
        if (dirty & 2 && span0_title_value !== (span0_title_value = ctx2[1].humanName())) {
          attr(span0, "title", span0_title_value);
        }
        if (ctx2[3]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_33(ctx2);
            if_block0.c();
            if_block0.m(div, t2);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (ctx2[2]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_24(ctx2);
            if_block1.c();
            if_block1.m(div, t3);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
        if (ctx2[5]) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
          } else {
            if_block2 = create_if_block_111(ctx2);
            if_block2.c();
            if_block2.m(div, t4);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }
        if (ctx2[6]) {
          if (if_block3) {
            if_block3.p(ctx2, dirty);
          } else {
            if_block3 = create_if_block24(ctx2);
            if_block3.c();
            if_block3.m(div, t5);
          }
        } else if (if_block3) {
          if_block3.d(1);
          if_block3 = null;
        }
        if (dirty & 1 && t6_value !== (t6_value = ctx2[0] + 1 + ""))
          set_data(t6, t6_value);
        if (dirty & 16)
          set_data(t8, ctx2[4]);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(div);
        if (if_block0)
          if_block0.d();
        if (if_block1)
          if_block1.d();
        if (if_block2)
          if_block2.d();
        if (if_block3)
          if_block3.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance32($$self, $$props, $$invalidate) {
    let { ptk } = $$props;
    let { name: name2 } = $$props;
    let { caption } = $$props;
    let { tofind: tofind2 } = $$props;
    let { from } = $$props;
    let { last } = $$props;
    let { seq } = $$props;
    let { hitcount } = $$props;
    let { chunk } = $$props;
    const LV = getContext("LV");
    let { pagesize = EXCERPT_PAGESIZE } = $$props;
    const next = () => {
      if (from + pagesize >= last)
        return;
      $$invalidate(0, from += pagesize);
      if (from > last)
        $$invalidate(0, from = last - 1);
    };
    const prev = () => {
      $$invalidate(0, from -= pagesize);
      if (from < 0)
        $$invalidate(0, from = 0);
    };
    const setTofind = () => {
      LV.setTofind(tofind2);
    };
    const listChunk = () => {
      const address = name2 + "=";
      LV.insertAddress(address, seq);
    };
    const openChunk = (bkid, tagname, id) => {
      const address = makeElementId("bk", bkid) + "." + tagname + (parseInt(id) ? id : "#" + id);
      LV.insertAddress(address, seq);
    };
    const click_handler = () => setTofind();
    const click_handler_1 = () => listChunk();
    const click_handler_2 = () => openChunk(chunk.bkid, chunk.tagname, chunk.id);
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("name" in $$props2)
        $$invalidate(12, name2 = $$props2.name);
      if ("caption" in $$props2)
        $$invalidate(2, caption = $$props2.caption);
      if ("tofind" in $$props2)
        $$invalidate(3, tofind2 = $$props2.tofind);
      if ("from" in $$props2)
        $$invalidate(0, from = $$props2.from);
      if ("last" in $$props2)
        $$invalidate(4, last = $$props2.last);
      if ("seq" in $$props2)
        $$invalidate(13, seq = $$props2.seq);
      if ("hitcount" in $$props2)
        $$invalidate(5, hitcount = $$props2.hitcount);
      if ("chunk" in $$props2)
        $$invalidate(6, chunk = $$props2.chunk);
      if ("pagesize" in $$props2)
        $$invalidate(14, pagesize = $$props2.pagesize);
    };
    return [
      from,
      ptk,
      caption,
      tofind2,
      last,
      hitcount,
      chunk,
      next,
      prev,
      setTofind,
      listChunk,
      openChunk,
      name2,
      seq,
      pagesize,
      click_handler,
      click_handler_1,
      click_handler_2
    ];
  }
  var Excerptbar = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance32, create_fragment32, safe_not_equal, {
        ptk: 1,
        name: 12,
        caption: 2,
        tofind: 3,
        from: 0,
        last: 4,
        seq: 13,
        hitcount: 5,
        chunk: 6,
        pagesize: 14
      });
    }
  };
  var excerptbar_default = Excerptbar;

  // src/ownerdraw/excerptheading.svelte
  function create_fragment33(ctx) {
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        attr(span, "class", "clickable openexcerpt");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", ctx[0]);
          mounted = true;
        }
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function instance33($$self, $$props, $$invalidate) {
    let { id } = $$props;
    let { bkid } = $$props;
    let { tagname } = $$props;
    let { seq } = $$props;
    let { ptk } = $$props;
    let { lineoff } = $$props;
    const LV = getContext("LV");
    const openchunk = () => {
      const scrollto = lineoff ? (lineoff >= 5 ? ">" + (lineoff - 1) : "") + (lineoff ? ":" + lineoff : "") : "";
      const address = ptk.name + ":" + makeElementId("bk", bkid) + "." + tagname + (parseInt(id) ? id : "#" + id) + scrollto;
      LV.insertAddress(address, seq);
    };
    $$self.$$set = ($$props2) => {
      if ("id" in $$props2)
        $$invalidate(1, id = $$props2.id);
      if ("bkid" in $$props2)
        $$invalidate(2, bkid = $$props2.bkid);
      if ("tagname" in $$props2)
        $$invalidate(3, tagname = $$props2.tagname);
      if ("seq" in $$props2)
        $$invalidate(4, seq = $$props2.seq);
      if ("ptk" in $$props2)
        $$invalidate(5, ptk = $$props2.ptk);
      if ("lineoff" in $$props2)
        $$invalidate(6, lineoff = $$props2.lineoff);
    };
    return [openchunk, id, bkid, tagname, seq, ptk, lineoff];
  }
  var Excerptheading = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance33, create_fragment33, safe_not_equal, {
        id: 1,
        bkid: 2,
        tagname: 3,
        seq: 4,
        ptk: 5,
        lineoff: 6
      });
    }
  };
  var excerptheading_default = Excerptheading;

  // src/ownerdraw/excerpt.svelte
  function get_each_context16(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[22] = list[i];
    child_ctx[24] = i;
    return child_ctx;
  }
  function create_if_block25(ctx) {
    let span;
    let t0_value = " " + ctx[22].ck.humanId;
    let t0;
    let t1;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[17](ctx[22]);
    }
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = space();
        attr(span, "class", "excerptheading clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        insert(target, t1, anchor);
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 256 && t0_value !== (t0_value = " " + ctx[22].ck.humanId))
          set_data(t0, t0_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t1);
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block16(ctx) {
    let div;
    let excerptheading;
    let t;
    let abridge;
    let current;
    const excerptheading_spread_levels = [{ ptk: ctx[4] }, { seq: ctx[3] }, ctx[22].ck];
    let excerptheading_props = {};
    for (let i = 0; i < excerptheading_spread_levels.length; i += 1) {
      excerptheading_props = assign(excerptheading_props, excerptheading_spread_levels[i]);
    }
    excerptheading = new excerptheading_default({ props: excerptheading_props });
    const abridge_spread_levels = [ctx[22], { ptk: ctx[4] }];
    let abridge_props = {};
    for (let i = 0; i < abridge_spread_levels.length; i += 1) {
      abridge_props = assign(abridge_props, abridge_spread_levels[i]);
    }
    abridge = new abridge_default({ props: abridge_props });
    let if_block = !ctx[7] && create_if_block25(ctx);
    return {
      c() {
        div = element("div");
        create_component(excerptheading.$$.fragment);
        t = space();
        create_component(abridge.$$.fragment);
        if (if_block)
          if_block.c();
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(excerptheading, div, null);
        append(div, t);
        mount_component(abridge, div, null);
        if (if_block)
          if_block.m(div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const excerptheading_changes = dirty & 280 ? get_spread_update(excerptheading_spread_levels, [
          dirty & 16 && { ptk: ctx2[4] },
          dirty & 8 && { seq: ctx2[3] },
          dirty & 256 && get_spread_object(ctx2[22].ck)
        ]) : {};
        excerptheading.$set(excerptheading_changes);
        const abridge_changes = dirty & 272 ? get_spread_update(abridge_spread_levels, [
          dirty & 256 && get_spread_object(ctx2[22]),
          dirty & 16 && { ptk: ctx2[4] }
        ]) : {};
        abridge.$set(abridge_changes);
        if (!ctx2[7]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block25(ctx2);
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(excerptheading.$$.fragment, local);
        transition_in(abridge.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(excerptheading.$$.fragment, local);
        transition_out(abridge.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(excerptheading);
        destroy_component(abridge);
        if (if_block)
          if_block.d();
      }
    };
  }
  function create_fragment34(ctx) {
    let excerptbar;
    let updating_from;
    let t;
    let each_1_anchor;
    let current;
    function excerptbar_from_binding(value) {
      ctx[16](value);
    }
    let excerptbar_props = {
      caption: ctx[1],
      ptk: ctx[4],
      tofind: ctx[6],
      last: ctx[5],
      seq: ctx[3],
      chunk: ctx[7],
      action: ctx[2]
    };
    if (ctx[0] !== void 0) {
      excerptbar_props.from = ctx[0];
    }
    excerptbar = new excerptbar_default({ props: excerptbar_props });
    binding_callbacks.push(() => bind(excerptbar, "from", excerptbar_from_binding));
    let each_value = ctx[8];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block16(get_each_context16(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        create_component(excerptbar.$$.fragment);
        t = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        mount_component(excerptbar, target, anchor);
        insert(target, t, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        const excerptbar_changes = {};
        if (dirty & 2)
          excerptbar_changes.caption = ctx2[1];
        if (dirty & 16)
          excerptbar_changes.ptk = ctx2[4];
        if (dirty & 64)
          excerptbar_changes.tofind = ctx2[6];
        if (dirty & 32)
          excerptbar_changes.last = ctx2[5];
        if (dirty & 8)
          excerptbar_changes.seq = ctx2[3];
        if (dirty & 128)
          excerptbar_changes.chunk = ctx2[7];
        if (dirty & 4)
          excerptbar_changes.action = ctx2[2];
        if (!updating_from && dirty & 1) {
          updating_from = true;
          excerptbar_changes.from = ctx2[0];
          add_flush_callback(() => updating_from = false);
        }
        excerptbar.$set(excerptbar_changes);
        if (dirty & 920) {
          each_value = ctx2[8];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context16(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block16(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(excerptbar.$$.fragment, local);
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        transition_out(excerptbar.$$.fragment, local);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_component(excerptbar, detaching);
        if (detaching)
          detach(t);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance34($$self, $$props, $$invalidate) {
    let displayitems;
    let chunk;
    let { caption } = $$props;
    let { action } = $$props;
    let { name: name2 } = $$props;
    let { lines } = $$props;
    let { hits } = $$props;
    let { phraselength } = $$props;
    let { seq } = $$props;
    let { dividx } = $$props;
    let { ptk } = $$props;
    let { last } = $$props;
    let { tofind: tofind2 } = $$props;
    let { from } = $$props;
    let { samechunkline } = $$props;
    const LV = getContext("LV");
    let pfrom = from;
    async function load2() {
      await ptk.loadLines(lines);
      $$invalidate(8, displayitems = lines.map((line, idx2) => {
        const ck = ptk.getHeading(line);
        return {
          ck,
          line,
          text: ptk.getLine(line),
          hits: hits[idx2],
          phraselength: phraselength[idx2]
        };
      }));
    }
    const setFrom = () => {
      if (pfrom == from)
        return;
      LV.setFrom(dividx, from);
      pfrom = from;
    };
    const openChunk = (bkid, tagname, id) => {
      const address = makeElementId("bk", bkid) + "." + tagname + (parseInt(id) ? id : "#" + id);
      LV.insertAddress(address, seq);
    };
    function excerptbar_from_binding(value) {
      from = value;
      $$invalidate(0, from);
    }
    const click_handler = (item) => openChunk(item.ck.bkid, item.ck.tagname, item.ck.id);
    $$self.$$set = ($$props2) => {
      if ("caption" in $$props2)
        $$invalidate(1, caption = $$props2.caption);
      if ("action" in $$props2)
        $$invalidate(2, action = $$props2.action);
      if ("name" in $$props2)
        $$invalidate(10, name2 = $$props2.name);
      if ("lines" in $$props2)
        $$invalidate(11, lines = $$props2.lines);
      if ("hits" in $$props2)
        $$invalidate(12, hits = $$props2.hits);
      if ("phraselength" in $$props2)
        $$invalidate(13, phraselength = $$props2.phraselength);
      if ("seq" in $$props2)
        $$invalidate(3, seq = $$props2.seq);
      if ("dividx" in $$props2)
        $$invalidate(14, dividx = $$props2.dividx);
      if ("ptk" in $$props2)
        $$invalidate(4, ptk = $$props2.ptk);
      if ("last" in $$props2)
        $$invalidate(5, last = $$props2.last);
      if ("tofind" in $$props2)
        $$invalidate(6, tofind2 = $$props2.tofind);
      if ("from" in $$props2)
        $$invalidate(0, from = $$props2.from);
      if ("samechunkline" in $$props2)
        $$invalidate(15, samechunkline = $$props2.samechunkline);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 1024) {
        $:
          name2;
      }
      if ($$self.$$.dirty & 1) {
        $:
          setFrom(from);
      }
      if ($$self.$$.dirty & 2048) {
        $:
          load2(lines);
      }
      if ($$self.$$.dirty & 32784) {
        $:
          $$invalidate(7, chunk = samechunkline > -1 ? ptk.getHeading(samechunkline) : null);
      }
    };
    $:
      $$invalidate(8, displayitems = []);
    return [
      from,
      caption,
      action,
      seq,
      ptk,
      last,
      tofind2,
      chunk,
      displayitems,
      openChunk,
      name2,
      lines,
      hits,
      phraselength,
      dividx,
      samechunkline,
      excerptbar_from_binding,
      click_handler
    ];
  }
  var Excerpt = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance34, create_fragment34, safe_not_equal, {
        caption: 1,
        action: 2,
        name: 10,
        lines: 11,
        hits: 12,
        phraselength: 13,
        seq: 3,
        dividx: 14,
        ptk: 4,
        last: 5,
        tofind: 6,
        from: 0,
        samechunkline: 15
      });
    }
  };
  var excerpt_default = Excerpt;

  // src/ownerdraw/bmeresult.svelte
  function get_each_context17(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[17] = list[i];
    child_ctx[19] = i;
    return child_ctx;
  }
  function create_each_block17(ctx) {
    let t_value = ctx[19] ? " " : "";
    let t;
    let togglelink;
    let backref_1;
    let current;
    function func() {
      return ctx[13](ctx[19]);
    }
    togglelink = new togglelink_default({
      props: {
        onclick: func,
        clickable: ctx[11](ctx[19]),
        text: ctx[17]
      }
    });
    backref_1 = new backref_default({
      props: {
        togglebutton: true,
        name: ctx[4],
        backref: ctx[6],
        tagname: ctx[5],
        seq: ctx[1],
        ptk: ctx[0],
        keys: ctx[3],
        key: ctx[2][ctx[19]]
      }
    });
    return {
      c() {
        t = text(t_value);
        create_component(togglelink.$$.fragment);
        create_component(backref_1.$$.fragment);
      },
      m(target, anchor) {
        insert(target, t, anchor);
        mount_component(togglelink, target, anchor);
        mount_component(backref_1, target, anchor);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const togglelink_changes = {};
        if (dirty & 256)
          togglelink_changes.text = ctx[17];
        togglelink.$set(togglelink_changes);
        const backref_1_changes = {};
        if (dirty & 16)
          backref_1_changes.name = ctx[4];
        if (dirty & 64)
          backref_1_changes.backref = ctx[6];
        if (dirty & 32)
          backref_1_changes.tagname = ctx[5];
        if (dirty & 2)
          backref_1_changes.seq = ctx[1];
        if (dirty & 1)
          backref_1_changes.ptk = ctx[0];
        if (dirty & 8)
          backref_1_changes.keys = ctx[3];
        if (dirty & 4)
          backref_1_changes.key = ctx[2][ctx[19]];
        backref_1.$set(backref_1_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(togglelink.$$.fragment, local);
        transition_in(backref_1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(togglelink.$$.fragment, local);
        transition_out(backref_1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t);
        destroy_component(togglelink, detaching);
        destroy_component(backref_1, detaching);
      }
    };
  }
  function create_if_block26(ctx) {
    let span;
    let t0;
    let t1_value = ctx[2].length - ctx[7] + "";
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        t0 = text("+");
        t1 = text(t1_value);
        attr(span, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
        if (!mounted) {
          dispose = listen(span, "click", ctx[14]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 132 && t1_value !== (t1_value = ctx2[2].length - ctx2[7] + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment35(ctx) {
    let t;
    let if_block_anchor;
    let current;
    let each_value = ctx[8];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block17(get_each_context17(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    let if_block = ctx[7] < ctx[2].length && create_if_block26(ctx);
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, t, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 3455) {
          each_value = ctx2[8];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context17(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block17(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(t.parentNode, t);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (ctx2[7] < ctx2[2].length) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block26(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  var ITEMPERPAGE3 = 10;
  function instance35($$self, $$props, $$invalidate) {
    let showcount;
    let displayitems;
    const LV = getContext("LV");
    let { ptk } = $$props;
    let { seq } = $$props;
    let { items = [] } = $$props;
    let { lexicon } = $$props;
    let { tofind: tofind2 } = $$props;
    let { name: name2 } = $$props;
    let { tagname } = $$props;
    let { backref } = $$props;
    const getItems = () => {
      const out = [];
      for (let i = 0; i < showcount && i < items.length; i++) {
        out.push(lexicon.get(items[i]).replace(tofind2, '<span class="highlight">' + tofind2 + "</span>"));
      }
      return out;
    };
    const showmore = () => {
      $$invalidate(7, showcount += ITEMPERPAGE3);
    };
    const onclick = (idx2) => {
      const id = items[idx2];
      if (tagname == "*") {
        LV.insertAddress("*=" + lexicon.get(id), seq || 0);
      } else {
        LV.insertAddress(tagname + id, seq || 0);
      }
    };
    const isclickable = (idx2) => {
      if (!ptk)
        return;
      const id = items[idx2];
      if (tagname == "*")
        return true;
      return ptk.validId(tagname, id);
    };
    const func = (idx2) => onclick(idx2);
    const click_handler = () => showmore();
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("seq" in $$props2)
        $$invalidate(1, seq = $$props2.seq);
      if ("items" in $$props2)
        $$invalidate(2, items = $$props2.items);
      if ("lexicon" in $$props2)
        $$invalidate(3, lexicon = $$props2.lexicon);
      if ("tofind" in $$props2)
        $$invalidate(12, tofind2 = $$props2.tofind);
      if ("name" in $$props2)
        $$invalidate(4, name2 = $$props2.name);
      if ("tagname" in $$props2)
        $$invalidate(5, tagname = $$props2.tagname);
      if ("backref" in $$props2)
        $$invalidate(6, backref = $$props2.backref);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 4) {
        $:
          $$invalidate(7, showcount = items.length > ITEMPERPAGE3 ? ITEMPERPAGE3 : items.length);
      }
      if ($$self.$$.dirty & 128) {
        $:
          $$invalidate(8, displayitems = getItems(showcount));
      }
    };
    return [
      ptk,
      seq,
      items,
      lexicon,
      name2,
      tagname,
      backref,
      showcount,
      displayitems,
      showmore,
      onclick,
      isclickable,
      tofind2,
      func,
      click_handler
    ];
  }
  var Bmeresult = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance35, create_fragment35, safe_not_equal, {
        ptk: 0,
        seq: 1,
        items: 2,
        lexicon: 3,
        tofind: 12,
        name: 4,
        tagname: 5,
        backref: 6
      });
    }
  };
  var bmeresult_default = Bmeresult;

  // src/ownerdraw/queryresult.svelte
  function create_fragment36(ctx) {
    let t0_value = ctx[5].name + "";
    let t0;
    let span;
    let t1;
    let t2;
    let t3_value = ctx[6].length + "";
    let t3;
    let t4;
    let bmeresult;
    let current;
    bmeresult = new bmeresult_default({
      props: {
        seq: ctx[9],
        backref: ctx[8],
        items: ctx[6],
        name: ctx[2],
        tagname: ctx[4],
        lexicon: ctx[7],
        ptk: ctx[5],
        tofind: ctx[1],
        foreign: ctx[3]
      }
    });
    return {
      c() {
        t0 = text(t0_value);
        span = element("span");
        t1 = text(ctx[0]);
        t2 = text("(");
        t3 = text(t3_value);
        t4 = text(")");
        create_component(bmeresult.$$.fragment);
        attr(span, "class", "field");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, span, anchor);
        append(span, t1);
        insert(target, t2, anchor);
        insert(target, t3, anchor);
        insert(target, t4, anchor);
        mount_component(bmeresult, target, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if ((!current || dirty & 32) && t0_value !== (t0_value = ctx2[5].name + ""))
          set_data(t0, t0_value);
        if (!current || dirty & 1)
          set_data(t1, ctx2[0]);
        if ((!current || dirty & 64) && t3_value !== (t3_value = ctx2[6].length + ""))
          set_data(t3, t3_value);
        const bmeresult_changes = {};
        if (dirty & 512)
          bmeresult_changes.seq = ctx2[9];
        if (dirty & 256)
          bmeresult_changes.backref = ctx2[8];
        if (dirty & 64)
          bmeresult_changes.items = ctx2[6];
        if (dirty & 4)
          bmeresult_changes.name = ctx2[2];
        if (dirty & 16)
          bmeresult_changes.tagname = ctx2[4];
        if (dirty & 128)
          bmeresult_changes.lexicon = ctx2[7];
        if (dirty & 32)
          bmeresult_changes.ptk = ctx2[5];
        if (dirty & 2)
          bmeresult_changes.tofind = ctx2[1];
        if (dirty & 8)
          bmeresult_changes.foreign = ctx2[3];
        bmeresult.$set(bmeresult_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(bmeresult.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(bmeresult.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(span);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(t4);
        destroy_component(bmeresult, detaching);
      }
    };
  }
  function instance36($$self, $$props, $$invalidate) {
    let { caption } = $$props;
    let { tofind: tofind2 } = $$props;
    let { name: name2 } = $$props;
    let { foreign } = $$props;
    let { tagname } = $$props;
    let { ptk } = $$props;
    let { items = [] } = $$props;
    let { lexicon } = $$props;
    let { backref } = $$props;
    let { seq } = $$props;
    $$self.$$set = ($$props2) => {
      if ("caption" in $$props2)
        $$invalidate(0, caption = $$props2.caption);
      if ("tofind" in $$props2)
        $$invalidate(1, tofind2 = $$props2.tofind);
      if ("name" in $$props2)
        $$invalidate(2, name2 = $$props2.name);
      if ("foreign" in $$props2)
        $$invalidate(3, foreign = $$props2.foreign);
      if ("tagname" in $$props2)
        $$invalidate(4, tagname = $$props2.tagname);
      if ("ptk" in $$props2)
        $$invalidate(5, ptk = $$props2.ptk);
      if ("items" in $$props2)
        $$invalidate(6, items = $$props2.items);
      if ("lexicon" in $$props2)
        $$invalidate(7, lexicon = $$props2.lexicon);
      if ("backref" in $$props2)
        $$invalidate(8, backref = $$props2.backref);
      if ("seq" in $$props2)
        $$invalidate(9, seq = $$props2.seq);
    };
    return [caption, tofind2, name2, foreign, tagname, ptk, items, lexicon, backref, seq];
  }
  var Queryresult = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance36, create_fragment36, safe_not_equal, {
        caption: 0,
        tofind: 1,
        name: 2,
        foreign: 3,
        tagname: 4,
        ptk: 5,
        items: 6,
        lexicon: 7,
        backref: 8,
        seq: 9
      });
    }
  };
  var queryresult_default = Queryresult;

  // src/ownerdraw/titlecount.svelte
  function get_each_context18(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[18] = list[i];
    child_ctx[20] = i;
    return child_ctx;
  }
  function create_if_block27(ctx) {
    let span;
    let t_value = "\u3000" + ctx[18].count;
    let t;
    let mounted;
    let dispose;
    function click_handler_1() {
      return ctx[14](ctx[18]);
    }
    return {
      c() {
        span = element("span");
        t = text(t_value);
        attr(span, "class", "clickable hitcount");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
        if (!mounted) {
          dispose = listen(span, "click", click_handler_1);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 16 && t_value !== (t_value = "\u3000" + ctx[18].count))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block18(ctx) {
    let div;
    let t0_value = ctx[18].id + "";
    let t0;
    let t1;
    let span;
    let t2_value = _(ctx[18].title, ctx[5]?.lang) + "";
    let t2;
    let span_class_value;
    let t3;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[13](ctx[18]);
    }
    let if_block = ctx[18].count >= 0 && create_if_block27(ctx);
    return {
      c() {
        div = element("div");
        t0 = text(t0_value);
        t1 = text(".");
        span = element("span");
        t2 = text(t2_value);
        t3 = space();
        if (if_block)
          if_block.c();
        attr(span, "class", span_class_value = "clickable " + textClasses(ctx[5]));
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t0);
        append(div, t1);
        append(div, span);
        append(span, t2);
        append(div, t3);
        if (if_block)
          if_block.m(div, null);
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 16 && t0_value !== (t0_value = ctx[18].id + ""))
          set_data(t0, t0_value);
        if (dirty & 48 && t2_value !== (t2_value = _(ctx[18].title, ctx[5]?.lang) + ""))
          set_data(t2, t2_value);
        if (dirty & 32 && span_class_value !== (span_class_value = "clickable " + textClasses(ctx[5]))) {
          attr(span, "class", span_class_value);
        }
        if (ctx[18].count >= 0) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block27(ctx);
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if (if_block)
          if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment37(ctx) {
    let excerptbar;
    let updating_from;
    let t;
    let each_1_anchor;
    let current;
    function excerptbar_from_binding(value) {
      ctx[12](value);
    }
    let excerptbar_props = {
      caption: ctx[1],
      ptk: ctx[5],
      tofind: ctx[3],
      last: ctx[6],
      hitcount: ctx[7],
      name: ctx[2]
    };
    if (ctx[0] !== void 0) {
      excerptbar_props.from = ctx[0];
    }
    excerptbar = new excerptbar_default({ props: excerptbar_props });
    binding_callbacks.push(() => bind(excerptbar, "from", excerptbar_from_binding));
    let each_value = ctx[4];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block18(get_each_context18(ctx, each_value, i));
    }
    return {
      c() {
        create_component(excerptbar.$$.fragment);
        t = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        mount_component(excerptbar, target, anchor);
        insert(target, t, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        const excerptbar_changes = {};
        if (dirty & 2)
          excerptbar_changes.caption = ctx2[1];
        if (dirty & 32)
          excerptbar_changes.ptk = ctx2[5];
        if (dirty & 8)
          excerptbar_changes.tofind = ctx2[3];
        if (dirty & 64)
          excerptbar_changes.last = ctx2[6];
        if (dirty & 128)
          excerptbar_changes.hitcount = ctx2[7];
        if (dirty & 4)
          excerptbar_changes.name = ctx2[2];
        if (!updating_from && dirty & 1) {
          updating_from = true;
          excerptbar_changes.from = ctx2[0];
          add_flush_callback(() => updating_from = false);
        }
        excerptbar.$set(excerptbar_changes);
        if (dirty & 816) {
          each_value = ctx2[4];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context18(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block18(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(excerptbar.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(excerptbar.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(excerptbar, detaching);
        if (detaching)
          detach(t);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance37($$self, $$props, $$invalidate) {
    let { caption } = $$props;
    let { name: name2 } = $$props;
    let { tofind: tofind2 } = $$props;
    let { items } = $$props;
    let { seq } = $$props;
    let { dividx } = $$props;
    let { ptk } = $$props;
    let { last } = $$props;
    let { from } = $$props;
    let { hitcount } = $$props;
    const LV = getContext("LV");
    let pfrom = from;
    const setFrom = () => {
      if (pfrom == from)
        return;
      LV.setFrom(dividx, from);
      pfrom = from;
    };
    const newdivision = (address) => {
      LV.insertAddress(ptk.name + ":" + address, seq);
    };
    const newexcerpt = (chunk) => {
      const address = makeExcerptAddress(ptk.name, name2.slice(1), tofind2, "ck" + chunk);
      LV.insertAddress(address, seq);
    };
    function excerptbar_from_binding(value) {
      from = value;
      $$invalidate(0, from);
    }
    const click_handler = (item) => newdivision(item.address);
    const click_handler_1 = (item) => newexcerpt(item.id);
    $$self.$$set = ($$props2) => {
      if ("caption" in $$props2)
        $$invalidate(1, caption = $$props2.caption);
      if ("name" in $$props2)
        $$invalidate(2, name2 = $$props2.name);
      if ("tofind" in $$props2)
        $$invalidate(3, tofind2 = $$props2.tofind);
      if ("items" in $$props2)
        $$invalidate(4, items = $$props2.items);
      if ("seq" in $$props2)
        $$invalidate(10, seq = $$props2.seq);
      if ("dividx" in $$props2)
        $$invalidate(11, dividx = $$props2.dividx);
      if ("ptk" in $$props2)
        $$invalidate(5, ptk = $$props2.ptk);
      if ("last" in $$props2)
        $$invalidate(6, last = $$props2.last);
      if ("from" in $$props2)
        $$invalidate(0, from = $$props2.from);
      if ("hitcount" in $$props2)
        $$invalidate(7, hitcount = $$props2.hitcount);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 4) {
        $:
          name2;
      }
      if ($$self.$$.dirty & 1) {
        $:
          setFrom(from);
      }
    };
    return [
      from,
      caption,
      name2,
      tofind2,
      items,
      ptk,
      last,
      hitcount,
      newdivision,
      newexcerpt,
      seq,
      dividx,
      excerptbar_from_binding,
      click_handler,
      click_handler_1
    ];
  }
  var Titlecount = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance37, create_fragment37, safe_not_equal, {
        caption: 1,
        name: 2,
        tofind: 3,
        items: 4,
        seq: 10,
        dividx: 11,
        ptk: 5,
        last: 6,
        from: 0,
        hitcount: 7
      });
    }
  };
  var titlecount_default = Titlecount;

  // src/ownerdraw/systeminfo.svelte
  function create_fragment38(ctx) {
    let t;
    return {
      c() {
        t = text("SystemInfoxxxx");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  var Systeminfo = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment38, safe_not_equal, {});
    }
  };
  var systeminfo_default = Systeminfo;

  // src/comps/statebutton.svelte
  function create_fragment39(ctx) {
    let span1;
    let span0;
    let raw_value = ctx[4](ctx[1], ctx[0]) + "";
    let mounted;
    let dispose;
    return {
      c() {
        span1 = element("span");
        span0 = element("span");
        attr(span1, "class", "statebutton");
        attr(span1, "title", ctx[3]);
        toggle_class(span1, "disabled", ctx[2]);
        toggle_class(span1, "unselected", ctx[0] == -1);
      },
      m(target, anchor) {
        insert(target, span1, anchor);
        append(span1, span0);
        span0.innerHTML = raw_value;
        if (!mounted) {
          dispose = listen(span1, "click", ctx[5]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 3 && raw_value !== (raw_value = ctx2[4](ctx2[1], ctx2[0]) + ""))
          span0.innerHTML = raw_value;
        ;
        if (dirty & 8) {
          attr(span1, "title", ctx2[3]);
        }
        if (dirty & 4) {
          toggle_class(span1, "disabled", ctx2[2]);
        }
        if (dirty & 1) {
          toggle_class(span1, "unselected", ctx2[0] == -1);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span1);
        mounted = false;
        dispose();
      }
    };
  }
  function instance38($$self, $$props, $$invalidate) {
    let { onclick = null } = $$props;
    let { disabled = false } = $$props;
    let { title = "" } = $$props;
    let { states = {} } = $$props;
    let { storeid = null } = $$props;
    let { styles = null } = $$props;
    let { caption = "" } = $$props;
    let unselectedcaption = caption;
    let { unselectable = false } = $$props;
    const statekeys = Object.keys(states);
    let { selectedIndex = storeid && statekeys.indexOf(get_store_value(storeid).toString()) || -1 } = $$props;
    if (selectedIndex == -1 && !unselectable) {
      selectedIndex = 0;
      if (storeid && get_store_value(storeid).toString() !== statekeys[selectedIndex])
        storeid.set(statekeys[selectedIndex]);
    }
    const setcaption = () => {
      if (storeid)
        $$invalidate(1, caption = states[get_store_value(storeid)]);
      else
        $$invalidate(1, caption = selectedIndex == -1 ? unselectedcaption : statekeys[selectedIndex]);
    };
    const highlight = (str, selectedIndex2) => {
      if (!styles)
        return str;
      return str.replace(/\$(\w+)/g, (m4, m1) => {
        if (typeof styles[m1] == "string") {
          return styles[m1];
        } else if (typeof styles == "function") {
          return styles(m1);
        } else {
          return get_store_value(styles[m1]) || "auto";
        }
      });
    };
    const click = (evt) => {
      if (disabled)
        return;
      $$invalidate(0, selectedIndex++, selectedIndex);
      if (selectedIndex >= statekeys.length) {
        if (unselectable) {
          if (selectedIndex == -1)
            $$invalidate(0, selectedIndex = 0);
          else
            $$invalidate(0, selectedIndex = -1);
        } else
          $$invalidate(0, selectedIndex = 0);
      }
      if (storeid)
        storeid.set(statekeys[selectedIndex]);
      onclick && onclick(selectedIndex);
    };
    onMount(() => setcaption());
    $$self.$$set = ($$props2) => {
      if ("onclick" in $$props2)
        $$invalidate(6, onclick = $$props2.onclick);
      if ("disabled" in $$props2)
        $$invalidate(2, disabled = $$props2.disabled);
      if ("title" in $$props2)
        $$invalidate(3, title = $$props2.title);
      if ("states" in $$props2)
        $$invalidate(7, states = $$props2.states);
      if ("storeid" in $$props2)
        $$invalidate(8, storeid = $$props2.storeid);
      if ("styles" in $$props2)
        $$invalidate(9, styles = $$props2.styles);
      if ("caption" in $$props2)
        $$invalidate(1, caption = $$props2.caption);
      if ("unselectable" in $$props2)
        $$invalidate(10, unselectable = $$props2.unselectable);
      if ("selectedIndex" in $$props2)
        $$invalidate(0, selectedIndex = $$props2.selectedIndex);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 1) {
        $:
          setcaption(selectedIndex);
      }
    };
    return [
      selectedIndex,
      caption,
      disabled,
      title,
      highlight,
      click,
      onclick,
      states,
      storeid,
      styles,
      unselectable
    ];
  }
  var Statebutton = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance38, create_fragment39, safe_not_equal, {
        onclick: 6,
        disabled: 2,
        title: 3,
        states: 7,
        storeid: 8,
        styles: 9,
        caption: 1,
        unselectable: 10,
        selectedIndex: 0
      });
    }
  };
  var statebutton_default = Statebutton;

  // src/ownerdraw/versioninfo.svelte
  function get_each_context19(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[1] = list[i];
    child_ctx[3] = i;
    return child_ctx;
  }
  function get_each_context_12(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[4] = list[i];
    return child_ctx;
  }
  function create_each_block_12(ctx) {
    let div;
    let inlinetext;
    let t;
    let current;
    inlinetext = new inlinetext_default({
      props: {
        text: ctx[4],
        ptk: ctx[1].ptk
      }
    });
    return {
      c() {
        div = element("div");
        create_component(inlinetext.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(inlinetext, div, null);
        insert(target, t, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const inlinetext_changes = {};
        if (dirty & 1)
          inlinetext_changes.text = ctx2[4];
        if (dirty & 1)
          inlinetext_changes.ptk = ctx2[1].ptk;
        inlinetext.$set(inlinetext_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(inlinetext);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block19(ctx) {
    let div1;
    let span0;
    let t0_value = ctx[1].ptk.humanName(true) + "";
    let t0;
    let t1;
    let span1;
    let t2_value = _("\u4EE3\u865F:") + "";
    let t2;
    let t3_value = ctx[1].name + "";
    let t3;
    let t4;
    let span2;
    let t5_value = _("\u5EFA\u7F6E:") + "";
    let t5;
    let t6_value = ctx[1].buildtime.toLocaleDateString() + "";
    let t6;
    let t7;
    let span3;
    let t8_value = _("\u884C\u6578:") + "";
    let t8;
    let t9_value = ctx[1].eot + "";
    let t9;
    let t10;
    let span4;
    let t11;
    let div0;
    let t12;
    let current;
    let each_value_1 = ctx[1].verTexts;
    let each_blocks = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_1, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        div1 = element("div");
        span0 = element("span");
        t0 = text(t0_value);
        t1 = space();
        span1 = element("span");
        t2 = text(t2_value);
        t3 = text(t3_value);
        t4 = space();
        span2 = element("span");
        t5 = text(t5_value);
        t6 = text(t6_value);
        t7 = space();
        span3 = element("span");
        t8 = text(t8_value);
        t9 = text(t9_value);
        t10 = space();
        span4 = element("span");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t11 = space();
        div0 = element("div");
        t12 = space();
        attr(span0, "class", "excerptheading");
        attr(div0, "class", "divider");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, span0);
        append(span0, t0);
        append(div1, t1);
        append(div1, span1);
        append(span1, t2);
        append(span1, t3);
        append(div1, t4);
        append(div1, span2);
        append(span2, t5);
        append(span2, t6);
        append(div1, t7);
        append(div1, span3);
        append(span3, t8);
        append(span3, t9);
        append(div1, t10);
        append(div1, span4);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(span4, null);
        }
        append(div1, t11);
        append(div1, div0);
        append(div1, t12);
        current = true;
      },
      p(ctx2, dirty) {
        if ((!current || dirty & 1) && t0_value !== (t0_value = ctx2[1].ptk.humanName(true) + ""))
          set_data(t0, t0_value);
        if ((!current || dirty & 1) && t3_value !== (t3_value = ctx2[1].name + ""))
          set_data(t3, t3_value);
        if ((!current || dirty & 1) && t6_value !== (t6_value = ctx2[1].buildtime.toLocaleDateString() + ""))
          set_data(t6, t6_value);
        if ((!current || dirty & 1) && t9_value !== (t9_value = ctx2[1].eot + ""))
          set_data(t9, t9_value);
        if (dirty & 1) {
          each_value_1 = ctx2[1].verTexts;
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_12(ctx2, each_value_1, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block_12(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(span4, null);
            }
          }
          group_outros();
          for (i = each_value_1.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value_1.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div1);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_fragment40(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[0];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block19(get_each_context19(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 1) {
          each_value = ctx2[0];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context19(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block19(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance39($$self, $$props, $$invalidate) {
    let $pitakas;
    component_subscribe($$self, pitakas, ($$value) => $$invalidate(0, $pitakas = $$value));
    return [$pitakas];
  }
  var Versioninfo = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance39, create_fragment40, safe_not_equal, {});
    }
  };
  var versioninfo_default = Versioninfo;

  // src/ownerdraw/setting.svelte
  function create_if_block28(ctx) {
    let t0_value = _("Pali:") + "";
    let t0;
    let t1;
    let statebtn;
    let current;
    statebtn = new statebutton_default({
      props: {
        states: {
          "": _("\u6AA2\u7D04 Provident"),
          "iast": _("\u7F85\u99AC Roman"),
          "my": _("\u7DEC \u1017\u1019\u102C\u1005\u102C"),
          "th": _("\u6CF0 \u0E44\u0E17\u0E22"),
          "lo": _("\u5BEE \u0EA5\u0EB2\u0EA7"),
          "km": _("\u67EC \u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A"),
          "hi": _("\u5929\u57CE \u0939\u093F\u0928\u094D\u0926\u0940"),
          "si": _("\u50E7\u4F3D\u7F85 \u0DC3\u0DD2\u0D82\u0DC4\u0DBD"),
          "tb": "\u85CF \u0F56\u0F7C\u0F51\u0F0B\u0F66\u0F90\u0F51\u0F0D"
        },
        storeid: palitrans
      }
    });
    return {
      c() {
        t0 = text(t0_value);
        t1 = space();
        create_component(statebtn.$$.fragment);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        mount_component(statebtn, target, anchor);
        current = true;
      },
      p: noop,
      i(local) {
        if (current)
          return;
        transition_in(statebtn.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(statebtn.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        destroy_component(statebtn, detaching);
      }
    };
  }
  function create_fragment41(ctx) {
    let statebtn0;
    let t0;
    let statebtn1;
    let t1;
    let show_if = hasLang("pp");
    let t2;
    let div0;
    let versioninfo;
    let t3;
    let div1;
    let t5;
    let hr;
    let current;
    statebtn0 = new statebutton_default({
      props: {
        states: {
          80: "\u5C0F\u5B57",
          100: "\u6B63\u5E38\u5927\u5C0F",
          125: "\u5927\u5B57",
          150: "\u66F4\u5927\u5B57",
          180: "\u7279\u5927\u5B57"
        },
        storeid: fontsize
      }
    });
    statebtn1 = new statebutton_default({
      props: {
        states: { 0: "\u539F\u6587", 1: "\u7B80\u9AD4", 2: "\u7B80\u4F53" },
        storeid: tosim
      }
    });
    let if_block = show_if && create_if_block28(ctx);
    versioninfo = new versioninfo_default({});
    return {
      c() {
        create_component(statebtn0.$$.fragment);
        t0 = space();
        create_component(statebtn1.$$.fragment);
        t1 = space();
        if (if_block)
          if_block.c();
        t2 = space();
        div0 = element("div");
        create_component(versioninfo.$$.fragment);
        t3 = space();
        div1 = element("div");
        div1.textContent = "Accelon2023.1.13";
        t5 = space();
        hr = element("hr");
        attr(div1, "class", "logo svelte-1yzj5q6");
      },
      m(target, anchor) {
        mount_component(statebtn0, target, anchor);
        insert(target, t0, anchor);
        mount_component(statebtn1, target, anchor);
        insert(target, t1, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t2, anchor);
        insert(target, div0, anchor);
        mount_component(versioninfo, div0, null);
        insert(target, t3, anchor);
        insert(target, div1, anchor);
        insert(target, t5, anchor);
        insert(target, hr, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (show_if)
          if_block.p(ctx2, dirty);
      },
      i(local) {
        if (current)
          return;
        transition_in(statebtn0.$$.fragment, local);
        transition_in(statebtn1.$$.fragment, local);
        transition_in(if_block);
        transition_in(versioninfo.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(statebtn0.$$.fragment, local);
        transition_out(statebtn1.$$.fragment, local);
        transition_out(if_block);
        transition_out(versioninfo.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(statebtn0, detaching);
        if (detaching)
          detach(t0);
        destroy_component(statebtn1, detaching);
        if (detaching)
          detach(t1);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(div0);
        destroy_component(versioninfo);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(div1);
        if (detaching)
          detach(t5);
        if (detaching)
          detach(hr);
      }
    };
  }
  var Setting = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment41, safe_not_equal, {});
    }
  };
  var setting_default = Setting;

  // src/ownerdraw/unknown.svelte
  function create_fragment42(ctx) {
    let t;
    return {
      c() {
        t = text("unknown onwerdraw");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  var Unknown = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment42, safe_not_equal, {});
    }
  };
  var unknown_default = Unknown;

  // src/comps/statebuttons.svelte
  function get_each_context20(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[7] = list[i];
    return child_ctx;
  }
  function create_each_block20(ctx) {
    let statebutton;
    let current;
    function func(...args) {
      return ctx[6](ctx[7], ...args);
    }
    const statebutton_spread_levels = [
      ctx[7],
      {
        selectedIndex: ctx[4](ctx[7].prefix)
      },
      { unselectable: ctx[1] },
      { onclick: func }
    ];
    let statebutton_props = {};
    for (let i = 0; i < statebutton_spread_levels.length; i += 1) {
      statebutton_props = assign(statebutton_props, statebutton_spread_levels[i]);
    }
    statebutton = new statebutton_default({ props: statebutton_props });
    return {
      c() {
        create_component(statebutton.$$.fragment);
      },
      m(target, anchor) {
        mount_component(statebutton, target, anchor);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const statebutton_changes = dirty & 27 ? get_spread_update(statebutton_spread_levels, [
          dirty & 1 && get_spread_object(ctx[7]),
          dirty & 17 && {
            selectedIndex: ctx[4](ctx[7].prefix)
          },
          dirty & 2 && { unselectable: ctx[1] },
          dirty & 9 && { onclick: func }
        ]) : {};
        statebutton.$set(statebutton_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(statebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(statebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(statebutton, detaching);
      }
    };
  }
  function create_key_block5(ctx) {
    let each_1_anchor;
    let current;
    let each_value = ctx[0];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block20(get_each_context20(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 27) {
          each_value = ctx2[0];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context20(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block20(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function create_fragment43(ctx) {
    let previous_key = ctx[2];
    let key_block_anchor;
    let current;
    let key_block = create_key_block5(ctx);
    return {
      c() {
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 4 && safe_not_equal(previous_key, previous_key = ctx2[2])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block5(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
      }
    };
  }
  function instance40($$self, $$props, $$invalidate) {
    let { items = [] } = $$props;
    let { choices = [] } = $$props;
    let { unselectable = false } = $$props;
    let { refresh = 0 } = $$props;
    const choose = (prefix, selectedIndex) => {
      const toadd = prefix + selectedIndex;
      $$invalidate(5, choices = choices.filter((it) => !it.startsWith(prefix)));
      if (selectedIndex !== -1) {
        choices.push(toadd);
      }
    };
    const getSelected = (prefix) => {
      let at = -1;
      for (let i = 0; i < choices.length; i++) {
        if (choices[i].startsWith(prefix))
          at = i;
      }
      return at;
    };
    const func = (item, n) => choose(item.prefix, n);
    $$self.$$set = ($$props2) => {
      if ("items" in $$props2)
        $$invalidate(0, items = $$props2.items);
      if ("choices" in $$props2)
        $$invalidate(5, choices = $$props2.choices);
      if ("unselectable" in $$props2)
        $$invalidate(1, unselectable = $$props2.unselectable);
      if ("refresh" in $$props2)
        $$invalidate(2, refresh = $$props2.refresh);
    };
    return [items, unselectable, refresh, choose, getSelected, choices, func];
  }
  var Statebuttons = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance40, create_fragment43, safe_not_equal, {
        items: 0,
        choices: 5,
        unselectable: 1,
        refresh: 2
      });
    }
  };
  var statebuttons_default = Statebuttons;

  // src/comps/groupstatlink.svelte
  function create_fragment44(ctx) {
    let span1;
    let t0_value = " " + ctx[0];
    let t0;
    let span0;
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        span1 = element("span");
        t0 = text(t0_value);
        span0 = element("span");
        t1 = text(ctx[1]);
        attr(span0, "class", "hitcount");
        attr(span1, "class", "clickable");
      },
      m(target, anchor) {
        insert(target, span1, anchor);
        append(span1, t0);
        append(span1, span0);
        append(span0, t1);
        if (!mounted) {
          dispose = listen(span1, "click", ctx[4]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 1 && t0_value !== (t0_value = " " + ctx2[0]))
          set_data(t0, t0_value);
        if (dirty & 2)
          set_data(t1, ctx2[1]);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span1);
        mounted = false;
        dispose();
      }
    };
  }
  function instance41($$self, $$props, $$invalidate) {
    let { caption } = $$props;
    let { count } = $$props;
    let { idx: idx2 } = $$props;
    let { onclick } = $$props;
    const click_handler = () => onclick(idx2);
    $$self.$$set = ($$props2) => {
      if ("caption" in $$props2)
        $$invalidate(0, caption = $$props2.caption);
      if ("count" in $$props2)
        $$invalidate(1, count = $$props2.count);
      if ("idx" in $$props2)
        $$invalidate(2, idx2 = $$props2.idx);
      if ("onclick" in $$props2)
        $$invalidate(3, onclick = $$props2.onclick);
    };
    return [caption, count, idx2, onclick, click_handler];
  }
  var Groupstatlink = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance41, create_fragment44, safe_not_equal, { caption: 0, count: 1, idx: 2, onclick: 3 });
    }
  };
  var groupstatlink_default = Groupstatlink;

  // src/ownerdraw/guidefilter.svelte
  function get_each_context21(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[20] = list[i];
    child_ctx[21] = list;
    child_ctx[22] = i;
    return child_ctx;
  }
  function create_if_block_25(ctx) {
    let br;
    return {
      c() {
        br = element("br");
      },
      m(target, anchor) {
        insert(target, br, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(br);
      }
    };
  }
  function create_each_block21(ctx) {
    let span;
    let t0_value = ctx[20].caption + "";
    let t0;
    let t1;
    let statebuttons;
    let updating_choices;
    let t2;
    let if_block_anchor;
    let current;
    let mounted;
    let dispose;
    function click_handler() {
      return ctx[13](ctx[20]);
    }
    function statebuttons_choices_binding(value) {
      ctx[14](value, ctx[20]);
    }
    let statebuttons_props = {
      unselectable: true,
      refresh: ctx[5],
      items: ctx[20].states
    };
    if (ctx[2][ctx[20].name] !== void 0) {
      statebuttons_props.choices = ctx[2][ctx[20].name];
    }
    statebuttons = new statebuttons_default({ props: statebuttons_props });
    binding_callbacks.push(() => bind(statebuttons, "choices", statebuttons_choices_binding));
    let if_block = ctx[20].newline && create_if_block_25(ctx);
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = space();
        create_component(statebuttons.$$.fragment);
        t2 = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(span, "class", "guidegroup closelink clickable");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        insert(target, t1, anchor);
        mount_component(statebuttons, target, anchor);
        insert(target, t2, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = listen(span, "click", click_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const statebuttons_changes = {};
        if (dirty & 32)
          statebuttons_changes.refresh = ctx[5];
        if (!updating_choices && dirty & 132) {
          updating_choices = true;
          statebuttons_changes.choices = ctx[2][ctx[20].name];
          add_flush_callback(() => updating_choices = false);
        }
        statebuttons.$set(statebuttons_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(statebuttons.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(statebuttons.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t1);
        destroy_component(statebuttons, detaching);
        if (detaching)
          detach(t2);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_112(ctx) {
    let t;
    return {
      c() {
        t = text("\u627E\u4E0D\u5230");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block29(ctx) {
    let span;
    let t0_value = ctx[6].length + "";
    let t0;
    let t1_value = ctx[4].attrs.caption + "";
    let t1;
    let t2;
    let statebutton;
    let updating_selectedIndex;
    let t3;
    let morelink;
    let current;
    let mounted;
    let dispose;
    function statebutton_selectedIndex_binding(value) {
      ctx[16](value);
    }
    let statebutton_props = { states: ctx[8] };
    if (ctx[1] !== void 0) {
      statebutton_props.selectedIndex = ctx[1];
    }
    statebutton = new statebutton_default({ props: statebutton_props });
    binding_callbacks.push(() => bind(statebutton, "selectedIndex", statebutton_selectedIndex_binding));
    morelink = new morelink_default({
      props: {
        ptk: ctx[0],
        items: ctx[3],
        onclick: ctx[11],
        itemRenderer: groupstatlink_default
      }
    });
    return {
      c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = text(t1_value);
        t2 = space();
        create_component(statebutton.$$.fragment);
        t3 = space();
        create_component(morelink.$$.fragment);
        attr(span, "class", "clickable hitcount");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
        insert(target, t2, anchor);
        mount_component(statebutton, target, anchor);
        insert(target, t3, anchor);
        mount_component(morelink, target, anchor);
        current = true;
        if (!mounted) {
          dispose = listen(span, "click", ctx[15]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if ((!current || dirty & 64) && t0_value !== (t0_value = ctx2[6].length + ""))
          set_data(t0, t0_value);
        if ((!current || dirty & 16) && t1_value !== (t1_value = ctx2[4].attrs.caption + ""))
          set_data(t1, t1_value);
        const statebutton_changes = {};
        if (!updating_selectedIndex && dirty & 2) {
          updating_selectedIndex = true;
          statebutton_changes.selectedIndex = ctx2[1];
          add_flush_callback(() => updating_selectedIndex = false);
        }
        statebutton.$set(statebutton_changes);
        const morelink_changes = {};
        if (dirty & 1)
          morelink_changes.ptk = ctx2[0];
        if (dirty & 8)
          morelink_changes.items = ctx2[3];
        morelink.$set(morelink_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(statebutton.$$.fragment, local);
        transition_in(morelink.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(statebutton.$$.fragment, local);
        transition_out(morelink.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(span);
        if (detaching)
          detach(t2);
        destroy_component(statebutton, detaching);
        if (detaching)
          detach(t3);
        destroy_component(morelink, detaching);
        mounted = false;
        dispose();
      }
    };
  }
  function create_key_block6(ctx) {
    let br;
    let t;
    let show_if;
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block29, create_if_block_112];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[6].length)
        return 0;
      if (show_if == null)
        show_if = !!ctx2[9]();
      if (show_if)
        return 1;
      return -1;
    }
    if (~(current_block_type_index = select_block_type(ctx, -1))) {
      if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    return {
      c() {
        br = element("br");
        t = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        insert(target, br, anchor);
        insert(target, t, anchor);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(target, anchor);
        }
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if (~current_block_type_index) {
            if_blocks[current_block_type_index].p(ctx2, dirty);
          }
        } else {
          if (if_block) {
            group_outros();
            transition_out(if_blocks[previous_block_index], 1, 1, () => {
              if_blocks[previous_block_index] = null;
            });
            check_outros();
          }
          if (~current_block_type_index) {
            if_block = if_blocks[current_block_type_index];
            if (!if_block) {
              if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
              if_block.c();
            } else {
              if_block.p(ctx2, dirty);
            }
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          } else {
            if_block = null;
          }
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(br);
        if (detaching)
          detach(t);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d(detaching);
        }
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_fragment45(ctx) {
    let t;
    let previous_key = ctx[6];
    let key_block_anchor;
    let current;
    let each_value = ctx[7];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block21(get_each_context21(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    let key_block = create_key_block6(ctx);
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t = space();
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, t, anchor);
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 1188) {
          each_value = ctx2[7];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context21(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block21(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(t.parentNode, t);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (dirty & 64 && safe_not_equal(previous_key, previous_key = ctx2[6])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block6(ctx2);
          key_block.c();
          transition_in(key_block, 1);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(key_block);
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t);
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
      }
    };
  }
  function instance42($$self, $$props, $$invalidate) {
    let groups;
    let items;
    let { ptk, seq } = $$props;
    const LV = getContext("LV");
    const filters = ptk.template.getMultiStateFilters();
    let groupby = 0, groupitems = [], mastertag, choices = {};
    const groupstates = ptk.template.groupStates("statebutton");
    const update2 = () => {
      const col = ptk.columns[ptk.template.filterColumn];
      const obj = ptk.template.runFilter(ptk, col, { choices, groupby });
      $$invalidate(6, items = obj.items);
      groups = obj.groups;
      $$invalidate(4, mastertag = obj.mastertag);
      $$invalidate(3, groupitems = groups.map((it, idx2) => {
        return {
          idx: idx2,
          caption: it[0],
          count: it[1],
          groupfilter: it[2]
        };
      }));
    };
    for (let i = 0; i < filters.length; i++) {
      choices[filters[i].name] = [];
    }
    let refresh = 1;
    const choicecount = () => {
      let count = 0;
      for (let field in choices) {
        count += choices[field].length;
      }
      return count;
    };
    const reset = (name2) => {
      $$invalidate(2, choices[name2] = [], choices);
      $$invalidate(2, choices);
      $$invalidate(5, refresh++, refresh);
    };
    const list = (idx2 = -1) => {
      let gitem;
      if (idx2 > -1) {
        gitem = groupitems[idx2];
      }
      const action = ptk.template.stringifyChoice(choices, groupby, gitem?.groupfilter);
      LV.insertAddress(GUIDEACTIONPREFIX + action, seq);
    };
    const click_handler = (filter) => reset(filter.name);
    function statebuttons_choices_binding(value, filter) {
      if ($$self.$$.not_equal(choices[filter.name], value)) {
        choices[filter.name] = value;
        $$invalidate(2, choices);
      }
    }
    const click_handler_1 = () => list(-1);
    function statebutton_selectedIndex_binding(value) {
      groupby = value;
      $$invalidate(1, groupby);
    }
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("seq" in $$props2)
        $$invalidate(12, seq = $$props2.seq);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 6) {
        $:
          update2(choices, groupby);
      }
    };
    $:
      groups = {};
    $:
      $$invalidate(6, items = []);
    return [
      ptk,
      groupby,
      choices,
      groupitems,
      mastertag,
      refresh,
      items,
      filters,
      groupstates,
      choicecount,
      reset,
      list,
      seq,
      click_handler,
      statebuttons_choices_binding,
      click_handler_1,
      statebutton_selectedIndex_binding
    ];
  }
  var Guidefilter = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance42, create_fragment45, safe_not_equal, { ptk: 0, seq: 12 });
    }
  };
  var guidefilter_default = Guidefilter;

  // src/ownerdraw/guide.svelte
  function get_each_context22(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[16] = list[i];
    return child_ctx;
  }
  function get_each_context_13(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[19] = list[i];
    return child_ctx;
  }
  function create_if_block_113(ctx) {
    let t0_value = ctx[0].template.humanChoice(ctx[1]) + "";
    let t0;
    let t1;
    let span3;
    let span0;
    let t2_value = ctx[4] + 1 + "";
    let t2;
    let t3;
    let t4;
    let span1;
    let t5_value = ctx[2].length + "";
    let t5;
    let t6;
    let span2;
    let t7_value = ctx[0].template.onChunkCaption(ctx[6]?.ck?.id) + "";
    let t7;
    let t8;
    let div;
    let span4;
    let t9;
    let inlinetext;
    let t10;
    let current;
    let mounted;
    let dispose;
    inlinetext = new inlinetext_default({
      props: {
        text: ctx[0].getLine(ctx[6]?.line),
        ptk: ctx[0],
        seq: ctx[3]
      }
    });
    let each_value = ctx[6]?.record;
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block22(get_each_context22(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        t0 = text(t0_value);
        t1 = space();
        span3 = element("span");
        span0 = element("span");
        t2 = text(t2_value);
        t3 = text("/");
        t4 = space();
        span1 = element("span");
        t5 = text(t5_value);
        t6 = space();
        span2 = element("span");
        t7 = text(t7_value);
        t8 = space();
        div = element("div");
        span4 = element("span");
        t9 = space();
        create_component(inlinetext.$$.fragment);
        t10 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(span0, "class", "clickable");
        attr(span1, "class", "clickable");
        attr(span2, "class", "clickable");
        attr(span3, "class", "toolbar");
        attr(span4, "class", "clickable openexcerpt");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, span3, anchor);
        append(span3, span0);
        append(span0, t2);
        append(span0, t3);
        append(span3, t4);
        append(span3, span1);
        append(span1, t5);
        append(span3, t6);
        append(span3, span2);
        append(span2, t7);
        insert(target, t8, anchor);
        insert(target, div, anchor);
        append(div, span4);
        append(div, t9);
        mount_component(inlinetext, div, null);
        append(div, t10);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }
        current = true;
        if (!mounted) {
          dispose = [
            listen(span0, "click", ctx[11]),
            listen(span1, "click", ctx[12]),
            listen(span4, "click", ctx[13])
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if ((!current || dirty & 3) && t0_value !== (t0_value = ctx2[0].template.humanChoice(ctx2[1]) + ""))
          set_data(t0, t0_value);
        if ((!current || dirty & 16) && t2_value !== (t2_value = ctx2[4] + 1 + ""))
          set_data(t2, t2_value);
        if ((!current || dirty & 4) && t5_value !== (t5_value = ctx2[2].length + ""))
          set_data(t5, t5_value);
        if ((!current || dirty & 65) && t7_value !== (t7_value = ctx2[0].template.onChunkCaption(ctx2[6]?.ck?.id) + ""))
          set_data(t7, t7_value);
        const inlinetext_changes = {};
        if (dirty & 65)
          inlinetext_changes.text = ctx2[0].getLine(ctx2[6]?.line);
        if (dirty & 1)
          inlinetext_changes.ptk = ctx2[0];
        if (dirty & 8)
          inlinetext_changes.seq = ctx2[3];
        inlinetext.$set(inlinetext_changes);
        if (dirty & 201) {
          each_value = ctx2[6]?.record;
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context22(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block22(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(div, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(span3);
        if (detaching)
          detach(t8);
        if (detaching)
          detach(div);
        destroy_component(inlinetext);
        destroy_each(each_blocks, detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block30(ctx) {
    let guidefilter;
    let current;
    guidefilter = new guidefilter_default({
      props: { ptk: ctx[0], seq: ctx[3] }
    });
    return {
      c() {
        create_component(guidefilter.$$.fragment);
      },
      m(target, anchor) {
        mount_component(guidefilter, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const guidefilter_changes = {};
        if (dirty & 1)
          guidefilter_changes.ptk = ctx2[0];
        if (dirty & 8)
          guidefilter_changes.seq = ctx2[3];
        guidefilter.$set(guidefilter_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(guidefilter.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(guidefilter.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(guidefilter, detaching);
      }
    };
  }
  function create_if_block_26(ctx) {
    let each_1_anchor;
    let current;
    let each_value_1 = ctx[7][ctx[16]];
    let each_blocks = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_1, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 200) {
          each_value_1 = ctx2[7][ctx2[16]];
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_13(ctx2, each_value_1, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block_13(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value_1.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value_1.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function create_each_block_13(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [{ seq: ctx[3] }, ctx[19].data, { line: ctx[16] }];
    var switch_value = Painters[ctx[19].painter];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 200 ? get_spread_update(switch_instance_spread_levels, [
          dirty & 8 && { seq: ctx2[3] },
          dirty & 192 && get_spread_object(ctx2[19].data),
          dirty & 64 && { line: ctx2[16] }
        ]) : {};
        if (switch_value !== (switch_value = Painters[ctx2[19].painter])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_each_block22(ctx) {
    let div;
    let inlinetext;
    let t0;
    let t1;
    let current;
    inlinetext = new inlinetext_default({
      props: {
        text: ctx[0].getLine(ctx[16]),
        ptk: ctx[0],
        seq: ctx[3]
      }
    });
    let if_block = ctx[7][ctx[16]] && create_if_block_26(ctx);
    return {
      c() {
        div = element("div");
        create_component(inlinetext.$$.fragment);
        t0 = space();
        if (if_block)
          if_block.c();
        t1 = space();
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(inlinetext, div, null);
        append(div, t0);
        if (if_block)
          if_block.m(div, null);
        append(div, t1);
        current = true;
      },
      p(ctx2, dirty) {
        const inlinetext_changes = {};
        if (dirty & 65)
          inlinetext_changes.text = ctx2[0].getLine(ctx2[16]);
        if (dirty & 1)
          inlinetext_changes.ptk = ctx2[0];
        if (dirty & 8)
          inlinetext_changes.seq = ctx2[3];
        inlinetext.$set(inlinetext_changes);
        if (ctx2[7][ctx2[16]]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 192) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block_26(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div, t1);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(inlinetext.$$.fragment, local);
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(inlinetext.$$.fragment, local);
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(inlinetext);
        if (if_block)
          if_block.d();
      }
    };
  }
  function create_fragment46(ctx) {
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block30, create_if_block_113];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (!ctx2[1])
        return 0;
      if (ctx2[5])
        return 1;
      return -1;
    }
    if (~(current_block_type_index = select_block_type(ctx, -1))) {
      if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(target, anchor);
        }
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if (~current_block_type_index) {
            if_blocks[current_block_type_index].p(ctx2, dirty);
          }
        } else {
          if (if_block) {
            group_outros();
            transition_out(if_blocks[previous_block_index], 1, 1, () => {
              if_blocks[previous_block_index] = null;
            });
            check_outros();
          }
          if (~current_block_type_index) {
            if_block = if_blocks[current_block_type_index];
            if (!if_block) {
              if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
              if_block.c();
            } else {
              if_block.p(ctx2, dirty);
            }
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          } else {
            if_block = null;
          }
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d(detaching);
        }
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance43($$self, $$props, $$invalidate) {
    let { ptk, action, items = [], seq } = $$props;
    const LV = getContext("LV");
    let from = 0, ready = false, now = {};
    const next = () => {
      if (from < items.length)
        $$invalidate(4, from++, from);
    };
    const prev = () => {
      if (from > 0)
        $$invalidate(4, from--, from);
    };
    const open = () => {
      const lineoffset = now.line - now.ck.line;
      const address = makeChunkAddress(now.ck, now.ck.id, lineoffset);
      LV.insertAddress(address, seq);
    };
    let activelinemenus = [];
    const fetchLine = async () => {
      $$invalidate(5, ready = false);
      $$invalidate(6, now = items[from]);
      if (!now)
        return;
      await ptk.loadLines([now.line, now.line + now.size]);
      for (let i = now.line; i < now.line + now.size; i++) {
        const text2 = ptk.getLine(i);
        const [units, ot] = renderOfftext(text2, { line: i });
        const _activelinemenu = getExtraPainter(ptk, ot, "activelinemenu");
        if (_activelinemenu.length) {
          $$invalidate(7, activelinemenus[i] = _activelinemenu, activelinemenus);
        }
      }
      $$invalidate(5, ready = true);
    };
    const click_handler = () => prev();
    const click_handler_1 = () => next();
    const click_handler_2 = () => open();
    $$self.$$set = ($$props2) => {
      if ("ptk" in $$props2)
        $$invalidate(0, ptk = $$props2.ptk);
      if ("action" in $$props2)
        $$invalidate(1, action = $$props2.action);
      if ("items" in $$props2)
        $$invalidate(2, items = $$props2.items);
      if ("seq" in $$props2)
        $$invalidate(3, seq = $$props2.seq);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 16) {
        $:
          fetchLine(from);
      }
    };
    return [
      ptk,
      action,
      items,
      seq,
      from,
      ready,
      now,
      activelinemenus,
      next,
      prev,
      open,
      click_handler,
      click_handler_1,
      click_handler_2
    ];
  }
  var Guide = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance43, create_fragment46, safe_not_equal, { ptk: 0, action: 1, items: 2, seq: 3 });
    }
  };
  var guide_default = Guide;

  // src/ownerdraw/approx.svelte
  function get_each_context23(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[13] = list[i];
    return child_ctx;
  }
  function create_if_block31(ctx) {
    let t;
    return {
      c() {
        t = text("\u{1F622} \u627E\u4E0D\u5230 Not Found");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block23(ctx) {
    let div;
    let excerptheading;
    let t0;
    let t1_value = Math.floor(ctx[13].similarity * 100) + "%";
    let t1;
    let t2;
    let inlinetext;
    let current;
    const excerptheading_spread_levels = [{ ptk: ctx[1] }, { seq: ctx[0] }, ctx[13].ck];
    let excerptheading_props = {};
    for (let i = 0; i < excerptheading_spread_levels.length; i += 1) {
      excerptheading_props = assign(excerptheading_props, excerptheading_spread_levels[i]);
    }
    excerptheading = new excerptheading_default({ props: excerptheading_props });
    inlinetext = new inlinetext_default({
      props: {
        text: ctx[13].text,
        ptk: ctx[1],
        seq: ctx[0]
      }
    });
    return {
      c() {
        div = element("div");
        create_component(excerptheading.$$.fragment);
        t0 = space();
        t1 = text(t1_value);
        t2 = space();
        create_component(inlinetext.$$.fragment);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(excerptheading, div, null);
        append(div, t0);
        append(div, t1);
        append(div, t2);
        mount_component(inlinetext, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const excerptheading_changes = dirty & 7 ? get_spread_update(excerptheading_spread_levels, [
          dirty & 2 && { ptk: ctx2[1] },
          dirty & 1 && { seq: ctx2[0] },
          dirty & 4 && get_spread_object(ctx2[13].ck)
        ]) : {};
        excerptheading.$set(excerptheading_changes);
        if ((!current || dirty & 4) && t1_value !== (t1_value = Math.floor(ctx2[13].similarity * 100) + "%"))
          set_data(t1, t1_value);
        const inlinetext_changes = {};
        if (dirty & 4)
          inlinetext_changes.text = ctx2[13].text;
        if (dirty & 2)
          inlinetext_changes.ptk = ctx2[1];
        if (dirty & 1)
          inlinetext_changes.seq = ctx2[0];
        inlinetext.$set(inlinetext_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(excerptheading.$$.fragment, local);
        transition_in(inlinetext.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(excerptheading.$$.fragment, local);
        transition_out(inlinetext.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(excerptheading);
        destroy_component(inlinetext);
      }
    };
  }
  function create_fragment47(ctx) {
    let t;
    let each_1_anchor;
    let current;
    let if_block = !ctx[2].length && create_if_block31(ctx);
    let each_value = ctx[2];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block23(get_each_context23(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        if (if_block)
          if_block.c();
        t = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        each_1_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(target, anchor);
        }
        insert(target, each_1_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (!ctx2[2].length) {
          if (if_block) {
          } else {
            if_block = create_if_block31(ctx2);
            if_block.c();
            if_block.m(t.parentNode, t);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (dirty & 7) {
          each_value = ctx2[2];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context23(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block23(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(each_1_anchor);
      }
    };
  }
  function instance44($$self, $$props, $$invalidate) {
    let displayitems;
    let { name: name2 } = $$props;
    let { lines } = $$props;
    let { seq } = $$props;
    let { dividx } = $$props;
    let { ptk } = $$props;
    let { from } = $$props;
    let { similarity } = $$props;
    const LV = getContext("LV");
    let pfrom = from;
    async function load2() {
      await ptk.loadLines(lines);
      $$invalidate(2, displayitems = lines.map((line, idx2) => {
        const ck = ptk.getHeading(line);
        return {
          ck,
          line,
          text: ptk.getLine(line),
          similarity: similarity[idx2]
        };
      }));
    }
    const setFrom = () => {
      if (pfrom == from)
        return;
      LV.setFrom(dividx, from);
      pfrom = from;
    };
    const openChunk = (bkid, tagname, id) => {
      const address = makeElementId("bk", bkid) + "." + tagname + (parseInt(id) ? id : "#" + id);
      LV.insertAddress(address, seq);
    };
    $$self.$$set = ($$props2) => {
      if ("name" in $$props2)
        $$invalidate(3, name2 = $$props2.name);
      if ("lines" in $$props2)
        $$invalidate(4, lines = $$props2.lines);
      if ("seq" in $$props2)
        $$invalidate(0, seq = $$props2.seq);
      if ("dividx" in $$props2)
        $$invalidate(5, dividx = $$props2.dividx);
      if ("ptk" in $$props2)
        $$invalidate(1, ptk = $$props2.ptk);
      if ("from" in $$props2)
        $$invalidate(6, from = $$props2.from);
      if ("similarity" in $$props2)
        $$invalidate(7, similarity = $$props2.similarity);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 8) {
        $:
          name2;
      }
      if ($$self.$$.dirty & 64) {
        $:
          setFrom(from);
      }
      if ($$self.$$.dirty & 16) {
        $:
          load2(lines);
      }
    };
    $:
      $$invalidate(2, displayitems = []);
    return [seq, ptk, displayitems, name2, lines, dividx, from, similarity];
  }
  var Approx = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance44, create_fragment47, safe_not_equal, {
        name: 3,
        lines: 4,
        seq: 0,
        dividx: 5,
        ptk: 1,
        from: 6,
        similarity: 7
      });
    }
  };
  var approx_default = Approx;

  // ../ptk/platform/pwa.js
  function registerServiceWorker(swfn = "./sw.js") {
    const p2 = document.location.protocol;
    const h = document.location.hostname;
    const localhost = p2 == "http:" && (h == "127.0.0.1" || h == "localhost");
    if ("serviceWorker" in navigator && (localhost || p2 == "https:")) {
      navigator.serviceWorker.register(swfn);
    }
  }

  // src/app.svelte
  function create_else_block7(ctx) {
    let t;
    return {
      c() {
        t = text("Loading...");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block32(ctx) {
    let librarymain;
    let current;
    librarymain = new librarymain_default({});
    return {
      c() {
        create_component(librarymain.$$.fragment);
      },
      m(target, anchor) {
        mount_component(librarymain, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(librarymain.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(librarymain.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(librarymain, detaching);
      }
    };
  }
  function create_fragment48(ctx) {
    let t;
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block32, create_else_block7];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[0])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        t = space();
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        insert(target, t, anchor);
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index !== previous_block_index) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t);
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance45($$self, $$props, $$invalidate) {
    let ready;
    initPainters({
      note: note_default,
      keys: keys_default,
      key: key_default,
      confer: confer_default,
      f: f_default,
      fn: fn_default,
      backref: backref_default,
      backreflist: backreflist_default,
      approxbackref: approxbackref_default,
      partialchunkid: partialchunkid_default,
      chunk: chunk_default
    });
    initOwnerdraws({
      queryresult: queryresult_default,
      excerpt: excerpt_default,
      titlecount: titlecount_default,
      systeminfo: systeminfo_default,
      setting: setting_default,
      unknown: unknown_default,
      guide: guide_default,
      approx: approx_default
    });
    registerServiceWorker();
    onMount(async () => {
      await openPitakas();
      $$invalidate(0, ready = true);
    });
    $:
      $$invalidate(0, ready = false);
    return [ready];
  }
  var App = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance45, create_fragment48, safe_not_equal, {});
    }
  };
  var app_default = App;

  // src/index.ts
  var app = new app_default({ target: document.body });
  document.querySelector("#bootmessage").innerHTML = "";
  var src_default = app;
})();
