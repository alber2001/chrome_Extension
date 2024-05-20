document.addEventListener('DOMContentLoaded', function() {
    var helloButton = document.getElementById('helloButton');
    helloButton.addEventListener('click', function() {
      hola();
    });
  });
  
  function hola() {
    alert("¡Hola!");
    chrome.tabs.create({ url: "https://wa.me/50432323507" });
  }
    