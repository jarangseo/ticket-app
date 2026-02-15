import { useQuery } from '@tanstack/react-query';
import { fetchTickets } from '../api/tickets';

const TicketListPage = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => fetchTickets({}),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        <p>에러: {error.message}</p>
        <button onClick={() => refetch()}>재시도</button>
      </div>
    );

  if (!data || data.items.length === 0) return <div>No data</div>;

  return (
    <div>
      <h1>Tickets</h1>
      <ul>
        {data.items.map((ticket) => (
          <li key={ticket.id}>{ticket.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TicketListPage;
