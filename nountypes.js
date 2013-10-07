// = Built-in Noun Types =
// **//FIXME//**
// \\Explain:
// * how nouns work.
// * common properties.
// ** {{{suggest}}}
// ** {{{default}}}
// ** {{{label}}} (, {{{name}}}, {{{id}}})
// ** {{{noSelection}}}
// ** {{{noExternalCalls}}}

var NounUtils = (function() {

  var nu = {}

  // === {{{ NounUtils.NounType(label, expected, defaults) }}} ===
  //
  // Constructor of a noun type that accepts a specific set of inputs.
  // See {{{NounType._from*}}} methods for details
  // (but do not use them directly).
  //
  // {{{label}}} is an optional string specifying default label of the nountype.
  //
  // {{{expected}}} is the instance of {{{Array}}}, {{{Object}}} or {{{RegExp}}}.
  // The array can optionally be a space-separated string.
  //
  // {{{defaults}}} is an optional array or space-separated string
  // of default inputs.

  function NounType(label, expected, defaults) {
    if (!(this instanceof NounType))
      return new NounType(label, expected, defaults);

    if (typeof label !== "string")
      [label, expected, defaults] = ["?", label, expected];

    if (typeof expected.suggest === "function") return expected;

    function maybe_qw(o) typeof o === "string" ? o.match(/\S+/g) || [] : o;
    expected = maybe_qw(expected);
    defaults = maybe_qw(defaults);

    var maker = NounType["_from" + Utils.classOf(expected)];
    for (let [k, v] in new Iterator(maker(expected))) this[k] = v;
    this.suggest = maker.suggest;
    this.label = label;
    this.noExternalCalls = true;
    this.cacheTime = -1;
    // TODO fix to generate unique id
    if (this.id) this.id += (new Date())
    if (defaults) {
      // [[a], [b, c], ...] => [a].concat([b, c], ...) => [a, b, c, ...]
      this.default =
        Array.concat.apply(0, [this.suggest(d) for each (d in defaults)]);
    }
  }
  nu.NounType = NounType

  // ** {{{ NounUtils.NounType._fromArray(words) }}} **
  //
  // Creates a noun type that accepts a finite list of specific words
  // as the only valid inputs. Those words will be suggested as {{{text}}}s.
  //
  // {{{words}}} is the array of words.

  NounType._fromArray = function NT_Array(words)({
    id: "#na_",
    name: words.slice(0, 2) + (words.length > 2 ? ",..." : ""),
    _list: [makeSugg(w) for each (w in words)],
  });

  // ** {{{ NounUtils.NounType._fromObject(dict) }}} **
  //
  // Creates a noun type from the given key:value pairs, the key being
  // the {{{text}}} attribute of its suggest and the value {{{data}}}.
  //
  // {{{dict}}} is the object of text:data pairs.

  NounType._fromObject = function NT_Object(dict) {
    var list = [makeSugg(key, null, dict[key]) for (key in dict)];
    return {
      name: ([s.text for each (s in list.slice(0, 2))] +
             (list.length > 2 ? ",..." : "")),
      _list: list,
    };
  };

  NounType._fromArray.suggest = NounType._fromObject.suggest = (
    function NT_suggest(text) grepSuggs(text, this._list));

  // ** {{{ NounUtils.NounType._fromRegExp(regexp) }}} **
  //
  // Creates a noun type from the given regular expression object
  // and returns it. The {{{data}}} attribute of the noun type is
  // the {{{match}}} object resulting from the regular expression
  // match.
  //
  // {{{regexp}}} is the RegExp object that checks inputs.

  NounType._fromRegExp = function NT_RegExp(regexp) ({
    id: "#nr_",
    name: regexp + "",
    rankLast: regexp.test(""),
    _regexp: RegExp(
      regexp.source,
      [ "g"[regexp.global     - 1]
      , "i"[regexp.ignoreCase - 1]
      , "m"[regexp.multiline  - 1]
      , "y"[regexp.sticky     - 1]
      ].join('')),
  });
  NounType._fromRegExp.suggest = function NT_RE_suggest(text, html, cb,
                                                        selectionIndices) {
    var match = text.match(this._regexp);
    if (!match) return [];
    // ToDo: how to score global match
    var score = "index" in match ? matchScore(match) : 1;
    return [makeSugg(text, html, match, score, selectionIndices)];
  };

  // === {{{ NounUtils.matchScore(match) }}} ===
  //
  // Calculates the score for use in suggestions from
  // a result array ({{{match}}}) of {{{RegExp#exec}}}.

  const SCORE_BASE = 0.3;
  const SCORE_LENGTH = 0.25;
  const SCORE_INDEX = 1 - SCORE_BASE - SCORE_LENGTH;

  function matchScore(match) {
    var inLen = match.input.length;
    return (SCORE_BASE +
            SCORE_LENGTH * Math.sqrt(match[0].length / inLen) +
            SCORE_INDEX  * (1 - match.index / inLen));
  }
  nu.matchScore = matchScore

  // === {{{NounUtils.makeSugg(text, html, data, score, selectionIndices)}}} ===
  //
  // Creates a suggestion object, filling in {{{text}}} and {{{html}}} if missing
  // and constructing {{{summary}}} from {{{text}}} and {{{selectionIndices}}}.
  // At least one of {{{text}}}, {{{html}}} or {{{data}}} is required.
  //
  // {{{text}}} can be any string.
  //
  // {{{html}}} must be a valid HTML string.
  //
  // {{{data}}} can be any value.
  //
  // {{{score}}} is an optional float number representing
  // the score of the suggestion. Defaults to {{{1.0}}}.
  //
  // {{{selectionIndices}}} is an optional array containing the start and end
  // indices of selection within {{{text}}}.

  function makeSugg(text, html, data, score, selectionIndices, arg) {
    if (text == null && html == null && arguments.length < 3)
      // all inputs empty!  There is no suggestion to be made.
      return null;

    // Shift the argument if appropriate:
    if (typeof score === "object") {
      selectionIndices = score;
      score = null;
    }

    // Fill in missing fields however we can:
    if (text != null) text += "";
    if (html != null) html += "";
    if (!text && data != null)
      text = data.toString();
    if (!html && text >= "")
      html = Utils.escapeHtml(text);
    if (!text && html >= "")
      text = html.replace(/<[^>]*>/g, "");

    // Create a summary of the text:
    var snippetLength = 35;
    var summary = (text.length > snippetLength
                   ? text.slice(0, snippetLength - 1) + "\u2026"
                   : text);

    // If the input comes all or in part from a text selection,
    // we'll stick some html tags into the summary so that the part
    // that comes from the text selection can be visually marked in
    // the suggestion list.
    var [start, end] = selectionIndices || 0;
    summary = (
      start < end
      ? (Utils.escapeHtml(summary.slice(0, start)) +
         "<span class='selection'>" +
         Utils.escapeHtml(summary.slice(start, end)) +
         "</span>" +
         Utils.escapeHtml(summary.slice(end)))
      : Utils.escapeHtml(summary));

    return {
      text: text,
      html: html,
      data: data,
      summary: summary,
      score: score || 1,
      arg: arg
    }
  }
  nu.makeSugg = makeSugg

  // === {{{ NounUtils.grepSuggs(input, suggs, key) }}} ===
  //
  // A helper function to grep a list of suggestion objects by user input.
  // Returns an array of filtered suggetions, each of them assigned {{{score}}}
  // calculated by {{{NounUtils.matchScore()}}}.
  //
  // {{{input}}} is a string that filters the list.
  //
  // {{{suggs}}} is an array or dictionary of suggestion objects.
  //
  // {{{key}}} is an optional string to specify the target property
  // to match with. Defaults to {{{"text"}}}.

  function grepSuggs(input, suggs, key) {
    if (!input) return [];
    if (key == null) key = "text";
    var re = Utils.regexp(input, "i"), match;
    return ([(sugg.score = matchScore(match), sugg)
             for each (sugg in suggs) if ((match = re.exec(sugg[key])))]
            .sort(byScoreDescending));
  }
  nu.grepSuggs = grepSuggs

  function byScoreDescending(a, b) b.score - a.score;
  nu.byScoreDescending = byScoreDescending

  // === {{{ NounUtils.mixNouns(label, nouns) }}} ===
  //
  // Creates a noun by combining two or more nouns.
  //
  // {{{label}}} is an optional string specifying the created noun's label.
  //
  // {{{nouns}}} is the array of nouns.

  function mixNouns(label) {
    var gotLabel = typeof label === "string";
    var nouns = gotLabel ? arguments[1] : label;
    if (!Utils.isArray(nouns))
      nouns = Array.slice(arguments, gotLabel ? 1 : 0);
    function mixer(key) function suggestMixed() {
      var val, suggsList = [
        typeof val === "function" ? val.apply(noun, arguments) : val
        for each (noun in nouns) if ((val = noun[key])) ];
      return suggsList.concat.apply([], suggsList); // flatten
    };
    return {
      label: gotLabel ? label : [n.label || "?" for each (n in nouns)].join("|"),
      rankLast: nouns.some(function (n) n.rankLast),
      noExternalCalls: nouns.every(function (n) n.noExternalCalls),
      suggest: mixer("suggest"),
      default: nouns.some(function (n) "default" in n) && mixer("default"),
    };
  }
  nu.mixNouns = mixNouns

  return nu
}())

