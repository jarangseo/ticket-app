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

export const fetchTicket = async (id: string): Promise<Ticket> => {
  const res = await fetch(`/api/tickets/${id}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch ticket');
  }

  return res.json();
};

export const deleteTicket = async (id: string): Promise<void> => {
  const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete ticket');
  }
};
