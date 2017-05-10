# What's Happening Bot

A messenger bot that suggests events based on location for you to check out! This bot uses artificial intelligence language processing to analyze your text and searches for events in Eventbrite. Just tell the bot the kind of activity and place, and she'll find you a fun event for you!

## Getting Started

Chat with Eve today! [m.me/whatshappeningEVE](m.me/whatshappeningEVE)

Be sure to check out my [Medium](https://medium.com/@heygirlcode) blog, where I'll be posting a tutorial on how I built this bot.

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

## Heroku Deployment

1. Set up the [Heroku command line tools](https://devcenter.heroku.com/articles/heroku-cli) and install [Yarn](https://yarnpkg.com/en/) if you haven't already (`npm install -g yarn`)
2. `heroku login`
3. Add a git remote for heroku:
  - **If you're creating a new app...**
    1. `heroku create` or `heroku create your-app-name` if you have a name in mind.
    2. `npm run deploy-heroku`. This will create a new branch and compile and commit your frontend JS to it, then push that branch to Heroku.

  - **If you already have a Heroku app...**
    1.  `heroku git:remote your-app-name` You'll need to be a collaborator on the app.

4. Save your app tokens as [environment variables](https://devcenter.heroku.com/articles/config-vars#setting-up-config-vars-for-a-deployed-application):
    `$ heroku config:set YOUR_SECRET_TOKEN=secret_token` to set your config variables`
    `$ heroku config` to view your config variables`
5. Add a `Procfile` to your root directory. The file should be named `Procfile` exactly and contain:
`web: node webhook.js`, which indicates process type: web, and it takes a node command to start the app.
6. Deploy! `npm run deploy-heroku`
7. Remember to change the webhook URL in your Facebook app dashboard to your heroku app URL:
`your-app.herokuapp.com/webhook` Facebook webhook
`your-app.herokuapp.com/ai` API.ai webhook
8. Have fun with it!

## Built With

* [Facebook Messenger](developers.facebook.com/quickstarts)
* [API.ai](https://console.api.ai/)
* [Eventbrite](https://www.eventbrite.com/developer/v3/quickstart/)


## Authors

* **Fanny Jiang** - [GitHub](https://github.com/fanny-jiang)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* **Tomomi Imura** - [GitHub](https://github.com/girliemac/fb-apiai-bot-demo/tree/tutorial-01) - really awesome tutorial that helped me get started on the project!