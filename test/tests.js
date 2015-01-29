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
    previewUrl: 'http://localhost/webiquity/commands/testCommand.html?cmd=' + cmdName + '&preview={{search}}',
    executeUrl: 'http://localhost/webiquity/commands/testCommand.html?cmd=' + cmdName + '&search={{search}}',
    url: 'http://localhost/webiquity/commands/testCommand.html?cmd=' + cmdName,
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
  expectedCount: 0,
  results: []
})

// match one command
tests.push({
  searchString: 'ap',
  expectedCount: 1,
  results: []
})

function executeTest(test) {
  // set input text
  document.querySelector('#ubiquity-entry').value = test.searchString

  // check suggestion count
  var count = suggestionCount(),
      passed = count === test.expectedCount,
      consoleFunc = passed ? console.log : console.error;
  consoleFunc.call(console, 'test>>> ', test.searchString, 'expected', test.expectedCount, 'received', count);
}

function suggestionCount() {
  var nodes = document.querySelectorAll(".suggested")
  return nodes.length || 0
}

function runTests() {
  tests.forEach(executeTest)
};
