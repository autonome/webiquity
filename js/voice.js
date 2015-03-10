function say(phrase) {
  speechSynthesis.speak(new SpeechSynthesisUtterance(phrase));
}

function addSpeech(words) {
  var speechrecognitionlist = new SpeechGrammarList();
  speechrecognitionlist.addFromString(
    "#JSGF V1.0; grammar test; public <simple> = " +
    words.join(' | ') + ' ;', 1);
}

function recordSpeech(handler) {
  var recognition = new SpeechRecognition()
  var interim_transcript = '',
      final_transcript = '',
      confidence = ''

  recognition.onstart = function(e) {
    console.log('recognition.onstart')
  }

  recognition.onresult = function(e) {
    console.log("recognition.onresult", e.results.length, 'results returned')
    // Assemble the transcript from the array of results
    for (var i = e.resultIndex; i < e.results.length; ++i) {
      if (e.results[i].isFinal) {
        console.log("recognition.onresult", "isFinal")
        final_transcript += e.results[i][0].transcript
      } else {
        console.log("recognition.onresult", "not isFinal")
        interim_transcript += e.results[i][0].transcript
        confidence = e.results[i][0].confidence
      }
    }
    console.log("recognition.onresult", "interim_transcript", interim_transcript)
    handler(interim_transcript, final_transcript, confidence)
  }

  recognition.onend = function() {
    recognition.stop()

    console.log('recognition.onend', "final_transcript", final_transcript)
  }

  recognition.onerror = function(e) {
    console.log('recognition.onerror', e)
  }

  recognition.start()
}

function display(arrayOfSelections) {
  var container = document.querySelector('.results')
  if (arrayOfSelections) {
    arrayOfSelections.forEach(function(selection) {
      var div = document.createElement('div')
      div.textContent = selection;
      container.appendChild(div)
    })
  }
  // empty it
  else {
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
  }
}

function generateAgent(options) {

  (function init() {
    addSpeech([
      options.activator,
      options.next,
      options.select
    ])

    /*
    recordSpeech(function(transcript) {
      display([transcript])
      if (transcript.indexOf(options.activator) > -1) {
        //agent.onActivate()
      }
    })
    */
  })()

  var agent = {
    activator: options.activator,
    onActivate: function() {
    },

    next: options.next,
    onNext: function() {
    },

    select: options.select,
    onSelect: function() {
    },

    addPlugin: function(plugin) {
      this._plugins.push(plugin)
    },
    _plugins: [
    ]
  }

  return agent;
}

var agent = generateAgent({
  activator: 'hey',
  next: 'next',
  select: 'ok'
})

agent.onActivate = function() {
  console.log('onActivate')
  //say('next')
  recordSpeech(function(interim, complete, confidence) {
    console.log('recording results', 'INTERIM', interim, 'COMPLETE', complete, 'CONFIDENCE', confidence)
    say(complete)
    display([complete])
  })
  //
}

/*
agent.plugins.push({
  activator: 'news',
  onActivate: function() {
  }
})
*/

document.querySelector('.visualizerWrapper').addEventListener('touchend', function() {
  agent.onActivate()
}, false);

/*
function searchcontact(name) {
  var allContacts = navigator.mozContacts.getAll({sortBy: "familyName", sortOrder: "descending"});
  allContacts.onsuccess = function(event) {
    var cursor = event.target;
    if (cursor.result) {
      console.log("Found from all contacts: " + cursor.result.name[0]  + " tel: " + cursor.result.tel[0].value );

      if (cursor.result.name[0].toLowerCase() == name) {
        console.log("achou " + cursor.result.name[0].toLowerCase() + " " + cursor.result.tel[0].value );
        call(cursor.result.tel[0].value);
      }
      cursor.continue();
    } else {
      console.log("No more contacts");
    }
  };

  allContacts.onerror = function() {
    console.warn("Something went terribly wrong! :(");
  };
}

function call(number) {
  // Telephony object
  var tel = navigator.mozTelephony;

  // Place a call
  var telCall = tel.dial(number);  
  telCall.onactive = function(e) {
    window.console.log('Call connected!');
  }
  telCall.ondisconnected = function(e) {
    window.console.log('Call disconnected!');
  }
  telCall.onerror = function(e) {
    window.console.error('Call error!', e);
  }
}
*/


