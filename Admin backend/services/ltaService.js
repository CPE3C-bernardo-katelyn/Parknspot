const axios = require('axios');
const cron = require('node-cron');
const Carpark = require('../models/Carpark');
require('dotenv').config();

const LTA_BASE_URL = process.env.LTA_BASE_URL || 'https://datamall2.mytransport.sg/ltaodataservice';
const LTA_API_KEY = process.env.LTA_API_KEY;

const fetchAllCarparkAvailability = async () => {
  let allRecords = [];
  let skip = 0;
  const batchSize = 500;

  while (true) {
    const response = await axios.get(`${LTA_BASE_URL}/CarParkAvailabilityv2`, {
      headers: { AccountKey: LTA_API_KEY, accept: 'application/json' },
      params: { $skip: skip },
    });
    const records = response.data?.value || [];
    if (records.length === 0) break;
    allRecords = [...allRecords, ...records];
    skip += batchSize;
    if (records.length < batchSize) break;
  }

  console.log(`✅ Fetched ${allRecords.length} carpark records from LTA`);
  return allRecords;
};

const parseLocation = (locationStr) => {
  if (!locationStr) return { lat: null, lng: null };
  const parts = locationStr.trim().split(' ');
  if (parts.length === 2) return { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
  return { lat: null, lng: null };
};

const syncCarparkData = async () => {
  try {
    const ltaRecords = await fetchAllCarparkAvailability();
    if (!ltaRecords || ltaRecords.length === 0) return { synced: 0 };

    const bulkOps = ltaRecords.map((record) => {
      const coordinates = parseLocation(record.Location);
      const availableLots = parseInt(record.AvailableLots) || 0;
      let status = 'Available';
      if (availableLots === 0) status = 'Full';
      else if (availableLots <= 10) status = 'Limited';

      return {
        updateOne: {
          filter: { carparkID: record.CarParkID },
          update: {
            $set: {
              carparkID: record.CarParkID,
              area: record.Area || '',
              development: record.Development || '',
              location: record.Location || '',
              availableLots,
              lotType: record.LotType || 'C',
              agency: record.Agency || 'HDB',
              coordinates,
              status,
              lastSyncedAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Carpark.bulkWrite(bulkOps);
    console.log(`🔄 Sync complete: ${result.upsertedCount} new | ${result.modifiedCount} updated`);
    return { synced: result.upsertedCount + result.modifiedCount, total: ltaRecords.length };
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  }
};

const startSyncScheduler = () => {
  const intervalMinutes = parseInt(process.env.SYNC_INTERVAL_MINUTES) || 1;
  const cronExpression = `*/${intervalMinutes} * * * *`;
  console.log(`⏰ LTA sync scheduler started — every ${intervalMinutes} minute(s)`);
  syncCarparkData().catch(console.error);
  cron.schedule(cronExpression, () => {
    console.log(`\n🕐 [${new Date().toLocaleTimeString()}] Running scheduled LTA sync...`);
    syncCarparkData().catch(console.error);
  });
};

const getDashboardStats = async () => {
  const [total, available, limited, full] = await Promise.all([
    Carpark.countDocuments(),
    Carpark.countDocuments({ status: 'Available' }),
    Carpark.countDocuments({ status: 'Limited' }),
    Carpark.countDocuments({ status: 'Full' }),
  ]);
  const avgOccupancy = await Carpark.aggregate([{ $group: { _id: null, avg: { $avg: '$occupancyRate' } } }]);
  return {
    totalCarparks: total,
    availableCarparks: available,
    limitedCarparks: limited,
    fullCarparks: full,
    averageOccupancy: Math.round(avgOccupancy[0]?.avg || 0),
    utilization: Math.round(avgOccupancy[0]?.avg || 0),
    activeSessions: available,
    dailyIncidents: 0,
    avgResponse: '1.4h',
    satisfiedRate: '94%',
  };
};

module.exports = { syncCarparkData, startSyncScheduler, getDashboardStats };