import { dashboardRoom } from "../common/utils/socket.helper.js";
import { dashboard, get_poll_results } from "../modules/poll/poll.service.js";

export const setupPollSocketHandlers = (io, socket) => {
  // Client joins a specific poll room to listen for live updates
  socket.on("join_poll", async ({ pollId, creatorId, userId }) => {
    if (!pollId) return;
    console.log(
      "control in ",
      "pollID",
      pollId,
      "creator id:",
      creatorId,
      "user:",
      userId,
    );

    if (creatorId && userId === null) {
      console.log("control in creator block");

      const creatorRoom = `poll:${pollId}:creator`;
      socket.join(creatorRoom);
      console.log(
        `[Socket.io] Socket ${socket.id} joined creator room ${creatorRoom}`,
      );
    } else if (userId) {
      console.log("control in user block");

      const room = `poll:${pollId}`;
      socket.join(room);
      console.log(
        `User joined room ${room} pollId: ${pollId} Creator: ${creatorId} user: ${userId}`,
      );
    }
    console.log("control out");
    // socket.emit("joined_poll", { pollId, success: true });
  });

  // Client leaves a specific poll room
  socket.on("leave_poll", ({ pollId }) => {
    if (!pollId) return;
    const room = `poll:${pollId}`;
    const creatorRoom = `poll:${pollId}:creator`;
    socket.leave(room);
    socket.leave(creatorRoom);
    console.log(`[Socket.io] Socket ${socket.id} left room ${room}`);
  });

  // Client requests real-time poll results over WebSocket
  socket.on("get_poll_results", async ({ pollId, user }) => {
    if (!pollId) {
      socket.emit("poll_results_error", { message: "pollId is required" });
      return;
    }
    console.log("received data:", pollId, "  ", user);

    try {
      // Auto-join room for live updates
      const room = `poll:${pollId}`;
      socket.join(room);
 
      const results = await get_poll_results(pollId, user);
      console.log("result=", results);

      if (results && results.canViewResults && user) {
        socket.join(`poll:${pollId}:creator`);
      }

      socket.emit("poll_results", results);
     // socket.emit("poll_results_data", results);
    } catch (error) {
      console.log(
        `[Socket.io] Error in get_poll_results handler for poll ${pollId}:`,
        error.message,
      );
      socket.emit("poll_results_error", {
        message: error.message || "Failed to fetch poll results",
      });
    }
  });
};

export const emitDashboardUpdate = (io, socket) => {
  try {
    socket.on("dashboard", async ({ userId }) => {
      if (!userId) return;

      //const dashboardRoom=`Dashboard:${userId}`
      socket.join(dashboardRoom(userId));
      const response = await dashboard(userId);
      socket.emit("dashboard", response);
    });
  } catch (error) {
    console.log("Error in emit dashboard data SOCKET:", error);
  }
};

// export const emitPollDetail=(io,socket)=>{
// try {
//   socket.on("polldata",async()=>{})
// } catch (error) {

// }
// }
