const mongoose = require('mongoose');
const Lead  = mongoose.model('Lead');
const Admin = mongoose.model('Admin');

const managerRoles = ['admin', 'owner'];

const OPEN_LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];

const getLeadStats = async (req, res) => {
  try {
    const currentAdmin = req.admin;
    const role      = currentAdmin?.role;
    const isManager = managerRoles.includes(role);
    const isOwner   = role === 'owner';

    const requestedUserId = req.query.userId;
    const month = req.query.month ? parseInt(req.query.month, 10) : null;
    const year  = req.query.year  ? parseInt(req.query.year,  10) : null;

    // Scope by createdBy — who brought in the lead
    const scopedUserId = !isManager
      ? currentAdmin._id
      : requestedUserId && mongoose.Types.ObjectId.isValid(requestedUserId)
        ? new mongoose.Types.ObjectId(requestedUserId)
        : null;

    const userFilter = scopedUserId ? { createdBy: scopedUserId } : {};
    const dateFilter = buildDateFilter(year, month, 'created');
    const baseMatch  = { removed: false, ...userFilter, ...dateFilter };

    // ── Counts ───────────────────────────────────────────────────────────────
    const [totalLeads, openLeads, lostLeads] = await Promise.all([
      Lead.countDocuments(baseMatch),
      Lead.countDocuments({ ...baseMatch, status: { $in: OPEN_LEAD_STATUSES } }),
      Lead.countDocuments({ ...baseMatch, status: 'closed_lost' }),
    ]);

    // ── Leads per status ─────────────────────────────────────────────────────
    const leadsByStatus = await Lead.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$status', total: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', total: 1 } },
      { $sort: { total: -1 } },
    ]);

    // ── Leads per user (owner only) ──────────────────────────────────────────
    let leadsByUser = [];
    if (isOwner) {
      leadsByUser = await Lead.aggregate([
        { $match: { removed: false, ...buildDateFilter(year, month, 'created') } },
        {
          $group: {
            _id: '$createdBy',
            totalLeads: { $sum: 1 },
            openLeads:  { $sum: { $cond: [{ $in: ['$status', OPEN_LEAD_STATUSES] }, 1, 0] } },
            lostLeads:  { $sum: { $cond: [{ $eq:  ['$status', 'closed_lost'] },    1, 0] } },
          },
        },
        {
          $lookup: { from: 'admins', localField: '_id', foreignField: '_id', as: 'user' },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: {
              $trim: {
                input: { $concat: [{ $ifNull: ['$user.name', 'Onbekend'] }, ' ', { $ifNull: ['$user.surname', ''] }] },
              },
            },
            role:       '$user.role',
            totalLeads: 1,
            openLeads:  1,
            lostLeads:  1,
          },
        },
        { $sort: { totalLeads: -1 } },
      ]);
    }

    // ── User dropdown list (managers only) ───────────────────────────────────
    const users = isManager
      ? await Admin.find({ removed: false, role: { $in: ['owner', 'admin', 'sales'] } })
          .select('_id name surname role')
          .lean()
      : [];

    return res.status(200).json({
      success: true,
      result: {
        permissions: { role, isManager, isOwner },
        users: users.map((u) => ({
          _id:  u._id,
          name: `${u.name || ''} ${u.surname || ''}`.trim(),
          role: u.role,
        })),
        totalLeads,
        openLeads,
        lostLeads,
        leadsByStatus,
        leadsByUser,
      },
      message: 'Lead stats fetched successfully.',
    });
  } catch (error) {
    console.error('getLeadStats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

function buildDateFilter(year, month, field) {
  if (!year && !month) return {};
  if (year && month)   return { [field]: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } };
  if (year)            return { [field]: { $gte: new Date(year, 0, 1),         $lt: new Date(year + 1, 0, 1) } };
  return { $expr: { $eq: [{ $month: `$${field}` }, month] } };
}

module.exports = getLeadStats;