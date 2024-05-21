document.addEventListener('DOMContentLoaded', function() {
    var helloButton = document.getElementById('helloButton');
    helloButton.addEventListener('click', function() {
      hola();
    });
  });
  
  function hola() {    
    chrome.tabs.create({ url: "https://web.whatsapp.com/send?phone=50432323507"});
  }
    