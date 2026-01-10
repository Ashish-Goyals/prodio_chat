import {createServer} from 'node:http';
import next from 'next';
import {Server} from 'socket.io';
import onCall from './socket-events/onCall.js';
import onWebrtcSignal from './socket-events/onWebrtcSignal.js';
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next ({dev, hostname, port});
const handler = app.getRequestHandler ();

export let io;

app.prepare ().then (() => {
  const httpServer = createServer (handler);

  io = new Server (httpServer);

  let onlineUsers = [];

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
      onlineUsers = onlineUsers.filter (user => user.socketId !== socket.id);

      io.emit ('getUsers', onlineUsers);
      console.log ('onlineUsers (removed):', onlineUsers.length);
    });

    socket.on ('call', onCall);
    socket.on('webrtcSignal',onWebrtcSignal);
    socket.on('hangup', data => {
      try {
        const ongoingCall = data?.ongoingCall;
        if (!ongoingCall || !ongoingCall.participants) return;
        const { caller, receiver } = ongoingCall.participants;

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
    .once ('error', err => {
      console.error (err);
      process.exit (1);
    })
    .listen (port, () => {
      console.log (`LocalHost :- http://${hostname}:${port}`);
    });
});
