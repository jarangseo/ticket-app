import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchTickets } from '../api/tickets';
import { useCallback, useEffect, useState } from 'react';
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

  // Update URL when debounced value changes
  useEffect(() => {
    updateParams({ q: debouncedQ, page: '1' }); // Reset to page 1 on search
  }, [debouncedQ, updateParams]);

  // Auto refetch when params change
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <div>No tickets found.</div>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div>
        <select
          value={params.status}
          onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
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
        >
          <option value="all">Priority: All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={params.tag}
          onChange={(e) => updateParams({ tag: e.target.value, page: '1' })}
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
        >
          <option value="updatedAt_desc">Latest updated</option>
          <option value="updatedAt_asc">Oldest updated</option>
          <option value="createdAt_desc">Latest created</option>
          <option value="createdAt_asc">Oldest created</option>
        </select>
      </div>
      <h1>Tickets ({data.total})</h1>
      <ul>
        {data.items.map((ticket) => (
          <li key={ticket.id}>
            [{ticket.status}] {ticket.title} - {ticket.priority}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TicketListPage;
