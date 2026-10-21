import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiRequest } from '../api';
const CustomerTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await apiRequest('/api/tickets');
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Open': return 'badge badge-open';
      case 'In Progress': return 'badge badge-progress';
      case 'Resolved': return 'badge badge-resolved';
      case 'Closed': return 'badge badge-closed';
      default: return 'badge';
    }
  };
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">Create New Ticket</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <p>You have not created any tickets yet.</p>
          <Link to="/tickets/new" className="btn btn-primary">Submit a Ticket</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <Link to={`/tickets/${t._id}`} className="ticket-id-link">
                      {t.ticketId}
                    </Link>
                  </td>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td>
                    <span className={getPriorityClass(t.priority)}>{t.priority}</span>
                  </td>
                  <td>
                    <span className={getBadgeClass(t.status)}>{t.status}</span>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-outline">
                        View
                      </Link>
                      {t.status !== 'Closed' && t.status !== 'Resolved' && (
                        <Link to={`/tickets/${t._id}/edit`} className="btn btn-sm btn-outline">
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default CustomerTicketList;
