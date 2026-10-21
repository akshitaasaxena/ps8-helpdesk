import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { apiRequest } from '../api';
import { useAuth } from '../context/useAuth';
const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketData = await apiRequest(`/api/tickets/${id}`);
        setTicket(ticketData);
        const commentData = await apiRequest(`/api/tickets/${id}/comments`);
        setComments(commentData);
        if (user && user.role === 'admin') {
          const depts = await apiRequest('/api/departments');
          setDepartments(depts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);
  const handleAddComment = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionMessage('');
    if (!commentText.trim()) return;
    try {
      const newComment = await apiRequest(`/api/tickets/${id}/comments`, 'POST', {
        message: commentText.trim()
      });
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (err) {
      setActionError(err.message);
    }
  };
  const handleStatusChange = async (newStatus) => {
    setActionError('');
    setActionMessage('');
    try {
      const updated = await apiRequest(`/api/tickets/${id}/status`, 'PATCH', { status: newStatus });
      setTicket(updated);
      setActionMessage(`Status updated to ${newStatus}`);
    } catch (err) {
      setActionError(err.message);
    }
  };
  const handleDepartmentChange = async (newDeptId) => {
    setActionError('');
    setActionMessage('');
    try {
      const updated = await apiRequest(`/api/tickets/${id}/assign`, 'PATCH', {
        department: newDeptId ? newDeptId : null
      });
      setTicket(updated);
      setActionMessage('Department assignment updated');
    } catch (err) {
      setActionError(err.message);
    }
  };
  const handleReopen = async () => {
    setActionError('');
    setActionMessage('');
    try {
      const updated = await apiRequest(`/api/tickets/${id}/reopen`, 'POST');
      setTicket(updated);
      setActionMessage('Ticket reopened successfully');
    } catch (err) {
      setActionError(err.message);
    }
  };
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Open': return 'badge badge-open';
      case 'In Progress': return 'badge badge-progress';
      case 'Resolved': return 'badge badge-resolved';
      case 'Closed': return 'badge badge-closed';
      default: return 'badge';
    }
  };
  if (loading) return <div className="loading">Loading ticket details...</div>;
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;
  if (!ticket) return <div className="page-container"><div className="alert alert-error">Ticket not found</div></div>;
  const isAdmin = user && user.role === 'admin';
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="ticket-id-tag">{ticket.ticketId}</span>
          <h1>{ticket.title}</h1>
        </div>
        <div className="header-actions">
          {isAdmin ? (
            <Link to="/admin/tickets" className="btn btn-outline btn-sm">All Tickets</Link>
          ) : (
            <Link to="/tickets" className="btn btn-outline btn-sm">My Tickets</Link>
          )}
          {(!isAdmin && ticket.status !== 'Closed' && ticket.status !== 'Resolved') && (
            <Link to={`/tickets/${ticket._id}/edit`} className="btn btn-primary btn-sm">Edit Ticket</Link>
          )}
          {isAdmin && (
            <Link to={`/tickets/${ticket._id}/edit`} className="btn btn-primary btn-sm">Edit Ticket</Link>
          )}
        </div>
      </div>
      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}
      <div className="details-grid">
        <div className="details-main">
          <div className="detail-section">
            <h3>Description</h3>
            <p className="description-text">{ticket.description}</p>
          </div>
          {ticket.screenshotUrl && (
            <div className="detail-section">
              <h3>Screenshot</h3>
              <a href={ticket.screenshotUrl} target="_blank" rel="noopener noreferrer">
                <img src={ticket.screenshotUrl} alt="Ticket Screenshot" className="ticket-screenshot" />
              </a>
            </div>
          )}
          <div className="comments-section">
            <h3>Comments ({comments.length})</h3>
            <div className="comment-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="comment-card">
                    <div className="comment-header">
                      <span className="comment-author">
                        {c.user ? c.user.name : 'Unknown User'} ({c.user ? c.user.role : 'user'})
                      </span>
                      <span className="comment-time">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-body">{c.message}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="comment-form">
              <h4>Add a Comment</h4>
              <textarea
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your reply or update..."
                required
              ></textarea>
              <button type="submit" className="btn btn-primary btn-sm">Send Comment</button>
            </form>
          </div>
        </div>
        <div className="details-sidebar">
          <div className="sidebar-card">
            <h3>Ticket Details</h3>
            <div className="sidebar-field">
              <span className="field-label">Status</span>
              <span className={getBadgeClass(ticket.status)}>{ticket.status}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Priority</span>
              <span>{ticket.priority}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Category</span>
              <span>{ticket.category}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Department</span>
              <span>{ticket.department ? ticket.department.name : 'Unassigned'}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Customer</span>
              <span>{ticket.customer ? ticket.customer.name : 'Unknown'}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Created At</span>
              <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="sidebar-field">
              <span className="field-label">Updated At</span>
              <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
            {ticket.status === 'Resolved' && (
              <div className="reopen-box">
                {ticket.reopenCount < 1 ? (
                  <button className="btn btn-warning btn-block" onClick={handleReopen}>
                    Reopen Ticket
                  </button>
                ) : (
                  <div className="alert-notice">
                    This ticket was resolved and has already reached its 1-time reopen limit.
                  </div>
                )}
              </div>
            )}
          </div>
          {isAdmin && (
            <div className="sidebar-card">
              <h3>Admin Controls</h3>
              <div className="form-group">
                <label>Change Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign Department</label>
                <select
                  value={ticket.department ? (ticket.department._id || ticket.department) : ''}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TicketDetails;
