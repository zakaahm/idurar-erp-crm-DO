import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectCurrentAdmin } from '@/redux/auth/selectors';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Customer = lazy(() => import('@/pages/Customer'));
const Lead = lazy(() => import('@/pages/Lead'));
const LeadRead = lazy(() => import('@/pages/Lead/LeadRead'));
const LeadUpdate = lazy(() => import('@/pages/Lead/LeadUpdate'));

const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));
const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));

const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));

const Quote = lazy(() => import('../../src/modules/QuoteModule/QuoteDataTableModule/index'));
const QuoteCreate = lazy(() => import('../../src/modules/QuoteModule/CreateQuoteModule/index'));
const QuoteRead = lazy(() => import('../../src/modules/QuoteModule/ReadQuoteModule/index'));
const QuoteUpdate = lazy(() => import('../../src/modules/QuoteModule/UpdateQuoteModule/index'));

const PaymentMode = lazy(() => import('../../src/modules/PaymentModule/PaymentDataTableModule/index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));

const Profile = lazy(() => import('@/pages/Profile'));
const Admin = lazy(() => import('@/pages/Admin'));

const About = lazy(() => import('@/pages/About'));

function AdminOwnerRoute({ children }) {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const role = currentAdmin?.role;

  const isAllowed = role === 'admin' || role === 'owner';

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },

    // Toegestaan voor iedereen
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },
    {
      path: '/lead',
      element: <Lead />,
    },
    {
      path: '/lead/read/:id',
      element: <LeadRead />,
    },
    {
      path: '/lead/update/:id',
      element: <LeadUpdate />,
    },
    {
      path: '/profile',
      element: <Profile />,
    },

    // Alleen admin en owner
    {
      path: '/about',
      element: (
        <AdminOwnerRoute>
          <About />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/invoice',
      element: (
        <AdminOwnerRoute>
          <Invoice />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/invoice/create',
      element: (
        <AdminOwnerRoute>
          <InvoiceCreate />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/invoice/read/:id',
      element: (
        <AdminOwnerRoute>
          <InvoiceRead />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/invoice/update/:id',
      element: (
        <AdminOwnerRoute>
          <InvoiceUpdate />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/invoice/pay/:id',
      element: (
        <AdminOwnerRoute>
          <InvoiceRecordPayment />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/quote',
      element: (
        <AdminOwnerRoute>
          <Quote />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/quote/create',
      element: (
        <AdminOwnerRoute>
          <QuoteCreate />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/quote/read/:id',
      element: (
        <AdminOwnerRoute>
          <QuoteRead />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/quote/update/:id',
      element: (
        <AdminOwnerRoute>
          <QuoteUpdate />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/payment',
      element: (
        <AdminOwnerRoute>
          <Payment />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/payment/read/:id',
      element: (
        <AdminOwnerRoute>
          <PaymentRead />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/payment/update/:id',
      element: (
        <AdminOwnerRoute>
          <PaymentUpdate />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/settings',
      element: (
        <AdminOwnerRoute>
          <Settings />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/settings/edit/:settingsKey',
      element: (
        <AdminOwnerRoute>
          <Settings />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/payment/mode',
      element: (
        <AdminOwnerRoute>
          <PaymentMode />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '/admin',
      element: (
        <AdminOwnerRoute>
          <Admin />
        </AdminOwnerRoute>
      ),
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;