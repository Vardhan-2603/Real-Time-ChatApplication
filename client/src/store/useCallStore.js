import { create } from "zustand";

export const useCallStore = create((set) => ({
  incomingCall: null,

  outgoingCall: null,

  callAccepted: false,

  isCalling: false,

  localStream: null,

  activeCallUser: null,

  remoteStream: null,

  caller: null,

  callType: null,

  // FIXED
  setIncomingCall: (call) =>
    set({
      incomingCall: call,

      caller: call ? call.from : null,

      callType: call ? call.callType : null,
    }),

  setOutgoingCall: (call) =>
    set({
      outgoingCall: call,
      isCalling: true,
    }),

  setCallAccepted: (value) =>
    set({
      callAccepted: value,
      isCalling: false,
    }),

  setLocalStream: (stream) =>
    set({
      localStream: stream,
    }),

  setActiveCallUser: (user) =>
    set({
      activeCallUser: user,
    }),

  setRemoteStream: (stream) =>
    set({
      remoteStream: stream,
    }),

  resetCall: () =>
    set({
      incomingCall: null,
      outgoingCall: null,
      activeCallUser: null,
      callAccepted: false,
      isCalling: false,
      localStream: null,
      remoteStream: null,
      caller: null,
      callType: null,
    }),
}));