import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Added for state management
import { useLoginMutation } from '../Features/Apis/Auth.APi';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast'; // Added for notifications
import { setCredentials } from '../Features/Auth/AuthSlice';

const LoginPage = () => {
  const [studentRegNo, setStudentRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Execute login mutation
      const response = await login({ studentRegNo, password }).unwrap();

      // 2. Add your custom Redux dispatch logic
      if (response.token && response.user) {
        dispatch(setCredentials({
          user: response.user,
          token: response.token,
          requireProfileCompletion: response.requireProfileCompletion || false
        }));

        toast.success('Login Successful!');

        // 3. Navigate based on profile status
        if (response.requireProfileCompletion) {
          navigate("/complete-profile");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      // Handle error message from backend or default
      const errMsg = err?.data?.message || 'Authentication failed. Check your credentials.';
      toast.error(errMsg);
      console.error('Login Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Toast container must be present in the component tree */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Navbar />

      <div className="flex flex-1 pt-16 flex-col md:flex-row">
        
        {/* Left Side: Unsplash Image */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 items-center justify-center relative">
          <img 
            src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=1000" 
            alt="Voting Box" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 text-white p-12 max-w-lg">
            <h1 className="text-5xl font-black mb-6 leading-tight uppercase">Your Vote <br/> Matters.</h1>
            <p className="text-xl text-slate-200">Secure. Transparent. Verified.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-10">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900">Sign In</h2>
              <p className="text-gray-600 font-medium">Access the voting portal</p>
            </div>

            {/* Changed autoComplete to "off" to prevent browser prompts */}
            <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  autoComplete="one-time-code" // Harder for browsers to ignore than "off"
                  name="regNo"
                  placeholder="Enter Reg No"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                  value={studentRegNo}
                  onChange={(e) => setStudentRegNo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password" // Prevents most "save password" popups
                  name="userPassword"
                  placeholder="••••••••"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 text-gray-900 font-semibold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-xl text-lg transition-all transform active:scale-95 shadow-lg disabled:opacity-50"
              >
                {isLoading ? 'VERIFYING...' : 'CONTINUE TO VOTE'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
              <a href="/register" className="text-blue-700 hover:underline">Create Account</a>
              <a href="/forgot" className="text-gray-500 hover:text-gray-800">Forgot Password?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;