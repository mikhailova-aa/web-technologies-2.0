const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

const servers = null;
const api = new WebSocketApi();
let localPeerConnection, remotePeerConnection = null;

// Получаем доступ к медиа-устройствам пользователя 
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    // Устанавливаем медиа-поток в локальный видеоэлемент
    localVideo.srcObject = stream;

    const videoTrack = stream.getVideoTracks()[0];

    // Создаем локальное соединение для передачи медиа
    localPeerConnection = new RTCPeerConnection(servers);

    localPeerConnection.addEventListener('icecandidate', (event) => {
        // Отправляем локальный ICE-кандидат удаленной стороне
        if (event.candidate) {
            console.log('Local ICE Candidate:', event.candidate);
            api.send({ event: "LOCAL_CANDIDATE", payload: event.candidate });
        }
    });

    // Обработчик для получения удаленного ICE-кандидата
    api.on("REMOTE_CANDIDATE", (candidate) => {
        console.log('Remote ICE Candidate:', candidate);
        localPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Обработчик для получения удаленного описания 
    api.on("REMOTE_DESCRIPTION", (description) => {
        console.log('Remote Description:', description);
        localPeerConnection.setRemoteDescription(description);
    });

    // Добавляем видеодорожку к локальному соединению
    localPeerConnection.addTrack(videoTrack, stream);

    // Создаем и отправляем описание локального соединения
    localPeerConnection.createOffer().then((description) => {
        localPeerConnection.setLocalDescription(description);

        // Отправляем локальное описание удаленной стороне
        console.log('Local Description:', description);
        api.send({ event: "LOCAL_DESCRIPTION", payload: description });
    });
});

// Создаем удаленное соединение для приема медиа
remotePeerConnection = new RTCPeerConnection(servers);

// Обработчик для получения локального описания 
api.on('LOCAL_DESCRIPTION', (description) => {
    console.log('Local Description (received by remote side):', description);
    remotePeerConnection.setRemoteDescription(description);

    remotePeerConnection.addEventListener('icecandidate', (event) => {
        // Отправляем удаленному партнеру локальный ICE-кандидат
        if (event.candidate) {
            console.log('Remote ICE Candidate (from local side):', event.candidate);
            api.send({ event: "REMOTE_CANDIDATE", payload: event.candidate });
        }
    });

    remotePeerConnection.addEventListener('track', (event) => {
        // Воспроизводим удаленный поток на удаленном видеоэлементе
        console.log('Received remote track:', event);
        remoteVideo.srcObject = event.streams[0];
    });

    // Обработчик для получения локального ICE-кандидата
    api.on("LOCAL_CANDIDATE", (candidate) => {
        console.log('Local ICE Candidate (received by remote side):', candidate);
        remotePeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Создаем и отправляем описание  удаленного соединения
    remotePeerConnection.createAnswer().then((description) => {
        remotePeerConnection.setLocalDescription(description);

        // Отправляем удаленное описание локальной стороне
        console.log('Remote Description (to local side):', description);
        api.send({ event: "REMOTE_DESCRIPTION", payload: description });
    });
});