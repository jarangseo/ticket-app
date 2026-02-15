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

  // 입력값은 로컬 상태 (타이핑할 때마다 바로 반영)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // 디바운스된 값 (300ms 후 URL에 반영)
  const debouncedQ = useDebounce(searchInput, 1000);

  // URL에서 파라미터 읽기 (없으면 기본값)
  const params = {
    q: searchParams.get('q') || DEFAULT_PARAMS.q,
    status: searchParams.get('status') || DEFAULT_PARAMS.status,
    priority: searchParams.get('priority') || DEFAULT_PARAMS.priority,
    tag: searchParams.get('tag') || DEFAULT_PARAMS.tag,
    sort: searchParams.get('sort') || DEFAULT_PARAMS.sort,
    page: searchParams.get('page') || DEFAULT_PARAMS.page,
    pageSize: searchParams.get('pageSize') || DEFAULT_PARAMS.pageSize,
  };

  // URL 파라미터 업데이트 헬퍼 (setSearchParams 함수형으로 안정적 참조 유지)
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === DEFAULT_PARAMS[key as keyof typeof DEFAULT_PARAMS]) {
            next.delete(key); // 기본값이면 URL에서 제거 (깔끔하게)
          } else {
            next.set(key, value);
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  // debouncedQ가 바뀌면 URL 업데이트
  useEffect(() => {
    updateParams({ q: debouncedQ, page: '1' }); // 검색하면 1페이지로
  }, [debouncedQ, updateParams]);

  // queryKey에 params를 넣어서 파라미터 바뀔 때마다 자동 refetch
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
  });

  if (isLoading) return <div>로딩 중...</div>;

  if (isError) {
    return (
      <div>
        <p>에러: {error.message}</p>
        <button onClick={() => refetch()}>재시도</button>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return <div>조건에 맞는 티켓이 없습니다.</div>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="검색어 입력..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
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
