var tests = [],
    testCommands = []

// creates a basic text command loading testCommand.html
// and passing params in url
function makeCommand(cmdName) {
  return {
    name: cmdName,
    arguments: [
      { id: 'search',
        role: 'object',
        nountype: noun_arb_text,
        label: 'search text'
      },
    ],
    previewUrl: 'http://localhost/webiquity/testCommand.html?cmd=' + cmdName + '&preview={{search}}',
    executeUrl: 'http://localhost/webiquity/testCommand.html?cmd=' + cmdName + '&search={{search}}',
    url: 'http://localhost/webiquity/testCommand.html?cmd=' + cmdName,
    icon: 'http://localhost/webiquity/skin/icons/application_view_list.png'
  }
}

// create some test commands
['apples', 'bananas', 'oranges'].map(makeCommand).forEach(function(cmd) {
  testCommands.push(cmd)
})

// zero input
tests.push({
  searchString: '',
  resultCount: 0,
  results: []
})

// match one command
tests.push({
  searchString: 'ap',
  resultCount: 1,
  results: []
})

function executeTest(test) {
  // set input text
  document.querySelector('#ubiquity-entry').value = test.searchString

  // check suggestion count
  var count = suggestionCount()
  console.log('test ', test.searchString, 'suggestion count matches?', test.resultCount, count, count === test.resultCount)
}

function suggestionCount() {
  var nodes = document.querySelectorAll(".suggested")
  return nodes.length || 0
}
