import { create } from "zustand";

import {
  getSidebarUsers,
  getMyChannels,
} from "../services/api";

export const useMessageStore =
  create((set, get) => ({

    messages: [],

    selectedUser: null,

    unreadCounts: {},

    sidebarUsers: [],

    channels: [],

    replyingToMessage: null,

    isSidebarOpen: true,

    
    toggleSidebar:
      () =>
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
        })),

    addSidebarUser: (newUser) => set((state) => {
    const userExists = state.sidebarUsers?.find((u) => u._id === newUser._id);
    if (userExists) {
      return state; 
    }
    return { sidebarUsers: [newUser, ...(state.sidebarUsers || [])] };
    }),


    // =====================================================
    // REPLY
    // =====================================================

    setReplyingToMessage:
      (message) =>

        set({

          replyingToMessage:
            message,

        }),



    // =====================================================
    // MARK SEEN
    // =====================================================

    markStoreMessagesAsSeen:
      () =>

        set((state) => ({

          messages:
            state.messages.map(
              (msg) => ({

                ...msg,

                status: "seen",

              }),
            ),

        })),



    // =====================================================
    // LOAD SIDEBAR USERS
    // =====================================================

    loadSidebarUsers:
      async () => {

        try {

          const res =
            await getSidebarUsers();

          set({

            sidebarUsers:
              Array.isArray(res?.data?.payload)
                ? res.data.payload
                : Array.isArray(res?.data)
                  ? res.data
                  : [],

          });

        } catch (error) {

          console.error(

            "Error fetching sidebar users:",

            error,
          );

        }

      },



    // =====================================================
    // LOAD CHANNELS
    // =====================================================

    loadChannels:
      async () => {

        try {

          const res =
            await getMyChannels();

          set({

            channels:
              Array.isArray(res?.data?.payload)
                ? res.data.payload
                : Array.isArray(res?.data)
                  ? res.data
                  : [],

          });

        } catch (error) {

          console.error(

            "Error fetching channels:",

            error,
          );

        }

      },



    // =====================================================
    // SET MESSAGES
    // =====================================================

    setMessages:
      (messages) =>

        set((state) => ({

          messages:

            typeof messages ===
            "function"

              ? messages(
                  state.messages,
                )

              : messages || [],

        })),



    // =====================================================
    // ADD MESSAGE
    // =====================================================

    addMessage:
      (message) => {

        if (!message?._id) {
          return;
        }

        set((state) => {

          const isDuplicate =
            state.messages.some(
              (msg) =>
                msg._id ===
                message._id,
            );

          if (isDuplicate) {
            return state;
          }

          return {

            messages: [

              ...state.messages,

              message,

            ],

          };

        });

      },



    // =====================================================
    // UPDATE MESSAGE
    // =====================================================

    updateMessage:
      (updatedMessage) => {

        if (!updatedMessage?._id) {
          return;
        }

        set((state) => ({

          messages:
            state.messages.map(
              (msg) =>

                msg._id.toString() ===
                updatedMessage._id.toString()

                  ? {

                      ...msg,

                      ...updatedMessage,

                    }

                  : msg,
            ),

        }));

      },



    // =====================================================
    // THREAD REPLY
    // =====================================================

    addThreadReply:
      (replyMessage) => {

        if (!replyMessage?._id) {
          return;
        }

        set((state) => {

          const isDuplicate =
            state.messages.some(
              (msg) =>
                msg._id ===
                replyMessage._id,
            );

          if (isDuplicate) {
            return state;
          }

          return {

            messages: [

              ...state.messages,

              replyMessage,

            ],

          };

        });

      },



    // =====================================================
    // SELECT USER
    // =====================================================

    setSelectedUser:
      (user) =>

        set((state) => ({

          selectedUser: user,

          unreadCounts: user

            ? {

                ...state.unreadCounts,

                [user._id]: 0,

              }

            : state.unreadCounts,

        })),



    // =====================================================
    // REACTIONS
    // =====================================================

    updateMessageReaction:
      (updatedMessage) => {

        if (!updatedMessage?._id) {
          return;
        }

        set((state) => ({

          messages:
            state.messages.map(
              (msg) =>

                msg._id.toString() ===
                updatedMessage._id.toString()

                  ? updatedMessage

                  : msg,
            ),

        }));

      },



    // =====================================================
    // RECEIVE MESSAGE
    // =====================================================

    receiveMessage:
      (message) => {

        if (!message?._id) {
          return;
        }

        set((state) => {

          const isDuplicate =
            state.messages.some(
              (msg) =>
                msg._id ===
                message._id,
            );

          if (isDuplicate) {
            return state;
          }

          const activeChatId =
            state.selectedUser?._id;

          const isChannelChat =
            state.selectedUser?.isChannel;



          let isCurrentChatMatch =
            false;

          let notificationId =
            null;



          // =====================================
          // CHANNEL MESSAGE
          // =====================================

          if (message.channel) {

            const channelId =

              message.channel?._id ||

              message.channel;

            if (

              isChannelChat &&

              activeChatId ===
                channelId

            ) {

              isCurrentChatMatch =
                true;

            }

            else {

              notificationId =
                channelId;

            }

          }



          // =====================================
          // DIRECT MESSAGE
          // =====================================

          else {

            const senderId =

              message.sender?._id ||

              message.sender;

            const receiverId =

              message.receiver?._id ||

              message.receiver;



            if (

              !isChannelChat &&

              (

                activeChatId ===
                  senderId ||

                activeChatId ===
                  receiverId

              )

            ) {

              isCurrentChatMatch =
                true;

            }

            else {

              notificationId =
                senderId;

            }

          }



          // =====================================
          // ACTIVE CHAT
          // =====================================

          if (isCurrentChatMatch) {

            return {

              messages: [

                ...state.messages,

                message,

              ],

            };

          }



          // =====================================
          // UNREAD COUNT
          // =====================================

          else if (
            notificationId
          ) {

            return {

              unreadCounts: {

                ...state.unreadCounts,

                [notificationId]:

                  (
                    state.unreadCounts[
                      notificationId
                    ] || 0
                  ) + 1,

              },

            };

          }

          return state;

        });

      },

  }));