// = SuggestionMemory =

const Z = {__proto__: null}; // keep this empty!

// In the db schema, one row represents the fact that for the
// named suggestionMemory object identified by (id_string),
// it happened (score) number of times that the user typed in
// the string (input) and, out of all the suggested completions,
// the one the user chose was (suggestion).
/*

DbUtils.connectLite(
  "ubiquity_suggestion_memory",
  { id_string  : "VARCHAR(256)",
    input      : "VARCHAR(256)",
    suggestion : "VARCHAR(256)",
    score      : "INTEGER" },
  [],
  file);

*/

var gTables = {__proto__: null};

// == SuggestionMemory(id, connection) ==
// The constructor.
//
// {{{id}}} is a unique string which will keep this suggestion memory
// distinct from the others in the database when persisting.
//
// {{{connection}}} is an optional {{{mozIStorageConnection}}}
// object to specify its database connection.

function SuggestionMemory(id) {
  var self = this

  /*
  this._idb = new IDBStore({
    dbVersion: 1,
    storeName: 'ubiquity_suggestion_memory',
    keyPath: 'id_string',
    autoIncrement: true,
    indexes: [
      { name: 'id_string' }
    ],
    onStoreReady: function() {
      console.log('ready')
      self._init(id);
    }
  })
  */

  self._init(id);
}
SuggestionMemory.prototype = {
  constructor: SuggestionMemory,
  _memTable: {},
  toString: function SM_toString() "[object SuggestionMemory]",
  toJSON: function SM_toJSON() this._table,

  _getScores: function SM__getScores(input)
    this._table[input] || (this._table[input] = {__proto__: null}),

  _init: function SM__init(id) {
    this._id = id;
    this._memTable[this._id] = {}
    this._table = gTables[id] || (gTables[id] = {__proto__: null});

    // this._table is a dictionary of dictionaries with a format like this:
    // {
    //   input1: {
    //     suggestion1: 3,
    //     suggestion2: 4,
    //   },
    //   input2: {
    //     suggestion3: 1,
    //   }
    // }

    /*
    // So now, get everything from the database that matches our ID,
    // and turn each row into an entry in this._table:
    var selStmt = this._createStatement(
      "SELECT input, suggestion, score " +
      "FROM ubiquity_suggestion_memory " +
      "WHERE id_string == ?1");
    selStmt.bindUTF8StringParameter(0, id);
    while (selStmt.executeStep()) {
      let suggs = this._getScores(selStmt.getUTF8String(0));
      suggs[selStmt.getUTF8String(1)] = +selStmt.getUTF8String(2);
    }
    selStmt.finalize();
    */

    /*
    function onItem(item) {
      let suggs = this._getScores(item.input);
      suggs[item.suggestion] = +item.score;
    }

    this._idb.iterate(onItem, {
      index: 'id_string',
      keyRange: IDBKeyRange,
      order: 'ASC',
      filterDuplicates: false,
      writeAccess: false,
      onEnd: function(){},
      onError: function(e){ console.error(e) }
    });
    */
  },

  // === {{{ SuggestionMemory#remember(input, suggestion, amount) }}}
  // Increases the strength of the association between {{{input}}} and
  // {{{suggestion}}}.
  remember: function SM_remember(input, suggestion, amount) {
    amount = +amount || 1;
    var scores = this._getScores(input);
    if (suggestion in scores) {
      if (!this._memTable[this._id][input])
        this._memTable[this._id][input] = {}
      var score = scores[suggestion] += amount;
      this_memTable[this._id][input][suggestion] = score
      /*
      var stmt = this._createStatement(
        "UPDATE ubiquity_suggestion_memory " +
        "SET score = ?1 " +
        "WHERE id_string = ?2 AND input = ?3 AND " +
        "suggestion = ?4");
      stmt.bindInt32Parameter(0, score);
      stmt.bindUTF8StringParameter(1, this._id);
      stmt.bindUTF8StringParameter(2, input);
      stmt.bindUTF8StringParameter(3, suggestion);
      */
    }
    else {
      var score = scores[suggestion] = amount;
      this_memTable[this._id][input][suggestion] = score
      /*
      var stmt = this._createStatement(
        "INSERT INTO ubiquity_suggestion_memory " +
        "VALUES (?1, ?2, ?3, ?4)");
      stmt.bindUTF8StringParameter(0, this._id);
      stmt.bindUTF8StringParameter(1, input);
      stmt.bindUTF8StringParameter(2, suggestion);
      stmt.bindInt32Parameter(3, score);
      */
    }
    return score;
  },

  // === {{{ SuggestionMemory#getScore(input, suggestion) }}} ===
  // === {{{ SuggestionMemory#setScore(input, suggestion, score) }}} ===
  // Gets/Sets the number of times that {{{suggestion}}} has been associated
  // with {{{input}}}.
  getScore: function SM_getScore(input, suggestion)
    (this._table[input] || Z)[suggestion] || 0,
  setScore: function SM_setScore(input, suggestion, score)
    this.remember(input, suggestion, score - this.getScore(input, suggestion)),

  // === {{{ SuggestionMemory#getTopRanked(input, numResults) }}} ===
  // Returns the top {{{numResults}}} number of suggestions that have
  // the highest correlation with {{{input}}}, sorted.
  // May return fewer than {{{numResults}}},
  // if there aren't enough suggestions in the table.
  getTopRanked: function SM_getTopRanked(input, numResults) {
    var suggestions = this._memTable[this._id][input]
    var sortable = []
    for (var suggestion in suggestions)
      sortable.push({su: suggestion, sc: suggestions[suggestion]})
    return sortable.sort(function(a, b) { return a - b }).slice(0, numResults)

    /*
    let fetchStmt = this._createStatement(
      "SELECT suggestion FROM ubiquity_suggestion_memory " +
      "WHERE id_string = ?1 AND input = ?2 ORDER BY score DESC " +
      "LIMIT ?3");
    fetchStmt.bindUTF8StringParameter(0, this._id);
    fetchStmt.bindUTF8StringParameter(1, input);
    fetchStmt.bindInt32Parameter(2, numResults);
    let retVals = [];
    while (fetchStmt.executeStep()) {
      retVals.push(fetchStmt.getUTF8String(0));
    }
    fetchStmt.finalize();
    */
    return retVals;
  },

  // === {{{ SuggestionMemory#wipe(input, suggestion) }}} ===
  // Wipes the specified entry out of this suggestion memory instance.
  // Omitting both {{{input}}} and {{{suggestion}}} deletes everything.
  // Be careful with this.
  wipe: function SM_wipe(input, suggestion) {
    /*
    let wheres =
      [["id_string", this._id], ["input", input], ["suggestion", suggestion]];
    let wipeStmt = this._createStatement(
      "DELETE FROM ubiquity_suggestion_memory WHERE " +
      [k + " = ?" + (i + 1)
       for ([i, [k]] in new Iterator(wheres))].join(" AND "));
    for (let [i, [, v]] in new Iterator(wheres))
      wipeStmt.bindUTF8StringParameter(i, v);
    wipeStmt.execute();
    wipeStmt.finalize();
    */
    gTables[this._id] = null;
    this._init(this._id);
  },
}
