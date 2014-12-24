var gUbiquity = null,
    ORIGIN_URL = 'http://localhost/webiquity/demo.html'

addEventListener("load", function ubiquitySetup() {

  var cmdSource = new CommandAggregator(testCommands),
      processedCommands = cmdSource.getAllCommands(),
      languageCode = 'en',
      suggestionMemory = new SuggestionMemory('somefuckingkey')

  var parser = NLParser2.makeParserForLanguage(
    languageCode,
    processedCommands,
    suggestionMemory)

  var cmdMan = new CommandManager(
    cmdSource,
    parser,
    // command suggestions
    document.getElementById("ubiquity-suggest-container"),
    // preview pane
    document.getElementById("ubiquity-browser"))

  cmdMan.refresh()

  var panel = document.getElementById("ubiquity-transparent-panel"),
      textinput = document.getElementById("ubiquity-entry")
  
  gUbiquity = new Ubiquity(panel, textinput, cmdMan)

  // Hack for debugging
  gUbiquity.togglePanel()

  // Run tests
  //tests.forEach(executeTest)
}, false);
