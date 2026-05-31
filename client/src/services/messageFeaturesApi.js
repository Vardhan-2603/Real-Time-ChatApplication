import api from "./api";

/* ======================================================
   EDIT MESSAGE
====================================================== */

export const editMessageApi = (messageId, data) =>
  api.put(`/message-feature-api/edit/${messageId}`, data);

/* ======================================================
   SEND THREAD REPLY
====================================================== */

export const sendThreadReplyApi = (parentMessageId, data) =>
  api.post(`/message-feature-api/thread-reply/${parentMessageId}`, data);

/* ======================================================
   GET THREAD REPLIES
====================================================== */

export const getThreadRepliesApi = (parentMessageId) =>
  api.get(`/message-feature-api/thread-replies/${parentMessageId}`);

/* ======================================================
   REACT TO MESSAGE
====================================================== */

export const reactToMessageApi = (messageId, data) =>
  api.post(`/message-feature-api/react/${messageId}`, data);
