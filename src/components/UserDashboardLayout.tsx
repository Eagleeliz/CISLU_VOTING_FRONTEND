// components/DashboardLayout.tsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const UserDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Mock user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Applications', path: '/dashboard/applications', icon: '📝' },
    { name: 'Profile', path: '/dashboard/profile', icon: '👤' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex flex-grow pt-16 sm:pt-20 lg:pt-24">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Desktop: always visible, Mobile: slide in */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full lg:h-auto
        `}>
          
          {/* User Info - Sidebar Header */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold">
                {user.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.studentRegNo || 'Reg No'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive(item.path) 
                    ? 'bg-[#f97316] text-white' 
                    : 'text-gray-700 hover:bg-orange-50 hover:text-[#f97316]'
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 bg-[#f97316] text-white p-4 rounded-full shadow-lg hover:bg-[#ea580c] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;