// = Ubiquity =

// == Ubiquity(panel, textBox, cmdManager) ==
// Creates a Ubiquity interface and binds it to the given panel and text box.
// * {{{panel}}} top-level <div> containing suggestion list, preview pane, textbox.
// * {{{textBox}}} the <input type="text">.
// * {{{cmdManager}}} is a {{{CommandManager}}} instance.

function Ubiquity(panel, textBox, cmdManager) {

  this.__panel = panel;
  this.__textBox = textBox;
  this.__cmdManager = cmdManager;
  this.__needsToExecute = false;
  this.__lastValue = "";
  this.__previewTimerID = -1;
  this.__lastKeyEvent = {};

  this.closeable = false

  this.CommandHistory = CommandHistory

  EventEmitter.call(this)

  window.addEventListener("mousemove", this, false);

  textBox.addEventListener("keydown", this, false);
  textBox.addEventListener("keypress", this, false);
  textBox.addEventListener("keyup", this, false);
  textBox.addEventListener("focus", this, false);
  textBox.addEventListener("blur", this, false);
  textBox.addEventListener("DOMMouseScroll", this, false);

  this.on('PanelOpened', this.__onPanelOpened)
  this.on('PanelHidden', this.__onPanelHidden)

  panel.addEventListener("click", this, false);

  var self = this;

  // close panel when something is clicked/focused outside of the panel
  function onDocumentInput(e) { self.__onDocumentInput(e) }
  document.body.addEventListener("click", onDocumentInput, false)
  document.body.addEventListener("focus", onDocumentInput, false)

  self.__onSuggestionsUpdated = function U__onSuggestionsUpdated() {
    cmdManager.onSuggestionsUpdated(textBox.value, self.__makeContext());
  }
}

