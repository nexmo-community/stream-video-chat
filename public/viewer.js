fetch(location.pathname, { method: "POST" })
  .then(res => {
    return res.json();
  })
  .then(res => {
    const apiKey = res.apiKey;
    const sessionId = res.sessionId;
    const token = res.token;
    initializeSession(apiKey, sessionId, token);
  })
  .catch(handleCallback);

function initializeSession(apiKey, sessionId, token) {
  // Create a session object with the sessionId
  const session = OT.initSession(apiKey, sessionId);

  // Connect to the session
  session.connect(token, error => handleCallback(error));

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