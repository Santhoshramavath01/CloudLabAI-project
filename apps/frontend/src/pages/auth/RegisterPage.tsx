/**
 * PURPOSE: Registration screen rendered inside AuthLayout. Same pattern as
 * LoginPage: react-hook-form + zod validation, authApi.register, then
 * stores the session and lands on the dashboard.
 * DEPENDENCIES: react, react-router-dom, react-hook-form,
 * @hookform/resolvers/zod, ../../components/ui, ../../constants/routes,
 * ../../api/auth.api, ../../store/authStore, ../../utils/authValidation
 */

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '../../components/ui';
import { ROUTES } from '../../constants/routes';
import { authApi, extractApiErrorMessage } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { registerFormSchema, type RegisterFormValues } from '../../utils/authValidation';

export default function RegisterPage() {
  const navigate = useNavigate();
  const status = useAuthStore((state) => state.status);
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  if (status === 'authenticated') {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      const session = await authApi.register(values);
      setSession(session.user, session.accessToken);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      setFormError(extractApiErrorMessage(error, 'Unable to create your account. Please try again.'));
    }
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-text-primary">Create your account</h1>
      <p className="mt-1 text-sm text-text-secondary">Spin up your first cloud workspace.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name')}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        {formError && <p className="text-sm text-status-danger">{formError}</p>}

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-brand hover:text-brand-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
