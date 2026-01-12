import {createServer} from 'node:http';
import next from 'next';
import {Server} from 'socket.io';
import onWebrtcSignal from './socket-events/onWebrtcSignal.js';
import createOnCall from './socket-events/onCall.js';
const dev = process.env.NODE_ENV !== 'production';
const hostname = "0.0.0.0"; 
const PORT = process.env.PORT || 3000;
const app = next ({dev, hostname, port:PORT});
const handler = app.getRequestHandler ();

export let io;

app.prepare ().then (() => {
  const httpServer = createServer (handler);

  io = new Server (httpServer);

  let onlineUsers = [];
  let activeCalls = [];

   function removeActiveCallsFor(userIds) {
    for (let i = activeCalls.length - 1; i >= 0; i--) {
      const calling = activeCalls[i];
      if (!calling || !calling.participants) continue;
      const { caller, receiver } = calling.participants;
      if (userIds.includes(caller?.userId) || userIds.includes(receiver?.userId)) {
        activeCalls.splice(i, 1);
      }
    }
  }

  io.on ('connection', socket => {
    console.log ('client connected .....');
    socket.on ('addNewUser', clerkUser => {
      clerkUser &&
        !onlineUsers.some (user => user.userId === clerkUser.id) &&
        onlineUsers.push ({
          userId: clerkUser.id,
          socketId: socket.id,
          profile: clerkUser,
        });
      io.emit ('getUsers', onlineUsers);
      console.log ('onlineUsers (added):', onlineUsers.length);
    });
    socket.on ('disconnect', () => {
      console.log ('client disconnected .....');
      const disconnectedUser = onlineUsers.find(user => user.socketId === socket.id);
      onlineUsers = onlineUsers.filter (user => user.socketId !== socket.id);

      if (disconnectedUser?.userId) {
        removeActiveCallsFor([disconnectedUser.userId]);
      }

      io.emit ('getUsers', onlineUsers);
      console.log ('onlineUsers (removed):', onlineUsers.length);
    });

    socket.on('call', createOnCall(io, activeCalls));
    socket.on('webrtcSignal',onWebrtcSignal);
    socket.on('hangup', data => {
      try {
        const ongoingCall = data?.ongoingCall;
        if (!ongoingCall || !ongoingCall.participants) return;
        const { caller, receiver } = ongoingCall.participants;

         removeActiveCallsFor([caller.userId, receiver.userId]);

        const senderSocketId = socket.id;
        const other = caller?.socketId === senderSocketId ? receiver : caller;
        if (other && other.socketId) {
          io.to(other.socketId).emit('hangup', ongoingCall);
        }
      } catch (err) {
        console.error('Error handling hangup:', err);
      }
    });
  });

 httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(PORT, hostname, () => {
      console.log(`Server running on http://${hostname}:${PORT}`);
    });
});
