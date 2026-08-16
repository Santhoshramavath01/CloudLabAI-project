/**
 * PURPOSE: Login screen rendered inside AuthLayout. Validates with
 * react-hook-form + zod, calls authApi.login, and on success stores the
 * session and returns the user to wherever ProtectedRoute intercepted them
 * from (or the dashboard by default).
 * DEPENDENCIES: react, react-router-dom, react-hook-form,
 * @hookform/resolvers/zod, ../../components/ui, ../../constants/routes,
 * ../../api/auth.api, ../../store/authStore, ../../utils/authValidation
 */

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, type Location } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '../../components/ui';
import { ROUTES } from '../../constants/routes';
import { authApi, extractApiErrorMessage } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { loginFormSchema, type LoginFormValues } from '../../utils/authValidation';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAuthStore((state) => state.status);
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  if (status === 'authenticated') {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.dashboard;
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const session = await authApi.login(values);
      setSession(session.user, session.accessToken);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'Unable to sign in. Please try again.'));
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-text-primary">Sign in</h1>
      <p className="mt-1 text-sm text-text-secondary">Access your CloudLab-AI workspaces.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {formError && <p className="text-sm text-status-danger">{formError}</p>}

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.register} className="font-medium text-brand hover:text-brand-hover">
          Create one
        </Link>
      </p>
    </div>
  );
}
