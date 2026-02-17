import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Styling
import './App.css';

// Public Pages
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import CompleteProfile from "./DashBoards/UserDashboard/CompleteProfile"; 
import Error from './pages/Error';
import ProtectedRoutes from './components/ProtectedRoutes';

// Admin Dashboard
import { AdminDashBoard } from './pages/AdminDashBoard';
import { AllElections } from './DashBoards/AdminDashBoard/AllElections';
import { AllPositions } from './DashBoards/AdminDashBoard/AllPositions';
import { AllApplications as AdminAllApplications } from './DashBoards/AdminDashBoard/AllApplications';
import { AllCandidates } from './DashBoards/AdminDashBoard/AllCandidates';
import { AllUsers } from './DashBoards/AdminDashBoard/AllUsers';
import AccountCreationPage from './DashBoards/AdminDashBoard/AccountCreation';

// User Dashboard
import { UserLayout } from './DashBoards/DashBoardDesign/UserLayout';
import DashboardHome from './DashBoards/UserDashboard/DashboardHome';
import ApplicationPage from './DashBoards/UserDashboard/ApplicationPage';  
import ProfilePage from './DashBoards/UserDashboard/ProfilePage';
import Results from './DashBoards/UserDashboard/Results';

// Other Pages
import AboutPage from './pages/About';
import CandidatesPage from './pages/Candidates';
import CandidateProfileView from './pages/ProfileVeiw';
import VotingPage from './pages/Vote';
import ResultsPage from './pages/Results';

function App() {
  const Router = createBrowserRouter([
    // -------------------------------
    // 1. PUBLIC ROUTES
    // -------------------------------
    {
      path: '/',
      element: <LandingPage />,
      errorElement: <Error />,
    },
    {
      path: '/login',
      element: <LogIn />,
      errorElement: <Error />,
    },
    {
      path: '/about',
      element: <AboutPage />,
      errorElement: <Error />,
    },
    {
      path: '/Candidates',
      element: <CandidatesPage />,
      errorElement: <Error />,
    },
    {
      path: '/Candidates/profile/:applicationId',
      element: <CandidateProfileView />,
      errorElement: <Error />,
    },

    // -------------------------------
    // 2. PROFILE COMPLETION (Protected)
    // -------------------------------
    {
      path: '/complete-profile',
      element: (
        <ProtectedRoutes>
          <CompleteProfile />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
    },

    // -------------------------------
    // 3. USER DASHBOARD (Protected)
    // -------------------------------
    {
      path: '/dashboard',
      element: (
        <ProtectedRoutes>
          <UserLayout />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { index: true, element: <DashboardHome /> },
        { path: 'applications', element: <ApplicationPage /> },
        { path: 'applications/:id', element: <ApplicationPage /> },
        { path: 'applications/:id/edit', element: <ApplicationPage /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'results', element: <Results /> },
      ]
    },

    // -------------------------------
    // 4. ADMIN DASHBOARD (Protected)
    // -------------------------------
    {
      path: '/AdminDashBoard',
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { index: true, element: <Navigate to="AllElections" replace /> },
        { path: 'AllElections', element: <AllElections /> },
        { path: 'Manage-positions', element: <AllPositions /> },
        { path: 'Manage-Applications', element: <AdminAllApplications /> },
        { path: 'Manage-Candidates', element: <AllCandidates /> },
        { path: 'Manage-Users', element: <AllUsers /> },
        { path: 'create-accounts', element: <AccountCreationPage /> },
      ]
    },

    // -------------------------------
    // 5. VOTING & RESULTS (Public or Protected depending on your need)
    // -------------------------------
    {
      path: '/voting',
      element: <VotingPage />,
      errorElement: <Error />,
    },
    {
      path: '/results',
      element: <ResultsPage />,
      errorElement: <Error />,
    },

    // -------------------------------
    // 6. REDIRECTS & CATCH-ALL
    // -------------------------------
    {
      path: '/applications',
      element: <Navigate to="/dashboard/applications" replace />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    }
  ]);

  return <RouterProvider router={Router} />;
}

export default App;