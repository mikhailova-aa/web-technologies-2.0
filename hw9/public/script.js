const videoGrid = document.getElementById('video-grid');
let myPeerConnection;
let myDataChannel;
let roomId;
let userId;

const myVideo = document.createElement('video');
myVideo.muted = true;

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

function createPeerConnection(targetUserId) {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Добавьте другие STUN- или TURN-серверы, если необходимо
    ],
  });

  myPeerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      console.log('ICE candidate generated:', event.candidate);

      // Убедимся, что usernameFragment определен
      if (event.candidate.usernameFragment) {
        // Отправляем ICE-кандидата другому пользователю только после установки удаленного описания
        if (remoteDescriptionSet) {
          ws.send(JSON.stringify({ type: 'ice-candidate', targetUserId, candidate: event.candidate }));
        } else {
          console.warn('Adding pending ICE candidate');
          pendingIceCandidates.push(event.candidate);
        }
      } else {
        console.error('ICE candidate does not have usernameFragment:', event.candidate);
      }
    }
  };

  myPeerConnection.ontrack = (event) => {
    console.log('Remote track received:', event.track);

    // Создаем новый элемент <video> для отображения потока
    const remoteVideo = document.createElement('video');
    remoteVideo.autoplay = true;
    remoteVideo.srcObject = new MediaStream([event.track]);

    // Добавляем элемент <video> в контейнер videoGrid
    videoGrid.append(remoteVideo);

    console.log('Remote video added to videoGrid');
  };

  myPeerConnection.oniceconnectionstatechange = (event) => {
    console.log('ICE connection state change:', myPeerConnection.iceConnectionState);
  };
}

let remoteDescriptionSet = false;
let pendingIceCandidates = [];




const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', () => {
  console.log('WebSocket connection opened');
  
});

async function createOffer(targetUserId, roomId) {
  if (!targetUserId || !roomId) {
    console.error('TargetUserId or RoomId is undefined');
    return;
  }

  console.log(`Creating offer for user: ${targetUserId}`);
  try {
    const offer = await myPeerConnection.createOffer();
    await myPeerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', targetUserId, roomId, offer: myPeerConnection.localDescription }));
    console.log(`Offer created and sent to user: ${targetUserId}`);
  } catch (error) {
    console.error('Error creating offer:', error);
  }
}

createPeerConnection(); 

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
}).then((stream) => {
  addVideoStream(myVideo, stream);

  // Добавляем свой поток в пир-соединение
  stream.getTracks().forEach(track => myPeerConnection.addTrack(track, stream));


}).catch((error) => {
  console.error('Error getting user media:', error);
});

ws.addEventListener('message', async (message) => {
  const data = JSON.parse(message.data);
  const { type, roomId: receivedRoomId, userId: receivedUserId, offer, answer, candidate } = data;

  if (type === 'joined-room') {
    roomId = receivedRoomId;
    userId = receivedUserId;
    console.log(`Joined room: ${roomId}, User ID: ${userId}`);
  } else if (type === 'offer') {
    console.log(`Received offer from user: ${receivedUserId}`);
    createPeerConnection(receivedUserId);
    try {
      // Сбрасываем remoteDescriptionSet в false перед установкой удаленного описания
      remoteDescriptionSet = false;
  
      await myPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('Remote description set successfully');
      remoteDescriptionSet = true;
  
      // Обработка ожидающих ICE-кандидатов
      if (pendingIceCandidates.length > 0) {
        console.log('Adding pending ICE candidates');
        for (const iceCandidate of pendingIceCandidates) {
          await myPeerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
          console.log('ICE candidate added successfully');
        }
        pendingIceCandidates = [];
      }
  
      const answer = await myPeerConnection.createAnswer();
      await myPeerConnection.setLocalDescription(answer);
      ws.send(JSON.stringify({ type: 'answer', userId, answer: myPeerConnection.localDescription }));
      console.log(`Answer created and sent to user: ${receivedUserId}`);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }
   else if (type === 'answer') {
    console.log(`Received answer from user: ${receivedUserId}`);
    try {
      await myPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Remote description set successfully');

      // Обработка ожидающих ICE-кандидатов после установки удаленного описания
      if (pendingIceCandidates.length > 0) {
        console.log('Adding pending ICE candidates');
        for (const iceCandidate of pendingIceCandidates) {
          await myPeerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate));
          console.log('ICE candidate added successfully');
        }
        pendingIceCandidates = [];
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  } else if (type === 'ice-candidate') {
    console.log(`Received ICE candidate from user: ${receivedUserId}`);
    if (remoteDescriptionSet) {
      try {
        await myPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added successfully');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    } else {
      console.warn('No remote description set yet. Adding ICE candidate to pending list.');
      pendingIceCandidates.push(candidate);
    }
  }
});

ws.addEventListener('error', (error) => {
  console.error('Ошибка WebSocket:', error);
});