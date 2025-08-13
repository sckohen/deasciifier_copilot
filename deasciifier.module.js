(function() {
  // Turkish character tables (from base.js)
  const TURKISH_ASCIIFY_TABLE = {
    '\u00E7': 'c',
    '\u00C7': 'C',
    '\u011F': 'g',
    '\u011E': 'G',
    '\u0131': 'i',
    '\u0130': 'I',
    '\u00F6': 'o',
    '\u00D6': 'O',
    '\u015F': 's',
    '\u015E': 'S',
    '\u00FC': 'u',
    '\u00DC': 'U'
  };
  const DEASCII_TR_LOWER_C = '\u00E7';
  const DEASCII_TR_UPPER_C = '\u00C7';
  const DEASCII_TR_LOWER_G = '\u011F';
  const DEASCII_TR_UPPER_G = '\u011E';
  const DEASCII_TR_LOWER_I = '\u0131';
  const DEASCII_TR_UPPER_I = '\u0130';
  const DEASCII_TR_LOWER_O = '\u00F6';
  const DEASCII_TR_UPPER_O = '\u00D6';
  const DEASCII_TR_LOWER_S = '\u015F';
  const DEASCII_TR_UPPER_S = '\u015E';
  const DEASCII_TR_LOWER_U = '\u00FC';
  const DEASCII_TR_UPPER_U = '\u00DC';

  // Asciifier
  function asciifyRange(text, start, end) {
    if (!text || start >= end) {
      return null;
    }
    const changedPositions = [];
    const output = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      const toggled = TURKISH_ASCIIFY_TABLE[ch];
      if (i >= start && i <= end && toggled) {
        output[i] = toggled;
        changedPositions.push(i);
      } else {
        output[i] = ch;
      }
    }
    return { text: output.join(""), changedPositions };
  }

  function asciify(text) {
    if (!text) return null;
    return asciifyRange(text, 0, text.length - 1);
  }

  // Deasciifier
  let deasciifierState = {
    initialized: false,
    turkish_asciify_table: null,
    turkish_downcase_asciify_table: null,
    turkish_upcase_accents_table: null,
    turkish_toggle_accent_table: null,
    turkish_pattern_table: null
  };

  const TURKISH_CONTEXT_SIZE = 10;

  const TURKISH_CHAR_ALIST = {
    'c': DEASCII_TR_LOWER_C,
    'C': DEASCII_TR_UPPER_C,
    'g': DEASCII_TR_LOWER_G,
    'G': DEASCII_TR_UPPER_G,
    'i': DEASCII_TR_LOWER_I,
    'I': DEASCII_TR_UPPER_I,
    'o': DEASCII_TR_LOWER_O,
    'O': DEASCII_TR_UPPER_O,
    's': DEASCII_TR_LOWER_S,
    'S': DEASCII_TR_UPPER_S,
    'u': DEASCII_TR_LOWER_U,
    'U': DEASCII_TR_UPPER_U
  };

  function make_turkish_asciify_table() {
    const ct = {};
    for (const i in TURKISH_CHAR_ALIST) {
      ct[TURKISH_CHAR_ALIST[i]] = i;
    }
    return ct;
  }

  function make_turkish_downcase_asciify_table() {
    const ct = {};
    let ch = 'a';
    while (ch <= 'z') {
      ct[ch] = ch;
      ct[ch.toUpperCase()] = ch;
      ch = String.fromCharCode(ch.charCodeAt(0) + 1);
    }
    for (const i in TURKISH_CHAR_ALIST) {
      ct[TURKISH_CHAR_ALIST[i]] = i.toLowerCase();
    }
    return ct;
  }

  function make_turkish_upcase_accents_table() {
    const ct = {};
    let ch = 'a';
    while (ch <= 'z') {
      ct[ch] = ch;
      ct[ch.toUpperCase()] = ch;
      ch = String.fromCharCode(ch.charCodeAt(0) + 1);
    }
    for (const i in TURKISH_CHAR_ALIST) {
      ct[TURKISH_CHAR_ALIST[i]] = i.toUpperCase();
    }
    ct['i'] = 'i';
    ct['I'] = 'I';
    ct['\u0130'] = 'i';
    ct['\u0131'] = 'I';
    return ct;
  }

  function make_turkish_toggle_accent_table() {
    const ct = {};
    for (const i in TURKISH_CHAR_ALIST) {
      ct[i] = TURKISH_CHAR_ALIST[i];
      ct[TURKISH_CHAR_ALIST[i]] = i;
    }
    return ct;
  }

  function setCharAt(str, pos, c) {
    return str.substring(0, pos) + c + str.substring(pos + 1);
  }

  function turkish_get_context(text, pos, size) {
    let s = '';
    let space = false;
    const string_size = 2 * size + 1;
    for (let j = 0; j < string_size; j++) {
      s = s + ' ';
    }
    s = setCharAt(s, size, 'X');

    let i = size + 1;
    let index = pos + 1;
    while (i < s.length && !space && index < text.length) {
      const c = text.charAt(index);
      const x = deasciifierState.turkish_downcase_asciify_table[c];
      if (!x) {
        if (!space) {
          i++;
          space = true;
        }
      } else {
        s = setCharAt(s, i, x);
        i++;
        space = false;
      }
      index++;
    }

    s = s.substring(0, i);
    index = pos;
    i = size - 1;
    space = false;
    index--;

    while (i >= 0 && index >= 0) {
      const c = text.charAt(index);
      const x = deasciifierState.turkish_upcase_accents_table[c];
      if (!x) {
        if (!space) {
          i--;
          space = true;
        }
      } else {
        s = setCharAt(s, i, x);
        i--;
        space = false;
      }
      index--;
    }
    return s;
  }

  function turkish_match_pattern(text, pos, dlist) {
    let rank = dlist.length * 2;
    const str = turkish_get_context(text, pos, TURKISH_CONTEXT_SIZE);
    const start = 0;
    const len = str.length;

    for (let s = start; s <= TURKISH_CONTEXT_SIZE; s++) {
      for (let end = TURKISH_CONTEXT_SIZE + 1; end <= len; end++) {
        const substr = str.substring(s, end);
        const r = dlist[substr];
        if (r && Math.abs(r) < Math.abs(rank)) {
          rank = r;
        }
      }
    }
    return rank > 0;
  }

  function turkish_toggle_accent(text, pos) {
    const alt = deasciifierState.turkish_toggle_accent_table[text.charAt(pos)];
    if (alt) {
      return setCharAt(text, pos, alt);
    }
    return text;
  }

  function turkish_need_correction(text, pos, options) {
    let ch = text.charAt(pos);
    let tr = deasciifierState.turkish_asciify_table[ch];
    if (!tr) tr = ch;
    const pl = deasciifierState.turkish_pattern_table[tr.toLowerCase()];
    const m = pl && turkish_match_pattern(text, pos, pl);

    if (tr === "I") {
      const shouldReplaceCapitalI = Options.get(options, 'replaceCapitalI');
      if (!shouldReplaceCapitalI) {
          return false; // Skip correction for 'I' if option is disabled
      }
      return (ch === tr) ? !m : m;
    }
    return (ch === tr) ? m : !m;
  }

  function turkish_correct_region(text, start, end, filter, options) {
    if (!deasciifierState.initialized) {
      throw new Error("Pattern list not loaded");
    }
    if (!text) return null;
    if (start < 0) start = 0;
    if (end > text.length) end = text.length;
    const changedPositions = [];
    for (let i = start; i < end; i++) {
      if (filter && filter.shouldExclude && filter.shouldExclude(i)) continue;
      if (turkish_need_correction(text, i, options)) {
        text = turkish_toggle_accent(text, i);
        changedPositions.push(i);
      }
    }
    return { text, changedPositions, skippedRegions: filter };
  }

  // Skip region logic
  const URL_REGEX = /\b((((https?|ftp|file):\/\/)|(www\.))[\S]+)/gi;
  const DOUBLE_QUOTED_REGEX = /"[^"]*"/g;
  const SINGLE_QUOTED_REGEX = /'[^']*'/g;
  
  class SkipRegion {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  }
  class SkipList {
    constructor(skipRegions) {
      this.skipRegions = skipRegions;
    }
    shouldExclude(pos) {
      for (let i = 0; i < this.skipRegions.length; i++) {
        if (pos >= this.skipRegions[i].start && pos <= this.skipRegions[i].end) {
          return true;
        }
      }
      return false;
    }
  }
  const DefaultSkipFilter = {
    getSkipRegions: function(options, text) {
      const regexps = [];
      if (options && options.skipURLs) {
          regexps.push(URL_REGEX);
      }
      if (options && options.skipDoubleQuotes) {
        regexps.push(DOUBLE_QUOTED_REGEX);
      }
      if (options && options.skipSingleQuotes) {
        regexps.push(SINGLE_QUOTED_REGEX);
      }
  
      const skipList = [];
      for (let i = 0; i < regexps.length; i++) {
        const regex = regexps[i];
        let match = null;
        while ((match = regex.exec(text)) != null) {
          const startPos = match.index;
          const endPos = regex.lastIndex;
          skipList.push(new SkipRegion(startPos, endPos));
        }
      }
      return new SkipList(skipList);
    }
  };
  
  const Options = {
      defaults: {
          skipURLs: true,
          skipDoubleQuotes: true,
          skipSingleQuotes: true,
          replaceCapitalI: false
      },
    get: function(options, optionName) {
      if (options && options.hasOwnProperty(optionName)) {
        return options[optionName];
      }
      return Options.defaults[optionName];
    },
    getMulti: function(options, optionNames) {
      const ret = {};
      for (let i = 0; i < optionNames.length; i++) {
        ret[optionNames[i]] = Options.get(options, optionNames[i]);
      }
      return ret;
    }
  };
  
  function build_skip_list(text, options) {
    const skipOptions = Options.getMulti(options, ["skipURLs", "skipDoubleQuotes", "skipSingleQuotes"]);
    if (skipOptions) {
      return DefaultSkipFilter.getSkipRegions(skipOptions, text);
    }
    return null;
  }
  

  function deasciifyRange(text, start, end, options) {
    if (!text) return null;
    return turkish_correct_region(
      text, start, end, build_skip_list(text, options), options
    );
  }

  function deasciify(text, options) {
    if (!text) return null;
    return deasciifyRange(text, 0, text.length - 1, options);
  }

  function init(patternListV2) {
    if (!patternListV2) throw new Error("Pattern list can't be null");
    deasciifierState.turkish_asciify_table = make_turkish_asciify_table();
    deasciifierState.turkish_downcase_asciify_table = make_turkish_downcase_asciify_table();
    deasciifierState.turkish_upcase_accents_table = make_turkish_upcase_accents_table();
    deasciifierState.turkish_toggle_accent_table = make_turkish_toggle_accent_table();
    deasciifierState.turkish_pattern_table = {};
    for (const key in patternListV2) {
      deasciifierState.turkish_pattern_table[key] = {};
      const tokens = patternListV2[key];
      for (let i = 0; i < tokens.length; i++) {
        const [pattern, rank] = tokens[i];
        deasciifierState.turkish_pattern_table[key][pattern] = rank;
      }
      deasciifierState.turkish_pattern_table[key]["length"] = tokens.length;
    }
    deasciifierState.initialized = true;
  }

  // Attach API to window for Chrome extension compatibility, only if not already defined
  if (!window.init) window.init = init;
  if (!window.deasciify) window.deasciify = deasciify;
  if (!window.deasciifyRange) window.deasciifyRange = deasciifyRange;
  if (!window.asciify) window.asciify = asciify;
  if (!window.asciifyRange) window.asciifyRange = asciifyRange;

})();