// === {{{ noun_arb_text }}} ===
// Suggests the input as is.
// * {{{text, html}}} : user input

var noun_arb_text = {
  id: "#arbtxt",
  label: "?",
  rankLast: true,
  noExternalCalls: true,
  cacheTime: -1,
  suggest: function nat_suggest(text, html, callback, selectionIndices) {
    return [NounUtils.makeSugg(text, html, null, 0.3, selectionIndices)];
  },
};

// === {{{ noun_type_email_service }}} ===
// **//FIXME//**
// * {{{text}}} :
// * {{{html}}} :
// * {{{data}}} :

var noun_type_email_service = NounUtils.NounType("email service",
                                                "googleapps gmail",
                                                "gmail");

// === {{{ noun_type_email }}} ===
// Suggests an email address (RFC2822 minus domain-lit).
// The regex is taken from:
// http://blog.livedoor.jp/dankogai/archives/51190099.html
// * {{{text, html}}} : email address

const EMAIL_ATOM = "[\\w!#$%&'*+/=?^`{}~|-]+";
var noun_type_email = {
  label: "email",
  noExternalCalls: true,
  cacheTime: -1,
  _email: RegExp("^(?:" + EMAIL_ATOM + "(?:\\." + EMAIL_ATOM +
                 ')*|(?:\\"(?:\\\\[^\\r\\n]|[^\\\\\\"])*\\"))@(' +
                 EMAIL_ATOM + "(?:\\." + EMAIL_ATOM + ")*)$"),
  _username: RegExp("^(?:" + EMAIL_ATOM + "(?:\\." + EMAIL_ATOM +
                    ')*|(?:\\"(?:\\\\[^\\r\\n]|[^\\\\\\"])*\\"))$'),
  suggest: function nt_email_suggest(text, html, cb, selectionIndices) {
    if (this._username.test(text))
      return [NounUtils.makeSugg(text, html, null, 0.3, selectionIndices)];

    var match = text.match(this._email);
    if (!match) return [];

    var domain = match[1];
    // if the domain doesn't have a period or the TLD
    // has less than two letters, penalize
    var score = /\.(?:\d+|[a-z]{2,})$/i.test(domain) ? 1 : 0.8;

    return [NounUtils.makeSugg(text, html, null, score, selectionIndices)];
  }
};

// === {{{ noun_type_percentage }}} ===
// Suggests a percentage value.
// * {{{text, html}}} : "?%"
// * {{{data}}} : a float number (1.0 for 100% etc.)

