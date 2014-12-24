(function(exports) {
  const DEFAULT_PREVIEW_URL = "data:text/html,No suggestions"
  const DEFAULT_MAX_SUGGESTIONS = 5
  const MIN_MAX_SUGGS = 1
  const MAX_MAX_SUGGS = 42

  const NULL_QUERY = {
    suggestionList: [],
    finished: true,
    hasResults: false
  }

  CommandManager.__defineGetter__("maxSuggestions", function CM_getMaxSuggestions() {
    return DEFAULT_MAX_SUGGESTIONS
  })

  CommandManager.__defineSetter__("maxSuggestions", function CM_setMaxSuggestions(value) {
    var num = Math.max(MIN_MAX_SUGGS, Math.min(value | 0, MAX_MAX_SUGGS));
  })

  function CommandManager(cmdSource, parser, suggsNode, previewPaneNode) {
    this.__cmdSource = cmdSource;
    this.__hilitedIndex = 0;
    this.__lastInput = "";
    this.__lastSuggestion = null;
    this.__queuedExecute = null;
    this.__lastAsyncSuggestionCb = Boolean;
    this.__nlParser = parser;
    this.__activeQuery = NULL_QUERY;
    this.__domNodes = {
      suggs: suggsNode,
      preview: previewPaneNode,
    };

    this._loadCommands();

    this.setPreviewState("no-suggestions");

    suggsNode.addEventListener("click", this, false);
    suggsNode.addEventListener("DOMMouseScroll", this, false);
  }

  CommandManager.prototype = {
    handleEvent: function CM_handleEvent(event) {
      switch (event.type) {
        case "click": {
          if (event.button === 2) return;
          var {target} = event;
          do {
            if (!("hasAttribute" in target)) return;
            if (target.hasAttribute("index")) break;
          } while ((target = target.parentNode));
          var index = +target.getAttribute("index");
          if (this.__hilitedIndex === index) return;
          this.__hilitedIndex = index;
          this.__lastAsyncSuggestionCb();
        } break;
        case "DOMMouseScroll": {
          this[event.detail < 0 ? "moveIndicationUp" : "moveIndicationDown"]();
          this.__lastAsyncSuggestionCb();
        } break;
        default: return;
      }
      event.preventDefault();
      event.stopPropagation();
    },

    setPreviewState: function CM_setPreviewState(state) {
      var {suggs, preview} = this.__domNodes;
      switch (state) {
        case "computing-suggestions":
        case "with-suggestions": {
          suggs.style.display = "block";
          preview.style.display = "block";
          break;
        }
        case "no-suggestions": {
          suggs.style.display = "none";
          preview.style.display = "none";
          preview.setAttribute('src', DEFAULT_PREVIEW_URL)
          break;
        }
        default: throw new Error("Unknown state: " + state);
      }
    },

    refresh: function CM_refresh() {
      this.__cmdSource.refresh()
      this.reset()
    },

    moveIndicationUp: function CM_moveIndicationUp(context) {
      if (--this.__hilitedIndex < 0)
        this.__hilitedIndex = this.__activeQuery.suggestionList.length - 1;
      if (context) this._renderAll(context);
    },

    moveIndicationDown: function CM_moveIndicationDown(context) {
      if (++this.__hilitedIndex >= this.__activeQuery.suggestionList.length)
        this.__hilitedIndex = 0;
      if (context) this._renderAll(context);
    },

    _loadCommands: function CM__loadCommands() {
      if (this.__nlParser)
        this.__nlParser.setCommandList(this.__cmdSource.getAllCommands());
    },

    _renderSuggestions: function CM__renderSuggestions() {
      var {escapeHtml} = Utils, content = "";
      var {__activeQuery: {suggestionList}, __hilitedIndex: hindex} = this;
      for (var i = 0, l = suggestionList.length; i < l; ++i) {
        var {displayHtml, icon} = suggestionList[i];
        content += (
          '<div class="suggested' + (i === hindex ? " hilited" : "") +
          '" index="' + i + '"><div class="cmdicon">' +
          (icon ? '<img src="' + escapeHtml(icon) + '"/>' : "") +
          "</div>" + displayHtml + "</div>");
      }
      this.__domNodes.suggs.innerHTML = content;
    },

    _renderPreview: function CM__renderPreview(context) {
      var activeSugg = this.hilitedSuggestion;
      if (!activeSugg || activeSugg === this.__lastSuggestion)
        return;

      var self = this;
      this.__lastSuggestion = activeSugg;
      //console.log('renderPreview', activeSugg.previewUrl, activeSugg)
      //console.log(activeSugg._verb.arguments[0].id)
      //console.log(activeSugg.args.object[0].text)
      //console.log('renderPreview', activeSugg.previewUrl)
      //console.log(activeSugg)
      
      var iframe = this.__domNodes.preview,
          url = activeSugg.previewUrl

      //console.log('renderPreview', url)
      if (iframe.src == url) {
        iframe.contentWindow.postMessage({input: activeSugg.input}, '*')
      }
      else {
        iframe.src = url
      }
    },

    _renderAll: function CM__renderAll(context) {
        this._renderSuggestions();
        this._renderPreview(context);
    },

    reset: function CM_reset() {
      var query = this.__activeQuery;
      if (!query.finished)
        query.cancel();
      this.__activeQuery = NULL_QUERY;
      this.__hilitedIndex = 0;
      this.__lastInput = "";
      this.__lastSuggestion = null;
      this.__queuedExecute = null;
    },

    updateInput: function CM_updateInput(input, context, asyncSuggestionCb) {
      this.reset();
      this.__lastInput = input;

      var query = this.__activeQuery =
        this.__nlParser.newQuery(input, context, this.maxSuggestions, true);

      query.onResults = asyncSuggestionCb || this.__lastAsyncSuggestionCb;

      if (asyncSuggestionCb)
        this.__lastAsyncSuggestionCb = asyncSuggestionCb;

      query.run();
    },

    onSuggestionsUpdated: function CM_onSuggestionsUpdated(input, context) {
      if (input !== this.__lastInput)
        return

      var {hilitedSuggestion} = this;
      if (this.__queuedExecute && hilitedSuggestion) {
        this.__queuedExecute(hilitedSuggestion);
        this.__queuedExecute = null;
      }

      this.setPreviewState(this.__activeQuery.finished
                           ? (hilitedSuggestion
                              ? "with-suggestions"
                              : "no-suggestions")
                           : "computing-suggestions");
      this._renderAll(context);
    },

    execute: function CM_execute(context) {
      function doExecute(activeSugg) {
        try {
          this.__nlParser.strengthenMemory(activeSugg);
          activeSugg.execute(context);
        } catch (e) {
        }
      }
      var {hilitedSuggestion} = this;
      if (hilitedSuggestion)
        doExecute.call(this, hilitedSuggestion);
      else
        this.__queuedExecute = doExecute;
    },

    getSuggestionListNoInput: function CM_getSuggListNoInput(context, asyncSuggestionCb) {
      var noInputQuery = this.__nlParser.newQuery(
        "", context, 4 * CommandManager.maxSuggestions);
      noInputQuery.onResults = function onResultsNoInput() {
        asyncSuggestionCb(noInputQuery.suggestionList);
      };
    },

    makeCommandSuggester: function CM_makeCommandSuggester() {
      var self = this;
      return function getAvailableCommands(context, popupCb) {
        self.getSuggestionListNoInput(context, popupCb)
      }
    },

    remember: function CM_remember() {
      var {hilitedSuggestion} = this;
      if (hilitedSuggestion)
        this.__nlParser.strengthenMemory(hilitedSuggestion);
    },

    get parser() this.__nlParser,
    get lastInput() this.__lastInput,

    get maxSuggestions() CommandManager.maxSuggestions,
    get hasSuggestions() this.__activeQuery.hasResults,
    get suggestions() this.__activeQuery.suggestionList,
    get hilitedSuggestion()
      this.__activeQuery.suggestionList[this.__hilitedIndex],
    get hilitedIndex() this.__hilitedIndex,
    set hilitedIndex(i) this.__hilitedIndex = i,
  }

  exports.CommandManager = CommandManager;
})(window);

