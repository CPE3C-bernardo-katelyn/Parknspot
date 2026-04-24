const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, parkingSpotId = null, metadata = {} }) => {
  try {
    const notification = await Notification.create({ userId, type, title, message, parkingSpotId, metadata });
    return notification;
  } catch (err) {
    console.error('createNotification error:', err);
    return null;
  }
};

const notifyParkingAvailable = async ({ userId, spotName, parkingSpotId = null, metadata = {} }) => {
  return createNotification({
    userId,
    type: 'parking_available',
    title: '🅿️ Parking Space Available!',
    message: `A spot at ${spotName} is now available. Head over before it's taken!`,
    parkingSpotId,
    metadata,
  });
};

const notifyParkingFull = async ({ userId, spotName, parkingSpotId = null, metadata = {} }) => {
  return createNotification({
    userId,
    type: 'parking_full',
    title: '🚫 Parking Area Full',
    message: `${spotName} is currently full. We'll notify you when a spot opens up.`,
    parkingSpotId,
    metadata,
  });
};

// FIX 1: broadcastNotification — emit using notification.userId instead of index-based matching
const broadcastNotification = async ({ userIds, title, message, type = 'system' }) => {
  try {
    const docs = userIds.map((userId) => ({ userId, type, title, message, isRead: false }));
    const notifications = await Notification.insertMany(docs);
    return notifications;
  } catch (err) {
    console.error('broadcastNotification error:', err);
    return [];
  }
};

// FIX 2: watchParkingSpots — added replica set error guard + safe close
const watchParkingSpots = (ParkingSpotModel, getUserIdsForSpot) => {
  let changeStream;

  try {
    changeStream = ParkingSpotModel.watch(
      [{ $match: { operationType: { $in: ['update', 'replace'] } } }],
      { fullDocument: 'updateLookup' }
    );
  } catch (err) {
    console.error('❌ Failed to start change stream. Make sure MongoDB is running as a replica set.', err.message);
    return null;
  }

  changeStream.on('change', async (change) => {
    const spot = change.fullDocument;
    if (!spot) return;

    const wasAvailable = change.updateDescription?.updatedFields?.availableSpaces;
    if (wasAvailable === undefined) return;

    const userIds = await getUserIdsForSpot(spot);
    if (!userIds || userIds.length === 0) return;

    const spotName = spot.name || spot.location || 'a nearby parking spot';

    for (const userId of userIds) {
      if (spot.availableSpaces > 0) {
        await notifyParkingAvailable({ userId, spotName, parkingSpotId: spot._id, metadata: { availableSpaces: spot.availableSpaces } });
      } else {
        await notifyParkingFull({ userId, spotName, parkingSpotId: spot._id });
      }
    }
  });

  changeStream.on('error', (err) => {
    // Error code 40573 = change streams require replica set
    if (err.code === 40573) {
      console.error('❌ Change streams require a MongoDB replica set. Parking watcher disabled.');
      changeStream.close();
    } else {
      console.error('Change stream error:', err);
    }
  });

  console.log('✅ Parking spot watcher started');
  return changeStream;
};

module.exports = { createNotification, notifyParkingAvailable, notifyParkingFull, broadcastNotification, watchParkingSpots };