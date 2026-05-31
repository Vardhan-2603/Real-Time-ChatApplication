let peerConnection = null;
let pendingCandidates = []; 

const getIceServers = () => {
  const servers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

 
  if (import.meta.env.VITE_TURN_USERNAME && import.meta.env.VITE_TURN_PASSWORD) {
    servers.push({
      urls: [
        "turn:global.relay.metered.ca:80",
        "turn:global.relay.metered.ca:80?transport=tcp",
        "turn:global.relay.metered.ca:443",
        "turns:global.relay.metered.ca:443?transport=tcp",
      ],
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD,
    });
  }

  return { iceServers: servers };
};

export const createPeerConnection = (onTrack, onIceCandidate) => {
  peerConnection = new RTCPeerConnection(getIceServers());
  
  peerConnection.ontrack = onTrack;
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };
  return peerConnection;
};

export const getPeerConnection = () => peerConnection;


export const addIceCandidateToPeer = async (candidate) => {
  
  if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Ice candidate error", err);
    }
  } else {
 
    pendingCandidates.push(candidate);
  }
};


export const flushIceCandidates = async () => {
  if (!peerConnection || !peerConnection.remoteDescription) return;
  
  for (const candidate of pendingCandidates) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error flushing queued ICE candidate:", err);
    }
  }
  pendingCandidates = [];
};
export const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  pendingCandidates = []; 
};