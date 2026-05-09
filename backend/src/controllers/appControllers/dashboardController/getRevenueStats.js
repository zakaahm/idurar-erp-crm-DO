const mongoose = require('mongoose');
const Invoice = mongoose.model('Invoice');

const managerRoles     = ['admin', 'owner'];
const REVENUE_STATUSES = ['paid', 'partially'];

const getRevenueStats = async (req, res) => {
  try {
    const currentAdmin = req.admin;
    const role      = currentAdmin?.role;
    const isManager = managerRoles.includes(role);

    const requestedUserId = req.query.userId;
    const month = req.query.month ? parseInt(req.query.month, 10) : null;
    const year  = req.query.year  ? parseInt(req.query.year,  10) : null;

    // createdBy: wie maakte de offerte
    const createdByUserId = !isManager
      ? currentAdmin._id
      : requestedUserId && mongoose.Types.ObjectId.isValid(requestedUserId)
        ? new mongoose.Types.ObjectId(requestedUserId)
        : null;

    const userFilter = createdByUserId ? { createdBy: createdByUserId } : {};
    const dateFilter = buildDateFilter(year, month, 'date');

    const baseMatch = {
      removed: false,
      paymentStatus: { $in: REVENUE_STATUSES },
      ...userFilter,
      ...dateFilter,
    };

    const [revenueSummary, revenueByMonth] = await Promise.all([
      Invoice.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            totalRevenue:        { $sum: '$total' },
            totalInvoices:       { $sum: 1 },
            averageInvoiceValue: { $avg: '$total' },
          },
        },
      ]),

      Invoice.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      result: {
        summary: revenueSummary[0] || {
          totalRevenue: 0,
          totalInvoices: 0,
          averageInvoiceValue: 0,
        },
        revenueByMonth,
      },
      message: 'Revenue stats fetched successfully.',
    });
  } catch (error) {
    console.error('getRevenueStats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

function buildDateFilter(year, month, field) {
  if (!year && !month) return {};
  if (year && month)   return { [field]: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } };
  if (year)            return { [field]: { $gte: new Date(year, 0, 1),         $lt: new Date(year + 1, 0, 1) } };
  return { $expr: { $eq: [{ $month: `$${field}` }, month] } };
}

module.exports = getRevenueStats;