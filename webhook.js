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
  EB_ANON_TOKEN = tokens.EB_ANON_TOKEN

// APIs
const apiai = require('apiai')
const Nbrite = require('nbrite')

const apiaiApp = apiai(process.env.AI_CLIENT_ACCESS_TOKEN)
const nbrite = new Nbrite({ token: process.env.EB_ANON_TOKEN })


// express app setup
const app = express()

// bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// server
app.get('/', function (req, res) {
  res.send('Deployed!');
});

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('server is listening on port %d in %s mode!', server.address().port, app.settings.env)
})

/*<--- FB Webhook Setup--->*/

// get request to webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log('Validating webhook')
    res.status(200).send(req.query['hub.challenge'])
  } else {
    console.error('Failed validation. Make sure the validation tokens match.')
    res.status(403).end()
  }
});

// post request to webhook

app.post('/webhook', (req, res) => {
  // User's text is received
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
    sessionId: process.env.AI_SESSION_ID
  });

  apiai.on('response', (res) => {

    let message = null;

    // if response from AI matches activity intent and returns events data send message to User
    if (res.result.action === 'activity' && res.result.fulfillment.data) {
      let aiRes = res.result.fulfillment.data,
        aiEventName = aiRes.eventName ? aiRes.eventName : 'Event',
        aiEventDesc = aiRes.eventDesc ? aiRes.eventDesc : '',
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

    // send json object containing message to FB messenger post request
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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
//     qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
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

// POST request to API.ai with user's text from FB messenger
app.post('/ai', (req, res) => {
  // response back from API.ai
  if (req.body.result.action === 'activity') {
    let activity = req.body.result.parameters.category;
    let city = req.body.result.parameters['geo-city'];
    let state = req.body.result.parameters['geo-state-us'];
    let category;
    switch (activity) {
      case 'concert':
      case 'concerts':
      case 'live band':
      case 'music':
      case 'live show':
      case 'band':
        category = '103'
        break;
      case 'play':
        category = '105'
        break;
      case 'movie':
        category = '104'
        break;
      default:
        category = ''
    }

    let restURL = 'https://www.eventbriteapi.com/v3/events/search/?q=' + activity + '&sort_by=date&location.address=' + city + state + '&location.within=5mi&categories=' + category + '&token=' + process.env.EB_ANON_TOKEN;

    console.log('RESTURL: ', restURL)

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


