'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const VERIFY_TOKEN = require('./tokens').VERIFY_TOKEN
const PAGE_ACCESS_TOKEN = require('./tokens').PAGE_ACCESS_TOKEN

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('server is listening on port %d in %s mode!', server.address().port, app.settings.env)
})

/*<--- webhook setup--->*/

// get request to webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.status(403).end();
  }
});

// post request to webhook

app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end()
  }
})

function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: { text: text }
    }
  }, function (error, response) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
