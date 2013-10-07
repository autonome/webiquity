var gUbiquity = null,
    ORIGIN_URL = 'http://localhost/webiquity/demo.html'

addEventListener("load", function ubiquityBoot() {
  removeEventListener("load", ubiquityBoot, false)
  ubiquitySetup()

  //tests.forEach(executeTest)
}, false);

function ubiquitySetup() {

  var cmdSource = new CommandAggregator(testCommands)

  var commands = cmdSource.getAllCommands(),
      languageCode = 'en',
      suggestionMemory = new SuggestionMemory('somefuckingkey')

  var parser = NLParser2.makeParserForLanguage(
    languageCode,
    commands,
    suggestionMemory)

  var cmdMan = new CommandManager(
    cmdSource,
    parser,
    document.getElementById("ubiquity-suggest-container"),
    document.getElementById("ubiquity-browser"))

  cmdMan.refresh()

  var panel = document.getElementById("ubiquity-transparent-panel"),
      textinput = document.getElementById("ubiquity-entry")
  
  gUbiquity = new Ubiquity(panel, textinput, cmdMan)

  gUbiquity.togglePanel()
}

