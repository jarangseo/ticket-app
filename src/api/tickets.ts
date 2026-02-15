import type { Ticket } from '../types/ticket';

type TicketListResponse = {
  items: Ticket[];
  page: number;
  pageSize: number;
  total: number;
};

export const fetchTickets = async (
  params: Record<string, string>,
): Promise<TicketListResponse> => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/tickets?${query}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch tickets');
  }

  return res.json();
};
