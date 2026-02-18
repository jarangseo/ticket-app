import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  fetchTicket,
  deleteTicket,
  updateTicket,
  type UpdateTicketBody,
} from '../api/tickets';
import TicketEditModal from '../components/TicketEditModal';
import { useToastStore } from '../stores/toastStore';

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

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const { addToast } = useToastStore();

  const {
    data: ticket,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicket(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTicket(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      addToast('Ticket deleted', 'success');
      navigate('/tickets');
    },
    onError: (err: Error) => {
      setShowDeleteConfirm(false);
      addToast(err.message, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateTicketBody) => updateTicket(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowEdit(false);
      addToast('Ticket updated', 'success');
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );

  if (isError)
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

  if (!ticket) return null;

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/tickets')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to list
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="mb-4 text-2xl font-bold">{ticket.title}</h1>

      {/* Status & Priority */}
      <div className="mb-6 flex gap-2">
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor[ticket.status]}`}
        >
          {ticket.status}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${priorityColor[ticket.priority]}`}
        >
          {ticket.priority}
        </span>
      </div>

      {/* Info */}
      <div className="mb-6 rounded-md border border-gray-200 p-4">
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-500">Description</span>
          <p className="mt-1">{ticket.description || 'No description'}</p>
        </div>
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-500">Assignee</span>
          <p className="mt-1">{ticket.assignee ?? 'Unassigned'}</p>
        </div>
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-500">Tags</span>
          <div className="mt-1 flex gap-2">
            {ticket.tags.length > 0 ? (
              ticket.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No tags</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
          <div>
            <span className="font-medium">Created</span>
            <p className="mt-1">
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <span className="font-medium">Updated</span>
            <p className="mt-1">
              {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Delete ticket?</h2>
            <p className="mb-6 text-gray-600">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showEdit && (
        <TicketEditModal
          ticket={ticket}
          onSave={(body) => updateMutation.mutate(body)}
          onClose={() => setShowEdit(false)}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default TicketDetailPage;
