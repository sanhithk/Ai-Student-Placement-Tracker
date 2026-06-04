import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card, { CardBody } from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import { Compass } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const { login, googleLogin, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const result = await forgotPassword(email);
    if (result.success) {
      setMessage(result.message);
      setOtpSent(true);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      setMessage(result.message);
      setTimeout(() => {
        setIsForgotPassword(false);
        setOtpSent(false);
        setOtp('');
        setNewPassword('');
        setMessage('');
      }, 2000);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Compass size={48} className="text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isForgotPassword ? 'Reset Password' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isForgotPassword ? 'Enter your email to receive a reset code' : 'Sign in to your account to continue'}
          </p>
        </div>

        <Card className="mt-8">
          <CardBody>
            {isForgotPassword ? (
              <form onSubmit={otpSent ? handleResetSubmit : handleForgotSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="bg-emerald-900/30 text-emerald-400 p-3 rounded-lg text-sm text-center">
                    {message}
                  </div>
                )}
                
                <Input
                  label="Email address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={otpSent}
                />

                {otpSent && (
                  <>
                    <Input
                      label="6-Digit OTP Code"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : otpSent ? 'Reset Password' : 'Send Reset Code'}
                </Button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setOtpSent(false);
                      setError('');
                      setMessage('');
                    }}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm text-center">
                      {error}
                    </div>
                  )}
                  
                  <Input
                    label="Email address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />

                  <div>
                    <Input
                      label="Password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                        }}
                        className="text-sm text-primary-500 hover:text-primary-400"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setError('Google sign in failed');
                      }}
                      theme="outline"
                      size="large"
                    />
                  </div>
                </div>

                <div className="mt-6 text-center text-sm">
                  <span className="text-slate-400">Don't have an account? </span>
                  <Link to="/register" className="text-primary-500 font-medium hover:text-primary-400">
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
