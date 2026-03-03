import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';
import AuditLog from '../models/AuditLog.js';
import Document from '../models/Document.js';

// Get comprehensive statistics
export const getStatistics = async () => {
  try {
    const [fisherfolkCount, boatsCount, gearsCount, organizationsCount, activeUsers] = await Promise.all([
      Fisherfolk.countDocuments(),
      Boat.countDocuments(),
      Gear.countDocuments(),
      // Organization count would go here
      Promise.resolve(0),
      AuditLog.countDocuments({ action: 'LOGIN', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);

    return {
      fisherfolk: fisherfolkCount,
      boats: boatsCount,
      gears: gearsCount,
      organizations: organizationsCount,
      activeUsers30Days: activeUsers,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[v0] Error getting statistics:', error);
    throw error;
  }
};

// Get geographic distribution
export const getGeographicDistribution = async () => {
  try {
    const distribution = await Fisherfolk.aggregate([
      {
        $group: {
          _id: '$province',
          count: { $sum: 1 },
          cities: { $addToSet: '$cityMunicipality' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return distribution;
  } catch (error) {
    console.error('[v0] Error getting geographic distribution:', error);
    throw error;
  }
};

// Get activity timeline
export const getActivityTimeline = async (days = 30) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const timeline = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            action: '$action',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    return timeline;
  } catch (error) {
    console.error('[v0] Error getting activity timeline:', error);
    throw error;
  }
};

// Get user activity report
export const getUserActivityReport = async (userId) => {
  try {
    const logs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    const summary = {
      totalActions: logs.length,
      actionCounts: {},
      lastActive: logs[0]?.createdAt,
      firstActive: logs[logs.length - 1]?.createdAt,
    };

    logs.forEach(log => {
      summary.actionCounts[log.action] = (summary.actionCounts[log.action] || 0) + 1;
    });

    return {
      summary,
      recentActivity: logs.slice(0, 20),
    };
  } catch (error) {
    console.error('[v0] Error getting user activity report:', error);
    throw error;
  }
};

// Get resource statistics
export const getResourceStatistics = async (resource) => {
  try {
    let Model;
    switch (resource) {
      case 'fisherfolk':
        Model = Fisherfolk;
        break;
      case 'boats':
        Model = Boat;
        break;
      case 'gears':
        Model = Gear;
        break;
      default:
        return null;
    }

    const total = await Model.countDocuments();
    const createdThisMonth = await Model.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setDate(1)),
      },
    });

    const createdThisWeek = await Model.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      resource,
      total,
      createdThisMonth,
      createdThisWeek,
      growthRate: ((createdThisMonth / (total || 1)) * 100).toFixed(2) + '%',
    };
  } catch (error) {
    console.error('[v0] Error getting resource statistics:', error);
    throw error;
  }
};

// Get system health metrics
export const getSystemHealth = async () => {
  try {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      uptime: `${Math.floor(uptime / 3600)} hours`,
      memory: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[v0] Error getting system health:', error);
    throw error;
  }
};

// Generate CSV report
export const generateCSVReport = async (data, headers) => {
  try {
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
      csv += headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',') + '\n';
    });

    return csv;
  } catch (error) {
    console.error('[v0] Error generating CSV report:', error);
    throw error;
  }
};

// Generate PDF report (would use a library like pdfkit)
export const generatePDFReport = async (title, data) => {
  try {
    // This would use pdfkit or similar
    console.log('[v0] PDF report generation for:', title);
    return null;
  } catch (error) {
    console.error('[v0] Error generating PDF report:', error);
    throw error;
  }
};

export default {
  getStatistics,
  getGeographicDistribution,
  getActivityTimeline,
  getUserActivityReport,
  getResourceStatistics,
  getSystemHealth,
  generateCSVReport,
  generatePDFReport,
};
