// refresh token if needed
var token;

var speakerEnabled = false;

function initializeUI() {
  
  $("#dialButton").click(function() {
    var params = { "tocall" : $('#phoneNumber').val()};
    Twilio.TwilioVoiceClient.call(token, params);
  });
  
  $("#hangupButton").click(function() {
    Twilio.TwilioVoiceClient.disconnect();
  });

  $("#speakerButton").click(function() {
      speakerEnabled = !speakerEnabled;
      if (speakerEnabled) {
        Twilio.TwilioVoiceClient.setSpeaker("on");
      } else {
        Twilio.TwilioVoiceClient.setSpeaker("off");
      }
  });

  $("#muteButton").click(function() {
      $("#muteButton").toggle();
      $("#unmuteButton").toggle();
      Twilio.TwilioVoiceClient.muteCall();
  });

  $("#unmuteButton").click(function() {
      $("#muteButton").toggle();
      $("#unmuteButton").toggle();
      Twilio.TwilioVoiceClient.unmuteCall();
  });
}

$(document).ready(function(){
    initializeUI();
});

// Initialization after Cordova sets up
document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady() {
    // HTTPS request for the token
    var tokenRequest    = new XMLHttpRequest();
    tokenRequest.onload = function() {
        token = tokenRequest.responseText;
        Twilio.TwilioVoiceClient.clientinitialized(function() {
             $('#statusMessage').text('Ready to start call');
        });

        Twilio.TwilioVoiceClient.initialize(token);

        // Accept or reject a call - only needed on Android - iOS uses CallKit
        if (device.platform == 'Android') {
            Twilio.TwilioVoiceClient.callinvitereceived(function (call) {
                var confirmed = confirm('Accept incoming call from ' + call.from + '?');
                if (confirmed) {
                    Twilio.TwilioVoiceClient.acceptCallInvite();
                } else {
                    Twilio.TwilioVoiceClient.rejectCallInvite();
                }
            });
        }
        
        // Handle Errors
        Twilio.TwilioVoiceClient.error(function (error) {
            $('#statusMessage').text(error);
        });

        // Handle Call Connection
        Twilio.TwilioVoiceClient.calldidconnect(function (call) {
            $('#statusMessage').text("Successfully established call");
            $('#dialButton').toggle();
            $('#hangupButton').toggle();

        });
        
        // Handle Call Disconnect
        Twilio.TwilioVoiceClient.calldiddisconnect(function (call) {
            $('#statusMessage').text("Call ended");
            $('#dialButton').toggle();
            $('#hangupButton').toggle();
        });
    }
    tokenRequest.open('GET', 'YOUR_ACCESS_TOKEN_URL_HERE');
    tokenRequest.send();
}

