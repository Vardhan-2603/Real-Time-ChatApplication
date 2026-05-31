import { useEffect, useRef } from "react";
import { Outlet } from "react-router";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import IncomingCallModal from "../components/IncomingCallModal";
import VideoCallModal from "../components/VideoCallModal";

import socket from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useCallStore } from "../store/useCallStore";

import {
  getPeerConnection,
  closePeerConnection,
  createPeerConnection,
} from "../services/webrtc";

export default function ChatLayout() {

  const currentUser =
    useAuthStore((state) => state.user);

  const receiveMessage =
    useMessageStore((state) => state.receiveMessage);

  const addMessage =
    useMessageStore((state) => state.addMessage);

  const markStoreMessagesAsSeen =
    useMessageStore((state) => state.markStoreMessagesAsSeen);

  const updateMessage =
    useMessageStore((state) => state.updateMessage);

  const {
    incomingCall,
    setIncomingCall,
    callAccepted,
    setCallAccepted,
    localStream,
    setLocalStream,
    remoteStream,
    setRemoteStream,
    resetCall,
    activeCallUser,
  } = useCallStore();

  // ======================================================
  // RINGTONE REFS
  // ======================================================

  const ringtoneRef = useRef(null);   // incoming ring
  const outgoingRef = useRef(null);   // outgoing ring

  // ======================================================
  // INITIALIZE SOUNDS
  // ======================================================

  useEffect(() => {
    ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
    ringtoneRef.current.loop = true;
    ringtoneRef.current.volume = 1;

    outgoingRef.current = new Audio("/sounds/ringtone.mp3");
    outgoingRef.current.loop = true;
    outgoingRef.current.volume = 1;
  }, []);

  // ======================================================
  // GLOBAL HELPERS — used by ChatArea startCall & onCancel
  // ======================================================

  window.playOutgoingSound = async () => {
    try {
      if (outgoingRef.current) {
        outgoingRef.current.currentTime = 0;
        const p = outgoingRef.current.play();
        if (p !== undefined) p.catch((err) => console.log("Outgoing blocked:", err));
      }
    } catch (err) {
      console.log("Outgoing sound error:", err);
    }
  };

  window.stopAllRingtones = () => {
    try {
      if (outgoingRef.current) {
        outgoingRef.current.pause();
        outgoingRef.current.currentTime = 0;
      }
    } catch (_) {}
    try {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    } catch (_) {}
  };

  // ======================================================
  // MESSAGE SOCKETS
  // ======================================================

  useEffect(() => {

    if (currentUser) {

      socket.emit("setup", currentUser);

      const handleMessageReceived = (newMessage) => {
        receiveMessage(newMessage);
      };

      socket.off("message Received");
      socket.on("message Received", handleMessageReceived);

      const handleMessageEdited = (updatedMessage) => {
        updateMessage(updatedMessage);
      };

      socket.off("message edited");
      socket.on("message edited", handleMessageEdited);

      // ------------------------------------------------
      // CALL LOG MESSAGE — emitted by server after a call
      // ends/is cancelled/rejected so the call bubble
      // appears in real-time without a refresh
      // ------------------------------------------------
      const handleCallMessage = (callMsg) => {
        receiveMessage(callMsg);
      };
      socket.off("call-message");
      socket.on("call-message", handleCallMessage);

      // ------------------------------------------------
      // MESSAGES SEEN — update tick colour in real-time
      // for the sender when the receiver opens the chat
      // receiverId = the person who just saw the messages
      // (they are the receiver / the other user in the chat)
      // ------------------------------------------------
      const handleMessagesSeen = ({ receiverId }) => {
        // Only mark as seen if the person who read the
        // messages is actually the user we're chatting with
        const { selectedUser: activeChat } = useMessageStore.getState();
        if (activeChat && activeChat._id === receiverId) {
          markStoreMessagesAsSeen();
        }
      };
      socket.off("messagesSeen");
      socket.on("messagesSeen", handleMessagesSeen);

      return () => {
        socket.off("message Received", handleMessageReceived);
        socket.off("message edited", handleMessageEdited);
        socket.off("call-message", handleCallMessage);
        socket.off("messagesSeen", handleMessagesSeen);
      };
    }

  }, [currentUser, receiveMessage]);

  // ======================================================
  // CALL SOCKETS
  // ======================================================

  useEffect(() => {

    // ==========================================
    // INCOMING CALL
    // ==========================================
    socket.on("incoming-call", async (data) => {
      setIncomingCall(data);
      try {
        if (ringtoneRef.current) {
          ringtoneRef.current.currentTime = 0;
          await ringtoneRef.current.play();
        }
      } catch (err) {
        console.log(err);
      }
    });

    // ==========================================
    // CALL ACCEPTED (other side accepted our call)
    // ==========================================
    socket.on("call-answered", async ({ answer }) => {
      window.stopAllRingtones();

      const peer = getPeerConnection();
      if (!peer) return;

      await peer.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      setCallAccepted(true);
    });

    // ==========================================
    // ICE
    // ==========================================
    socket.on("ice-candidate", async ({ candidate }) => {
      const peer = getPeerConnection();
      if (peer && candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // ==========================================
    // CALL ENDED / CANCELLED / REJECTED
    // ==========================================
    socket.on("call-ended",    () => cleanupCall());
    socket.on("call-cancelled", () => cleanupCall());
    socket.on("call-rejected",  () => cleanupCall());

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("call-cancelled");
      socket.off("call-rejected");
    };

  }, []);

  // ======================================================
  // ACCEPT CALL
  // ======================================================

  const acceptCall = async () => {
    try {
      // Stop incoming ring immediately
      window.stopAllRingtones();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.callType === "video",
        audio: true,
      });

      setLocalStream(stream);

      const peer = createPeerConnection(
        (event) => setRemoteStream(event.streams[0]),
        (candidate) => socket.emit("ice-candidate", {
          candidate,
          to: incomingCall.from._id,
        }),
      );

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: incomingCall.from._id,
        answer,
        callId: incomingCall.callId,
      });

      setCallAccepted(true);

    } catch (err) {
      console.log("Error accepting call:", err);
    }
  };

  // ======================================================
  // CLEANUP
  // ======================================================

  const cleanupCall = () => {
    try {
      window.stopAllRingtones();

      const currentLocalStream = useCallStore.getState().localStream;
      const currentRemoteStream = useCallStore.getState().remoteStream;

      if (currentLocalStream) {
        currentLocalStream.getTracks().forEach((track) => track.stop());
      }

      if (currentRemoteStream) {
        currentRemoteStream.getTracks().forEach((track) => track.stop());
      }

      closePeerConnection();

    } catch (err) {
      console.error("Error cleaning up tracks:", err);
    } finally {
      setCallAccepted(false);
      setIncomingCall(null);
      resetCall();
    }
  };

  // ======================================================
  // END CALL
  // ======================================================

  const endCall = () => {
    const callState = useCallStore.getState();

    const to =
      callState.activeCallUser?._id ||
      callState.incomingCall?.from?._id;

    if (to) {
      socket.emit("end-call", {
        to,
        from: currentUser._id,
        callId:
          callState.incomingCall?.callId ||
          callState.outgoingCall?.callId,
      });
    }

    cleanupCall();
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="h-screen flex flex-col bg-[#020617]">

      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Outlet />
      </div>

      {/* INCOMING CALL MODAL */}
      {incomingCall && !callAccepted && (
        <IncomingCallModal
          caller={incomingCall.from}
          onAccept={acceptCall}
          onReject={() => {
            window.stopAllRingtones();
            if (incomingCall?.from?._id) {
              socket.emit("reject-call", {
                to: incomingCall.from._id,
                from: currentUser._id,
                callType: incomingCall.callType,
              });
            }
            cleanupCall();
          }}
        />
      )}

      {/* ACTIVE CALL */}
      {callAccepted && (
        <VideoCallModal
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={endCall}
        />
      )}

    </div>
  );
}