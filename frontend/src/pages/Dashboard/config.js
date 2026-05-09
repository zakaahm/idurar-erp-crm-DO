export const currencyFormatter = (value) =>
  new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const MONTH_NAMES = [
  'Januari','Februari','Maart','April','Mei','Juni',
  'Juli','Augustus','September','Oktober','November','December',
];
export const MONTH_SHORT = [
  'Jan','Feb','Mrt','Apr','Mei','Jun',
  'Jul','Aug','Sep','Okt','Nov','Dec',
];

export const emptyDashboardData = {
  leads: {
    users: [],
    totalLeads: 0,
    openLeads: 0,
    lostLeads: 0,
    leadsByStatus: [],
    leadsByUser: [],
  },
  sales: {
    totalLeads: 0,
    totalSales: 0,
    totalConversions: 0,
    totalSalesUsers: 0,
    globalConversionRate: 0,
    ownStats: {
      totalLeads: 0,
      openLeads: 0,
      lostLeads: 0,
      totalSales: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalRevenue: 0,
    },
    salesPerformance: [],
  },
  revenue: {
    summary: {
      totalRevenue: 0,
      totalInvoices: 0,
      averageInvoiceValue: 0,
    },
    revenueByMonth: [],
  },
  permissions: {
    role: null,
    isManager: false,
    isOwner: false,
  },
};

const getToken = () => {
  try {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth)?.current?.token : null;
  } catch { return null; }
};

const requestJson = async (url) => {
  const token = getToken();
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.message || 'Request failed');
  return data.result;
};

export const getDashboardData = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.month)  params.set('month',  filters.month);
  if (filters.year)   params.set('year',   filters.year);

  const qs     = params.toString();
  const suffix = qs ? `?${qs}` : '';

  const [leads, sales, revenue] = await Promise.all([
    requestJson(`/api/dashboard/lead-stats${suffix}`),
    requestJson(`/api/dashboard/sales-stats${suffix}`),
    requestJson(`/api/dashboard/revenue-stats${suffix}`),
  ]);

  const permissions = {
    role:      leads?.permissions?.role      || sales?.permissions?.role      || null,
    isManager: Boolean(leads?.permissions?.isManager || sales?.permissions?.isManager),
    isOwner:   Boolean(leads?.permissions?.isOwner   || sales?.permissions?.isOwner),
  };

  return {
    ...emptyDashboardData,
    leads:   { ...emptyDashboardData.leads,   ...leads },
    sales:   { ...emptyDashboardData.sales,   ...sales },
    revenue: {
      ...emptyDashboardData.revenue,
      ...revenue,
      revenueByMonth: normalizeRevenueByMonth(revenue?.revenueByMonth || []),
    },
    permissions,
  };
};

const normalizeRevenueByMonth = (items) =>
  items.map((item) => {
    const idx  = Number(item?._id?.month ?? 1) - 1;
    const year = item?._id?.year;
    return {
      month:   year ? `${MONTH_SHORT[idx]} ${year}` : MONTH_SHORT[idx],
      revenue: item.revenue ?? 0,
    };
  });

export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);