var noun_type_percentage = {
  label: "percentage",
  noExternalCalls: true,
  cacheTime: -1,
  default: NounUtils.makeSugg("100%", null, 1, 0.3),
  suggest: function nt_percentage_suggest(text, html) {
    var number = parseFloat(text);
    if (isNaN(number)) return [];

    var score = text.replace(/[^-\d.Ee%]/g, "").length / text.length;
    var nopercent = text.indexOf("%") < 0;
    if (nopercent) score *= 0.9;

    var suggs = [NounUtils.makeSugg(number + "%", null, number / 100, score)];
    // if the number's 10 or less and there's no
    // % sign, also try interpreting it as a proportion instead of a
    // percent and offer it as a suggestion as well, but with a lower
    // score.
    if (nopercent && number <= 10)
      suggs.push(NounUtils.makeSugg(
        number * 100 + "%", null, number, score * 0.9));
    return suggs;
  },
};

// === {{{ noun_type_search_engine }}} ===
// **//FIXME//**
// * {{{text, html}}} : name of the engine
// * {{{data}}} : engine object (see {{{nsIBrowserSearchService}}})

var noun_type_search_engine = {
  label: "search engine",
  noExternalCalls: true,
  // the default search engine should just get 0.3 or so...
  // if it's actually entered, it can get a higher score.
  default: function nt_sengine_default()
    this._sugg(this._BSS.defaultEngine, 0.3),
  suggest: function nt_sengine_suggest(text) {
    var suggs = this._BSS.getVisibleEngines({}).map(this._sugg);
    return NounUtils.grepSuggs(text, suggs);
  },
  /*
  _BSS: (Cc["@mozilla.org/browser/search-service;1"]
         .getService(Ci.nsIBrowserSearchService)),
         */
  _sugg: function nt_sengine__sugg(engine, score) (
    NounUtils.makeSugg(engine.name, null, engine, score || 1)),
};

// === {{{ noun_type_tag }}} ===
// Suggests the input as comma separated tags,
// plus completions based on existing tags.
// Defaults to all tags.
// * {{{text, html}}} : comma separated tags
// * {{{data}}} : an array of tags

var noun_type_tag = {
  label: "tag1[,tag2 ...]",
  rankLast: true,
  noExternalCalls: true,
  default: function nt_tag_default()
    [NounUtils.makeSugg(tag, null, [tag], .3)
     for each (tag in PlacesUtils.tagging.allTags)],
  suggest: function nt_tag_suggest(text) {
    // can accept multiple tags, separated by commas
    var tags = text.split(/\s*,\s*/).filter(RegExp.prototype.test.bind(/\S/));
    if (!tags.length) return tags;

    var score = .3, {pow} = Math;
    var {allTags} = PlacesUtils.tagging;
    var allTagsLC = [tag.toLowerCase() for each (tag in allTags)];
    for each (let [i, tag] in new Iterator(tags)) {
      let index = allTagsLC.indexOf(tag.toLowerCase());
      if (~index) {
        // if preexisting, boost score
        score = pow(score, .5);
        // replace with the one with proper case
        tags[i] = allTags[index];
      }
      else
        // if multi-word, unboost score
        score /= pow(2, (tag.match(/\s+/g) || "").length);
    }
    var suggs = [NounUtils.makeSugg(null, null, tags, score)];

    // assume last tag is still being typed - suggest completions for that
    var lastTagLC = tags[tags.length - 1].toLowerCase();
    for (let [i, atagLC] in new Iterator(allTagsLC))
      // only match from the beginning of a tag name (not the middle)
      if (lastTagLC.length < atagLC.length &&
          atagLC.indexOf(lastTagLC) === 0)
        suggs.push(NounUtils.makeSugg(null, null,
                                     tags.slice(0, -1).concat(allTags[i]),
                                     pow(score, .5)));

    return suggs;
  }
};

// === {{{ noun_type_awesomebar }}} ===
// Suggests "Awesome Bar" query results.
// * {{{text, html}}} : title or url
// * {{{data}}} : a query result
//   (see {{{Utils}}}{{{.history.search}}})

var noun_type_awesomebar = {
  label: "query",
  rankLast: true,
  noExternalCalls: true,
  cacheTime: 0,
  suggest: function nt_awesome_suggest(text, html, callback) {
    text = text.trim();
    if (!text) return [];

    var reqObj = {readyState: 2}, {_match} = this;
    Utils.history.search(text, function nt_awesome_results(results) {
      reqObj.readyState = 4;
      if (/\s/.test(text)) { // multi-word query
        //TODO: should we calculate scores for these as well? if so, how?
        callback([NounUtils.makeSugg(r.title || r.url, null, r)
                  for each(r in results)]);
        return;
      }
      var returnArr = [], lctxt = text.toLowerCase();
      for each (let r in results) {
        let u = _match(r.url, lctxt);
        let t = _match(r.title, lctxt);
        let m = u.score > t.score ? u : t;
        returnArr.push(NounUtils.makeSugg(m.input, null, r, m.score));
      }
      callback(returnArr);
    });
    return [reqObj];
  },
  // creates a fake match object with an applicable score
  _match: function nt_awesome_match(input, lctxt) {
    var index = input.toLowerCase().indexOf(lctxt);
    var match = {index: index, input: input, 0: lctxt};
    match.score = ~index && NounUtils.matchScore(match);
    return match;
  },
};

// === {{{ noun_type_extension }}} ===
// Suggests installed extensions.
// * {{{text, html}}} : extension name
// * {{{data}}} : contains extension {{{id}}}, {{{name}}} and {{{version}}}

