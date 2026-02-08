function encrypt_data(string: string) {
  string = unescape(encodeURIComponent(string));
  var newString = '',
    char,
    nextChar,
    combinedCharCode;
  for (var i = 0; i < string.length; i += 2) {
    char = string.charCodeAt(i);

    if (i + 1 < string.length) {
      nextChar = string.charCodeAt(i + 1) - 31;

      combinedCharCode =
        char +
        '' +
        nextChar.toLocaleString('en', {
          minimumIntegerDigits: 2
        });

      newString += String.fromCharCode(parseInt(combinedCharCode, 10));
    } else {
      newString += string.charAt(i);
    }
  }
  return newString.split('').reduce((hex, c) => (hex += c.charCodeAt(0).toString(16).padStart(4, '0')), '');
}

function decrypt_data(string: string) {
  var newString = '',
    char,
    codeStr,
    firstCharCode,
    lastCharCode;
  string = string.match(/.{1,4}/g).reduce((acc, char) => acc + String.fromCharCode(parseInt(char, 16)), '');
  for (var i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    if (char > 132) {
      codeStr = char.toString(10);

      firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 2), 10);

      lastCharCode = parseInt(codeStr.substring(codeStr.length - 2, codeStr.length), 10) + 31;

      newString += String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode);
    } else {
      newString += string.charAt(i);
    }
  }
  return newString;
}
