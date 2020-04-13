fetch(location.pathname, { method: "POST" })
  .then(res => {
    return res.json();
  })
  .then(res => {
    const apiKey = res.apiKey;
    const sessionId = res.sessionId;
    const token = res.token;
    const streamName = res.streamName;
    initializeSession(apiKey, sessionId, token, streamName);
  })
  .catch(handleCallback);

function initializeSession(apiKey, sessionId, token, streamName) {
  // Create a session object with the sessionId
  const session = OT.initSession(apiKey, sessionId);

  // Create a publisher
  const publisher = OT.initPublisher(
    "publisher",
    {
      insertMode: "append",
      width: "100%",
      height: "100%",
      name: streamName
    },
    handleCallback
  );

  // Connect to the session
  session.connect(token, error => {
    // If the connection is successful, initialize the publisher and publish to the session
    if (error) {
      handleCallback(error);
    } else {
      session.publish(publisher, handleCallback);
    }
  });

  // Subscribe to a newly created stream
  session.on("streamCreated", event => {
    session.subscribe(
      event.stream,
      "subscriber",
      {
        insertMode: "append",
        width: "100%",
        height: "100%",
        name: event.stream.name
      },
      handleCallback
    );
  });
}

// Callback handler
function handleCallback(error) {
  if (error) {
    console.log("error: " + error.message);
  } else {
    console.log("callback success");
  }
}