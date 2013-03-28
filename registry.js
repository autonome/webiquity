/***** BEGIN LICENSE BLOCK *****
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
 
NLParser2.loadParserMaker('$', function makeParser() new Parser({
  lang: "$",
  anaphora: ["$"],
  roles: [{role: r, delimiter: d} for ([r, ds] in Iterator({
    goal       : ">",
    source     : "<",
    location   : "@",
    time       : ":",
    instrument : "+",
    alias      : "=",
    format     : "%",
    modifier   : "*",
  })) for each (d in ds.split(" "))],
  branching: "right",
  usespaces: true,
}))

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Toni Hermoso Pulido <toniher@softcatala.cat>
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
 
NLParser2.loadParserMaker('ca', function makeParser() {
  var ca = new Parser('ca');
  ca.roles = [
    {role: 'goal', delimiter: 'a'},
    {role: 'goal', delimiter: 'al'},
    {role: 'goal', delimiter: 'als'},
    {role: 'source', delimiter: 'de'},
    {role: 'source', delimiter: 'dels'},
    {role: 'alias', delimiter: 'com'},
    {role: 'time', delimiter: 'a'},
    {role: 'location', delimiter: 'a'},
    {role: 'instrument', delimiter: 'amb'},
    {role: 'instrument', delimiter: 'sobre'}
  ];

  ca.argumentNormalizer = new RegExp('^(el\\s+|la\\s+|les\\s+|l\')(.+)()$','i');
  ca.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[2], suffix:matches[3]}];
    return [];
  },

  ca.anaphora = ["açò", "allò", "això", "la selecció"];
  
  ca.branching = 'right';

  ca.clitics = [
    {clitic: 'el', role: 'object'},
    {clitic: 'els', role: 'object'}
  ];

  ca.verbFinalMultiplier = 0.3;

  return ca;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Christian Sonne <cers@geeksbynature.dk>
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

NLParser2.loadParserMaker('da', function makeParser() {
  var da = new Parser('da');
  da.anaphora = ["det","dette", "den", "denne", "han", "hun", "dem", "de", "markering", "markeringen"];
  da.roles = [
    {role: 'goal', delimiter: 'til'},
    {role: 'source', delimiter: 'fra'},
    {role: 'time', delimiter: 'klokken'},
    {role: 'time', delimiter: 'på'},
    {role: 'time', delimiter: 'den'},
    {role: 'time', delimiter: 'omkring'},
    {role: 'location', delimiter: 'på'},
    {role: 'location', delimiter: 'i'},
    {role: 'location', delimiter: 'ved'},
    {role: 'location', delimiter: 'nær'},
    {role: 'location', delimiter: 'omkring'},
    {role: 'location', delimiter: 'hos'},
    {role: 'instrument', delimiter: 'med'},
    {role: 'instrument', delimiter: 'gennem'},
    {role: 'instrument', delimiter: 'via'},
    {role: 'instrument', delimiter: 'kva'},
    {role: 'format', delimiter: 'i'},
    {role: 'format', delimiter: 'på'},
    {role: 'alias', delimiter: 'som'},
    {role: 'alias', delimiter: 'navngivet'} // "ved navn" when spaces are allowed
  ];
  da.branching = 'right';

  return da;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Christian Sonne <cers@geeksbynature.dk>
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

NLParser2.loadParserMaker('de', function makeParser() {
  var de = new Parser("de");
  de.anaphora = ["das","es","markierung","alles"];
  de.roles = [
    {role: "goal", delimiter: "nach"},
    //{role: "goal", delimiter: "bis"},
    {role: "goal", delimiter: "zu"},
    {role: "goal", delimiter: "an"},
    {role: "source", delimiter: "von"},
    {role: "source", delimiter: "aus"},
    {role: "time", delimiter: "um"},
    {role: "location", delimiter: "nahe"},
    {role: "location", delimiter: "in"},
    {role: "location", delimiter: "bei"},
    {role: "location", delimiter: "neben"},
    {role: "instrument", delimiter: "mit"},
    {role: "instrument", delimiter: "mithilfe"},
    {role: "instrument", delimiter: "via"},
    {role: "instrument", delimiter: "durch"},
    {role: "format", delimiter: "in"},
    {role: "format", delimiter: "als"},
  ];
  de.branching = "right";

  return de
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Brandon Pung <brandonpung@gmail.com>
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

NLParser2.loadParserMaker('en', function makeParser() new Parser({
  lang: "en",
  anaphora: ["this", "that", "it", "selection", "him", "her", "them"],
  roles: [
    {role: "goal", delimiter: "to"},
    {role: "source", delimiter: "from"},
    {role: "location", delimiter: "near"},
    {role: "location", delimiter: "on"},
    {role: "location", delimiter: "at"},
    {role: "location", delimiter: "in"},
    {role: "time", delimiter: "at"},
    {role: "time", delimiter: "on"},
    {role: "instrument", delimiter: "with"},
    {role: "instrument", delimiter: "using"},
    {role: "format", delimiter: "in"},
    {role: "modifier", delimiter: "of"},
    {role: "modifier", delimiter: "for"},
    {role: "alias", delimiter: "as"},
    {role: "alias", delimiter: "named"}
  ],
  branching: "right",
  verbFinalMultiplier: 0.3
}));

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   kelopez
 *   Roberto MuÃ±oz GÃ³mez <munoz.roberto@gmail.com>
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
 
NLParser2.loadParserMaker('es', function makeParser() {
  var es = new Parser('es');
  es.roles = [
	{role: 'goal', delimiter: 'hasta'},
	{role: 'goal', delimiter: 'hacia'},
	{role: 'goal', delimiter: 'a'},
	{role: 'source', delimiter: 'desde'},
	{role: 'source', delimiter: 'de'},
	{role: 'location', delimiter: 'en'},
	{role: 'time', delimiter: 'a'},
	{role: 'instrument', delimiter: 'con'},
	{role: 'instrument', delimiter: 'usando'},
	{role: 'format', delimiter: 'en'},
	{role: 'alias', delimiter: 'como'},
	{role: 'modifier', delimiter: 'de'},
  ];

  es.argumentNormalizer = new RegExp('^(el|lo\\s+|la\\s+)(.+)()$','i');
  es.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[2], suffix:matches[3]}];
    return [];
  },

  es.anaphora = ["esto", "eso", "la selección", "él", "ella", "ellos", "ellas"];
  
  es.branching = 'right';

  es.clitics = [
    {clitic: 'el', role: 'object'},
    {clitic: 'los', role: 'object'}
  ];

  es.verbFinalMultiplier = 0.3;

  return es;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
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

NLParser2.loadParserMaker('fr', function makeParser() {
  var fr = new Parser('fr');
  fr.roles = [
    {role: 'goal', delimiter: 'à'},
    {role: 'goal', delimiter: 'a'},
    {role: 'goal', delimiter: 'au'},
    {role: 'goal', delimiter: 'aux'},
    {role: 'source', delimiter: 'de'},
    {role: 'source', delimiter: 'des'},
    {role: 'modifier', delimiter: 'de'},
    {role: 'modifier', delimiter: 'des'},
    {role: 'location', delimiter: 'en'},
    {role: 'location', delimiter: 'sur'},
    {role: 'location', delimiter: 'à'},
    {role: 'location', delimiter: 'a'},
    {role: 'time', delimiter: 'à'},
    {role: 'time', delimiter: 'a'},
    {role: 'instrument', delimiter: 'avec'},
    {role: 'instrument', delimiter: 'utilisant'},
    // multiword delimiter: currently unsupported
    {role: 'instrument', delimiter: 'en utilisant'},
    {role: 'alias', delimiter: 'comme'},
    {role: 'format', delimiter: 'en'}
  ];

  fr.argumentNormalizer = new RegExp('^(le\\s+|la\\s+|les\\s+|l\')(.+)()$','i');
  fr.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[2], suffix:matches[3]}];
    return [];
  },

  fr.branching = 'right';
  fr.clitics = [
    {clitic: 'le', role: 'object'},
    {clitic: 'les', role: 'object'}
  ];

  fr.verbFinalMultiplier = 0.3;

  return fr;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Sandro Della Giustina <sandrodll@yahoo.it>
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
 
NLParser2.loadParserMaker('it', function makeParser() {
  var it = new Parser('it');
  it.roles = [
    {role: 'goal', delimiter: 'a'},
    {role: 'goal', delimiter: 'al'},
    {role: 'goal', delimiter: 'alla'},
    {role: 'goal', delimiter: 'all\''},
    {role: 'goal', delimiter: 'agli'},
    {role: 'goal', delimiter: 'ai'},
    {role: 'goal', delimiter: 'alle'},
    {role: 'goal', delimiter: 'in'},
    {role: 'source', delimiter: 'da'},
    {role: 'source', delimiter: 'dal'},
    {role: 'source', delimiter: 'dalla'},
    {role: 'source', delimiter: 'dall\''},
    {role: 'source', delimiter: 'dagli'},
    {role: 'source', delimiter: 'dai'},
    {role: 'alias', delimiter: 'con'},
    {role: 'location', delimiter: 'alle'},
    {role: 'time', delimiter: 'alle'},
    {role: 'instrument', delimiter: 'su'}
  ];

  it._patternCache.contractionMatcher = new RegExp('(^| )(all\'|dall\')','g');
  it.wordBreaker = function(input) {
    return input.replace(this._patternCache.contractionMatcher,'$1$2\u200b');
  };

/*  it.argumentNormalizer = new RegExp('^(il\\s+|la\\s+|gli\\s+|l\')(.+)()$','i');
  it.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[2], suffix:matches[3]}];
    return [];
  },
*/
  it.anaphora = ["questa", "questo", "la selezione","testo selezionato"];
  
  it.branching = 'right';

  it.clitics = [
    {clitic: 'el', role: 'object'},
    {clitic: 'els', role: 'object'}
  ];

  return it;

});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
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

