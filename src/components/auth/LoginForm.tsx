import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { showErrorToast } from '../../lib/toast';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const isValidEmail = (email: string) => {
    return email.includes('@');
  };

  const getEmailFromUsername = (input: string) => {
    return isValidEmail(input) ? input : `${input}@atlantatelecables.com`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      showErrorToast('Please enter your credentials');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const emailToUse = getEmailFromUsername(username);
      const success = await login(emailToUse, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        showErrorToast('Invalid credentials');
      }
    } catch (err: any) {
      if (err?.message?.includes('Email not confirmed')) {
        showErrorToast('Please confirm your email');
      } else {
        showErrorToast('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-fit bg-gray-50 flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Wallet className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to PayFlow Sandbox
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Payment approval management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Username or Email"
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                placeholder="Enter username or email"
              />
            </div>

            <div>
              <Input
                label="Password"
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
              >
                Sign in
              </Button>
            </div>
          </form>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between">
            <Button
                variant='secondary'
                onClick={() => {
                  setUsername("user@abc.com");
                  setPassword("user@123");
                }}
              >
                User
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  setUsername("admin@abc.com");
                  setPassword("admin@123");
                }}
              >
                Admin
              </Button>
              <Button
                variant='secondary'
                onClick={() => {
                  setUsername("accounts@abc.com");
                  setPassword("accounts@123");
                }}
              >
                Accounts
              </Button>
             
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginForm;