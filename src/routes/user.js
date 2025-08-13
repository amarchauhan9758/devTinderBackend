const express = require("express");
const User = require("../models/user");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

// Get all  pending connection requests for a user

const USER_SAFE_FIELDS = "firstName profileURL  lastName about skills";

userRouter.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log(loggedInUser, "line no 14");
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_FIELDS);
    // Populate fromUserId with name and profileURL

    if (!connectionRequest || connectionRequest.length === 0) {
      return res.status(500).send({
        data: null,
        message: "No connection requests found",
      });
    }

    // const filteredData = connectionRequest.map((req) => ({
    //   fromUser: req.fromUserId, // this will only have USER_SAFE_FIELDS
    // }));

    res.json({
      message: "Connection requests fetched successfully",
      data: connectionRequest,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequestes = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS);

    const data = connectionRequestes.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({
      message: "Connections fetched successfully",
      data: data,
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const skip = (page - 1) * limit;

  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    });

    console.log(connectionRequests, "line no 79");

    const hideUserFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUserFromFeed.add(req.fromUserId.toString());
      hideUserFromFeed.add(req.toUserId.toString());
    });
    // console.log(hideUserFromFeed, 'line no 83')

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_FIELDS)
      .skip(skip)
      .limit(limit);
    // console.log(users, 'line no 85')

    res.send(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = userRouter;