NLParser2.loadParserMaker('ja', function makeParser() {
  var ja = new Parser('ja');
  ja.branching = 'left';
  ja.usespaces = false;
  ja.joindelimiter = '';
  ja.anaphora = ["これ", "それ", "あれ"];
  ja.roles = [
    {role: 'object', delimiter: 'を'},
    {role: 'object', delimiter: 'と'}, // this is actually a quotative marker
    {role: 'goal', delimiter: 'に'},
    {role: 'goal', delimiter: 'へ'},
    {role: 'source', delimiter: 'から'},
    {role: 'time', delimiter: 'に'},
    {role: 'location', delimiter: 'で'},
    {role: 'location', delimiter: 'に'},
    {role: 'instrument', delimiter: 'で'},
    {role: 'alias', delimiter: 'として'},
    {role: 'modifier', delimiter: 'の'},
    {role: 'format', delimiter: 'で'}
  ];

  ja.initializeLanguage = function() {
    this._patternCache.particleMatcher = new RegExp('('+[role.delimiter for each (role in this.roles)].join('|')+')','g');
  }

  // Japanese verbs are always sentence-final.
  ja.suggestedVerbOrder = -1;
  ja.verbInitialMultiplier = 0.3;
  
  ja.wordBreaker = function(input) {
    return input.replace(this._patternCache.particleMatcher,'\u200b$1\u200b');
  };

  return ja;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Brandon Pung <brandonpung@gmail.com>
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

NLParser2.loadParserMaker('nl', function makeParser() {
  var nl = new Parser('nl');
  nl.anaphora = ["dit", "dat", "het", "de", "selectie", "hij", "zij"];
  
  //{role: "location", delimiter: "in de omgeving van"},
  //{role: "instrument", delimiter: "gebruikmakend van"},
  nl.roles = [
    {role: "goal", delimiter: "naar"},
    {role: "source", delimiter: "van"},
    {role: "location", delimiter: "nabij"},
    {role: "location", delimiter: "op"},
    {role: "location", delimiter: "aan"},
    {role: "location", delimiter: "in"},
    {role: "time", delimiter: "om"},
    {role: "time", delimiter: "op"},
    {role: "instrument", delimiter: "met"},
    {role: "format", delimiter: "in"},
    {role: "modifier", delimiter: "van"},
    {role: "modifier", delimiter: "voor"},
    {role: "alias", delimiter: "als"}
  ];
  nl.branching = "right";
  
  return nl;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Felipe Gomes <felipc@gmail.com>
 *   Fernando Takai <fernando.takai@gmail.com>    
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

NLParser2.loadParserMaker('pt', function makeParser() {
  var pt = new Parser('pt');
  pt.roles = [
    {role: 'goal', delimiter: 'à'},
    {role: 'goal', delimiter: 'ao'},
    {role: 'goal', delimiter: 'a'},
    {role: 'goal', delimiter: 'até'},
    {role: 'goal', delimiter: 'em'},
    {role: 'goal', delimiter: 'no'},
    {role: 'goal', delimiter: 'na'},
    {role: 'goal', delimiter: 'pra'},
    {role: 'goal', delimiter: 'para'},

    {role: 'source', delimiter: 'de'},
    {role: 'source', delimiter: 'des'},
    {role: 'source', delimiter: 'do'},
    {role: 'source', delimiter: 'da'},

    {role: 'location', delimiter: 'em'},

    {role: 'time', delimiter: 'às'},
    {role: 'time', delimiter: 'de'},
    {role: 'time', delimiter: 'a'},
    {role: 'time', delimiter: 'as'},

    {role: 'instrument', delimiter: 'com'},
    {role: 'instrument', delimiter: 'usando'},
    {role: 'instrument', delimiter: 'pelo'},
    {role: 'instrument', delimiter: 'pela'},
    {role: 'instrument', delimiter: 'no'},
    {role: 'instrument', delimiter: 'na'},
    
    {role: 'format', delimiter: 'em'},

    {role: 'modifier', delimiter: 'de'},
    {role: 'modifier', delimiter: 'para'},

    {role: 'alias', delimiter: 'como'}

  ];
  pt.branching = 'right';
  pt.anaphora = ['isto', 'isso', 'aquilo'];

  /* this removes the definite article (all gender and number variations),
     removing it from the argument and putting it on the prefix */
  pt.argumentNormalizer = new RegExp("(^(o|a|os|as)\\s+)(.*)$", "i");
  pt.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[3], suffix:''}];
    return [];
  };

  return pt;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Kim Ahlström <kim.ahlstrom@gmail.com>
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

NLParser2.loadParserMaker('sv', function makeParser() {
  var sv = new Parser('sv');
  sv.anaphora = ["han", "honom", "hon", "henne", "den", "det", "de", "dem"];
  sv.roles = [
    {role: 'goal', delimiter: 'till'},
    
    {role: 'source', delimiter: 'från'},
    {role: 'source', delimiter: 'av'},
    
    {role: 'location', delimiter: 'på'},
    {role: 'location', delimiter: 'den'},

    {role: 'time', delimiter: 'klockan'},
    {role: 'time', delimiter: 'på'},
    {role: 'time', delimiter: 'den'},
    
    {role: 'instrument', delimiter: 'med'},
    {role: 'instrument', delimiter: 'från'},
    {role: 'instrument', delimiter: 'hos'},
    {role: 'instrument', delimiter: 'via'}
  ];
  sv.branching = 'right';

  return sv;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   kelopez
 *   Ayhan Eses-ayhan515 <paylasimlarimiz@gmail.com>
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
 
NLParser2.loadParserMaker('tr', function makeParser() {
  var tr = new Parser('tr');
  tr.roles = [
	{role: 'goal', delimiter: 'kime'},
	{role: 'goal', delimiter: 'þundan'},
	{role: 'goal', delimiter: 'a'},
	{role: 'source', delimiter: 'den'},
	{role: 'source', delimiter: 'de'},
	{role: 'location', delimiter: 'daki'},
	{role: 'time', delimiter: 'de'},
	{role: 'instrument', delimiter: 'dan'},
	{role: 'instrument', delimiter: 'kullanarak'},
	{role: 'format', delimiter: 'olarak'},
	{role: 'alias', delimiter: 'como'},
	{role: 'modifier', delimiter: 'de'},
  ];

  tr.argumentNormalizer = new RegExp('^(el|lo\\s+|la\\s+)(.+)()$','i');
  tr.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[2], suffix:matches[3]}];
    return [];
  },

  tr.anaphora = ["bu", "bu", "seçim", "o", "o", "onlar", "onlar"];
  
  tr.branching = 'right';

  tr.clitics = [
    {clitic: 'el', role: 'object'},
    {clitic: 'los', role: 'object'}
  ];

  tr.verbFinalMultiplier = 0.3;

  return tr;
});

/***** BEGIN LICENSE BLOCK *****
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
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Jono DiCarlo <jdicarlo@mozilla.com>
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

NLParser2.loadParserMaker('zh', function makeParser() {
  var zh = new Parser('zh');
  zh.branching = 'right';
  zh.usespaces = false;
  zh.joindelimiter = '';

  zh.anaphora = ["这个","那个","這個","那個"];
  zh.roles = [
      {role: 'object', delimiter: '把'},
      {role: 'goal', delimiter: '到'},
      {role: 'goal', delimiter: '成'},
      {role: 'goal', delimiter: '为'},
      {role: 'goal', delimiter: '為'},
      {role: 'goal', delimiter: '给'},
      {role: 'goal', delimiter: '給'},
      {role: 'source', delimiter: '从'},
      {role: 'source', delimiter: '從'},
      {role: 'location', delimiter: '在'},
      // blank markers are not currently supported
      // {role: 'time', delimiter: ''},
      {role: 'instrument', delimiter: '用'},
      {role: 'alias', delimiter: '用'},
      {role: 'format', delimiter: '成'},
      {role: 'format', delimiter: '为'},
      {role: 'format', delimiter: '為'}
  ];
  
  zh.initializeLanguage = function() {
    this._patternCache.particleMatcher = new RegExp('('+[role.delimiter for each (role in this.roles)].join('|')+')','g');
  }
  
  zh.wordBreaker = function(input) {
    return input.replace(this._patternCache.particleMatcher,'\u200b$1\u200b');
  };

  zh.verbFinalMultiplier = 0.3;
  
  return zh;
});
