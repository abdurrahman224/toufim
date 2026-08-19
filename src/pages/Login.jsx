import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginSuccess } from '../store/slices/authSlice';
import { ROUTES } from '../config';
import { httpMethods } from '../services/httpMethods';
import { API_ENDPOINTS } from '../services/httpEndpoint';

import {
  LogIn,
  ShieldCheck,
  BarChart3,
  Users,
  Settings,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, label: 'Real-time analytics & reporting' },
  { icon: Users, label: 'Lead & customer management' },
  { icon: Settings, label: 'Full platform configuration' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = t('loginPage.emailRequired');
    } else if (!EMAIL_REGEX.test(email)) {
      errs.email = t('loginPage.emailInvalid');
    }
    if (!password) {
      errs.password = t('loginPage.passwordRequired');
    }
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const response = await httpMethods.post(API_ENDPOINTS.ADMIN_AUTH.LOGIN, {
        email,
        password,
      });

      const { token, user } = response.data;

      dispatch(
        loginSuccess({
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role || 'admin',
          },
          token,
        }),
      );
      navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please try again.';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex">
      <div className="hidden lg:flex lg:w-[52%] bg-linear-to-br bg-[#F485250D] flex-col justify-between p-14 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3 h-200 max-w-2xl ">
          <Link to={'/'}><img src="/logo.webp" alt="" /></Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center lg:hidden shadow-md shadow-orange-600/25">
              <ShieldCheck
                size={16}
                className="text-white"
                aria-hidden="true"
              />
            </div>
          </div>
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors duration-200 group"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            {t('loginPage.backToHome')}
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                {t('loginPage.heading')}
              </h1>
              <p className="text-gray-500 text-sm">
                {t('loginPage.subheading')}
              </p>
            </div>

            {errors.form && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5"
              >
                {errors.form}
              </div>
            )}

            <form onSubmit={handleLogin} noValidate className="space-y-5 mb-7">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {t('loginPage.emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('loginPage.emailPlaceholder')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all shadow-sm ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {t('loginPage.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('loginPage.passwordPlaceholder')}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                    className={`w-full px-4 py-3 pr-11 bg-white border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all shadow-sm ${
                      errors.password ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={
                      showPassword ? t('loginPage.hidePassword') : t('loginPage.showPassword')
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 hover:shadow-orange-500/35 hover:-translate-y-0.5 cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} aria-hidden="true" />
                )}
                {isLoading ? t('loginPage.signingIn') : t('loginPage.signIn')}
              </button>
            </form>

            {/* <p className="text-center text-xs text-gray-400 mt-6">
              &copy; {new Date().getFullYear()}{' '}
              {process.env.REACT_APP_NAME || 'My React App'}
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
