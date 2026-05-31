import { CallModel } from "../Models/CallModel.js";
import { MessageModel } from "../Models/MessageModel.js";

export const registerCallSockets =
  (io, socket) => {

    // ==================================================
    // SAVE + SEND CALL LOG MESSAGE
    // ==================================================

    const saveCallMessage =
      async ({

        sender,

        receiver,

        content,

        callDuration = "",

        callStatus = "",

        callType = "",

      }) => {

        try {

          const newMessage =
            await MessageModel.create({

              sender,

              receiver,

              content,

              callDuration,

              callStatus,

              callType,

              messageType: "call",

            });

          const populatedMessage =
            await MessageModel.findById(
              newMessage._id,
            )

              .populate(
                "sender",
                "firstName lastName profilePic",
              )

              .populate(
                "receiver",
                "firstName lastName profilePic",
              );



          // ==========================================
          // REALTIME BOTH USERS
          // ==========================================

          io.to(
            sender.toString(),
          ).emit(
            "message Received",
            populatedMessage,
          );

          io.to(
            receiver.toString(),
          ).emit(
            "message Received",
            populatedMessage,
          );



          // OPTIONAL EXTRA EVENT
          io.to(
            sender.toString(),
          ).emit(
            "call-log",
            populatedMessage,
          );

          io.to(
            receiver.toString(),
          ).emit(
            "call-log",
            populatedMessage,
          );



          return populatedMessage;

        } catch (err) {

          console.log(
            "saveCallMessage error",
            err,
          );

        }

      };



    // ==================================================
    // START CALL
    // ==================================================

    socket.on(
      "call-user",
      async (data) => {

        try {

          const call =
            await CallModel.create({

              caller:
                data.from._id,

              receiver:
                data.to,

              type:
                data.callType,

              status:
                "calling",

              startedAt:
                new Date(),

            });

          io.to(data.to).emit(
            "incoming-call",
            {

              from:
                data.from,

              offer:
                data.offer,

              callType:
                data.callType,

              callId:
                call._id,

            },
          );

        } catch (err) {

          console.log(
            "CALL ERROR",
            err,
          );

        }

      },
    );



    // ==================================================
    // ACCEPT CALL
    // ==================================================

    socket.on(
      "answer-call",
      async (data) => {

        try {

          await CallModel.findByIdAndUpdate(

            data.callId,

            {
              status:
                "answered",
            },

          );

          io.to(data.to).emit(
            "call-answered",
            {

              answer:
                data.answer,

              callId:
                data.callId,

            },
          );

        } catch (err) {

          console.log(err);

        }

      },
    );



    // ==================================================
    // ICE
    // ==================================================

    socket.on(
      "ice-candidate",
      (data) => {

        io.to(data.to).emit(
          "ice-candidate",
          {

            candidate:
              data.candidate,

          },
        );

      },
    );



    // ==================================================
    // MISSED CALL
    // ==================================================

    socket.on(
      "cancel-call",
      async ({
        to,
        from,
        callType,
      }) => {

        try {

          io.to(to).emit(
            "call-cancelled",
          );

          const content =
            callType === "video"
              ? "📹 Missed Video Call"
              : "📞 Missed Audio Call";

          await saveCallMessage({

            sender: from,

            receiver: to,

            content,

            callStatus:
              "missed",

            callType,

          });

        } catch (err) {

          console.log(err);

        }

      },
    );



    // ==================================================
    // REJECTED CALL
    // ==================================================

    socket.on(
      "reject-call",
      async ({
        to,
        from,
        callType,
      }) => {

        try {

          io.to(to).emit(
            "call-rejected",
          );

          const content =
            callType === "video"
              ? "📹 Video Call Rejected"
              : "📞 Audio Call Rejected";

          await saveCallMessage({

            sender: from,

            receiver: to,

            content,

            callStatus:
              "rejected",

            callType,

          });

        } catch (err) {

          console.log(err);

        }

      },
    );



    // ==================================================
    // END CALL
    // ==================================================

    socket.on(
      "end-call",
      async ({
        to,
        from,
        callId,
      }) => {

        try {

          io.to(to).emit(
            "call-ended",
          );

          const call =
            await CallModel.findById(
              callId,
            );

          if (!call) return;

          // PREVENT DUPLICATE SAVE
          if (
            call.status === "ended"
          ) {
            return;
          }

          const endedAt =
            new Date();

          const durationMs =
            endedAt -
            new Date(
              call.startedAt,
            );

          const totalSeconds =
            Math.floor(
              durationMs / 1000,
            );

          const minutes =
            Math.floor(
              totalSeconds / 60,
            );

          const seconds =
            totalSeconds % 60;

          const duration =
            `${minutes}m ${seconds}s`;



          await CallModel.findByIdAndUpdate(

            callId,

            {

              status:
                "ended",

              endedAt,

            },

          );



          const content =
            call.type === "video"
              ? "📹 Video Call"
              : "📞 Audio Call";



          await saveCallMessage({

            sender: call.caller,
            receiver: call.receiver,

            content,

            callDuration:
              duration,

            callStatus:
              "ended",

            callType:
              call.type,

          });

        } catch (err) {

          console.log(err);

        }

      },
    );

  };
