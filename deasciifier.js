
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    var lib = factory();
    root.Deasciifier = lib.Deasciifier;
    root.Asciifier = lib.Asciifier;
    root.TurkishEncoder = lib.TurkishEncoder;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  // Turkish character mappings
  var TURKISH_MAP = {
    Z: {
      'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
    },
    F: 'ç', N: 'Ç', H: 'ğ', P: 'Ğ', J: 'ı', R: 'İ', K: 'ö', T: 'Ö', L: 'ş', V: 'Ş', M: 'ü', W: 'Ü'
  };

  // Asciifier
  var Asciifier = {
    asciify: function(str) {
      if (!str) return '';
      return str.split('').map(function(ch) { return TURKISH_MAP.Z[ch] || ch; }).join('');
    },
    asciifyRange: function(str, start, end) {
      if (!str || start >= end) return null;
      var arr = str.split('');
      var changed = [];
      for (var i = 0; i < arr.length; i++) {
        if (i >= start && i <= end && TURKISH_MAP.Z[arr[i]]) {
          arr[i] = TURKISH_MAP.Z[arr[i]];
          changed.push(i);
        }
      }
      return { text: arr.join(''), changedPositions: changed };
    }
  };

  // Deasciifier
  function _Deasciifier() {
    this.patterns = null;
    this.initialized = false;
  }
  _Deasciifier.prototype.init = function(patterns) {
    if (!patterns) throw new Error('Pattern list can\'t be null');
    this.patterns = patterns;
    this.initialized = true;
  };
  _Deasciifier.prototype.deasciify = function(str, options) {
    if (!this.initialized) throw new Error('Pattern list not loaded');
    // Simple implementation: replace ascii chars with Turkish chars
    // For full linguistic rules, use patterns
    // This is a placeholder for the real algorithm
    // TODO: Implement full pattern-based deasciification
    return str.replace(/[cCgGiIoOsSuU]/g, function(ch) {
      switch (ch) {
        case 'c': return 'ç'; case 'C': return 'Ç';
        case 'g': return 'ğ'; case 'G': return 'Ğ';
        case 'i': return 'ı'; case 'I': return 'İ';
        case 'o': return 'ö'; case 'O': return 'Ö';
        case 's': return 'ş'; case 'S': return 'Ş';
        case 'u': return 'ü'; case 'U': return 'Ü';
        default: return ch;
      }
    });
  };
  _Deasciifier.prototype.deasciifyRange = function(str, start, end, options) {
    if (!this.initialized) throw new Error('Pattern list not loaded');
    var before = str.slice(0, start);
    var range = this.deasciify(str.slice(start, end + 1), options);
    var after = str.slice(end + 1);
    return { text: before + range + after, changedPositions: Array.from({length: end - start + 1}, function(_, i) { return start + i; }) };
  };

  var Deasciifier = new _Deasciifier();

  // TurkishEncoder
  var TurkishEncoder = {
    encodeHTML: function(str) {
      var map = {
        'ç': '&#231;', 'Ç': '&#199;', 'ğ': '&#287;', 'Ğ': '&#286;',
        'ı': '&#305;', 'İ': '&#304;', 'ö': '&#246;', 'Ö': '&#214;',
        'ş': '&#351;', 'Ş': '&#350;', 'ü': '&#252;', 'Ü': '&#220;'
      };
      return str.split('').map(function(ch) { return map[ch] || ch; }).join('');
    },
    encodeJS: function(str) {
      var map = {
        'ç': '\u00E7', 'Ç': '\u00C7', 'ğ': '\u011F', 'Ğ': '\u011E',
        'ı': '\u0131', 'İ': '\u0130', 'ö': '\u00F6', 'Ö': '\u00D6',
        'ş': '\u015F', 'Ş': '\u015E', 'ü': '\u00FC', 'Ü': '\u00DC'
      };
      return str.split('').map(function(ch) { return map[ch] || ch; }).join('');
    }
  };

  return {
    Deasciifier: Deasciifier,
    Asciifier: Asciifier,
    TurkishEncoder: TurkishEncoder
  };
}));
