import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Styling
import './App.css';

// Public Pages
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import ApplicationsPage from "./pages/Application";
import Error from './pages/Error';
import ProtectedRoutes from './components/ProtectedRoutes';
import { AdminDashBoard } from './pages/AdminDashBoard';
import { AllElections } from './DashBoards/AdminDashBoard/AllElections';
import { AllPositions } from './DashBoards/AdminDashBoard/AllPositions';
import { AllApplications } from './DashBoards/AdminDashBoard/AllApplications';
import { AllCandidates } from './DashBoards/AdminDashBoard/AllCandidates';


function App() {
  const Router = createBrowserRouter([
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
      path: '/applications',
      element: <ApplicationsPage />,
      errorElement: <Error />,
    },

    {
      path: 'AdminDashBoard',
      element: (
        <ProtectedRoutes>
          <AdminDashBoard />
        </ProtectedRoutes>
      ),
      errorElement: <Error />,
      children: [
        { path: 'AllElections', element: <AllElections /> },
        { path: 'Manage-positions', element: <AllPositions /> },
        { path: 'Manage-Applications', element: <AllApplications /> },
        { path: 'Manage-Candidates', element: <AllCandidates /> },
      ]
    }

  ]);

  return (
    <>


      {/* The Router Provider */}
      <RouterProvider router={Router} />
    </>
  );
}

export default App;