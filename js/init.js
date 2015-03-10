addEventListener("load", function ubiquitySetup() {

  var commands = internalCommands.concat(testCommands),
      languageCode = 'en',
      suggestionMemory = new SuggestionMemory('somefuckingkey')

  // TODO: maybe remove the commands from here altogether
  var parser = NLParser2.makeParserForLanguage(
    languageCode,
    [], // commands are added to the parser from the cmd manager
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
