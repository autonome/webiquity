(function(exports) {

  var internalCommands = []

  internalCommands.push({
    name: 'install',
    arguments: [
      { id: 'url',
        role: 'object',
        nountype: noun_arb_text,
        label: 'command URL'
      },
    ],
    /*
    get previewUrl () {
      console.log('install.previewURL')
      return 'http://localhost/webiquity/commands/testCommand.html?cmd='
      //return 'data:text/html,blah blah'
    },
    get executeUrl () {
      console.log('install.executeURL')
      return 'http://localhost/webiquity/commands/testCommand.html?cmd='
      //return 'data:text/html,blah blah'
    },
    */
    previewUrl: 'http://localhost/webiquity/commands/testCommand.html?cmd=install',
    executeUrl: 'http://localhost/webiquity/commands/testCommand.html?cmd=install',
    url: 'http://localhost/webiquity/commands/testCommand.html?cmd=install',
    icon: 'http://localhost/webiquity/skin/icons/application_view_list.png'
  })

  exports.internalCommands = internalCommands
})(window);
