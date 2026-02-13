import { Link, useRouteError } from "react-router-dom";
import { ArrowLeft, ShieldAlert, LifeBuoy, Home } from 'lucide-react';

function Error() {
  // Catching the routing error
  const error: any = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-24 relative overflow-hidden font-sans">
      
      {/* Decorative Background Blur */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-96 h-96 bg-blue-200 rounded-full blur-[100px] opacity-30"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-indigo-200 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <div className="text-center max-w-xl w-full bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-200">
        
        {/* Error Graphic */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-5 rounded-full border-2 border-red-100 shadow-sm">
              <ShieldAlert size={56} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Status Code */}
        <h2 className="text-8xl font-black text-gray-200 mb-2 leading-none">
          {error?.status || "404"}
        </h2>
        
        <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-4">
          Ballot Not Found
        </h1>
        
        <p className="text-gray-600 font-semibold leading-7 mb-8">
          The page you are looking for has been moved or doesn't exist. 
          Don't worry—your actual session is still secure.
        </p>

        {/* Technical Message Box - High Visibility */}
        {(error?.statusText || error?.message) && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border-l-4 border-blue-600 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Error Log</p>
            <p className="text-sm font-bold text-gray-800 font-mono italic">
              {error?.statusText || error?.message}
            </p>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 py-4 text-sm font-black text-white shadow-lg hover:bg-blue-800 transition-all active:scale-95 group"
          >
            <Home size={18} />
            BACK TO HOME
          </Link>
          
          <Link
            to="/contact"
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-gray-900 shadow-sm ring-2 ring-gray-200 hover:bg-gray-50 transition-all"
          >
            <LifeBuoy size={18} className="text-blue-600" />
            SUPPORT
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button 
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-gray-900 text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}

export default Error;