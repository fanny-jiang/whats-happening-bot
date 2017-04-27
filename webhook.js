const express = require('express')
const bodyParser = require('body-parser')
const webhookToken = require('./secrets').webhookToken

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.port || 8080, () => {
  console.log('server is listening on port %d in %s mode!', server.address().port, app.settings)
  // console.log('server is listening!')
})

/*<--- webhook setup--->*/

// get request to webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === webhookToken) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.sendStatus(200);
  }
})

// app.post('/webhook', function (req, res) {
//   var data = req.body;
//   if (data.object === 'page') {

//     // iterate over each entry -- there may be multiple if batched (???)
//     data.entry.forEach(function (entry) {
//       var pageID = entry.id;
//       var timeOfEvent = entry.time;

//       // iterate over each messaging event
//       if (event.message) {
//         receivedMessage(event);
//       } else {
//         console.log("Webhook received unknown event", event);
//       }
//     });
//     res.sendStatus(200);
//   }
// });

// // send message
// function receivedMessage(event) {
//   var senderId = event.sender.id;
//   var recipientId = event.recipient.id;
//   var timeOfMessage = event.timestamp;
//   var message = event.message;

//   console.log('Received message for user %d and page %d at %d with message: ', senderId, recipientId, timeOfMessage);
//   console.log(JSON.stringify(message));

//   var messageId = message.mid;

//   var messageText = message.text;
//   var messageAttachments = message.attachments;

//   if (messageText) {
//     switch (messageText) {
//       case 'generic':
//         sendGenericMessage(senderID);
//         break;
//       default:
//         sendTextMessage(senderID, messageText);
//     }
//   } else if (messageAttachments) {
//     sendTextMessage(senderID, 'Message with attachment received');
//   }
// }

// function sendGenericMessage(recipient, message) {
//   // add more later
// }

// function sendTextMessage(recipientId, messageText) {
//   var messageData = {
//     recipient: {
//       id: recipientId
//     },
//     message: {
//       text: messageText
//     }
//   };
//   callSendAPI(messageData);
// }

// function callSendAPI(messageData) {
//   request({
//     uri: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: { access_token: "PAGE_ACCESS_TOKEN" },
//     method: 'POST',
//     json: messageData

//   }, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var recipientId = body.recipient_id;
//       var messageId = body.message_id;

//       console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
//     } else {
//       console.error("unable to send message.");
//       console.error(response);
//       console.error(error);
//     }
//   });
// };

