(function(exports) {
  const SEPARATOR = "\n"

  var cursor = -1,
      _bin = null,
      max = 20
  
  var CommandHistory = {
    get: function() {
      return ['?']
    },
    set: function set(arr) {
      _bin = arr;
      return this.save();
    },

    add: function add(txt) {
      if (!(txt = txt.trim()))
        return this;
      var bin = this.get(), idx = bin.indexOf(txt);
      if (~idx) bin.unshift(bin.splice(idx, 1)[0]);
      else {
        if (bin.unshift(txt) > max) bin.length = max;
      }
      //return this.save();
    },

    go: function go(num, U) {
      var {textBox} = U;
      var bin = get();
      if (cursor < 0 && textBox.value) {
        this.add(textBox.value);
        cursor = 0;
      }
      cursor -= num;
      if (cursor < -1 || bin.length <= cursor)
        cursor = -1;
      U.preview(bin[cursor] || "");
      return this;
    },

    complete: function complete(rev, U) {
      var {textBox} = U;
      var {value: txt, selectionStart: pos} = textBox, bin = this.get();
      if (rev)
        bin = bin.slice().reverse();
      pos -= txt.length - (txt = txt.trimLeft()).length;
      var key = txt.slice(0, pos),
          re = RegExp("^" + Utils.regexp.quote(key), "i");
      for (let h, i = bin.indexOf(txt); h = bin[++i];) {
        if (re.test(h)) {
          U.preview(h);
          textBox.setSelectionRange(key.length, textBox.textLength);
          return true;
        }
      }
      return false;
    }
  }
  exports.CommandHistory = CommandHistory;
})(window);
