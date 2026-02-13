import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Styling
import './App.css';

// Public Pages
import LandingPage from "./pages/LandingPage";
import LogIn from "./pages/LogIn";
import ApplicationsPage from "./pages/Application";
import Error from './pages/Error'; 
import ProtectedRoutes from './components/ProtectedRoutes';
import { AdminDashBoard } from './pages/AdminDashBoard';


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
          // { path: 'profile', element: <UserProfile /> },
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