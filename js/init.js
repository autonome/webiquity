addEventListener("load", function ubiquitySetup() {

  //var commands = [],
  var commands = testCommands,
      languageCode = 'en',
      suggestionMemory = new SuggestionMemory('somefuckingkey')

  var parser = NLParser2.makeParserForLanguage(
    languageCode,
    [],
    suggestionMemory)

  var cmdMgr = new CommandManager(
    commands,
    parser,
    // command suggestions
    document.getElementById("ubiquity-suggest-container"),
    // preview pane
    document.getElementById("ubiquity-browser"))

  cmdMgr.refresh()

  var panel = document.getElementById("ubiquity-transparent-panel"),
      textinput = document.getElementById("ubiquity-entry")
  
  var wui = new WebiquityUI(panel, textinput, cmdMgr)

  // Open UI by default.
  // Hack for debugging. When included as content script, need to have opened
  // via user-configurable key command, gesture or voice command.
  wui.togglePanel()

  // Run tests
  //tests.forEach(executeTest)
}, false);
