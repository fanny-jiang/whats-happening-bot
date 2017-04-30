# What's Happening Bot

A messenger bot that suggests events based on location for you to check out! This bot uses artificial intelligence language processing to analyze your text and searches for events in Eventbrite. Just tell the bot the kind of activity and place, and she'll find you a fun event for you!

## Getting Started

**NOTE:** What's Happening Bot is still currently in developer mode, but when it is approved by Facebook,
simply go to [messenger.com/whatshappeningbot](https://www.messenger.com/t/whatshappeningbot) and start chatting with the bot!

## Prerequisites

**To chat with bot for cool events:**
You just need a Facebook account, that's it!

**To run source code you'll need:**
* Node.js
* ngrok

You'll also need to sign up for developer accounts and request application keys for the APIs:

* [Facebook Messenger](developers.facebook.com/quickstarts)
* [API.ai](https://console.api.ai/)
* [Eventbrite](https://www.eventbrite.com/developer/v3/quickstart/)


### Facebook Messenger set up
Replace:
```
"VERIFY_TOKEN" with any string, remember it for later.
"PAGE_ACCESS_TOKEN" with your Facebook Messenger App Page Access Token
```

### API.ai set up
Replace:
```
"AI_CLIENT_ACCESS_TOKEN" with your API.ai client access token.
"AI_SESSION_ID" with any arbitrary string
```

### Eventbrite set up
Replace:
```
"EB_ANON_TOKEN" with your Eventbrite Public OAuth token
```

Install packages
```
npm install
```

## Installing

```
npm install
```
Run node in one terminal and ngrok at port 8080 in another terminal
```
node webhook        // or use nodemon to have it watch for file changes
ngrok http 8080     // sets up temporary webhook endpoint at port 8080
```

## Deployment

Finally, deploy to heroku and remember to change the API callback url settings to your heroku url.

## Built With

* [Facebook Messenger](developers.facebook.com/quickstarts)
* [API.ai](https://console.api.ai/)
* [Eventbrite](https://www.eventbrite.com/developer/v3/quickstart/)


## Authors

* **Fanny Jiang** - [GitHub](https://github.com/fanny-jiang)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* **Tomomi Imura** - [GitHub](https://github.com/girliemac/fb-apiai-bot-demo/tree/tutorial-01) - really awesome tutorial that helped me get started on the projected!