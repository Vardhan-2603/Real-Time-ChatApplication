import { CallModel } from "../Models/CallModel.js";

export const createCall = async (req, res) => {
  try {
    const call = await CallModel.create(req.body);

    res.status(201).json({
      message: "Call created",
      payload: call,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating call",
      error: err.message,
    });
  }
};

export const getCalls = async (req, res) => {
  try {
    const userId = req.user._id;

    const calls = await CallModel.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller", "firstName lastName")
      .populate("receiver", "firstName lastName")
      .sort({
        createdAt: -1,
      });

    res.json({
      payload: calls,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

export const updateCall = async (req, res) => {
  try {
    const updatedCall = await CallModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.json({
      payload: updatedCall,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
