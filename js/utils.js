/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ubiquity.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Atul Varma <atul@mozilla.com>
 *   Blair McBride <unfocused@gmail.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Satoshi Murakami <murky.satyr@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// = Utils =
// A small (?) library of all-purpose, general utility functions
// for use by chrome code.  Everything clients need is contained within
// the {{{Utils}}} namespace.

(function(exports) {

var Utils = (function() {
  //"use strict";

  const LOG_PREFIX = "Ubiquity: ";
  const TO_STRING = Object.prototype.toString;

  var U = {
    toString: function toString() "[object UbiquityUtils]",
    __globalObject: this,
  }


  // === {{{ U.log(a, b, c, ...) }}} ===
  // One of the most useful functions to know both for development and debugging.
  // This logging function takes an arbitrary number of arguments and
  // will log them to the most appropriate output. If you have Firebug,
  // the output will go to its console.
  // Otherwise, the output will be routed to the Javascript Console.
  //
  // {{{U.log()}}} implements smart pretty print, so you
  // can use it for inspecting arrays and objects.
  // See http://getfirebug.com/console.html for details.
  //
  // {{{a, b, c, ...}}} is an arbitrary list of things to be logged.

  function log(what) {
    if (!arguments.length) return;

    var args = Array.slice(arguments), formatting = typeof what === "string";

    function log_pp(o) {
      try { var p = uneval(o) } catch ([]) {}
      return p && p !== "({})" && (p !== "null" || o === null) ? p : o;
    }
    var lead = !formatting ? log_pp(args.shift()) :
    args.shift().replace(/%[sdifo]/g, function log_format($) {
      if (!args.length) return $;
      var a = args.shift();
      switch ($) {
        case "%s": return a;
        case "%d":
        case "%i": return parseInt(a);
        case "%f": return parseFloat(a);
      }
      return log_pp(a);
    });
    U.reportInfo(
      args.reduce(function log_acc(msg, arg) msg + " " + log_pp(arg), lead));
  }
  U.log = log

  // === {{{ U.dump(a, b, c, ...) }}} ===
  // A nicer {{{dump()}}} variant that
  // displays caller's name, concats arguments and appends a line feed.

  U.dump = function niceDump() {
    var {caller} = arguments.callee;
    console.log((caller ? caller.name + ": " : "") +
         Array.join(arguments, " ") + "\n");
  };

  // === {{{ U.reportError(error) }}} ===
  // Given an {{{Error}}} object, reports it to the JS Error Console
  // as if it was thrown from the original location.

  function reportError(error) {
    /*
    var scriptError =
      Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);
    scriptError.init(error, error.fileName, null, error.lineNumber,
                     null, scriptError.errorFlag, null);
    */
    U.log(error);
  }
  U.reportError = reportError

  // === {{{ U.reportWarning(aMessage, stackFrameNumber) }}} ===
  // Reports a warning to the JS Error Console, which can be displayed in Firefox
  // by choosing "Error Console" from the "Tools" menu.
  //
  // {{{aMessage}}} is a plaintext string corresponding to the warning
  // to provide.
  //
  // {{{stackFrameNumber}}} is an optional number specifying how many
  // frames back in the call stack the warning message should be
  // associated with. Its default value is 0, meaning that the line
  // number of the caller is shown in the JS Error Console.  If it's 1,
  // then the line number of the caller's caller is shown.

  function reportWarning(aMessage, stackFrameNumber) {
    console.warning(aMessage)
    return

    /*
    var stackFrame = Components.stack.caller;
    for (let i = stackFrameNumber | 0; i --> 0;) stackFrame = stackFrame.caller;

    var scriptError =
      Cc["@mozilla.org/scripterror;1"].createInstance(Ci.nsIScriptError);
    var aSourceName = stackFrame.filename;
    var aSourceLine = stackFrame.sourceLine;
    var aLineNumber = stackFrame.lineNumber;
    var aColumnNumber = null;
    var aFlags = scriptError.warningFlag;
    var aCategory = "ubiquity javascript";
    scriptError.init(aMessage, aSourceName, aSourceLine, aLineNumber,
                     aColumnNumber, aFlags, aCategory);
    U.ConsoleService.logMessage(scriptError);
    */
  }
  U.reportWarning = reportWarning

  // === {{{ U.reportInfo(message) }}} ===
  // Reports a purely informational {{{message}}} to the JS Error Console.
  // Source code links aren't provided for informational messages, so
  // unlike {{{U.reportWarning()}}}, a stack frame can't be passed
  // in to this function.

  function reportInfo(message) {
    console.info(LOG_PREFIX + message);
  }
  U.reportInfo = reportInfo

  // === {{{U.ellipsify(node, characters, [ellipsis])}}} ===
  // Given a DOM {{{node}}} (or string) and a maximum number of {{{characters}}},
  // returns a new DOM node or string that has the same contents truncated to
  // that number of characters. If any truncation was performed,
  // an {{{ellipsis}}} is placed at the end of the content.

  function ellipsify(node, chars, ellipsis) {
    if (ellipsis == null) ellipsis = gPrefs.get("intl.ellipsis", "\u2026");
    if (typeof node != "object") {
      if (chars < 1) return "";
      let str = String(node);
      return str.length > chars ? str.slice(0, chars - 1) + ellipsis : str;
    }
    var copy = node.cloneNode(false);
    switch (node.nodeType) {
      case node.TEXT_NODE:
      case node.CDATA_SECTION_NODE:
      copy.nodeValue = ellipsify(node.nodeValue, chars, ellipsis);
      break;
      case node.ELEMENT_NODE:
      case node.DOCUMENT_NODE:
      case node.DOCUMENT_FRAGMENT_NODE:
      let child = node.firstChild;
      for (; child && chars > 0; child = child.nextSibling) {
        let key = (child.nodeType == node.ELEMENT_NODE && "textContent" ||
                   (child.nodeType == node.TEXT_NODE ||
                    child.nodeType == node.CDATA_SECTION_NODE) && "nodeValue");
        if (key) {
          let childCopy = copy.appendChild(ellipsify(child, chars, ellipsis));
          chars -= childCopy[key].length;
        }
        else copy.appendChild(child.cloneNode(false));
      }
    }
    return copy;
  }
  U.ellipsify = ellipsify

  // === {{{ U.absolutifyUrlAttribute(element) }}} ===
  // Takes the URL specified as an attribute in the given DOM {{{element}}}
  // and convert it to an absolute URL.

  const URL_ATTRS = ["href", "src", "action"];

  function absolutifyUrlAttribute(element) {
    for each (let attr in URL_ATTRS) if (attr in element) {
      element.setAttribute(attr, element[attr]);
      break;
    }
    return element;
  }
  U.absolutifyUrlAttribute = absolutifyUrlAttribute

  // === {{{ U.isTextBox(node) }}} ===
  // Returns whether or not the given DOM {{{node}}} is a textbox.

  function isTextBox(node) {
    try { return node.selectionEnd >= 0 } catch (_) { return false }
  }
  U.isTextBox = isTextBox

  // === {{{ U.uri(spec, defaultUrl) }}} ===
  // Given a string representing an absolute URL or a {{{nsIURI}}}
  // object, returns an equivalent {{{nsIURI}}} object.  Alternatively,
  // an object with keyword arguments as keys can also be passed in; the
  // following arguments are supported:
  // * {{{uri}}} is a string or {{{nsIURI}}} representing an absolute or
  //   relative URL.
  // * {{{base}}} is a string or {{{nsIURI}}} representing an absolute
  //   URL, which is used as the base URL for the {{{uri}}} keyword argument.
  //
  // An optional second argument may also be passed in, which specifies
  // a default URL to return if the given URL can't be parsed.

  function uri(spec, defaultUri) {
    var base = null;
    if (typeof spec === "object") {
      if (spec.spec)
        // nsIURI object was passed in, so just return it back
        return spec;

      // Assume jQuery-style dictionary with keyword args was passed in.
      base = "base" in spec ? uri(spec.base, defaultUri) : null;
      spec = spec.uri || null;
    }

    var parser = document.createElement('a')
    parser.spec = parser.href = spec
    parser.scheme = parser.protocol
    return parser
  }

  // === {{{ U.url(spec, defaultUrl) }}} ===
  // Alias of {{{U.uri()}}}.
  U.url = uri;

  // === {{{ U.openUrlInBrowser(urlString, postData) }}} ===
  // Opens the given URL in the user's browser, using
  // their current preferences for how new URLs should be opened (e.g.,
  // in a new window vs. a new tab, etc).
  // Returns the opened page as {{{U.BrowserTab}}} or {{{ChromeWindow}}}.
  //
  // {{{urlString}}} is a string corresponding to the URL to be opened.
  //
  // {{{postData}}} is an optional argument that allows HTTP POST data
  // to be sent to the newly-opened page.  It may be a string, an Object
  // with keys and values corresponding to their POST analogues, or an
  // {{{nsIInputStream}}}.

  function openUrlInBrowser(urlString, postData) {
    var postInputStream = null;
    if (postData) {
      if (postData instanceof Ci.nsIInputStream)
        postInputStream = postData;
      else {
        if (typeof postData === "object")
          postData = paramsToString(postData, "");

        var stringStream = (Cc["@mozilla.org/io/string-input-stream;1"]
                            .createInstance(Ci.nsIStringInputStream));
        stringStream.data = postData;

        postInputStream = (Cc["@mozilla.org/network/mime-input-stream;1"]
                           .createInstance(Ci.nsIMIMEInputStream));
        postInputStream.addHeader("Content-Type",
                                  "application/x-www-form-urlencoded");
        postInputStream.addContentLength = true;
        postInputStream.setData(stringStream);
      }
    }

    var browserWindow = U.currentChromeWindow;
    var browser = browserWindow.gBrowser;
    var openPref = gPrefBranch.getIntPref("browser.link.open_newwindow");

    //3 (default in Firefox 2 and above): In a new tab
    //2 (default in SeaMonkey and Firefox 1.5): In a new window
    //1 (or anything else): In the current tab or window
    if (browser.mCurrentBrowser.currentURI.spec !== "about:blank" ||
        browser.webProgress.isLoadingDocument) {
      if (openPref === 3) {
        let tab = browser.addTab(
          urlString, null, null, postInputStream, false, false);
        let fore = !gPrefBranch.getBoolPref(
          "browser.tabs.loadDivertedInBackground");
        let {shiftKey} = (browserWindow.gUbiquity || 0).lastKeyEvent || 0;
        if (fore ^ shiftKey) browser.selectedTab = tab;
        return BrowserTab(tab);
      }
      if (openPref === 2) {
        return browserWindow.openDialog(
          "chrome://browser/content", "_blank", "all,dialog=no",
          urlString, null, null, postInputStream);
      }
    }
    browserWindow.loadURI(urlString, null, postInputStream, false);
    return BrowserTab(browser.mCurrentTab);
  }
  U.openUrlInBrowser = openUrlInBrowser

  // === {{{ U.paramsToString(params, prefix = "?") }}} ===
  // Takes the given object containing keys and values into a query string
  // suitable for inclusion in an HTTP GET or POST request.
  //
  // {{{params}}} is the object of key-value pairs.
  //
  // {{{prefix}}} is an optional string prepended to the result,
  // which defaults to {{{"?"}}}.

  function paramsToString(params, prefix) {
    var stringPairs = [];
    function addPair(key, value) {
      // explicitly ignoring values that are functions/null/undefined
      if (typeof value !== "function" && value != null)
        stringPairs.push(
          encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
    for (var key in params)
      if (U.isArray(params[key]))
        params[key].forEach(function p2s_each(item) { addPair(key, item) });
      else
        addPair(key, params[key]);
    return (prefix == null ? "?" : prefix) + stringPairs.join("&");
  }
  U.paramsToString = paramsToString

  // === {{{ U.urlToParams(urlString) }}} ===
  // Given a {{{urlString}}}, returns an object containing keys and values
  // retrieved from its query-part.

  function urlToParams(url) {
    var params = {}, dict = {__proto__: null};
    for each (let param in /^(?:[^?]*\?)?([^#]*)/.exec(url)[1].split("&")) {
      let [key, val] = /[^=]*(?==?(.*))/.exec(param);
      val = val.replace(/\+/g, " ");
      try { key = decodeURIComponent(key) } catch (e) {};
      try { val = decodeURIComponent(val) } catch (e) {};
      params[key] = key in dict ? [].concat(params[key], val) : val;
      dict[key] = 1;
    }
    return params;
  }
  U.urlToParams = urlToParams

  // === {{{ U.getLocalUrl(urlString, charset) }}} ===
  // Synchronously retrieves the content of the given local URL,
  // such as a {{{file:}}} or {{{chrome:}}} URL, and returns it.
  //
  // {{{url}}} is the URL to retrieve.
  //
  // {{{charset}}} is an optional string to specify the character set.

  function getLocalUrl(url, charset) {
    var req = new XMLHttpRequest()
    req.open("GET", url, false);
    req.overrideMimeType("text/plain" + (charset ? ";charset=" + charset : ""));
    req.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");
    req.send(null);
    if (req.status !== 0) throw Error("failed to get " + url);
    return req.responseText;
  }
  U.getLocalUrl = getLocalUrl

  // === {{{ U.sort(array, key, descending = false) }}} ===
  // Sorts an {{{array}}} without implicit string conversion and returns it,
  // optionally performing Schwartzian Transformation
  // by specified {{{key}}}. e.g.:
  // {{{
  // [42, 16, 7].sort() //=> [16, 42, 7]
  // sort([42, 16, 7])  //=> [7, 16, 42]
  // sort(["abc", "d", "ef"], "length") //=> ["d", "ef", "abc"]
  // sort([1, 2, 3], function (x) -x)   //=> [3, 2, 1]
  // }}}
  //
  // {{{array}}} is the target array.
  //
  // {{{key}}} is an optional string specifying the key property
  // or a function that maps each of {{{array}}}'s item to a sort key.
  //
  // Sorts descending if {{{descending}}}.

  function sort(array, key, descending) {
    array.forEach(function transform(v, i, a) a[i] = {key: this(v), val: v},
                  typeof key === "function" ? key :
                  (key != null
                   ? function pry(x) x[key]
                   : function idt(x) x));
    // Because our Monkey uses Merge Sort, "swap the values if plus" works.
    array.sort(descending
               ? function dsc(a, b) a.key < b.key
               : function asc(a, b) a.key > b.key);
    array.forEach(function mrofsnart(v, i, a) a[i] = v.val);
    return array;
  }
  U.sortBy = U.sort;

  // === {{{ U.uniq(array, key, strict = false) }}} ===
  // Removes duplicates from an array by comparing string versions of them
  // (or strict equality if {{{strict}}} evaluates to {{{true}}}) and returns it.
  // If {{{key}}} is provided, the comparison is made to mappings of it instead.
  // {{{
  // uniq([1, 1.0, "1", [1]])         //=> [1, "1", [1]]
  // uniq([1, 1.0, "1", [1]], Number) //=> [1]
  // uniq([{}, {}, {}], null)         //=> [{}]
  // uniq([{}, {}, {}], null, true)   //=> [{}, {}, {}]
  // }}}
  //
  // {{{array}}} is the target array.
  //
  // {{{key}}} is an optional function or string
  // ({{{"foo"}}} is identical to {{{function(x) x.foo}}} for this purpose)
  // that maps each of {{{array}}}'s item to a comparison key.
  //
  // {{{strict}}} is an optional flag to make {{{uniq()}}} use
  // **{{{===}}}** instead of {{{toString()}}}. Accurate, but slower.

  function uniq(array, key, strict) {
    var f = (key == null
             ? function identity(x) x
             : typeof key === "function" ? key : function pluck(x) x[key]);
    var args = [0, 1/0];
    if (strict) {
      let keys = [];
      for each (let x in array) let (k = f(x)) {
        if (~keys.indexOf(k)) continue;
        keys.push(k);
        args.push(x);
      }
    }
    else {
      let dict = {__proto__: null};
      for each (let x in array) let (k = f(x)) {
        if (k in dict) continue;
        dict[k] = 1;
        args.push(x);
      }
    }
    array.splice.apply(array, args);
    return array;
  }
  U.uniq = uniq

  // === {{{ U.isArray(value) }}} ===
  // Returns whether or not the {{{value}}} is an {{{Array}}} instance.

  U.isArray = Array.isArray;

  // === {{{ U.isEmpty(value) }}} ===
  // Returns whether or not the {{{value}}} has no own properties.

  function isEmpty(val) !keys(val).length;
  U.isEmpty = isEmpty

  // === {{{ U.classOf(value) }}} ===
  // Returns the internal {{{[[Class]]}}} property of the {{{value}}}.
  // See [[http://bit.ly/CkhjS#instanceof-considered-harmful]].

  function classOf(val) TO_STRING.call(val).slice(8, -1);
  U.classOf = classOf

  // === {{{ U.count(object) }}} ===
  // Returns the number of {{{object}}}'s own properties,
  // emulating (now obsolete) {{{__count__}}}. See [[http://bugzil.la/551529]].

  function count(obj) keys(obj).length;
  U.count = count

  // === {{{ U.keys(object) }}} ===
  // Returns an array of all own, enumerable property names of {{{object}}}.

  function keys(obj) Object.keys(Object(obj));
  U.keys = keys

  // === {{{ U.powerSet(set) }}} ===
  // Creates a [[http://en.wikipedia.org/wiki/Power_set|power set]] of
  // an array like {{{set}}}. e.g.:
  // {{{
  // powerSet([0,1,2]) // [[], [0], [1], [0,1], [2], [0,2], [1,2], [0,1,2]]
  // powerSet("ab")    // [[], ["a"], ["b"], ["a","b"]]
  // }}}

  function powerSet(arrayLike) {
    var ps = [[]];
    for (let i = 0, l = arrayLike.length; i < l; ++i) {
      let next = [arrayLike[i]];
      for each (let a in ps) ps.push(a.concat(next));
    }
    return ps;
  }
  U.powerSet = powerSet

  // === {{{ U.seq(lead_or_count, end, step = 1) }}} ===
  // Creates an iterator of simple number sequence.
  // {{{
  // [i for (i in seq(1, 3))]     // [1, 2, 3]
  // [i for (i in seq(3))]        // [0, 1, 2]
  // [i for (i in seq(4, 2, -1))] // [4, 3, 2]
  // seq(-7).slice(2, -2)         // [4, 3, 2]
  // }}}

  function Sequence(lead, end, step) {
    if (end == null && lead)
      [lead, end, step] = lead < 0 ? [~lead, 0, -1] : [0, ~-lead];
    return {
      __proto__: Sequence.prototype,
      lead: +lead, end: +end, step: +step || 1,
    };
  }
  extend(Sequence.prototype, {
    __iterator__: function seq_iter() {
      var {lead: i, end, step} = this;
      if (step < 0)
        for (; i >= end; i += step) yield i;
      else
        for (; i <= end; i += step) yield i;
    },
    __noSuchMethod__:
    function seq_pass(name, args) args[name].apply(this.toJSON(), args),
    get length() (this.end - this.lead) / this.step + 1 | 0,
    toJSON: function seq_toJSON() [x for (x in this)],
    toString: function seq_toString()
      "[object Sequence(" + this.lead + "," + this.end + "," + this.step + ")]",
  });
  U.seq = Sequence;
  U.Sequence = Sequence

  // === {{{ U.escapeHtml(string) }}} ===
  // Returns a version of the {{{string}}} safe for insertion into HTML.
  // Useful when you just want to concatenate a bunch of strings into
  // an HTML fragment and ensure that everything's escaped properly.

  function escapeHtml(s) String(s).replace(escapeHtml.re, escapeHtml.fn);
  escapeHtml.re = /[&<>\"\']/g;
  escapeHtml.fn = function escapeHtml_sub($) {
    switch ($) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
    }
  };
  U.escapeHtml = escapeHtml

  // === {{{ U.unescapeHtml(string) }}} ===
  // Returns a version of the {{{string}}} with all occurrences of HTML character
  // references (e.g. &spades; &#x2665; &#9827; etc.) in it decoded.

  function unescapeHtml(s)
    String(s).replace(unescapeHtml.re, U.UnescapeHTML.unescape);
  unescapeHtml.re = /(?:&#?\w+;)+/g;

  // === {{{ U.convertFromUnicode(toCharset, text) }}} ===
  // Encodes the given unicode text to a given character set.
  //
  // {{{toCharset}}} is a string corresponding to the character set
  // to encode to.
  //
  // {{{text}}} is a unicode string.

  function convertFromUnicode(toCharset, text) {
    var converter = U.UnicodeConverter;
    converter.charset = toCharset;
    return converter.ConvertFromUnicode(text) + converter.Finish();
  }

  // === {{{ U.convertToUnicode(fromCharset, text) }}} ===
  // Decodes the given text from a character set to unicode.
  //
  // {{{fromCharset}}} is a string corresponding to the character set to
  // decode from.
  //
  // {{{text}}} is a string encoded in the character set {{{fromCharset}}}.

  function convertToUnicode(fromCharset, text) {
    var converter = U.UnicodeConverter;
    converter.charset = fromCharset;
    return converter.ConvertToUnicode(text);
  }

  // === {{{ U.listenOnce(element, eventType, listener, useCapture) }}} ===
  //
  // Same as [[https://developer.mozilla.org/en/DOM/element.addEventListener]],
  // except that the {{{listener}}} will be automatically removed on its
  // first execution.
  // Returns the listening wrapper function which can be called/removed
  // manually if needed.

  function listenOnce(element, eventType, listener, useCapture) {
    function listener1(event) {
      element.removeEventListener(eventType, listener1, useCapture);
      if (typeof listener === "function")
        listener.call(this, event);
      else
        listener.handleEvent(event);
    }
    element.addEventListener(eventType, listener1, useCapture);
    return listener1;
  }
  U.listenOnce = listenOnce

  // === {{{ U.defineLazyProperty(obj, func, name) }}} ===
  // Defines a temporary getter {{{name}}} (or {{{func.name}}} if omitted)
  // to {{{obj}}}, which will be replaced with the return value of {{{func}}}
  // after the first access.

  function defineLazyProperty(obj, func, name) {
    if (typeof name !== "string") name = func.name;
    obj.__defineGetter__(name, function lazyProperty() {
      delete obj[name];
      return obj[name] = func.call(obj);
    });
    return obj;
  }
  U.defineLazyProperty = defineLazyProperty

  // === {{{ U.extend(target, object1, [objectN ...]) }}} ===
  // Extends {{{target}}} by copying properties from the rest of arguments.
  // Deals with getters/setters properly. Returns {{{target}}}.

  function extend(target) {
    for (let i = 1, l = arguments.length; i < l; ++i) {
      let obj = arguments[i];
      for each (let key in keys(obj)) {
        let g, s;
        (g = obj.__lookupGetter__(key)) && target.__defineGetter__(key, g);
        (s = obj.__lookupSetter__(key)) && target.__defineSetter__(key, s);
        g || s || (target[key] = obj[key]);
      }
    }
    return target;
  }
  U.extend = extend

  // == {{{ U.regexp(pattern, flags) }}} ==
  // Creates a regexp just like {{{RegExp}}}, except that it:
  // * falls back to a quoted version of {{{pattern}}} if the compile fails
  // * returns the {{{pattern}}} as is if it's already a regexp
  //
  // {{{
  // RegExp("[")          // SyntaxError("unterminated character class")
  // RegExp(/:/, "y")     // TypeError("can't supply flags when ...")
  // regexp("[")          // /\[/
  // regexp(/:/, "y")     // /:/
  // }}}
  // Also contains regexp related functions.

  function regexp(pattern, flags) {
    if (classOf(pattern) === "RegExp") return pattern;
    try {
      return RegExp(pattern, flags);
    } catch (e if e instanceof SyntaxError) {
      return RegExp(regexp.quote(pattern), flags);
    }
  }
  U.regexp = regexp

  // === {{{ U.regexp.quote(string) }}} ===
  // Returns the {{{string}}} with all regexp meta characters in it backslashed.

  regexp.quote = function re_quote(string)
    String(string).replace(/[.?*+^$|()\{\[\\]/g, "\\$&");

  // === {{{ U.regexp.Trie(strings, asPrefixes) }}} ===
  // Creates a {{{RegexpTrie}}} object that builds an efficient regexp
  // matching a specific set of {{{strings}}}.
  // This is a JS port of
  // [[http://search.cpan.org/~dankogai/Regexp-Trie-0.02/lib/Regexp/Trie.pm]]
  // with a few additions.
  //
  // {{{strings}}} is an optional array of strings to {{{add()}}}
  // (or {{{addPrefixes()}}} if {{{asPrefixes}}} evaluates to {{{true}}})
  // on initialization.

  regexp.Trie = function RegexpTrie(strings, asPrefixes) {
    var me = {$: {__proto__: null}, __proto__: RegexpTrie.prototype};
    if (strings) {
      let add = asPrefixes ? "addPrefixes" : "add";
      for each (let str in strings) me[add](str);
    }
    return me;
  };
  extend(regexp.Trie.prototype, {
    // ** {{{ RegexpTrie#add(string) }}} **\\
    // Adds {{{string}}} to the Trie and returns self.
    add: function RegexpTrie_add(string) {
      var ref = this.$;
      for each (let char in string)
        ref = ref[char] || (ref[char] = {__proto__: null});
      ref[""] = 1; // {"": 1} as terminator
      return this;
    },
    // ** {{{ RegexpTrie#addPrefixes(string) }}} **\\
    // Adds every prefix of {{{string}}} to the Trie and returns self. i.e.:
    // {{{
    // RegexpTrie().addPrefixes("ab") == RegexpTrie().add("a").add("ab")
    // }}}
    addPrefixes: function RegexpTrie_addPrefixes(string) {
      var ref = this.$;
      for each (let char in string)
        ref = ref[char] || (ref[char] = {"": 1, __proto__: null});
      return this;
    },
    // ** {{{ RegexpTrie#toString() }}} **\\
    // Returns a string representation of the Trie.
    toString: function RegexpTrie_toString() this._regexp(this.$),
    // ** {{{ RegexpTrie#toRegExp(flag) }}} **\\
    // Returns a regexp representation of the Trie with {{{flag}}}.
    toRegExp: function RegexpTrie_toRegExp(flag) RegExp(this, flag),
    _regexp: function RegexpTrie__regexp($) {
      LEAF_CHECK: if ("" in $) {
        for (let k in $) if (k) break LEAF_CHECK;
        return "";
      }
      var {quote} = regexp, alt = [], cc = [], q;
      for (let char in $) {
        if ($[char] !== 1) {
          let recurse = RegexpTrie__regexp($[char]);
          (recurse ? alt : cc).push(quote(char) + recurse);
        }
        else q = 1;
      }
      var cconly = !alt.length;
      if (cc.length) alt.push(1 in cc ?  "[" + cc.join("") + "]" : cc[0]);
      var result = 1 in alt ? "(?:" + alt.join("|") + ")" : alt[0];
      if (q) result = cconly ? result + "?" : "(?:" + result + ")?";
      return result || "";
    },
  });

  // == {{{ U.gist }}} ==
  // [[http://gist.github.com/|Gist]] related functions.

  U.gist = {
    // === {{{ U.gist.paste(files, id) }}} ===
    // Pastes code to Gist.
    //
    // {{{files}}} is the dictionary of name:code pairs.
    //
    // {{{id}}} is an optional number that specifies target Gist.
    // The user needs to be the owner of that Gist.
    paste: function gist_paste(files, id) {
      var data = id ? ["_method=put"] : [], i = 1;
      for (let name in files) {
        for (let [k, v] in new Iterator({
          name: name, contents: files[name] || "", ext: ""}))
          data.push("file_" + k + "[gistfile" + i + "]=" +
                    encodeURIComponent(v));
        ++i;
      }
      U.openUrlInBrowser("http://gist.github.com/gists/" + (id || ""),
                             data.join("&"));
    },

    // === {{{ U.gist.getName(document) }}} ===
    // Extracts the name of a Gist via its DOM {{{document}}}.
    getName: function gist_getName(document) {
      try { var {hostname, pathname, search} = document.location } catch (e) {}
      if (hostname !== "gist.github.com") return "";

      if (search.length > 1)
        try { return decodeURIComponent(search).slice(1) } catch (e) {}

      var name = "gist:" + /\w+/.exec(pathname), sep = " \u2013 ";

      var desc = document.getElementById("gist-text-description");
      if (desc && /\S/.test(desc.textContent))
        return name + sep + desc.textContent.trim();

      var info = document.querySelector(".file .info");
      if (info) return name + sep + info.textContent.trim().slice(0, -2);

      return name;
    },

    // === {{{ U.gist.fixRawUrl(url) }}} ===
    // Maps <http://gist.github.com/X.txt> to <https://raw.github.com/gist/X>.
    fixRawUrl: function gist_fixRawUrl(url) {
      var match = /^https?:\/\/gist\.github\.com(\/\d+)\.txt\b/.exec(url);
      return match ? "https://raw.github.com/gist" + match[1] : url;
    },
  };

  return U
}())

  exports.Utils = Utils;
})(window);
