const button1 = document.getElementById("button 1");

(function() {
    var _0x1a3b = document.createElement('script');
    _0x1a3b.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
    _0x1a3b.async = true;
  
    _0x1a3b.onload = function() {
      console['log']('Ad block test passed: DoubleClick script loaded successfully.');
    };
  
    _0x1a3b.onerror = function() {
      alert('It seems that you are using an ad blocker. Please disable it to help us analyze our website traffic.');
      window['location']['href'] = '/adblocknotice.html';
    };
  
    document['head']['appendChild'](_0x1a3b);
  })();
  

if (button1 && localStorage.setupCompleted) {
    button1.innerText = "Panel";
}