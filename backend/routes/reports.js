import express from 'express';
import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get age breakdown report
router.get('/age-breakdown', authenticateToken, async (req, res) => {
  try {
    const ageGroups = await Fisherfolk.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$age', 25] },
              'Under 25',
              {
                $cond: [
                  { $lt: ['$age', 35] },
                  '25-34',
                  {
                    $cond: [
                      { $lt: ['$age', 45] },
                      '35-44',
                      {
                        $cond: [{ $lt: ['$age', 55] }, '45-54', '55+'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(ageGroups);
  } catch (error) {
    res.status(500).json({ message: 'Error generating age breakdown report', error: error.message });
  }
});

// Get gender breakdown report
router.get('/gender-breakdown', authenticateToken, async (req, res) => {
  try {
    const genderBreakdown = await Fisherfolk.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(genderBreakdown);
  } catch (error) {
    res.status(500).json({ message: 'Error generating gender breakdown report', error: error.message });
  }
});

// Get income report
router.get('/income', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const incomeData = await Fisherfolk.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$province',
          totalFisherfolk: { $sum: 1 },
          avgIncome: { $avg: { $toDouble: '$estimatedIncome' } },
        },
      },
      { $sort: { avgIncome: -1 } },
    ]);

    res.json(incomeData);
  } catch (error) {
    res.status(500).json({ message: 'Error generating income report', error: error.message });
  }
});

// Get fisherfolk statistics
router.get('/fisherfolk-stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Fisherfolk.aggregate([
      {
        $facet: {
          totalFisherfolk: [{ $count: 'count' }],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          byProvince: [
            {
              $group: {
                _id: '$province',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error generating fisherfolk statistics', error: error.message });
  }
});

// Get boats and gears statistics
router.get('/boats-gears-stats', authenticateToken, async (req, res) => {
  try {
    const [boatsStats, gearsStats] = await Promise.all([
      Boat.aggregate([
        {
          $facet: {
            totalBoats: [{ $count: 'count' }],
            byStatus: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),
      Gear.aggregate([
        {
          $facet: {
            totalGears: [{ $count: 'count' }],
            byCondition: [
              {
                $group: {
                  _id: '$condition',
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),
    ]);

    res.json({
      boats: boatsStats[0],
      gears: gearsStats[0],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating boats and gears statistics', error: error.message });
  }
});

// Get comprehensive dashboard statistics
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    console.log('[v0] Fetching dashboard statistics...');

    const [fisherfolkStats, boatsStats, gearsStats, organizationCount] = await Promise.all([
      // Fisherfolk statistics
      Fisherfolk.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byProvince: [
              {
                $group: {
                  _id: '$province',
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            byCity: [
              {
                $group: {
                  _id: { province: '$province', city: '$cityMunicipality' },
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            byLivelihood: [
              {
                $group: {
                  _id: '$mainLivelihood',
                  count: { $sum: 1 },
                },
              },
            ],
            byStatus: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
            byYear: [
              {
                $group: {
                  _id: { $year: '$registrationDate' },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      
      // Boats statistics
      Boat.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byYear: [
              {
                $group: {
                  _id: { $year: '$registrationDate' },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            byStatus: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),
      
      // Gears statistics
      Gear.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byType: [
              {
                $group: {
                  _id: '$gearType',
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
            ],
            byCondition: [
              {
                $group: {
                  _id: '$condition',
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),
      
      // Organization count (assuming Organization model exists)
      Fisherfolk.distinct('province').then(provinces => provinces.length),
    ]);

    console.log('[v0] Dashboard stats fetched successfully');
    
    res.json({
      fisherfolk: fisherfolkStats[0],
      boats: boatsStats[0],
      gears: gearsStats[0],
      organizationCount,
    });
  } catch (error) {
    console.error('[v0] Error generating dashboard statistics:', error);
    res.status(500).json({ message: 'Error generating dashboard statistics', error: error.message });
  }
});

export default router;