Ubiquity.prototype = {
  constructor: Ubiquity,
  toString: function U_toString() "[object Ubiquity]",

  __KEYCODE_EXECUTE : KeyEvent.DOM_VK_RETURN,
  __KEYCODE_COMPLETE: KeyEvent.DOM_VK_TAB,

  __KEYMAP_MOVE_INDICATION: {
    38: "moveIndicationUp",
    40: "moveIndicationDown",
  },
  __KEYMAP_SCROLL_RATE: {
    33: -.8, // page up
    34: +.8, // page dn
  },

  handleEvent: function U_handleEvent(event) {
    if (this["__on" + event.type](event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },

  // == Read Only Properties ==

  // === {{{ Ubiquity#panel }}} ===
  get panel() this.__panel,

  // === {{{ Ubiquity#textBox }}} ===
  get textBox() this.__textBox,

  // === {{{ Ubiquity#cmdManager }}} ===
  get cmdManager() this.__cmdManager,

  // === {{{ Ubiquity#lastKeyEvent }}} ===
  // The last captured key event on the {{{textBox}}}.
  get lastKeyEvent() this.__lastKeyEvent,

  // === {{{ Ubiquity#isPanelOpen }}} ===
  get isPanelOpen() this.__panel.display == 'block' || undefined,

  // === {{{ Ubiquity#inputDelay }}} ===
  // Delay between the user's last keyup and parsing in milliseconds.
  get inputDelay() 100,

  // === {{{ Ubiquity#inputLimit }}} ===
  // Input length where Ubiquity starts to hesitate parsing. See #507.
  get inputLimit() 1000,

  __onmousemove: function U__onMouseMove(event) {
    this.__x = event.screenX;
    this.__y = event.screenY;
  },

  __onkeydown: function U__onKeyDown(event) {
    this.__lastKeyEvent = event;
    if (event.ctrlKey && event.altKey && event.which &&
        this.__cmdManager.preview.activateAccessKey(event.which))
      return true;
  },
  __onkeyup: function U__onKeyup(event) {
    var {keyCode} = this.__lastKeyEvent = event;

    if (keyCode >=  KeyEvent.DOM_VK_DELETE ||
        keyCode === KeyEvent.DOM_VK_SPACE ||
        keyCode === KeyEvent.DOM_VK_BACK_SPACE ||
        keyCode === KeyEvent.DOM_VK_RETURN && !this.__needsToExecute) {
      // Keys that would change input. RETURN is for IME.
      // https://developer.mozilla.org/En/DOM/Event/UIEvent/KeyEvent
      this.__processInput();
    }

    if (keyCode == KeyEvent.DOM_VK_ESCAPE && this.closeable)
      this.closePanel()
  },
  __onkeypress: function U__onKeyPress(event) {
    var {keyCode, ctrlKey} = event;

    if (event.altKey || event.metaKey) return;

    if (keyCode === this.__KEYCODE_EXECUTE) {
      this.__needsToExecute = true;
      if (this.closeable)
        this.closePanel();
      else
        this.execute();
      return true;
    }

    if (keyCode === this.__KEYCODE_COMPLETE) {
      if (ctrlKey)
        this.CommandHistory.complete(event.shiftKey, this);
      else {
        var {completionText} = this.__cmdManager.hilitedSuggestion || 0;
        if (completionText)
          this.__textBox.value = this.__lastValue = completionText;
      }
      return true;
    }

    var move = this.__KEYMAP_MOVE_INDICATION[keyCode];
    if (move) {
      if (ctrlKey)
        this.CommandHistory.go(keyCode - 39, this);
      else
        this.__cmdManager[move](this.__makeContext());
      return true;
    }

    if (ctrlKey) return;

    var rate = this.__KEYMAP_SCROLL_RATE[keyCode];
    if (rate) {
      var [x, y] = event.shiftKey ? [rate, 0] : [0, rate];
      this.__cmdManager.preview.scroll(x, y);
      return true;
    }
  },

  __onfocus: function U__onFocus() {
    // nada
  },
  __onblur: function U__onBlur() {
    this.CommandHistory.add(this.__textBox.value);
  },

  __onDOMMouseScroll: function U__onMouseScroll(event) {
    this.CommandHistory.go(event.detail > 0 ? 1 : -1, this);
  },

  __onPanelBlur: function U__onPanelBlur() {
    if (this.closeable)
      this.closePanel()
  },
  __onPanelHidden: function U__onPanelHidden() {
    clearTimeout(this.__previewTimerID);
    this.__cmdManager.remember();
    if (this.__needsToExecute) {
      this.__needsToExecute = false;
      this.execute();
    }
    else {
      this.__cmdManager.reset();
    }

    var unfocused = this.__focusedWindow;
    if (unfocused)
      unfocused.focus();
    this.__focusedWindow = this.__focusedElement = null;

    this.CommandHistory.cursor = -1;
  },
  __onPanelOpened: function U__onPanelOpened() {
    this.__lastValue = "";
    // if anything is in there
    this.__processInput(true);
    var {__textBox} = this;
    __textBox.focus();
    __textBox.select();
  },

  __onclick: function U__onClick(event) {
    // left: open link / execute; middle: same but without closing panel
    var {button, target, view} = event;
    if (button === 2) return;
    if (view.location.href === ORIGIN_URL) {
      for (var lm = target, hilited = /\bhilited\b/;; lm = lm.parentNode) {
        if (!lm || !("className" in lm)) return;
        if (hilited.test(lm.className)) break;
      }
      this.execute();
    }
    else {
      target.accessKey && setTimeout(function U_refocusTextBox(self) {
        if (self.isPanelOpen) self.__textBox.focus();
      }, 99, this);
      do var {href} = target; while (!href && (target = target.parentNode));
      if (!href ||
          ~href.lastIndexOf("javascript:", 0) ||
          ~href.lastIndexOf("resource://ubiquity/preview.html#", 0)) return;
      this.Utils.openUrlInBrowser(href);
    }
    if (button === 0 && this.closeable) this.closePanel();
    return true;
  },

  __onDocumentInput: function U__onDocumentInput(event) {
    var childOfPanel = false,
        target = event.target
    while (target.parentNode && target != this.__panel && target != document.body) {
      if (target == this.__panel)
        childOfPanel = true
      target = target.parentNode 
    }
    if (!childOfPanel)
      this.__onPanelBlur()
  },

  __delayedProcessInput: function U__delayedProcessInput(self, context) {
    var input = self.__textBox.value;
    if (input.length > self.inputLimit ||
        input && input === self.__lastValue)
      return;

    self.__cmdManager.updateInput(
      self.__lastValue = input,
      context || self.__makeContext(),
      self.__onSuggestionsUpdated);
  },
  __processInput: function U__processInput(immediate, context) {
    clearTimeout(this.__previewTimerID);
    if (immediate)
      this.__delayedProcessInput(this, context);
    else
      this.__previewTimerID = setTimeout(
        this.__delayedProcessInput, this.inputDelay, this, context);
  },

  __makeContext: function U__makeContext() {
    return {
      screenX: this.__x,
      screenY: this.__y,
      window: window,
      focusedWindow : this.__focusedWindow || null,
      focusedElement: this.__focusedElement || null
    }
  },


  // == Public Methods ==

  // === {{{ Ubiquity#execute(input) }}} ===
  // Executes {{{input}}} or the highlighted suggestion.
  // If {{{input}}} is provided but empty, the current entry is used instead.

  execute: function U_execute(input) {
    var cmdMan = this.__cmdManager;
    var external = input != null;
    if (external) {
      if (input)
        this.__textBox.value = input;
      this.__lastValue = "";
      cmdMan.hilitedIndex = 0;
    }
    var context = this.__makeContext();
    if (cmdMan.hilitedIndex < 1)
      this.__processInput(true, context);
    cmdMan.execute(context);
  },

  // === {{{ Ubiquity#preview(input, immediate) }}} ===
  // Previews {{{input}}} or the highlighted suggestion,
  // skipping the input delay if {{{immediate}}} evaluates to {{{true}}}
  // and opening Ubiquity if it's closed.

  preview: function U_preview(input, immediate) {
    if (input != null)
      this.__textBox.value = input;
    if (this.isPanelOpen)
      this.__processInput(immediate);
    else
      this.openPanel();
  },

  // === {{{ Ubiquity#openPanel() }}} ===

  openPanel: function U_openPanel() {
    this.__panel.style.display = 'block'
    this.emit('PanelOpened')
  },

  // === {{{ Ubiquity#closePanel() }}} ===

  closePanel: function U_closePanel() {
    this.__panel.style.display = 'none'
    this.emit('PanelClosed')
  },

  // === {{{ Ubiquity#togglePanel() }}} ===

  togglePanel: function U_togglePanel() {
    if (this.isPanelOpen)
      this.closePanel();
    else
      this.openPanel();
  },
}