(function(exports) {
  function CommandAggregator(arrayOfCommands) {
    var self = this;
    var commands = {}
    var commandNames = [];
    var commandsByName = {__proto__: null};
    var commandsByDomain = {__proto__: null};

    self.refresh = function FA_refresh() {
      commands = {}
      commandNames = []
      commandsByName = {__proto__: null}

      arrayOfCommands.forEach(self.addCommand)
    }

    self.__defineGetter__("commandNames",
                          function FA_cmdNames() commandNames)
    self.__defineGetter__("commandsByName",
                          function FA_cmdsByName() commandsByName)
    self.__defineGetter__("commandsByDomain",
                          function FA_cmdsByDomain() commandsByDomain)

    self.getAllCommands = function FA_getAllCommands() {
      return commands
    }

    self.getCommand = function FA_getCommand(id) {
      return commands[id] || commandsByName[id] || null
    }

    self.addCommand = function FA_addCommand(cmd) {
      if (cmd.name && !cmd.names)
        cmd.names = [cmd.name]
      cmd.id = cmd.url
      commandNames.push({
        name: cmd.name,
        url: cmd.url,
        icon: cmd.icon,
      })
      commands[cmd.url] = commandsByName[cmd.name] = cmd
    }

    if (arrayOfCommands.length)
      self.refresh()
  }
  exports.CommandAggregator = CommandAggregator;
})(window);
