import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

/* Tailwind + design tokens - after Ionic so utilities can override defaults */
import './index.css';

/* Screen-specific animations lifted from the Stitch exports */
import './styles/stitch-screens.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SideMenu from './components/SideMenu';
import LegalPage from './pages/legal/LegalPage';

/* Live, wired screens */
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import MapExplorer from './pages/MapExplorer';
import Screens from './pages/Screens';
import ReportFlow from './pages/ReportFlow';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';
import Notifications from './pages/Notifications';
import Impact from './pages/Impact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQueue from './pages/admin/AdminQueue';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPolicies from './pages/admin/AdminPolicies';
import AdminWardMap from './pages/admin/AdminWardMap';
import AdminReportDetail from './pages/admin/AdminReportDetail';
import AdminProfile from './pages/admin/AdminProfile';
import AdminContractors from './pages/admin/AdminContractors';
import ContractorPickups from './pages/contractor/ContractorPickups';
import ContractorRegister from './pages/contractor/ContractorRegister';

/* Design imports still awaiting wiring */
import Onboarding from './pages/generated/Onboarding';


setupIonicReact();

/*
 * Routing note (carried over from CleanWashroom): IonRouterOutlet does NOT
 * respect declaration order for path-param collisions - a static route like
 * /reports/detail would be swallowed by /reports/:id. Every route here is
 * static and exact, so there's nothing to collide yet; keep it that way when
 * the detail screens start taking real ids.
 */
const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        {/* Drawer lives beside the outlet so every page can open it. */}
        <SideMenu />
        <IonRouterOutlet id="main">
          {/* Public */}
          <Route exact path="/login"><Login /></Route>
          <Route exact path="/signup"><Signup /></Route>
          <Route exact path="/onboarding"><Onboarding /></Route>
          <Route exact path="/screens"><Screens /></Route>

          {/* Legal must be reachable without an account — Google Play requires
              the privacy policy to be accessible to anyone. */}
          <Route exact path="/legal/privacy"><LegalPage kind="privacy" /></Route>
          <Route exact path="/legal/terms"><LegalPage kind="terms" /></Route>

          {/* Citizen — requires a session */}
          <ProtectedRoute exact path="/home"><Home /></ProtectedRoute>
          <ProtectedRoute exact path="/report/capture"><ReportFlow /></ProtectedRoute>
          <ProtectedRoute exact path="/map"><MapExplorer /></ProtectedRoute>
          <ProtectedRoute exact path="/notifications"><Notifications /></ProtectedRoute>
          <ProtectedRoute exact path="/statistics"><Impact /></ProtectedRoute>
          <ProtectedRoute exact path="/profile"><Profile /></ProtectedRoute>

          {/* /reports must be declared before /reports/:id — IonRouterOutlet
              does not respect declaration order for param collisions, so the
              list route needs its own exact path and the detail route a
              distinct depth. */}
          <ProtectedRoute exact path="/reports"><MyReports /></ProtectedRoute>
          <ProtectedRoute exact path="/reports/:id"><ReportDetail /></ProtectedRoute>

          {/* Admin — requires the admin role. Static segments before the
              :id route so /admin/reports/:id doesn't swallow them. */}
          <ProtectedRoute exact path="/admin" adminOnly><AdminDashboard /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/complaints" adminOnly><AdminQueue /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/users" adminOnly><AdminUsers /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/map" adminOnly><AdminWardMap /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/policies" adminOnly><AdminPolicies /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/settings" adminOnly><AdminSettings /></ProtectedRoute>
          {/* The operator's own account, in the console. /profile stays the
              citizen screen and is untouched. */}
          <ProtectedRoute exact path="/admin/profile" adminOnly><AdminProfile /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/contractors" adminOnly><AdminContractors /></ProtectedRoute>

          {/* Collectors. Registration is reachable by any signed-in user —
              that is how someone becomes a collector — while the pickup
              screens are gated server-side on an approved profile. */}
          <ProtectedRoute exact path="/collector/register"><ContractorRegister /></ProtectedRoute>
          <ProtectedRoute exact path="/collector"><ContractorPickups /></ProtectedRoute>
          <ProtectedRoute exact path="/admin/reports/:id" adminOnly><AdminReportDetail /></ProtectedRoute>

          <Route exact path="/"><Redirect to="/home" /></Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
