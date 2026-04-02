'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterSchema } from '@udyogasakha/validators';
import type { RegisterInput } from '@udyogasakha/validators';
import { authApi } from '@udyogasakha/api-client';
import { useAuthStore } from '@/store/auth.store';
import { ParticipantType } from '@udyogasakha/types';

export default function RegisterPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { participantType: ParticipantType.INDIVIDUAL },
  });

  const participantType = watch('participantType');

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setTokens({ ...data, userId: 'decoded-from-jwt' });
      router.push('/dashboard');
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input {...register('fullName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" placeholder="Your full name" />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" placeholder="you@example.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (optional)</label>
        <input {...register('phone')} type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" placeholder="10-digit mobile number" />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">I am registering as</label>
        <select {...register('participantType')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
          <option value={ParticipantType.INDIVIDUAL}>Individual</option>
          <option value={ParticipantType.ORGANIZATION}>Organisation</option>
          <option value={ParticipantType.AGENCY}>Agency</option>
        </select>
      </div>

      {participantType !== ParticipantType.INDIVIDUAL && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organisation / Agency Name</label>
          <input {...register('organizationName')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" placeholder="Registered name" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input {...register('password')} type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" placeholder="Min 8 chars, 1 uppercase, 1 number" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {mutation.isError && <p className="text-red-500 text-sm">Registration failed. Please try again.</p>}

      <button type="submit" disabled={mutation.isPending} className="w-full bg-[#1D9E75] text-white py-2 rounded-lg font-medium hover:bg-[#178a64] transition-colors disabled:opacity-60">
        {mutation.isPending ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already registered?{' '}
        <Link href="/login" className="text-[#1D9E75] font-medium hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
