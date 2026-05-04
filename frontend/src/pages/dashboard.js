import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { ticketAPI, adminAPI } from '../lib/api';

const statusColors = {
  OPEN: { bg: '#dbeafe', color: '#1d4ed8', label: 'Open' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#b45309', label: 'In Progress' },
  RESOLVED: { bg: '#d1fae5', color: '#047857', label: 'Resolved' },
  CLOSED: { bg: '#f1f5f9', color: '#64748b', label: 'Closed' },
};

const priorityColors = {
  LOW: { bg: '#dbeafe', color: '#1d4ed8' },
  MEDIUM: { bg: '#fef3c7', color: '#b45309' },
  HIGH: { bg: '#fee2e2', color: '#dc2626' },
  URGENT: { bg: '#fef2f2', color: '#991b1b' },
};

function Badge({ value, map }) {
  const style = map[value] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600
    }}>
      {value?.replace('_', ' ')}
    </span>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{ cursor: onChange ? 'pointer' : 'default', fontSize: 20, color: star <= (hover || value) ? '#f59e0b' : '#d1d5db' }}
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [agents, setAgents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [createForm, setCreateForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  const isAgent = user?.role === 'SUPPORT_AGENT';
  const isAdmin = user?.role === 'ADMIN';

  const fetchTickets = useCallback(async () => {
    try {
      let res;
      if (isAgent) {
        res = await ticketAPI.getAssignedTickets();
      } else {
        res = await ticketAPI.getMyTickets();
      }
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAgent]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchTickets();
    if (isAdmin || isAgent) {
      adminAPI.getSupportAgents().then(r => setAgents(r.data)).catch(() => {});
    }
  }, [user]);

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setNewComment('');
    setShowRating(false);
    setRatingValue(ticket.rating || 0);
    setFeedbackText(ticket.feedback || '');
    try {
      const res = await ticketAPI.getComments(ticket.id);
      setComments(res.data);
    } catch (e) {
      setComments([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ticketAPI.createTicket(createForm);
      setShowCreate(false);
      setCreateForm({ subject: '', description: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (e) {
      setError('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await ticketAPI.addComment(selectedTicket.id, newComment.trim());
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (e) {
      alert('Failed to add comment');
    }
  };

  const handleAssign = async (agentId) => {
    try {
      const res = await ticketAPI.assignTicket(selectedTicket.id, Number(agentId));
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (e) {
      alert('Failed to assign ticket');
    }
  };

  const handleResolve = async () => {
    try {
      const res = await ticketAPI.resolveTicket(selectedTicket.id);
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (e) {
      alert('Failed to resolve ticket');
    }
  };

  const handleClose = async () => {
    try {
      const res = await ticketAPI.closeTicket(selectedTicket.id);
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (e) {
      alert('Failed to close ticket');
    }
  };

  const handleRate = async () => {
    if (!ratingValue) { alert('Please select a rating'); return; }
    try {
      const res = await ticketAPI.rateTicket(selectedTicket.id, ratingValue, feedbackText);
      setSelectedTicket(res.data);
      setShowRating(false);
      fetchTickets();
    } catch (e) {
      alert('Failed to submit rating');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: '#64748b' }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>🎫 SupportDesk</span>
          <span style={{ padding: '2px 8px', background: isAdmin ? '#fef3c7' : isAgent ? '#d1fae5' : '#dbeafe', color: isAdmin ? '#b45309' : isAgent ? '#047857' : '#1d4ed8', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 14 }}>{user?.fullName}</span>
          {isAdmin && <a href="/admin" style={{ padding: '6px 12px', background: '#f1f5f9', borderRadius: 6, fontSize: 14, color: '#1e293b', textDecoration: 'none', fontWeight: 500 }}>Admin Panel</a>}
          <button onClick={logout} style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, flex: 1, minWidth: 150 }}>
            {isAgent ? 'Assigned Tickets' : 'My Tickets'}
          </h2>
          <input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, width: 180 }}
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}>
            <option value="">All Status</option>
            {['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}>
            <option value="">All Priority</option>
            {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {!isAgent && (
            <button onClick={() => setShowCreate(true)}
              style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              + New Ticket
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(s => {
            const count = tickets.filter(t => t.status === s).length;
            const c = statusColors[s];
            return (
              <div key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                style={{ background: c.bg, padding: '12px 16px', borderRadius: 8, cursor: 'pointer', border: `2px solid ${filterStatus === s ? c.color : 'transparent'}` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{count}</div>
                <div style={{ fontSize: 12, color: c.color, fontWeight: 500 }}>{s.replace('_',' ')}</div>
              </div>
            );
          })}
        </div>

        {/* Ticket list */}
        {filteredTickets.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#94a3b8', marginBottom: 12 }}>No tickets found</p>
            {!isAgent && <button onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Create your first ticket</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTickets.map(ticket => (
              <div key={ticket.id} onClick={() => openTicket(ticket)}
                style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: 16 }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
              >
                <span style={{ color: '#94a3b8', fontSize: 13, minWidth: 40 }}>#{ticket.id}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{ticket.subject}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{ticket.description}</div>
                </div>
                <Badge value={ticket.priority} map={priorityColors} />
                <Badge value={ticket.status} map={statusColors} />
                <div style={{ fontSize: 12, color: '#94a3b8', minWidth: 80, textAlign: 'right' }}>{new Date(ticket.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Create New Ticket</h3>
            {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 14 }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Subject *</label>
                <input required value={createForm.subject} onChange={e => setCreateForm({...createForm, subject: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Description *</label>
                <textarea required rows={4} value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Priority</label>
                <select value={createForm.priority} onChange={e => setCreateForm({...createForm, priority: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}>
                  {['LOW','MEDIUM','HIGH','URGENT'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
                <button type="button" onClick={() => { setShowCreate(false); setError(''); }}
                  style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 660, maxHeight: '90vh', overflow: 'auto' }}>
            {/* Ticket header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Badge value={selectedTicket.priority} map={priorityColors} />
                  <Badge value={selectedTicket.status} map={statusColors} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>#{selectedTicket.id} — {selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>{selectedTicket.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, fontSize: 13, color: '#64748b' }}>
                <div>Created by: <strong>{selectedTicket.createdByName}</strong></div>
                <div>Assigned to: <strong>{selectedTicket.assignedToName || 'Unassigned'}</strong></div>
                <div>Created: <strong>{new Date(selectedTicket.createdAt).toLocaleString()}</strong></div>
                {selectedTicket.resolvedAt && <div>Resolved: <strong>{new Date(selectedTicket.resolvedAt).toLocaleString()}</strong></div>}
                {selectedTicket.rating && (
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Rating: <StarRating value={selectedTicket.rating} />
                    {selectedTicket.feedback && <em style={{ color: '#94a3b8' }}>"{selectedTicket.feedback}"</em>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {(isAdmin || isAgent) && selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button onClick={handleResolve}
                    style={{ padding: '7px 14px', background: '#d1fae5', color: '#047857', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    ✓ Resolve
                  </button>
                )}
                {(isAdmin || (!isAgent && selectedTicket.createdBy === user?.id)) && selectedTicket.status !== 'CLOSED' && (
                  <button onClick={handleClose}
                    style={{ padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    Close
                  </button>
                )}
                {!isAgent && !selectedTicket.rating && (selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && selectedTicket.createdBy === user?.id && (
                  <button onClick={() => setShowRating(true)}
                    style={{ padding: '7px 14px', background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                    ★ Rate Resolution
                  </button>
                )}
                {(isAdmin || isAgent) && agents.length > 0 && (
                  <select onChange={e => e.target.value && handleAssign(e.target.value)} defaultValue=""
                    style={{ padding: '7px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                    <option value="">Assign to agent...</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                  </select>
                )}
              </div>

              {/* Rating modal inline */}
              {showRating && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 12, fontSize: 15 }}>Rate this resolution</h4>
                  <StarRating value={ratingValue} onChange={setRatingValue} />
                  <textarea placeholder="Optional feedback..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                    rows={2} style={{ width: '100%', marginTop: 10, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={handleRate} style={{ padding: '7px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Submit Rating</button>
                    <button onClick={() => setShowRating(false)} style={{ padding: '7px 14px', background: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Comments */}
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                Comments ({comments.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {comments.length === 0 && <p style={{ color: '#94a3b8', fontSize: 14 }}>No comments yet.</p>}
                {comments.map(c => (
                  <div key={c.id} style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13, color: '#1e293b' }}>{c.userName}</strong>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{c.content}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'CLOSED' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                    placeholder="Add a comment..."
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}
                  />
                  <button onClick={handleAddComment}
                    style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
