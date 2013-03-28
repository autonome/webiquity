webiquity
=========

Proof of concept to port the Ubiquity add-on for Firefox to the web.

Concept
* Natural-language GCLI components for the web
* Like the Ubiquity add-on for Firefox, but pure web content
* Could load into existing pages via Firefox/Chrome add-on content script (or bookmarklet)
* Commands described via OpenWebApp manifests, with some added fields
* Commands are URLs, so execution navigates to the URL, depending on context of use
* Commands are previewed by loading preview URL into iframe repeatedly (move to postMessage)
* Commands are web pages, so utilize cache for quick asset loading and permissions model is the web permissions model

Demo page (no commands yet): http://autonome.github.com/webiquity/demo.html

Notes
* Gutted the Ubiquity code, removing as much as possible, while retaining the parser core
* Nountypes themselves are super dodgy, need a full rewrite
* Parser currently does reacharounds way out into the front-end, need to better abstract that shit
* Way too much sync execution, need some eventing up in heeeere

Misc TODO
* move all display code out of cmdmanager.js
* implement command updating via postMessage: load url once and postMessage to it for subsequent chars
* refreshCommandList being called way too often
* command is suggested with it's own text, eg "google google {search str}"
* nountypes need unique identification, i mean wtf
* make sure subsequent args don't overwrite core nountype list
* add data persistence back in
* review parser flows, still not very efficient
* put all the Ubiquity license and contributor stuff back somewhere
