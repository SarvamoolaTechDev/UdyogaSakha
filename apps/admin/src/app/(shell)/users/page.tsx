'use client';

import { useState, useRef } from 'react';
import { useUsers } from '@/hooks/useAdmin';
import { UserTable } from '@/components/UserTable';
import { Pagination } from '@/components/Pagination';

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebounced]   = useState('');
  const [page, setPage]                   = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data, isLoading } = useUsers(debouncedSearch);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebounced(e.target.value);
      setPage(1);
    }, 400);
  };

  // Client-side pagination (data is already fetched)
  const total      = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paged      = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email or phone…"
            className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
          />
          {total > 0 && (
            <span className="text-xs text-gray-400 shrink-0">{total} user{total !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Table */}
        <UserTable users={paged} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
