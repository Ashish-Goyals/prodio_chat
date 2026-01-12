const createOnCall = (io, activeCalls) => async participants => {
  try {
    if (!participants || !participants.caller || !participants.receiver) return;
    const {caller, receiver} = participants;

    const callerBusy = activeCalls.some (
      c =>
        c.participants.caller.userId === caller.userId ||
        c.participants.receiver.userId === caller.userId
    );
    if (callerBusy) {
      io.to (caller.socketId).emit ('alreadyInCall');
      return;
    }

    const receiverBusy = activeCalls.some (
      c =>
        calls.participants.caller.userId === receiver.userId ||
        calls.participants.receiver.userId === receiver.userId
    );
    if (receiverBusy) {
      io.to (caller.socketId).emit ('userBusy', {
        userId: receiver.userId,
        profile: receiver.profile,
      });
      return;
    }

    activeCalls.push ({participants, startedAt: Date.now ()});
    if (receiver.socketId) {
      io.to (receiver.socketId).emit ('incomingCall', participants);
    }
  } catch (err) {
    console.error ('error handling call:', err);
  }
};

export default createOnCall;
