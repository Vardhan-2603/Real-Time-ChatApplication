import { MessageModel } from "../Models/MessageModel.js";

export const sendMessage =
  async (req, res) => {
    const {
      sender,
      receiver,
      content,
      clientMessageId,
    } = req.body;

    try {
      if (clientMessageId) {
        const existing = await MessageModel.findOne({ clientMessageId })
          .populate("sender", "firstName lastName profilePic")
          .populate("receiver", "firstName lastName profilePic");
        if (existing) {
          return res.status(201).json(existing);
        }
      }

      // =================================================
      // FILE DETAILS
      // =================================================

      let fileUrl = "";

      let fileName = "";

      let fileType = "";



      // CLOUDINARY FILE
      if (req.file) {

        fileUrl =
          req.file.path;

        fileName =
          req.file.originalname;

        fileType =
          req.file.mimetype;

      }



      // =================================================
      // CREATE MESSAGE
      // =================================================

      const newMessage =
        await MessageModel.create({

          sender,

          receiver,

          content,

          fileUrl,

          fileName,

          fileType,

          messageType:
            req.file
              ? "file"
              : "text",
          ...(clientMessageId && { clientMessageId }),
        });



      // =================================================
      // POPULATE MESSAGE
      // =================================================

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



      // =================================================
      // SOCKET REALTIME
      // =================================================

      const io =
        req.app.get("socketio");



      io.to(
        sender.toString(),
      )

      .to(
        receiver.toString(),
      )

      .emit(
        "message Received",
        populatedMessage,
      );



      // =================================================
      // RESPONSE
      // =================================================

      res.status(201).json(
        populatedMessage,
      );

    } catch (error) {
      if (error.code === 11000 || (error.writeErrors && error.writeErrors.some(e => e.code === 11000))) {
        if (clientMessageId) {
          try {
            const existing = await MessageModel.findOne({ clientMessageId })
              .populate("sender", "firstName lastName profilePic")
              .populate("receiver", "firstName lastName profilePic");
            if (existing) {
              return res.status(201).json(existing);
            }
          } catch (findErr) {
            console.log("Error finding existing message:", findErr);
          }
        }
      }
      console.log(error);

      res.status(500).json({

        message:
          "Error sending message",

      });

    }

  };