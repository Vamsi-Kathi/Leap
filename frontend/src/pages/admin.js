import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { adminAPI, ticketAPI } from '../lib/api';

const statusColors = {
  OPEN: { bg: '#dbeafe', color: '#1d4ed8' },
  IN_PROGRESS: { bg: '#fef3c7', color: '#b45309' },
  RESOLVED: { bg: '#d1fae5', color: '#047857' },
  CLOSED: { bg: '#f1f5f9', color: '#64748b' },
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
    <span style={{ background: style.bg, color: style.color, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
      {value?.replace('_', ' ')}
    </span>
  );
}

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ email: '', password: '', fullName: '', role: 'USER' });
  const [assigning, setAssigning] = useState(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/dashboard'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [usersRes, ticketsRes, agentsRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllTickets(),
        adminAPI.getSupportAgents(),
      ]);
      setUsers(usersRes.data);
      setTickets(ticketsRes.data);
      setAgents(agentsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try { await adminAPI.updateUserRole(userId, newRole); fetchData(); }
    catch { alert('Failed to update role'); }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return;
    try { await adminAPI.deactivateUser(userId); fetchData(); }
    catch { alert('Failed'); }
  };

  const handleActivate = async (userId) => {
    try { await adminAPI.activateUser(userId); fetchData(); }
    catch { alert('Failed'); }
  };

  const handleResolve = async (ticketId) => {
    try { await adminAPI.forceResolve(ticketId); fetchData(); }
    catch { alert('Failed to resolve'); }
  };

  const handleClose = async (ticketId) => {
    try { await adminAPI.forceClose(ticketId); fetchData(); }
    catch { alert('Failed to close'); }
  };

  const handleAssign = async (ticketId, agentId) => {
    if (!agentId) return;
    try { await adminAPI.adminAssign(ticketId, Number(agentId)); fetchData(); setAssigning(null); }
    catch { alert('Failed to assign'); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(addUserForm);
      setShowAddUser(false);
      setAddUserForm({ email: '', password: '', fullName: '', role: 'USER' });
      fetchData();
    } catch { alert('Failed to create user'); }
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.createdByName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
    activeUsers: users.filter(u => u.active).length,
    agents: agents.length,
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><p style={{ color: '#64748b' }}>Loading...</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={{ background: '#1e293b', color: '#fff', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 20, fontWeight: 700 }}>🎫 SupportDesk</span>
          <span style={{ background: '#334155', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/dashboard" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>← My Dashboard</a>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>{user?.fullName}</span>
          <button onClick={logout} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Tickets', value: stats.total, color: '#2563eb', bg: '#dbeafe' },
            { label: 'Open', value: stats.open, color: '#b45309', bg: '#fef3c7' },
            { label: 'Resolved', value: stats.resolved, color: '#047857', bg: '#d1fae5' },
            { label: 'Active Users', value: stats.activeUsers, color: '#7c3aed', bg: '#ede9fe' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, padding: '16px 20px', borderRadius: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: s.color, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: 6, borderRadius: 10, border: '1px solid #e2e8f0', width: 'fit-content' }}>
          {['tickets', 'users'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: activeTab === tab ? '#2563eb' : 'transparent', color: activeTab === tab ? '#fff' : '#64748b' }}>
              {tab === 'tickets' ? '🎫 All Tickets' : '👥 Users'}
            </button>
          ))}
        </div>

        {activeTab === 'tickets' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <input placeholder="Search tickets, users..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, flex: 1, minWidth: 200 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}>
                <option value="">All Status</option>
                {['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['ID','Subject','Priority','Status','Created By','Assigned To','Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>#{t.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                        {t.rating && <div style={{ fontSize: 11, color: '#f59e0b' }}>{'★'.repeat(t.rating)}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}><Badge value={t.priority} map={priorityColors} /></td>
                      <td style={{ padding: '12px 16px' }}><Badge value={t.status} map={statusColors} /></td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{t.createdByName}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        {assigning === t.id ? (
                          <select onChange={e => handleAssign(t.id, e.target.value)} defaultValue="" autoFocus onBlur={() => setAssigning(null)}
                            style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }}>
                            <option value="">Select agent...</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.fullName}</option>)}
                          </select>
                        ) : (
                          <span onClick={() => setAssigning(t.id)} style={{ cursor: 'pointer', color: t.assignedToName ? '#1e293b' : '#2563eb', textDecoration: t.assignedToName ? 'none' : 'underline', fontSize: 13 }}>
                            {t.assignedToName || 'Assign...'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {t.status !== 'RESOLVED' && t.status !== 'CLOSED' && (
                            <button onClick={() => handleResolve(t.id)}
                              style={{ padding: '4px 10px', background: '#d1fae5', color: '#047857', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Resolve
                            </button>
                          )}
                          {t.status !== 'CLOSED' && (
                            <button onClick={() => handleClose(t.id)}
                              style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No tickets found</div>}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setShowAddUser(true)}
                style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                + Add User
              </button>
            </div>
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['ID','Name','Email','Role','Status','Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}>{u.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.fullName}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                          style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }}>
                          <option value="USER">User</option>
                          <option value="SUPPORT_AGENT">Support Agent</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: u.active ? '#d1fae5' : '#fee2e2', color: u.active ? '#047857' : '#dc2626', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.active ? (
                          <button onClick={() => handleDeactivate(u.id)}
                            style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleActivate(u.id)}
                            style={{ padding: '4px 10px', background: '#d1fae5', color: '#047857', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {showAddUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Add New User</h3>
            <form onSubmit={handleAddUser}>
              {[['Full Name','fullName','text'],['Email','email','email'],['Password','password','password']].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: 14 }}>{label}</label>
                  <input required type={type} value={addUserForm[key]} onChange={e => setAddUserForm({...addUserForm, [key]: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 5, fontWeight: 500, fontSize: 14 }}>Role</label>
                <select value={addUserForm.role} onChange={e => setAddUserForm({...addUserForm, role: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}>
                  <option value="USER">User</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" style={{ flex: 1, padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Create User</button>
                <button type="button" onClick={() => setShowAddUser(false)} style={{ flex: 1, padding: 10, background: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
