import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../Features/Apis/Auth.APi';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
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

      // 2. Process success response
      if (response.token && response.user) {
        dispatch(setCredentials({
          user: response.user,
          token: response.token,
          requireProfileCompletion: response.requireProfileCompletion || false
        }));

        // Persist session info
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.user.role);

        toast.success(`Welcome back, ${response.user.fullName?.split(" ")[0]}!`);

        // 3. Conditional Navigation based on Profile and Role
        if (response.requireProfileCompletion) {
          navigate("/complete-profile");
        } else if (response.user.role === 'admin') {
          navigate("/AdminDashboard");
        } else {
          navigate("/Dashboard");
        }
      }
    } catch (err: any) {
      /** * FIX: Targeting err.data.error to match your console log:
       * data: { error: 'User not found' }
       */
      const errMsg = err?.data?.error || err?.data?.message || 'Authentication failed. Please try again.';
      
      toast.error(errMsg, {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
          fontWeight: 'bold'
        },
      });
      console.error('Login Error details:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />
      
      <Navbar />

      <div className="flex flex-1 pt-16 flex-col md:flex-row">
        
        {/* Left Side: Branding/Image */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 items-center justify-center relative">
          <img 
            src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=1000" 
            alt="Voting System" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative z-10 text-white p-12 max-w-lg">
            <h1 className="text-5xl font-black mb-6 leading-tight uppercase tracking-tighter">Your Vote <br/> Matters.</h1>
            <p className="text-xl text-slate-200 font-medium tracking-wide">The most secure way to elect your student leaders. Fast, transparent, and verified.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-10">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gray-200">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sign In</h2>
              <p className="text-gray-500 font-bold">Access the voting portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  autoComplete="one-time-code"
                  placeholder="Enter Reg No"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-gray-900 font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                  value={studentRegNo}
                  onChange={(e) => setStudentRegNo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-gray-900 font-bold bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-4 rounded-2xl text-lg tracking-wide transition-all transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isLoading ? 'Verifying...' : 'Continue to Dashboard'}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center text-xs font-black uppercase tracking-widest">
              <a href="/register" className="text-blue-700 hover:underline">Create Account</a>
              <a href="/forgot" className="text-gray-400 hover:text-gray-600 transition-colors">Forgot Password?</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;