var noun_type_extension = {
  label: "name",
  noExternalCalls: true,
  suggest: function nt_ext_suggest(text, html, cb) {
    if (this._list.length) return NounUtils.grepSuggs(text, this._list);

    var fakeReq = {readyState: 2};
    ("AddonManager" in Utils
     ? Utils.AddonManager.getAllAddons(setList)
     : setList(Utils.ExtensionManager.getItemList(2, {})));
    function setList(exts) {
      var {escapeHtml} = Utils;
      this._list = [
        let (h = escapeHtml(ext.name)) {
          text: ext.name, data: ext, html: h, summary: h}
        for each(ext in exts)];
      fakeReq.readyState = 4;
      cb(NounUtils.grepSuggs(text, this._list));
    }
    return [fakeReq];
  },
  _list: [],
};

// === {{{ noun_type_common_URI_scheme }}} ===
// Suggests common URI schemes, which are the IANA-registered ones
// plus Unofficial ones and a few Mozilla specific ones.
// See [[http://en.wikipedia.org/wiki/URI_scheme]].
// * {{{text, html}}} : URI scheme

var common_URI_schemes = [
  'aaa aaas acap cap cid crid data dav dict dns fax file ftp go gopher h323',
  'http https icap im imap info ipp iris iris.beep iris.xpc iris.xpcs iris.lws',
  'ldap mailto mid modem msrp msrps mtqp mupdate news nfs nntp opaquelocktoken',
  'pop pres prospero rtsp service shttp sip sips snmp soap.beep soap.beeps tag',
  'tel telnet tftp thismessage tip tv urn vemmi wais xmlrpc.beep xmpp',
  'z39.50r z39.50s',
  'about afp aim apt bolo bzr callto cel cvs daap ed2k feed fish gg git',
  'gizmoproject iax2 irc ircs itms lastfm ldaps magnet mms msnim psyc rsync',
  'secondlife skype ssh svn sftp smb sms soldat steam unreal ut2004 view-source',
  'vzochat webcal wyciwyg xfire ymsgr',
  'chrome resource'
].join(' ').match(/\S+/g);

var noun_type_common_URI_scheme = NounUtils.NounType(
  "URI scheme",
  [scheme + ":" for each (scheme in common_URI_schemes)]);

// === {{{ noun_type_url }}} ===
// Suggests URLs from the user's input and/or history.
// Defaults to the current page's URL if no input is given.
// * {{{text, html}}} : URL
// * {{{data}}} : null or query result (same as {{{noun_type_awesomebar}}})

