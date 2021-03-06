# twitch-remotechat

A RESTful API (and websocket push interface) written for `nodejs` that you can use to track the stream status of your favorite Twitch streamers and also log their chat. The main goal here was to write a desktop app that can show you the stream chat of the subscribed channels in real time. Useful to track your own chat if you only have one screen and don't want to keep checking your phone every time someone says something.

## Table of Contents
1. [Installation](#installation)
1. [REST API](#rest-api)
	1. [Subscribe to streamer](#subscribe-to-streamer)
	1. [Get Subscriptions](#get-subscriptions)
	1. [Get Stream](#get-stream)
	1. [Get Chat](#get-chat)
	1. [Get Chatbot status](#get-chatbot-status)
1. [Websocket API](#websocket-api)
	1. [Message: Stream status changed](#message-stream-status-changed)
	1. [Message: Chat](#message-chat)
1. [REST endpoints for the Twitch API](#rest-endpoints-for-the-twitch-api)
	1. [Stream status change subscription validation](#stream-status-change-subscription-validation)
	1. [Stream status change notification](#stream-status-change-notification)
	1. [Chat sent by chat bot](#chat-sent-by-chat-bot)


## Installation
```powershell
git clone https://github.com/asec/twitch-remotechat.git
cd ./twitch-remotechat
npm install
```
You will need to rename `./config/config.secret.initial.js` to `./config/config.secret.js` and then add the client id and client secret of your own [Twitch App](https://dev.twitch.tv/console/apps).

You will also need to set the ip on which the server is available from the outside. This is needed because the Twitch API sends a validation request to one of the REST API endpoints that is used to listen to the stream status change events. You will also need to open up port `7332` on your host.

> If you happen to skip the second part the server should (in theory) work fine, but won't receive the stream status updates. All of your subscriptions will show up as unconfirmed.

```powershell
node api
```

## REST API

> http://localhost:7332

### Subscribe to streamer
```http
POST /subscribe
```
Subscribes to notifications in stream status for the given streamer. This is not a real Twitch subscription of any kind, it just means that the server gets the notifications whenever the streamer goes online or otherwise.

**Parameters:**

Name | Type | Required? | Description
---- | ---- | --------- | -----------
`username` | string | ✔ | The name of the Twitch channel you wish to subscribe to.

**Example Response:**
```json
{
    "success": true,
    "userId": "475650268"
}
```
---

### Get Subscriptions
```http
GET /subscriptions
```
Lists all of the currently active subscriptions in the API.

**Example Response:**
```json
{
    "success": true,
    "data": [{
        "userId": "475650268",
        "userName": "streamer",
        "image": "https://static-cdn.jtvnw.net/user-default-pictures-uv/294c98b5-e34d-42cd-a8f0-140b72fba9b0-profile_image-300x300.png",
        "confirmed": true
    }]
}
```
---

### Get Stream

```http
GET /stream
```
Gets the latest stream status of the specified user.

**Parameters:**

Name | Type | Required? | Description
---- | ---- | --------- | -----------
`user` | number | ✔ | The userid of the streamer whose stream status you already subscribed for.
`latest` | boolean | No. Default: `true` | If set, only the latest stream session data will be returned. Otherwise you get the list of all of the stream sessions registered to the user.

**Example Response:**
```json
{
    "success": true,
    "data": [{
    "id": "5df8dc1a89967957cce261c1",
        "sid": "318837873",
        "title": "Another test stream.",
        "isLive": false,
        "userId": "475650268",
        "userName": "streamer",
        "game": {
            "id": "29433",
            "name": "Dark Souls",
            "image": "https://static-cdn.jtvnw.net/ttv-boxart/Dark%20Souls-{width}x{height}.jpg"
        },
        "type": "live",
        "thumbnail": "https://static-cdn.jtvnw.net/previews-ttv/live_user_streamer-{width}x{height}.jpg"
    }]
}
```
---

### Get Chat

```http
GET /chat
```
Gets all of the logged chat messages belonging to the current stream session. It's basically an array of raw chat messages passed on by the bot. Has all of the `context` that the bot sees too. A new stream session is established whenever the Twitch API sends valid stream data via the [Stream Changed webhook](https://dev.twitch.tv/docs/api/webhooks-reference#topic-stream-changed).

If we dont get valid stream data we consider the stream to have went offline and will not establish a new stream session. Chat messages sent while the stream is offline will be attached to the previous live stream session.

**Parameters:**

Name | Type | Required? | Description
---- | ---- | --------- | -----------
`user` | number | ✔ | The userid of the streamer. It will get the latest stream session and list only the messages attached to that.
`stream` | string | No | If given only the chat for that specific session will be returned.

**Example Response:**
```json
{
    "success": true,
    "data": [{
        "channel": "#streamer",
        "context": {
            "badge-info": null,
            "badges": {
                "broadcaster": "1"
            },
            "color": null,
            "display-name": "streamer",
            "emote-only": false,
            "emotes": {
                "25": [
                    "0-4"
                ]
            },
            "flags": null,
            "id": "74613814-1c0f-4dcd-8a72-8656826bbf0e",
            "mod": false,
            "room-id": "475650268",
            "subscriber": false,
            "tmi-sent-ts": "1576610861651",
            "turbo": false,
            "user-id": "475650268",
            "user-type": null,
            "emotes-raw": "25:0-4/28087:6-12/86:14-23",
            "badge-info-raw": null,
            "badges-raw": "broadcaster/1",
            "username": "streamer",
            "message-type": "chat"
        },
        "message": "Kappa test message"
    }]
}
```

### Get Chatbot status

```http
GET /bot/status
```
Gets the current status of the chatbot. It can be useful to check on it when it disconnects randomly and can't reconnect. This way the server doesn't have to be restarted to get info on the bot.

**Example Response:**
```json
{
    "success": true,
    "readyState": "OPEN",
    "channels": [],
    "options": {
        "connection": {
            "reconnect": true,
            "secure": true
        },
        "identity": {
            "username": "botname",
            "password": ""
        },
        "channels": [
            "#streamer"
        ],
        "options": {}
    }
}
```


## Websocket API

> ws://localhost:7332

### Message: Stream status changed
```http
MESSAGE stream-status-changed
```
This event notifies the client that a stream status has changed. The message contains the same `data` as the `GET /stream?latest=true` API call. Instead of an array only the single stream object is attached. You will get messages for all streamers that you subscribed for using the REST API.

**Parameter Example:**
```json
{
    "id": "318837873",
    "title": "Another test stream.",
    "isLive": false,
    "userId": "475650268",
    "userName": "streamer",
    "game": {
        "id": "29433",
        "name": "Dark Souls",
        "image": "https://static-cdn.jtvnw.net/ttv-boxart/Dark%20Souls-{width}x{height}.jpg"
    },
    "type": "live",
    "thumbnail": "https://static-cdn.jtvnw.net/previews-ttv/live_user_streamer-{width}x{height}.jpg"
}
```
---
### Message: Chat
```http
MESSAGE chat
```
This event notifies the client that a single new chat message has just arrived for one of the streams. The message contains the same `data` as the `GET /chat` API call. Instead of an array only the single chat object is attached. You will get messages for all the logged chat events for all streamers you subscribed for using the REST API.

**Parameter Example:**
```json
{
    "channel": "#streamer",
    "context": {
        "badge-info": null,
        "badges": {
            "broadcaster": "1"
        },
        "color": null,
        "display-name": "streamer",
        "emote-only": false,
        "emotes": {
            "25": [
                "0-4"
            ]
        },
        "flags": null,
        "id": "74613814-1c0f-4dcd-8a72-8656826bbf0e",
        "mod": false,
        "room-id": "475650268",
        "subscriber": false,
        "tmi-sent-ts": "1576610861651",
        "turbo": false,
        "user-id": "475650268",
        "user-type": null,
        "emotes-raw": "25:0-4/28087:6-12/86:14-23",
        "badge-info-raw": null,
        "badges-raw": "broadcaster/1",
        "username": "streamer",
        "message-type": "chat"
    },
    "message": "Kappa test message"
}
```

## REST endpoints for the Twitch API

> **YOU SHOULD NOT USE THESE AS THEY ARE RESERVED FOR COMMUNICATION WITH THE TWITCH API OR THE TWITCH CHAT BOT. THEY ARE NOT MEANT TO EXPOSE FUNCTIONALITY TO THE DEVELOPER.**

### Stream status change subscription validation
```http
GET /stream-status-changed
```
Whenever you subscribe to a twitch channel using the webhooks, the Twitch API will asynchronously validate the callback URL with a secret token sent via a GET request to that URL. This endpoint validates that request and returns the token if the request was deemed valid. If this is completed successfully the Twitch API will then register the subscription. Only in that case will you get the stream status changed notifications to the next endpoint.

---

### Stream status change notification
```http
POST /stream-status-changed
```
If you successfully subscribed to the stream status change notifications with the Twitch API it will use this endpoint to notify you about the changes to your subscriptions as they occur. It will send only one at a time. In reality it takes about 2 minutes for the Twitch API to send out the notification from the time the change actually occurs. If the status change was saved successfully the websocket will emit a `stream-status-changed` event containing the new session data.

---

### Chat sent by chat bot
```http
PUT /chat
```
The chatbot uses this endpoint to forward the raw chat messages it captures. If the message was saved successfully the websocket will emit a `chat` event containing the chat data.