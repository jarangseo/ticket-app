import { useSearchParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchTickets } from '../api/tickets';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

const DEFAULT_PARAMS = {
  q: '',
  status: 'all',
  priority: 'all',
  tag: 'all',
  sort: 'updatedAt_desc',
  page: '1',
  pageSize: '20',
};

const TicketListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state for input
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Debounced value
  const debouncedQ = useDebounce(searchInput, 1000);

  // Read params from URL
  const params = {
    q: searchParams.get('q') || DEFAULT_PARAMS.q,
    status: searchParams.get('status') || DEFAULT_PARAMS.status,
    priority: searchParams.get('priority') || DEFAULT_PARAMS.priority,
    tag: searchParams.get('tag') || DEFAULT_PARAMS.tag,
    sort: searchParams.get('sort') || DEFAULT_PARAMS.sort,
    page: searchParams.get('page') || DEFAULT_PARAMS.page,
    pageSize: searchParams.get('pageSize') || DEFAULT_PARAMS.pageSize,
  };

  // Helper to update URL params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === DEFAULT_PARAMS[key as keyof typeof DEFAULT_PARAMS]) {
            next.delete(key); // Remove default values from URL
          } else {
            next.set(key, value);
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  const prevDebouncedQ = useRef(debouncedQ);

  // Update URL when debounced value changes
  useEffect(() => {
    if (prevDebouncedQ.current === debouncedQ) return; // Skip if not changed
    prevDebouncedQ.current = debouncedQ;
    updateParams({ q: debouncedQ, page: '1' });
  }, [debouncedQ, updateParams]);
  // Auto refetch when params change
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
  });

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">Error: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p>No tickets found.</p>
        <button
          onClick={() => setSearchParams({})}
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
        >
          Reset filters
        </button>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    todo: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  };

  const priorityColor: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Tickets ({data.total})</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={params.status}
          onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Status: All</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={params.priority}
          onChange={(e) =>
            updateParams({ priority: e.target.value, page: '1' })
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Priority: All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={params.tag}
          onChange={(e) => updateParams({ tag: e.target.value, page: '1' })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Tag: All</option>
          <option value="frontend">frontend</option>
          <option value="backend">backend</option>
          <option value="infra">infra</option>
          <option value="bug">bug</option>
          <option value="ux">ux</option>
          <option value="performance">performance</option>
          <option value="docs">docs</option>
          <option value="security">security</option>
        </select>

        <select
          value={params.sort}
          onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="updatedAt_desc">Latest updated</option>
          <option value="updatedAt_asc">Oldest updated</option>
          <option value="createdAt_desc">Latest created</option>
          <option value="createdAt_asc">Oldest created</option>
        </select>
      </div>

      {/* Ticket list */}
      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
        {data.items.map((ticket) => (
          <li
            key={ticket.id}
            className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{ticket.title}</span>
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[ticket.status]}`}
                >
                  {ticket.status}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[ticket.priority]}`}
                >
                  {ticket.priority}
                </span>
                {ticket.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-400">
              {ticket.assignee ?? 'Unassigned'}
            </span>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            disabled={params.page === '1'}
            onClick={() =>
              updateParams({ page: String(Number(params.page) - 1) })
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {data.page} of {Math.ceil(data.total / data.pageSize)}
          </span>

          <button
            disabled={data.page * data.pageSize >= data.total}
            onClick={() =>
              updateParams({ page: String(Number(params.page) + 1) })
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <select
          value={params.pageSize}
          onChange={(e) =>
            updateParams({ pageSize: e.target.value, page: '1' })
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>
    </div>
  );
};

export default TicketListPage;
