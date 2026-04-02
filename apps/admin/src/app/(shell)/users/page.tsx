'use client';

import { useState } from 'react';
import { useUsers } from '@/hooks/useAdmin';
import { UserTable } from '@/components/UserTable';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data, isLoading } = useUsers(debouncedSearch);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    clearTimeout((window as any)._userSearchTimer);
    (window as any)._userSearchTimer = setTimeout(() => setDebouncedSearch(e.target.value), 400);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email or phone…"
            className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
          />
        </div>
        <UserTable users={data ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
