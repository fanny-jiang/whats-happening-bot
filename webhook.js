'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const getRandomEvent = require('./utilities').getRandomEvent
const convertDateTime = require('./utilities').convertDateTime

// Tokens
const tokens = require('./tokens')
const VERIFY_TOKEN = tokens.VERIFY_TOKEN,
  PAGE_ACCESS_TOKEN = tokens.PAGE_ACCESS_TOKEN,
  AI_CLIENT_ACCESS_TOKEN = tokens.AI_CLIENT_ACCESS_TOKEN,
  AI_SESSION_ID = tokens.AI_SESSION_ID,
  EB_ANON_TOKEN = tokens.EB_ANON_TOKEN,

// APIs
const apiai = require('apiai')
const Nbrite = require('nbrite')

const apiaiApp = apiai(AI_CLIENT_ACCESS_TOKEN)
const nbrite = new Nbrite({ token: EB_ANON_TOKEN })


// express app setup
const app = express()

// bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// server
const server = app.listen(process.env.PORT || 8080, () => {
  console.log('server is listening on port %d in %s mode!', server.address().port, app.settings.env)
})

/*<--- FB Webhook Setup--->*/

// get request to webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.status(403).end()
  }
});

// post request to webhook with response from API.ai

app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      })
    })
    res.status(200).end()
  }
})

function sendMessage(event) {
  let sender = event.sender.id
  let text = event.message.text

  let apiai = apiaiApp.textRequest(text, {
    sessionId: AI_SESSION_ID
  });

  apiai.on('response', (res) => {
    // console.log('RESPONSE FROM EVENTBRITE: ', res.result)

    let message = null;

    // if response from AI matches activity intent and returns events data send message to User
    if (res.result.action === 'activity' && res.result.fulfillment.data) {
      let aiRes = res.result.fulfillment.data,
        aiEventName = aiRes.eventName ? aiRes.eventName : 'Event',
        aiEventDesc = aiRes.eventDesc,
        aiEventImgUrl = aiRes.imgUrl ? aiRes.imgUrl : '',
        aiEventUrl = aiRes.eventUrl,
        aiDateAndTime = convertDateTime(aiRes.dateAndTime),
        aiIsFree = aiRes.isFree;
      message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: aiEventName,
              image_url: aiEventImgUrl,
              subtitle: aiEventDesc + '\n' + aiIsFree + '\n' + aiDateAndTime,
              default_action: {
                type: 'web_url',
                url: aiEventUrl
              }
            }]
          }
        }
      }
    } else {
      // if no data received from Eventbrite, send API.ai response to user
      message = { text: res.result.fulfillment.speech, attachment: null };
    }

    // console.log('OUTPUT MESSAGE', message)

    // send json object containing message to FB messenger post request
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: {
        recipient: { id: sender },
        message: message
      }
    }, (err, res) => {
      if (err) {
        console.log('Error sending message: ', res.body.error);
      }
    });
  });

  apiai.on('error', (err) => {
    console.log(err);
  });

  apiai.end();

}

/* Echo sent message */

// function sendMessage(event) {
//   let sender = event.sender.id;
//   let text = event.message.text;

//   request({
//     url: 'https://graph.facebook.com/v2.6/me/messages',
//     qs: { access_token: PAGE_ACCESS_TOKEN },
//     method: 'POST',
//     json: {
//       recipient: { id: sender },
//       message: { text: text }
//     }
//   }, function (err, res) {
//     if (err) {
//       console.log('Error sending message: ', err);
//     } else if (res.body.err) {
//       console.log('Error: ', res.body.err);
//     }
//   });
// }


/* <----- Eventbrite api -----> */

// POST request to API.ai with data from Eventbrite event results
app.post('/ai', (req, res) => {

  if (req.body.result.action === 'activity') {
    // console.log('REQ.BODY FROM EVENTBRITE: ', req.body.result)
    let category = req.body.result.parameters.category;
    let city = req.body.result.parameters['geo-city'];
    let state = req.body.result.parameters['geo-state-us'];

    let restURL = 'https://www.eventbriteapi.com/v3/events/search/?q=' + category + '&sort_by=date&location.address=' + city + state + '&location.within=5mi&token=' + EB_ANON_TOKEN;

    // console.log('RESTURL: ', restURL)

    request.get(restURL, (err, response, body) => {
      // if no error, parse the json body
      if (!err && response.statusCode === 200) {
        const json = JSON.parse(body);
        // if events are returned
        if (json.events.length > 0) {
          const eventsArr = json.events.map((event) => event),
            randomEvent = getRandomEvent(eventsArr, 0, eventsArr.length),
            eventName = randomEvent.name.text,
            eventDesc = randomEvent.description.text ? randomEvent.description.text.slice(0, 45) + '...' : '',
            dateAndTime = randomEvent.start.local,
            isFree = randomEvent.is_free ? 'Free' : 'Get tickets',
            eventUrl = randomEvent.url,
            imgUrl = randomEvent.logo ? randomEvent.logo.url : 'https://cdn.zapier.com/storage/developer/638ebef07f1e312e20ee45ddb7df6be5.128x128.png';

          // console.log('SELECTED EVENT RESULT: ', randomEvent)

          let msg = eventName + '\n' + eventDesc + '\n' + dateAndTime;

          // send selected data as json body to AI to post to chat bot
          return res.json({
            speech: msg,
            data: {
              eventName: eventName,
              eventDesc: eventDesc,
              dateAndTime: dateAndTime,
              isFree: isFree,
              eventUrl: eventUrl,
              imgUrl: imgUrl
            },
            source: 'activity'
          });
        }
      } else {
        return res.status(400).json({
          status: {
            code: 400,
            errorType: 'NOT FOUND TEST'
          },
          data: null
        })
      }
    })
  }
})

