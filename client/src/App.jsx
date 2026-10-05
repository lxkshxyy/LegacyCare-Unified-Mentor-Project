import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui';
import Home from './pages/public/Home';

const HowItWorks = lazy(() => import('./pages/public/HowItWorks'));
const Providers = lazy(() => import('./pages/public/Providers'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

const PlannerOverview = lazy(() => import('./pages/planner/Overview'));
const Plans = lazy(() => import('./pages/planner/Plans'));
const PlanWizard = lazy(() => import('./pages/planner/PlanWizard'));
const PlanDetail = lazy(() => import('./pages/planner/PlanDetail'));

const SharedPlans = lazy(() => import('./pages/nominee/SharedPlans'));
const NomineePlan = lazy(() => import('./pages/nominee/NomineePlan'));

const ProviderOverview = lazy(() => import('./pages/provider/Overview'));
const Listings = lazy(() => import('./pages/provider/Listings'));
const ProviderRequests = lazy(() => import('./pages/provider/ProviderRequests'));

const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminProviders = lazy(() => import('./pages/admin/Providers'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminDisputes = lazy(() => import('./pages/admin/Disputes'));

const Requests = lazy(() => import('./pages/common/Requests'));
const Notifications = lazy(() => import('./pages/common/Notifications'));
const Account = lazy(() => import('./pages/common/Account'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const dash = (role) => (
  <ProtectedRoute roles={[role]}>
    <DashboardLayout />
  </ProtectedRoute>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="providers" element={<Providers />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="planner" element={dash('planner')}>
          <Route index element={<PlannerOverview />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/new" element={<PlanWizard />} />
          <Route path="plans/:id" element={<PlanDetail />} />
          <Route path="plans/:id/edit" element={<PlanWizard />} />
          <Route path="requests" element={<Requests />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="nominee" element={dash('nominee')}>
          <Route index element={<SharedPlans />} />
          <Route path="plans/:id" element={<NomineePlan />} />
          <Route path="requests" element={<Requests />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="provider" element={dash('provider')}>
          <Route index element={<ProviderOverview />} />
          <Route path="listings" element={<Listings />} />
          <Route path="requests" element={<ProviderRequests />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route path="admin" element={dash('admin')}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="account" element={<Account />} />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
