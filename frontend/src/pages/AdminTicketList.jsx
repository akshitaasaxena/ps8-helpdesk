import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiRequest } from '../api';
const AdminTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  useEffect(() => {
    let ignore = false;
    const loadDepartments = async () => {
      try {
        const depts = await apiRequest('/api/departments');
        if (!ignore) setDepartments(depts);
      } catch (err) {
        if (!ignore) setError(err.message);
      }
    };
    loadDepartments();
    return () => { ignore = true; };
  }, []);
  useEffect(() => {
    let ignore = false;
    const loadTickets = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter) queryParams.append('status', statusFilter);
        if (priorityFilter) queryParams.append('priority', priorityFilter);
        if (departmentFilter) queryParams.append('department', departmentFilter);
        const url = `/api/tickets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const data = await apiRequest(url);
        if (!ignore) setTickets(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadTickets();
    return () => { ignore = true; };
  }, [statusFilter, priorityFilter, departmentFilter]);
  const refreshTickets = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (priorityFilter) queryParams.append('priority', priorityFilter);
      if (departmentFilter) queryParams.append('department', departmentFilter);
      const url = `/api/tickets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await apiRequest(url);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleStatusChange = async (ticketId, newStatus) => {
    setActionSuccess('');
    setError('');
    try {
      await apiRequest(`/api/tickets/${ticketId}/status`, 'PATCH', { status: newStatus });
      setActionSuccess('Ticket status updated successfully');
      refreshTickets();
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDepartmentChange = async (ticketId, newDeptId) => {
    setActionSuccess('');
    setError('');
    try {
      await apiRequest(`/api/tickets/${ticketId}/assign`, 'PATCH', {
        department: newDeptId ? newDeptId : null
      });
      setActionSuccess('Department assignment updated successfully');
      refreshTickets();
    } catch (err) {
      setError(err.message);
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
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Ticket Management</h1>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority:</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Department:</label>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        {(statusFilter || priorityFilter || departmentFilter) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              setDepartmentFilter('');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">No tickets found matching the selected filters.</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Department</th>
                <th>Created</th>
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
                  <td>
                    <Link to={`/tickets/${t._id}`} className="table-title-link">
                      {t.title}
                    </Link>
                  </td>
                  <td>{t.customer ? t.customer.name : 'Unknown'}</td>
                  <td>{t.priority}</td>
                  <td>
                    <select
                      className={`select-sm ${getBadgeClass(t.status)}`}
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="select-sm"
                      value={t.department ? (t.department._id || t.department) : ''}
                      onChange={(e) => handleDepartmentChange(t._id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/tickets/${t._id}`} className="btn btn-sm btn-outline">
                        Details
                      </Link>
                      <Link to={`/tickets/${t._id}/edit`} className="btn btn-sm btn-outline">
                        Edit
                      </Link>
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
export default AdminTicketList;
