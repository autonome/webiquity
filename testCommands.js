/*

browser commands
* add tag to current page
* add bookmark
* open bookmark
* open url from history

text commands
*

*/

var testCommands = []

/*
testCommands.push({
  name: 'search',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search text'
    },
  ],
  previewUrl: 'http://localhost/webiquity/testCommand.html?preview={{search}}',
  executeUrl: 'http://localhost/webiquity/testCommand.html?search={{search}}',
  url: 'http://localhost/webiquity/',
  icon: 'http://localhost/webiquity/skin/icons/application_view_list.png'
})
*/

/*
testCommands.push({
  name: 'test',
  previewUrl: 'http://localhost',
  url: 'http://localhost',
  icon: 'http://g.etfv.co/http://www.mozilla.com',
})
*/

/*
testCommands.push({
  name: 'bugzilla',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'https://bugdata.jit.su/count?{{search}}',
  executeUrl: 'https://bugdata.jit.su/count?{{search}}',
  url: 'http://bugzilla.mozilla.com',
  icon: 'http://g.etfv.co/http://bugzilla.mozilla.org',
})
*/

/*
testCommands.push({
  name: 'duck',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://duckduckgo.com/search.html?prefill={{search}}',
  executeUrl: 'http://duckduckgo.com/search.html?prefill={{search}}',
  url: 'http://www.duckduckgo.com',
  icon: 'http://g.etfv.co/http://www.duckduckgo.com',
})
*/

/*
testCommands.push({
  name: 'google',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})
*/

/*
testCommands.push({
  name: 'translate',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'translate page',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'calculate',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'weather',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'map',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'yelp',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'wikipedia',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'amazon',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'bing',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'imdb',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

// send email with gmail
testCommands.push({
  name: 'mail',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'youtube',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})

testCommands.push({
  name: 'meme',
  arguments: [
    { id: 'search',
      role: 'object',
      nountype: noun_arb_text,
      label: 'search'
    },
  ],
  previewUrl: 'http://www.google.com/search?q={{search}}',
  executeUrl: 'http://www.google.com/search?q={{search}}',
  url: 'http://www.google.com',
  icon: 'http://g.etfv.co/http://www.google.com',
})
*/
