const mongoose = require('mongoose');
const Lead    = mongoose.model('Lead');
const Client  = mongoose.model('Client');
const Invoice = mongoose.model('Invoice');
const Admin   = mongoose.model('Admin');

const managerRoles       = ['admin', 'owner'];
const REVENUE_STATUSES   = ['paid', 'partially'];
const OPEN_LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];

/**
 * LOGICA:
 *
 *  LEADS aangebracht  = Lead.createdBy
 *  KLANTEN afgesloten = Client.createdBy  (alle clients, ook directe)
 *  CONVERSIE          = clients waar Client.leadId voorkomt als _id in Lead collectie
 *                       gedeeld door totaal leads × 100
 *  OMZET              = Invoice.createdBy (paid / partially)
 */
const getSalesStats = async (req, res) => {
  try {
    const currentAdmin = req.admin;
    const role      = currentAdmin?.role;
    const isManager = managerRoles.includes(role);
    const isOwner   = role === 'owner';

    const requestedUserId = req.query.userId;
    const month = req.query.month ? parseInt(req.query.month, 10) : null;
    const year  = req.query.year  ? parseInt(req.query.year,  10) : null;

    const scopedUserId = !isManager
      ? currentAdmin._id
      : requestedUserId && mongoose.Types.ObjectId.isValid(requestedUserId)
        ? new mongoose.Types.ObjectId(requestedUserId)
        : null;

    const userFilter        = scopedUserId ? { createdBy: scopedUserId } : {};
    const leadDateFilter    = buildDateFilter(year, month, 'created');
    const clientDateFilter  = buildDateFilter(year, month, 'created');
    const invoiceDateFilter = buildDateFilter(year, month, 'date');

    // ── Haal alle lead _ids op (voor conversie verificatie) ───────────────────
    // We hebben de lijst van alle lead IDs nodig om te checken of Client.leadId
    // echt terugkomt in de leads collectie
    const allLeadIds = await Lead.distinct('_id', {
      removed: false,
      ...leadDateFilter,
    });

    // ── Global totals ─────────────────────────────────────────────────────────
    const [totalLeads, totalSales, totalConversions] = await Promise.all([
      // Alle leads aangebracht (scoped op user indien gefilterd)
      Lead.countDocuments({ removed: false, ...userFilter, ...leadDateFilter }),

      // Alle klanten afgesloten (ook directe, niet via lead)
      Client.countDocuments({ removed: false, ...userFilter, ...clientDateFilter }),

      // Conversie: clients waarvan leadId voorkomt in de leads collectie
      Client.countDocuments({
        removed: false,
        ...userFilter,
        ...clientDateFilter,
        leadId: { $in: allLeadIds },
      }),
    ]);

    const totalSalesUsers = await Client.distinct('createdBy', {
      removed: false,
      ...clientDateFilter,
    }).then(ids => ids.length);

    const globalConversionRate = totalLeads > 0
      ? Math.round((totalConversions / totalLeads) * 100)
      : 0;

    // ── Per-user performance (owner only) ─────────────────────────────────────
    let salesPerformance = [];

    if (isOwner) {
      const allUsers = await Admin.find({
        removed: false,
        role: { $in: ['owner', 'admin', 'sales'] },
      })
        .select('_id name surname role')
        .lean();

      salesPerformance = await Promise.all(
        allUsers.map(async (user) => {
          const uid = user._id;

          // Lead IDs aangebracht door deze user (voor conversie check)
          const userLeadIds = await Lead.distinct('_id', {
            removed: false,
            createdBy: uid,
            ...leadDateFilter,
          });

          const [
            totalLeadsUser,
            openLeadsUser,
            lostLeadsUser,
            totalSalesUser,
            totalConversionsUser,
            revenueAgg,
          ] = await Promise.all([
            // Leads aangebracht door deze persoon
            Lead.countDocuments({ removed: false, createdBy: uid, ...leadDateFilter }),

            Lead.countDocuments({
              removed: false, createdBy: uid,
              status: { $in: OPEN_LEAD_STATUSES },
              ...leadDateFilter,
            }),

            Lead.countDocuments({
              removed: false, createdBy: uid,
              status: 'closed_lost',
              ...leadDateFilter,
            }),

            // Alle klanten afgesloten door deze persoon
            Client.countDocuments({
              removed: false,
              createdBy: uid,
              ...clientDateFilter,
            }),

            // Conversies: clients afgesloten door IEMAND waarvan leadId
            // voorkomt in de leads aangebracht door DEZE user
            Client.countDocuments({
              removed: false,
              ...clientDateFilter,
              leadId: { $in: userLeadIds },
            }),

            // Omzet op offertes gemaakt door deze persoon
            Invoice.aggregate([
              {
                $match: {
                  removed: false,
                  createdBy: uid,
                  paymentStatus: { $in: REVENUE_STATUSES },
                  ...invoiceDateFilter,
                },
              },
              { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
          ]);

          return {
            userId:         uid,
            name:           `${user.name || ''} ${user.surname || ''}`.trim(),
            role:           user.role,
            totalLeads:     totalLeadsUser,
            openLeads:      openLeadsUser,
            lostLeads:      lostLeadsUser,
            totalSales:     totalSalesUser,
            totalConversions: totalConversionsUser,
            totalRevenue:   revenueAgg[0]?.total ?? 0,
          };
        })
      );

      salesPerformance.sort((a, b) => b.totalSales - a.totalSales);
    }

    // ── Own stats (altijd, voor ingelogde gebruiker) ──────────────────────────
    const myId = currentAdmin._id;

    // Lead IDs aangebracht door de ingelogde user
    const myLeadIds = await Lead.distinct('_id', {
      removed: false,
      createdBy: myId,
      ...leadDateFilter,
    });

    const [
      ownTotalLeads,
      ownOpenLeads,
      ownLostLeads,
      ownTotalSales,
      ownConversions,
      ownRevenueAgg,
    ] = await Promise.all([
      Lead.countDocuments({ removed: false, createdBy: myId, ...leadDateFilter }),

      Lead.countDocuments({
        removed: false, createdBy: myId,
        status: { $in: OPEN_LEAD_STATUSES },
        ...leadDateFilter,
      }),

      Lead.countDocuments({
        removed: false, createdBy: myId,
        status: 'closed_lost',
        ...leadDateFilter,
      }),

      // Alle klanten die ik heb afgesloten
      Client.countDocuments({
        removed: false,
        createdBy: myId,
        ...clientDateFilter,
      }),

      // Conversies: clients waarvan leadId voorkomt in mijn leads
      Client.countDocuments({
        removed: false,
        ...clientDateFilter,
        leadId: { $in: myLeadIds },
      }),

      Invoice.aggregate([
        {
          $match: {
            removed: false,
            createdBy: myId,
            paymentStatus: { $in: REVENUE_STATUSES },
            ...invoiceDateFilter,
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const ownConversionRate = ownTotalLeads > 0
      ? Math.round((ownConversions / ownTotalLeads) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      result: {
        permissions: { role, isManager, isOwner },
        totalLeads,
        totalSales,
        totalConversions,
        totalSalesUsers,
        globalConversionRate,
        ownStats: {
          totalLeads:      ownTotalLeads,
          openLeads:       ownOpenLeads,
          lostLeads:       ownLostLeads,
          totalSales:      ownTotalSales,
          totalConversions: ownConversions,
          conversionRate:  ownConversionRate,
          totalRevenue:    ownRevenueAgg[0]?.total ?? 0,
        },
        salesPerformance,
      },
      message: 'Sales stats fetched successfully.',
    });
  } catch (error) {
    console.error('getSalesStats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

function buildDateFilter(year, month, field) {
  if (!year && !month) return {};
  if (year && month)   return { [field]: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } };
  if (year)            return { [field]: { $gte: new Date(year, 0, 1),         $lt: new Date(year + 1, 0, 1) } };
  return { $expr: { $eq: [{ $month: `$${field}` }, month] } };
}

module.exports = getSalesStats;