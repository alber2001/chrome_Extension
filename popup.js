document.addEventListener('DOMContentLoaded', function() {
  var sendButton = document.getElementById('sendButton');
  var pauseButton = document.getElementById('pauseButton');
  var isPaused = false; // Estado de pausa
  var phoneNumbers = [];
  var message = "";

  sendButton.addEventListener('click', function(event) {
      event.preventDefault(); // Prevenir el envío del formulario por defecto
      initializeMessages();
  });

  pauseButton.addEventListener('click', function(event) {
      event.preventDefault();
      isPaused = !isPaused;
      pauseButton.textContent = isPaused ? "Reanudar" : "Pausar";
      chrome.runtime.sendMessage({ action: isPaused ? 'pause' : 'resume' });
  });

  function initializeMessages() {
      var phoneNumbersInput = document.getElementById('phoneNumbers');
      var messageInput = document.getElementById('message');

      phoneNumbers = phoneNumbersInput.value.split(';').map(num => num.trim());
      message = encodeURIComponent(messageInput.value.trim()); // Codificar el mensaje para URL

      if (phoneNumbers.length > 0) {
          var firstPhone = phoneNumbers.shift(); // Obtener el primer número
          var url = `https://web.whatsapp.com/send?phone=${firstPhone}&text=${message}`;

          chrome.tabs.create({ url: url }, function(tab) {
              chrome.tabs.onUpdated.addListener(function openTab(tabId, info) {
                  if (tabId === tab.id && info.status === 'complete') {
                      chrome.tabs.executeScript(tabId, {
                          code: `
                              var phoneNumbers = ${JSON.stringify(phoneNumbers)};
                              var message = "${message}";
                              var isPaused = false;

                              function sendNextMessage() {
                                  if (phoneNumbers.length === 0) return;
                                  if (isPaused) {
                                      setTimeout(sendNextMessage, 1000); // Revisa cada segundo si se ha reanudado
                                      return;
                                  }
                                  var phone = phoneNumbers.shift();
                                  var url = \`https://web.whatsapp.com/send?phone=\${phone}&text=\${message}\`;
                                  window.location.href = url;
                              }

                              document.addEventListener('pauseMessages', function() {
                                  isPaused = true;
                              });

                              document.addEventListener('resumeMessages', function() {
                                  isPaused = false;
                                  sendNextMessage();
                              });

                              setTimeout(sendNextMessage, 5000); // Espera 5 segundos antes de enviar el siguiente mensaje
                          `
                      });
                      chrome.tabs.onUpdated.removeListener(openTab); // Eliminar listener una vez que el script se haya ejecutado
                  }
              });
          });
      }
  }

  // Comunicación entre popup.js y el script inyectado en la pestaña
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'pause') {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'pauseMessages' });
          });
      } else if (request.action === 'resume') {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'resumeMessages' });
          });
      }
  });
});
