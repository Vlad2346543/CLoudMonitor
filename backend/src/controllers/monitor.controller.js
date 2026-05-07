const prisma = require('../config/database');

// Simulate real-time metric fluctuation
const fluctuate = (base, range = 10) => {
  const delta = (Math.random() - 0.5) * range;
  return Math.min(100, Math.max(0, parseFloat((base + delta).toFixed(1))));
};

const getOverview = async (req, res, next) => {
  try {
    const [totalResources, onlineCount, offlineCount, maintenanceCount, totalUsers, recentLogs] = await Promise.all([
      prisma.resource.count(),
      prisma.resource.count({ where: { status: 'ONLINE' } }),
      prisma.resource.count({ where: { status: 'OFFLINE' } }),
      prisma.resource.count({ where: { status: 'MAINTENANCE' } }),
      prisma.user.count(),
      prisma.log.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    ]);

    res.json({
      resources: { total: totalResources, online: onlineCount, offline: offlineCount, maintenance: maintenanceCount },
      users: { total: totalUsers },
      activity: { logsLast24h: recentLogs },
      system: {
        cpu: fluctuate(35, 20),
        ram: fluctuate(60, 15),
        disk: fluctuate(45, 5),
        network: fluctuate(25, 30),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) { next(err); }
};

const getResourceMetrics = async (req, res, next) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { status: 'ONLINE' },
      select: { id: true, name: true, type: true, cpuUsage: true, ramUsage: true },
    });

    const metrics = resources.map(r => ({
      ...r,
      cpuUsage: r.cpuUsage !== null ? fluctuate(r.cpuUsage, 8) : null,
      ramUsage: r.ramUsage !== null ? fluctuate(r.ramUsage, 5) : null,
      networkIn: parseFloat((Math.random() * 500).toFixed(1)),
      networkOut: parseFloat((Math.random() * 200).toFixed(1)),
      timestamp: new Date().toISOString(),
    }));

    res.json(metrics);
  } catch (err) { next(err); }
};

module.exports = { getOverview, getResourceMetrics };
