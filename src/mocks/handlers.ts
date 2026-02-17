// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { tickets } from './data';
import type { TicketPriority } from '../types/ticket';

// Random delay 800~1500ms
const randomDelay = () => delay(800 + Math.random() * 700);

// 20% chance of error
const maybeError = () => {
  if (Math.random() < 0.2) {
    return HttpResponse.json(
      { message: 'Something went wrong', code: 'E_RANDOM' },
      { status: 500 },
    );
  }
  return null;
};

export const handlers = [
  // List
  http.get('/api/tickets', async ({ request }) => {
    await randomDelay();
    const error = maybeError();
    if (error) return error;

    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const status = url.searchParams.get('status') || 'all';
    const priority = url.searchParams.get('priority') || 'all';
    const tag = url.searchParams.get('tag') || 'all';
    const sort = url.searchParams.get('sort') || 'updatedAt_desc';
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Math.min(
      Number(url.searchParams.get('pageSize') || '20'),
      50,
    );

    let filtered = [...tickets];

    // Search
    if (q) {
      const lower = q.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower),
      );
    }

    // Filter
    if (status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (priority !== 'all') {
      filtered = filtered.filter((t) => t.priority === priority);
    }
    if (tag !== 'all') {
      filtered = filtered.filter((t) => t.tags.includes(tag));
    }

    // Sort
    const [field, order] = sort.split('_') as [string, string];
    filtered.sort((a, b) => {
      const aVal = field === 'updatedAt' ? a.updatedAt : a.createdAt;
      const bVal = field === 'updatedAt' ? b.updatedAt : b.createdAt;
      return order === 'desc'
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    });

    // Pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({ items, page, pageSize, total });
  }),

  // Detail
  http.get('/api/tickets/:id', async ({ params }) => {
    await randomDelay();
    const error = maybeError();
    if (error) return error;

    const ticket = tickets.find((t) => t.id === params.id);
    if (!ticket) {
      return HttpResponse.json(
        { message: 'Not found', code: 'E_NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json(ticket);
  }),

  // Create
  http.post('/api/tickets', async ({ request }) => {
    await randomDelay();
    const error = maybeError();
    if (error) return error;

    const body = (await request.json()) as Record<string, unknown>;
    const newTicket = {
      id: crypto.randomUUID(),
      title: body.title as string,
      description: (body.description as string) || '',
      status: 'todo' as const,
      priority: (body.priority as TicketPriority) || 'medium',
      assignee: (body.assignee as string) || null,
      tags: (body.tags as string[]) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    return HttpResponse.json(newTicket, { status: 201 });
  }),

  // Update
  http.patch('/api/tickets/:id', async ({ params, request }) => {
    await randomDelay();
    const error = maybeError();
    if (error) return error;

    const index = tickets.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Not found', code: 'E_NOT_FOUND' },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    tickets[index] = {
      ...tickets[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(tickets[index]);
  }),

  // Delete
  http.delete('/api/tickets/:id', async ({ params }) => {
    await randomDelay();
    const error = maybeError();
    if (error) return error;

    const index = tickets.findIndex((t) => t.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Not found', code: 'E_NOT_FOUND' },
        { status: 404 },
      );
    }

    tickets.splice(index, 1);
    return HttpResponse.json({ ok: true });
  }),
];
