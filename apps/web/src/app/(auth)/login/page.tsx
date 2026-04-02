'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginSchema } from '@udyogasakha/validators';
import type { LoginInput } from '@udyogasakha/validators';
import { authApi } from '@udyogasakha/api-client';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((s) => s.setTokens);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data);
      const from = searchParams.get('from') ?? '/dashboard';
      router.push(from);
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Sign In</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {mutation.isError && (
        <p className="text-red-500 text-sm">Invalid credentials. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-[#1D9E75] text-white py-2 rounded-lg font-medium hover:bg-[#178a64] transition-colors disabled:opacity-60"
      >
        {mutation.isPending ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-500">
        New to UdyogaSakha?{' '}
        <Link href="/register" className="text-[#1D9E75] font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
