const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { watchParkingSpots } = require('./services/parkingNotificationService');
const ParkingCache = require('./models/ParkingCache');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);

    const getUserIdsForSpot = async (spot) => {
      const users = await User.find({ watchedSpots: spot._id }, '_id');
      return users.map((u) => u._id);
    };

    watchParkingSpots(ParkingCache, getUserIdsForSpot);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1);
  }
};

start();
