import { useState, useEffect } from 'react';
import type { Ticket, TicketStatus, TicketPriority } from '../types/ticket';
import type { UpdateTicketBody } from '../api/tickets';

type Props = {
  ticket: Ticket;
  onSave: (body: UpdateTicketBody) => void;
  onClose: () => void;
  isPending: boolean;
};

type FormErrors = {
  title?: string;
  description?: string;
  tags?: string;
};

const TicketEditModal = ({ ticket, onSave, onClose, isPending }: Props) => {
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [assignee, setAssignee] = useState(ticket.assignee ?? '');
  const [tags, setTags] = useState(ticket.tags.join(', '));
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if form has changes
  const isDirty =
    title !== ticket.title ||
    description !== ticket.description ||
    status !== ticket.status ||
    priority !== ticket.priority ||
    (assignee || null) !== ticket.assignee ||
    tags !== ticket.tags.join(', ');

  // Dirty state protection
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard?')) {
      return;
    }
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (title.length < 2 || title.length > 80) {
      newErrors.title = 'Title must be 2-80 characters';
    }

    if (description.length > 500) {
      newErrors.description = 'Description must be at most 500 characters';
    }

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (tagList.length > 10) {
      newErrors.tags = 'Maximum 10 tags';
    } else if (new Set(tagList).size !== tagList.length) {
      newErrors.tags = 'Duplicate tags not allowed';
    } else if (tagList.some((t) => t.length < 1 || t.length > 20)) {
      newErrors.tags = 'Each tag must be 1-20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title,
      description,
      status,
      priority,
      assignee: assignee || null,
      tags: tagList,
    });
  };

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">Edit Ticket</h2>

        {/* Title */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500
  focus:outline-none"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">
            Description ({description.length}/500)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500
  focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Status & Priority */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Assignee</label>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Leave empty for unassigned"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500
  focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Tags (comma separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="frontend, bug, ux"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500
  focus:outline-none"
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !isDirty}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700
  disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketEditModal;
