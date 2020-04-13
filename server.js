require('dotenv').config();

const express = require("express");
const app = express();
const OpenTok = require("opentok");
const OT = new OpenTok(process.env.API_KEY, process.env.API_SECRET);

let sessions = {};

app.use(express.static("public"));
app.use(express.json());

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/landing.html");
});

app.get("/session/participant/:room", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/session/viewer/:room", (request, response) => {
  response.sendFile(__dirname + "/views/viewer.html");
});

app.post("/session/participant/:room", (request, response) => {
  const roomName = request.params.room;
  const streamName = request.body.username;
  // Check if the session already exists
  if (sessions[roomName]) {
    // Generate the token
    generatePublisherToken(roomName, streamName, response);
  } else {
    // If the session does not exist, create one
    OT.createSession((error, session) => {
      if (error) {
        console.log("Error creating session:", error);
      } else {
        // Store the session in the sessions object
        sessions[roomName] = session.sessionId;
        // Generate the token
        generatePublisherToken(roomName, streamName, response);
      }
    });
  }
});

app.post("/session/viewer/:room", (request, response) => {
  const roomName = request.params.room;
  // Check if the session already exists
  if (sessions[roomName]) {
    // Generate the token
    generateSubscriberToken(roomName, response);
  } else {
    // If the session does not exist, create one
    OT.createSession((error, session) => {
      if (error) {
        console.log("Error creating session:", error);
      } else {
        // Store the session in the sessions object
        sessions[roomName] = session.sessionId;
        // Generate the token
        generateSubscriberToken(roomName, response);
      }
    });
  }
});

function generatePublisherToken(roomName, streamName, response) {
  // Configure token options
  const tokenOptions = {
    role: "publisher",
    data: `roomname=${roomName}?streamname=${streamName}`
  };
  // Generate token with the OpenTok SDK
  let token = OT.generateToken(
    sessions[roomName],
    tokenOptions
  );
  // Send the required credentials back to to the client
  // as a response from the fetch request
  response.status(200);
  response.send({
    sessionId: sessions[roomName],
    token: token,
    apiKey: process.env.API_KEY,
    streamName: streamName
  });
}

function generateSubscriberToken(roomName, response) {
  // Configure token options
  const tokenOptions = {
    role: "subscriber",
    data: `roomname=${roomName}`
  };
  // Generate token with the OpenTok SDK
  let token = OT.generateToken(
    sessions[roomName],
    tokenOptions
  );
  // Send the required credentials back to to the client
  // as a response from the fetch request
  response.status(200);
  response.send({
    sessionId: sessions[roomName],
    token: token,
    apiKey: process.env.API_KEY
  });
}

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
