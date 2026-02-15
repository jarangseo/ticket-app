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

// 랜덤 유틸
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickMultiple = <T>(arr: T[], max: number): T[] => {
  const count = Math.floor(Math.random() * (max + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const generateTickets = (count: number): Ticket[] => {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // 최근 90일
    ).toISOString();

    return {
      id: crypto.randomUUID(),
      title: `Ticket ${i + 1} - ${pick(['로그인 버그 수정', '대시보드 개선', 'API 연동', '성능 최적화', '문서 업데이트', 'UI 리팩토링', '테스트 추가', '보안 패치'])}`,
      description: `이 티켓은 ${pick(['긴급한', '일반적인', '낮은 우선순위의'])} 작업입니다.`,
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