var noun_type_url = {
  label: "URL",
  noExternalCalls: true,
  cacheTime: 0,
  default: function nt_url_default() {
    var {window} = NounUtils;
    var {location: {href}, document: {activeElement}} = window;
    if (/^https:\/\/www\.google\.[a-z.]+\/reader\/view\b/.test(href))
      try { href = window.wrappedJSObject.getPermalink().url } catch ([]) {}
    var suggs = [NounUtils.makeSugg(href, null, null, .5)];
    if (activeElement && activeElement.href)
      suggs.unshift(NounUtils.makeSugg(activeElement.href, null, null, .7));
    return suggs;
  },
  suggest: function nt_url_suggest(text, html, callback, selectionIndices) {
    text = text.trim();
    if (!text || /\s/.test(text)) return [];

    var score = 1;
    // has scheme?
    if (/^[\w.-]+:\/{0,2}(?=.)/.test(text)) {
      var {lastMatch: scheme, rightContext: postScheme} = RegExp;
      if (postScheme.indexOf(".") < 0) score *= 0.9;
    }
    // has TLD?
    else if (text.indexOf(".") > 0 && /\b[a-z]{2,}\b/i.test(text)) {
      var scheme = "http://", postScheme = text;
      if (selectionIndices)
        selectionIndices =
          [i + scheme.length for each (i in selectionIndices)];
      score *= 0.9;
    }
    else return [];

    var [domain, path] = postScheme.split(/[/?#]/, 2);
    // if it's just a domain name-looking thing, lower confidence
    if (path == null) score *= 0.9;
    // LDH charcodes include "Letters, Digits, and Hyphen".
    // We'll throw in . @ : too.
    if (/^(?![A-Za-z\d-.@:]+$)/.test(domain)) score *= 0.9;

    var fakeRequest = {readyState: 2};
    Utils.history.search(text, function nt_url_search(results) {
      fakeRequest.readyState = 4;
      var suggs = [], tlc = text.toLowerCase();
      for each (let r in results) {
        let urlIndex = r.url.toLowerCase().indexOf(tlc);
        if (urlIndex < 0) continue;
        let urlScore =
          NounUtils.matchScore({index: urlIndex, 0: text, input: r.url});
        suggs.push(NounUtils.makeSugg(
          r.url, null, r, urlScore,
          selectionIndices && [urlIndex, urlIndex + text.length]));
      }
      callback(suggs);
    });

    return [NounUtils.makeSugg(scheme + postScheme, null, null,
                              score, selectionIndices),
            fakeRequest];
  },
};


// === {{{ noun_type_command }}} ===
// Suggests each installed command whose name matches the input.
// * {{{text, html}}} : command name
// * {{{data}}} : command object

var noun_type_command = {
  label: "name",
  noExternalCalls: true,
  cacheTime: 0,
  suggest: function nt_command_suggest(text) {
    if (!text) return [];
    var grepee = this._get();
    if (!grepee.length) return grepee;
    var suggs = NounUtils.grepSuggs(text, grepee);
    if (!suggs.length) return suggs;
    Utils.uniq(suggs, function nt_command_id(s) s.data.id);
    for each (let s in suggs) s.html = s.summary = Utils.escapeHtml(s.text);
    return suggs;
  },
  _get: function nt_command__get() {
    var cmds = commandSource.getAllCommands();
    if ("disabled" in this) {
      let {disabled} = this;
      cmds = [cmd for each (cmd in cmds) if (cmd.disabled === disabled)];
    }
    return [{text: name, data: cmd}
            for each (cmd in cmds) for each (name in cmd.names)];
  },
};

// === {{{ noun_type_enabled_command }}} ===
// === {{{ noun_type_disabled_command }}} ===
// Same as {{{noun_type_command}}}, but with only enabled/disabled commands.

var noun_type_enabled_command = {
  __proto__: noun_type_command,
  get disabled() false,
};

var noun_type_disabled_command = {
  __proto__: noun_type_command,
  get disabled() true,
};

// === {{{ noun_type_skin }}} ===
// Suggests each installed skin whose name matches the input.
// * {{{text, html}}} : skin name
// * {{{data}}} : skin feed object (see {{{SkinFeedPlugin}}})

var noun_type_skin = {
  label: "name",
  noExternalCalls: true,
  cacheTime: 0,
  suggest: function nt_skin_suggest(text, html, cb, selected) {
    var suggs = [NounUtils.makeSugg(skin.metaData.name, null, skin)
                 for each (skin in skinService.skins)];
    return NounUtils.grepSuggs(text, suggs);
  },
};

// === {{{ noun_type_twitter_user }}} ===
// Suggests Twitter IDs from the user's login info.
// * {{{text, html}}} : Twitter ID
// * {{{data}}} : login data (see {{{nsILoginManager}}})

var noun_type_twitter_user = {
  label: "user",
  rankLast: true,
  noExternalCalls: true,
  cacheTime: 0,
  suggest: function nt_twuser_suggest(text, html, cb, selected) {
    // reject text from selection.
    if (!text || selected) return [];

    var foundAt = text[0] === "@";
    if (foundAt) text = text.slice(1); // strip off the @

    var suggs = NounUtils.grepSuggs(text, this.logins());

    if (/^\w+$/.test(text) && suggs.every(function(s) s.text !== text))
      suggs.push(NounUtils.makeSugg(text, null, {username: text}, .4));

    if (foundAt) suggs = [
      { __proto__: s,
        summary: "@" + s.summary,
        score: Math.pow(s.score, 0.8) }
      for each (s in suggs)];

    return suggs;
  },
  logins: function nt_twuser_logins(reload) {
    // TODO: figure out how often to clear this list cache.
    if (this._list && !reload) return this._list;
    var list = [];
    if (Utils.loggedIn) {
      // Look for twitter usernames stored in password manager
      const {LoginManager} = Utils, usersFound = {__proto__: null};
      for each (let url in ["https://twitter.com", "http://twitter.com"]) {
        for each (let login in LoginManager.findLogins({}, url, "", "")) {
          let {username} = login;
          if (username in usersFound) continue;
          usersFound[username] = true;
          list.push(NounUtils.makeSugg(username, null, login));
        }
      }
    }
    return this._list = list;
  },
  _list: null,
};

// === {{{ noun_type_number }}} ===
// Suggests a number value. Defaults to 1.
// * {{{text, html}}} : number text
// * {{{data}}} : number

var noun_type_number = {
  label: "number",
  noExternalCalls: true,
  cacheTime: -1,
  suggest: function nt_number_suggest(text) {
    var num = +text;
    return isNaN(num) ? [] : [NounUtils.makeSugg(text, null, num)];
  },
  default: NounUtils.makeSugg("1", null, 1, 0.5),
};

// === {{{ noun_type_date }}} ===
// === {{{ noun_type_time }}} ===
// === {{{ noun_type_date_time }}} ===
// Suggests a date/time for input, using the mighty {{{Date.parse()}}}.
// Defaults to today/now.
// * {{{text, html}}} : date/time text
// * {{{data}}} : {{{Date}}} instance

function scoreDateTime(text) {
  // Give penalty for short input only slightly,
  // as Date.parse() can handle variety of lengths like:
  // "t" or "Wednesday September 18th 2009 13:29:54 GMT+0900",
  var score = Math.pow(text.length / 42, 1 / 17); // .8 ~
  return score > 1 ? 1 : score;
}

var noun_type_date = {
  label: "date",
  noExternalCalls: true,
  cacheTime: 0,
  "default": function nt_date_default() this._sugg(Date.today()),
  suggest: function nt_date_suggest(text) {
    var date = Date.parse(text);
    if (!date) return [];

    var score = scoreDateTime(text);
    if (date.isToday())
      score *= .5;
    if (date.getHours() || date.getMinutes() || date.getSeconds())
      score *= .7;

    return [this._sugg(date, score)];
  },
  _sugg: function nt_date__sugg(date, score)
    NounUtils.makeSugg(date.toString("yyyy-MM-dd"), null, date, score),
};

var noun_type_time = {
  label: "time",
  noExternalCalls: true,
  cacheTime: 0,
  "default": function nt_time_default() this._sugg(Date.parse("now")),
  suggest: function nt_time_suggest(text, html) {
    var date = Date.parse(text);
    if (!date) return [];

    var score = scoreDateTime(text), now = Date.parse("now");
    if (Math.abs(now - date) > 9) { // not "now"
      if (!now.isSameDay(date))
        score *= .7; // not "today"
      if (!date.getHours() && !date.getMinutes() && !date.getSeconds())
        score *= .5; // "00:00:00"
    }
    return [this._sugg(date, score)];
  },
  _sugg: function nt_time__sugg(date, score)
    NounUtils.makeSugg(date.toString("hh:mm:ss tt"), null, date, score),
};

var noun_type_date_time = {
  label: "date and time",
  noExternalCalls: true,
  cacheTime: 0,
  "default": function nt_date_time_default() this._sugg(Date.parse("now")),
  suggest: function nt_time_suggest(text) {
    var date = Date.parse(text);
    if (!date) return [];

    var score = scoreDateTime(text), now = Date.parse("now");
    if (Math.abs(now - date) > 9) { // not "now"
      if (now.isSameDay(date))
        score *= .7; // "today"
      if (!date.getHours() && !date.getMinutes() && !date.getSeconds())
        score *= .7; // "00:00:00"
    }
    return [this._sugg(date, score)];
  },
  _sugg: function nt_date_time__sugg(date, score)
    NounUtils.makeSugg(date.toString("yyyy-MM-dd hh:mm tt"), null, date,
                      score),
};

// === {{{ noun_type_contact }}} ===
// Same as {{{noun_type_email}}}, but also suggests
// the user's contact informations that are fetched from Gmail (for now).
// * {{{text}}} : email address
// * {{{html}}} : same as {{{summary}}}
// * {{{data}}} : name of contactee

var noun_type_contact = {
  label: "name or email",
  suggest: function nt_contact_suggest(text, html, callback) {
    var suggs = noun_type_email.suggest.apply(noun_type_email, arguments);
    if (this._list) return this._grep(text).concat(suggs);
    var self = this;
    this._list = [];
    getGmailContacts(
      function nt_contact_ok(contacts) {
        var list = self._list;
        for each (var {name, email} in contacts) {
          let htm = name + '&lt;' + email + '&gt;'
          list.push({
            text: email, html: htm, data: name, summary: htm, score: 1});
        }
        callback(self._grep(text));
      },
      function nt_contact_ng(info) {
        setTimeout(function nt_contact_reset() { self._list = null },
                   self._retryInterval *= 2);
        Utils.reportInfo(
          info + " (retrying in " + self._retryInterval / 1e3 + " sec.)");
      });
    return suggs;
  },
  _list: null,
  _retryInterval: 5e3,
  _grep: function nt_contact__grep(text)
    Utils.uniq([].concat(NounUtils.grepSuggs(text, this._list, "data"),
                         NounUtils.grepSuggs(text, this._list)),
               "text"),
};

function getGmailContacts(ok, ng) {
  if (!Utils.loggedIn)
    return ng("Gmail: Not logged in.");
  var logins = Utils.LoginManager
    .findLogins({}, "https://www.google.com", "", "");
  if (!logins.length)
    return ng("No Google logins.");
  var errors = 0;
  for each (let login in logins) jQuery.ajax({
    type: "POST", url: "https://www.google.com/accounts/ClientLogin",
    data: {
      Email  : login.username,
      Passwd : login.password,
      accountType: "GOOGLE", service: "cp", source: "Mozilla-Ubiquity-0.6",
    },
    error: googleContactsError,
    success: function googleClientLoggedIn(data, status, xhr) {
      var [, auth] = /^Auth=(.+)/m.exec(data) || 0;
      if (!auth) return this.error(xhr);
      jQuery.ajax({
        url: "https://www.google.com/m8/feeds/contacts/default/full",
        dataType: "xml",
        beforeSend: function setGoogleLoginAuth(xhr) {
          xhr.setRequestHeader("Authorization", "GoogleLogin auth=" + auth);
        },
        error: googleContactsError,
        success: function onContacts(atom) let (email) ok(
          [{name  : entry.querySelector("title").textContent,
            email : email.getAttribute("address")}
           for each (entry in Array.slice(atom.getElementsByTagName("entry")))
             if (email = entry.querySelector("email"))]),
      });
    },
  });
  function googleContactsError(xhr) {
    Utils.reportInfo(this.url + ": " + xhr.status + " " + xhr.statusText);
    ++errors == logins.length && ng("Failed retrieving Google Contacts");
  }
}

// === {{{ noun_type_geolocation }}} ===
// * {{{text, html}}} : user input / "city,( state,) country"
// * {{{data}}} : {{{null}}} or geoLocation object
//   (as returned by {{{NounUtils}}}{{{.getGeoLocation()}}})

var noun_type_geolocation = {
  label: "geolocation",
  rankLast: true,
  default: function nt_geoloc_default(loc) {
    if (!(loc = loc || NounUtils.geoLocation)) return null;
    var {city, state, country: text} = loc;
    if (state && state !== city) text = state + ", " + text;
    if (city) text = city + ", " + text;
    return NounUtils.makeSugg(text, null, loc);
  },
  suggest: function nt_geoloc_suggest(text, html, callback, selectionIndices) {
    // LONGTERM TODO: try to detect whether fragment is anything like
    // a valid location or not, and don't suggest anything
    // for input that's not a location.
    var suggs = [NounUtils.makeSugg(text, null, null, 0.3, selectionIndices)];
    // TODO: we should try to build this "here" handling into something like
    // magic words (anaphora) handling in Parser 2: make it localizable.
    if (/^\s*here\s*$/i.test(text)) {
      let me = this;
      suggs.push(NounUtils.getGeoLocation(function nt_geoloc_async(loc) {
        callback(me.default(loc));
      }));
    }
    return suggs;
  },
};

// === {{{ noun_type_lang_google }}} ===
// Suggests languages used in various Google services.
// * {{{text, html}}} : language name
// * {{{data}}} : language code
//
// {{{getLangName(code)}}} returns the corresponding language name
// for {{{code}}}.

var noun_type_lang_google = NounUtils.NounType("language", {
  Afrikaans: "af",
  Albanian: "sq",
  Arabic: "ar",
  Armenian: "hy",
  Azerbaijani: "az",
  Basque: "eu",
  Belarusian: "be",
  Bulgarian: "bg",
  Catalan: "ca",
  "Chinese Simplified": "zh-CN",
  "Chinese Traditional": "zh-TW",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dutch: "nl",
  English: "en",
  Estonian: "et",
  Filipino: "tl",
  Finnish: "fi",
  French: "fr",
  Galician: "gl",
  Georgian: "ka",
  German: "de",
  Greek: "el",
  Hebrew: "iw",
  Hindi: "hi",
  Hungarian: "hu",
  Icelandic: "is",
  Indonesian: "id",
  Irish: "ga",
  Italian: "it",
  Japanese: "ja",
  Korean: "ko",
  Latin: "la",
  Latvian: "lv",
  Lithuanian: "lt",
  Macedonian: "mk",
  Malay: "ms",
  Maltese: "mt",
  Norwegian: "no",
  Persian: "fa",
  Polish: "pl",
  Portuguese: "pt",
  Romanian: "ro",
  Russian: "ru",
  Serbian: "sr",
  Slovak: "sk",
  Slovenian: "sl",
  Spanish: "es",
  Swahili: "sw",
  Swedish: "sv",
  Thai: "th",
  Turkish: "tr",
  Ukrainian: "uk",
  Urdu: "ur",
  Vietnamese: "vi",
  Welsh: "cy",
  Yiddish: "yi",
});

// === {{{ noun_type_lang_wikipedia }}} ===
// Suggests languages used in Wikipedia.
// Works as same as noun_{{{type_lang_google}}}.

// from http://meta.wikimedia.org/wiki/List_of_Wikipedias
// omitting ones with 100+ articles
var noun_type_lang_wikipedia = NounUtils.NounType("language", {
  English: "en",
  German: "de",
  French: "fr",
  Polish: "pl",
  Japanese: "ja",
  Italian: "it",
  Dutch: "nl",
  Portuguese: "pt",
  Spanish: "es",
  Russian: "ru",
  Swedish: "sv",
  Chinese: "zh",
  "Norwegian (Bokmal)": "no",
  Finnish: "fi",
  Catalan: "ca",
  Ukrainian: "uk",
  Turkish: "tr",
  Czech: "cs",
  Hungarian: "hu",
  Romanian: "ro",
  Volapuk: "vo",
  Esperanto: "eo",
  Danish: "da",
  Slovak: "sk",
  Indonesian: "id",
  Arabic: "ar",
  Korean: "ko",
  Hebrew: "he",
  Lithuanian: "lt",
  Vietnamese: "vi",
  Slovenian: "sl",
  Serbian: "sr",
  Bulgarian: "bg",
  Estonian: "et",
  Persian: "fa",
  Croatian: "hr",
  "Simple English": "simple",
  "Newar / Nepal Bhasa": "new",
  Haitian: "ht",
  "Norwegian (Nynorsk)": "nn",
  Galician: "gl",
  Thai: "th",
  Telugu: "te",
  Greek: "el",
  Malay: "ms",
  Basque: "eu",
  Cebuano: "ceb",
  Hindi: "hi",
  Macedonian: "mk",
  Georgian: "ka",
  Latin: "la",
  Bosnian: "bs",
  Luxembourgish: "lb",
  Breton: "br",
  Icelandic: "is",
  "Bishnupriya Manipuri": "bpy",
  Marathi: "mr",
  Albanian: "sq",
  Welsh: "cy",
  Azeri: "az",
  "Serbo-Croatian": "sh",
  Tagalog: "tl",
  Latvian: "lv",
  Piedmontese: "pms",
  Bengali: "bn",
  "Belarusian (Tarashkevitsa)": "be-x-old",
  Javanese: "jv",
  Tamil: "ta",
  Occitan: "oc",
  Ido: "io",
  Belarusian: "be",
  Aragonese: "an",
  "Low Saxon": "nds",
  Sundanese: "su",
  Sicilian: "scn",
  Neapolitan: "nap",
  Kurdish: "ku",
  Asturian: "ast",
  Afrikaans: "af",
  "West Frisian": "fy",
  Swahili: "sw",
  Walloon: "wa",
  Cantonese: "zh-yue",
  Samogitian: "bat-smg",
  Quechua: "qu",
  Urdu: "ur",
  Chuvash: "cv",
  Ripuarian: "ksh",
  Malayalam: "ml",
  Tajik: "tg",
  Irish: "ga",
  Venetian: "vec",
  Tarantino: "roa-tara",
  "Waray-Waray": "war",
  Uzbek: "uz",
  "Scottish Gaelic": "gd",
  Kapampangan: "pam",
  Kannada: "kn",
  Maori: "mi",
  Yiddish: "yi",
  Yoruba: "yo",
  Gujarati: "gu",
  Nahuatl: "nah",
  Lombard: "lmo",
  Corsican: "co",
  Gilaki: "glk",
  "Upper Sorbian": "hsb",
  "Min Nan": "zh-min-nan",
  Aromanian: "roa-rup",
  Alemannic: "als",
  Interlingua: "ia",
  Limburgian: "li",
  Armenian: "hy",
  Sakha: "sah",
  Kazakh: "kk",
  Tatar: "tt",
  Gan: "gan",
  Sanskrit: "sa",
  Turkmen: "tk",
  Wu: "wuu",
  "Dutch Low Saxon": "nds-nl",
  Faroese: "fo",
  "West Flemish": "vls",
  Norman: "nrm",
  Ossetian: "os",
  Voro: "fiu-vro",
  Amharic: "am",
  Romansh: "rm",
  Banyumasan: "map-bms",
  Pangasinan: "pag",
  Divehi: "dv",
  Mongolian: "mn",
  "Egyptian Arabic": "arz",
  "Northern Sami": "se",
  Zazaki: "diq",
  Nepali: "ne",
  Friulian: "fur",
  Manx: "gv",
  Scots: "sco",
  Ligurian: "lij",
  Novial: "nov",
  Bavarian: "bar",
  Bihari: "bh",
  Maltese: "mt",
  Ilokano: "ilo",
  Pali: "pi",
  "Classical Chinese": "zh-classical",
  Khmer: "km",
  "Franco-Provencal/Arpitan": "frp",
  Mazandarani: "mzn",
  Kashubian: "csb",
  Ladino: "lad",
  "Pennsylvania German": "pdc",
  Uyghur: "ug",
  Cornish: "kw",
  Sinhalese: "si",
  "Anglo-Saxon": "ang",
  Hawaiian: "haw",
  Tongan: "to",
  Sardinian: "sc",
  "Central_Bicolano": "bcl",
  Komi: "kv",
  Punjabi: "pa",
  Pashto: "ps",
  Silesian: "szl",
  Interlingue: "ie",
  Malagasy: "mg",
  Guarani: "gn",
  Lingala: "ln",
  Burmese: "my",
  "Fiji Hindi": "hif",
}, "^_");

/*
for each (let ntl in [noun_type_lang_google, noun_type_lang_wikipedia]) {
  ntl._code2name = ntl._list.reduce(function (o, s) {
    o[s.data] = s.text;
    return o;
  }, {});
  ntl.getLangName = function getLangName(langCode) this._code2name[langCode];
  ntl.noSelection = true;
}
{
  let locale =
    Utils.prefs.getValue("general.useragent.locale", "en").slice(0, 2);
  let langName = noun_type_lang_wikipedia.getLangName(locale);
  if (langName)
    noun_type_lang_wikipedia.default.push(
      NounUtils.makeSugg(langName, null, locale));
}
*/

function NounAsync(label, checker) {
  return {
    label: label,
    suggest: function asyncSuggest(text, html, callback, selectionIndices) {
      return [checker(text, callback, selectionIndices)];
    },
  };
}

// === {{{ noun_type_async_restaurant }}} ===
// **//FIXME//**
// * {{{text}}} :
// * {{{html}}} :
// * {{{data}}} :

var noun_type_async_restaurant = NounAsync("restaurant", getRestaurants);

function getRestaurants(query, callback, selectionIndices) {
  if (!query) return;

  var baseUrl = "http://api.yelp.com/business_review_search";
  var queryToMatch = query.toLowerCase().replace(/\s+/g, '');
  var loc = NounUtils.getGeoLocation();
  var near = loc ? loc.city + "," + loc.state : "";

  return jQuery.ajax({
    url: baseUrl + Utils.paramsToString({
      term: query,
      num_biz_requested: 1,
      location: near,
      category: "restaurants",
      ywsid: "HbSZ2zXYuMnu1VTImlyA9A",
    }),
    dataType: "json",
    error: function () {
      callback([]);
    },
    success: function (data) {
      var allBusinesses = data.businesses.map(
        function (business) {
          return {name: business.name.toLowerCase().replace(/\s+/g, ''),
            categories: business.categories};
        });
      // if the business's name or category overlaps with the query
      // then consider it a restaurant match
      for each (let business in allBusinesses) {
        if (business.name.indexOf(queryToMatch) !== -1 ||
            queryToMatch.indexOf(business.name) !== -1) {
          callback([NounUtils.makeSugg(query, null, null, .9,
                                      selectionIndices)]);
          return;
        }
        else {
          for each (let category in business.categories) {
            if (category.name.indexOf(queryToMatch) !== -1 ||
                queryToMatch.indexOf(category.name) !== -1) {
              callback([NounUtils.makeSugg(query, null, null, .9,
                                          selectionIndices)]);
              return;
            }
          }
        }
      }
      callback([]);
    }
  });
}

// === {{{ noun_type_geo_country }}} ===
// === {{{ noun_type_geo_region }}} ===
// === {{{ noun_type_geo_subregion }}} ===
// === {{{ noun_type_geo_town }}} ===
// === {{{ noun_type_geo_postal }}} ===
// === {{{ noun_type_geo_address }}} ===

var noun_type_geo_country = NounGeo("country", 1, 1);
// Think American states, provinces in many countries, Japanese prefectures.
var noun_type_geo_region = NounGeo("region", 2, 2);
var noun_type_geo_subregion = NounGeo("subregion", 3, 3);
var noun_type_geo_town = NounGeo("city/town", 4, 4);
var noun_type_geo_postal = NounGeo("postal code", 5, 5);
var noun_type_geo_address = NounGeo("address", 6, 9);

// http://code.google.com/intl/ja/apis/maps/documentation/reference.html
// #GGeoAddressAccuracy
function NounGeo(label, minAccuracy, maxAccuracy) ({
  label: label,
  suggest: function geo_suggest(text, html, callback)
    [getGeo(text, callback, minAccuracy, maxAccuracy)],
});
function getGeo(query, callback, minAccuracy, maxAccuracy) jQuery.ajax({
  url: "http://maps.google.com/maps/geo",
  data: {
    q: query,
    output: "json",
    oe: "utf8",
    sensor: "false",
    key: ("ABQIAAAAzBIC_wxmje-aKLT3RzZx7BQFk1cXV-t8vQsDjF" +
          "X6X7KZv96YRxSFucHgmE5u4oZ5fuzOrPHpaB_Z2w"),
  },
  dataType: "json",
  success: function ggeo_success(data) {
    if (data.Status.code !== 200 || !(data.Placemark || "").length) return;

    var results = [];
    for each (let result in data.Placemark) {
      // if there are no AddressDetails, it has no accuracy value either
      // so let's ignore it.
      if (!result.AddressDetails) continue;

      // matchScore() isn't suitable, as the API allows ambiguous matching.
      // e.g.:  nrth -> north / can -> Çan / akihabara -> 秋葉原
      let score = accuracyScore(result.AddressDetails.Accuracy,
                                minAccuracy, maxAccuracy);
      results.push(formatGooglePlacemark(result, score));
    }
    callback(results);
  }
});

function accuracyScore(score, minAccuracy, maxAccuracy) (
  score < minAccuracy
  ? Math.pow(0.8, minAccuracy - score) :
  score > maxAccuracy
  ? Math.pow(0.8, score - maxAccuracy)
  : 1);

function formatGooglePlacemark(placemark, score) {
  var data = placemark.AddressDetails;
  [data.lon, data.lat] = placemark.Point.coordinates;
  return NounUtils.makeSugg(placemark.address, null, data, score);
}


// ** DEPRECATED ** \\
// {{{noun_type_language}}}\\
// {{{noun_type_commands}}}\\
// {{{noun_type_emailservice}}}\\
// {{{noun_type_searchengine}}}
for (let [old, now] in new Iterator({
  language: noun_type_lang_google,
  commands: noun_type_command,
  emailservice: noun_type_email_service,
  searchengine: noun_type_search_engine,
  async_address: noun_type_geo_address,
})) {
  let sym = "noun_type_" + old;
  this[sym] = now;
}

