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
import CandidatesPage from './pages/Candidates';
import CandidateProfileView from './pages/ProfileVeiw';
import VotingPage from './pages/Vote';
import ResultsPage from './pages/Results';

// User Dashboard
import { UserLayout } from './DashBoards/DashBoardDesign/UserLayout';
import DashboardHome from './DashBoards/UserDashboard/DashboardHome';
import ApplicationsPage from './DashBoards/UserDashboard/Application';
import ProfilePage from './DashBoards/UserDashboard/ProfilePage';
import Results from './DashBoards/UserDashboard/Results';
import ApplicationDetails from './DashBoards/UserDashboard/Application';
import EditApplication from './DashBoards/UserDashboard/Application';
import AboutPage from './pages/About';

function App() {
  const Router = createBrowserRouter([
    // Public Routes
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
      path: '/complete-profile',
      element: <CompleteProfile />,
      errorElement: <Error />,
    },
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
    
    {
       path: '/Candidates',
       element: <CandidatesPage />,
       errorElement: <Error />,
    },
    {
      // This path captures the unique ID from the URL
      path: '/Candidates/profile/:applicationId',
      element: <CandidateProfileView />,
      errorElement: <Error />,
    },
     {
       path: '/about',
       element: <AboutPage />,
       errorElement: <Error />,
    },
    

    // USER DASHBOARD ROUTES (Protected)
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
        { path: 'applications', element: <ApplicationsPage /> },
        { path: 'applications/:id', element: <ApplicationDetails /> },
        { path: 'applications/:id/edit', element: <EditApplication /> },
        { path: 'profile', element: <ProfilePage /> },
        { path: 'results', element: <Results /> },
      ]
    },

    // ADMIN DASHBOARD ROUTES (Protected)
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
      ]
    },

    // Redirect old applications route to new dashboard
    {
      path: '/applications',
      element: <Navigate to="/dashboard/applications" replace />,
      errorElement: <Error />,
    },

    // Catch all unmatched routes - redirect to home
    {
      path: '*',
      element: <Navigate to="/" replace />,
      errorElement: <Error />,
    }
  ]);

  return <RouterProvider router={Router} />;
}

export default App;