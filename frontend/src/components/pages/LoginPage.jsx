import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../App';
import axios from 'axios';
import { User, Lock } from 'lucide-react';

const LoginPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, setJwt } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
console.log("handle submit : 1")
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { username : username, password : password},
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log(response)
      
      console.log(response.data )
      console.log("handle submit : 2")
        console.log("handle submit : 3")
        setJwt(response.data.token);
        console.log("handle submit : 4")
        const user = await axios.post(
          `${API_URL}/user/by-jwt`,
          { token: response.data.token },
          { headers: { Authorization: `Bearer ${response.data.token}` } }
        );
        console.log("handle submit : 5")
        login(user.data);
        console.log("handle submit : 6")
        navigate(from, { replace: true });
        console.log("handle submit : 7")
        setError(response.message);
    } catch (error) {
        console.log("handle submit : 9")
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-1">Welcome back! Please log in to continue.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg 
                       hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        {/*
        <p className="text-center text-sm text-gray-500 mt-6">
          Forgot your password?{' '}
          <a href="#" className="text-blue-600 hover:underline">Reset it here</a>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;
