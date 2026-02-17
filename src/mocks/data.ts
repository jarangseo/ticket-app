// src/mocks/data.ts
import type { Ticket, TicketStatus, TicketPriority } from '../types/ticket';

const STATUSES: TicketStatus[] = ['todo', 'in_progress', 'done'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];
const TAGS = [
  'frontend',
  'backend',
  'infra',
  'bug',
  'ux',
  'performance',
  'docs',
  'security',
];
const ASSIGNEES = ['jarang', 'minho', 'yuna', 'jisoo', 'hyuk', null];

// Random utils
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickMultiple = <T>(arr: T[], max: number): T[] => {
  const count = Math.floor(Math.random() * (max + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generateTickets = (count: number): Ticket[] => {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
    ).toISOString();

    return {
      id: crypto.randomUUID(),
      title: `Ticket ${i + 1} - ${pick(['Fix login bug', 'Improve dashboard', 'API integration', 'Optimize performance', 'Update docs', 'Refactor UI', 'Add tests', 'Security patch'])}`,
      description: `This is a ${pick(['urgent', 'normal', 'low priority'])} task.`,
      status: pick(STATUSES),
      priority: pick(PRIORITIES),
      assignee: pick(ASSIGNEES),
      tags: pickMultiple(TAGS, 3),
      createdAt,
      updatedAt: createdAt,
    };
  });
};

export const tickets: Ticket[] = generateTickets(80);
