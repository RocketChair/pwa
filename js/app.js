// configuration
const backendAddress = 'wss://rocket-chair.herokuapp.com';
const minAccel = 0.5;
const maxMoveBreak = 1000;

// create WebSocket
const wss = new WebSocket(backendAddress);

const movementLastData = {
  isMoving: false,
  lastMove: undefined
};



if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker
    .register('sw.js', {scope: '/'})
    .then(swReg => {
      console.log('ServiceWorker Registered');
      swReg.pushManager.subscribe({
        userVisibleOnly: true
      });
    })
    .catch(error => {
      console.error('Service Worker Error', error);
    });

  // movement support
  window.addEventListener('devicemotion', deviceMotionHandler);
  // check every maxMoveBreak ms if move stopped
  setInterval(() => {
    const now = Date.now();
    const {isMoving, lastMove} = movementLastData;

    if (isMoving && lastMove && now > lastMove + maxMoveBreak) {
      // move stopped
      if(movementLastData.isMoving) {
        movementLastData.isMoving = false;
        sendUserMovementInfo(false);
      }
    }
  }, maxMoveBreak);

  // socket messages support
  wss.addEventListener('message', event => {
    handleSocketMessages(event.data);
  });

  function handleSocketMessages(wsMessage) {
    const wsMessageJSON = JSON.parse(wsMessage);

    if (wsMessageJSON.message === 'PING') {
      const messageToShow = 'PING';
      if (navigator.serviceWorker.controller) {
        console.log("Sending message to service worker");
        navigator.serviceWorker.controller.postMessage({
          command: "showPush",
          message: messageToShow
        });
      } else {
        console.log("No active ServiceWorker to show message");
      }
      // showPushMessage(messageToShow);
    }

    // if (wsMessageJSON.type === 'message-phone') {
    //   const messageToShow = wsMessageJSON.data && wsMessageJSON.data.message;
    //   showPushMessage(messageToShow);
    // }

    // function showPushMessage(messageToShow) {
    //if (navigator.serviceWorker.controller) {
    //   console.log("Sending message to service worker");
    //   navigator.serviceWorker.controller.postMessage({
    //     command: "showPush",
    //     message: messageToShow
    //   });
    // } else {
    //   console.log("No active ServiceWorker to show message");
    // }
    // }
  }
} else {
  console.error('ServiceWorkers not supported');
}

function deviceMotionHandler(event) {
  const {x, y, z} = event.acceleration;
  const enoughMove = enoughMoving(x, y, z);

  if (enoughMove && !movementLastData.isMoving) {
    sendUserMovementInfo(true);
    movementLastData.isMoving = true;
    movementLastData.lastMove = Date.now();
  }
}

function enoughMoving(x=0, y=0, z=0) {
  const absX = Math.abs(x);
  const absY = Math.abs(y);
  const absZ = Math.abs(z);

  return absX > minAccel || absY > minAccel || absZ > minAccel;
}

function sendUserMovementInfo(moving) {
  document.body.innerHTML = 'Czy się ruszam: ' + moving;
  if (!wss || wss.readyState < 1) {
    console.warn('WebSocket not created!');
    return;
  }

  console.log('isMoving: ' + moving);
  wss.send(createMoveMessage(moving));
}

function createMoveMessage(moving) {
  const newMessage = {
    source: 'phone',
    type: 'data',
    data: {
      moving
    }
  };

  return JSON.stringify(newMessage);
}