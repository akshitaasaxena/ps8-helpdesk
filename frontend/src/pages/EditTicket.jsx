import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { apiRequest } from '../api';
import { useAuth } from '../context/useAuth';
const EditTicket = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [status, setStatus] = useState('Open');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [ticketIdDisplay, setTicketIdDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notEditable, setNotEditable] = useState(false);
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticket = await apiRequest(`/api/tickets/${id}`);
        setTicketIdDisplay(ticket.ticketId);
        setTitle(ticket.title);
        setCategory(ticket.category);
        setPriority(ticket.priority);
        setDescription(ticket.description);
        setScreenshotUrl(ticket.screenshotUrl || '');
        setStatus(ticket.status);
        setDepartment(ticket.department ? (ticket.department._id || ticket.department) : '');
        if (user && user.role !== 'admin') {
          if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
            setNotEditable(true);
          }
        }
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
    fetchTicket();
  }, [id, user]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title,
        category,
        priority,
        description,
        screenshotUrl
      };
      if (user && user.role === 'admin') {
        payload.status = status;
        payload.department = department || null;
      }
      await apiRequest(`/api/tickets/${id}`, 'PUT', payload);
      navigate(`/tickets/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <div className="loading">Loading ticket...</div>;
  if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;
  if (notEditable) {
    return (
      <div className="form-card">
        <h2>Edit Ticket ({ticketIdDisplay})</h2>
        <div className="alert alert-error">
          This ticket is marked as {status} and cannot be edited.
        </div>
        <Link to={`/tickets/${id}`} className="btn btn-outline">Back to Ticket</Link>
      </div>
    );
  }
  const isAdmin = user && user.role === 'admin';
  return (
    <div className="form-card">
      <div className="card-header">
        <h2>Edit Ticket: {ticketIdDisplay}</h2>
        <Link to={`/tickets/${id}`} className="btn btn-outline btn-sm">Cancel</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input
            id="category"
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            rows="5"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="screenshotUrl">Screenshot URL</label>
          <input
            id="screenshotUrl"
            type="url"
            value={screenshotUrl}
            onChange={(e) => setScreenshotUrl(e.target.value)}
          />
        </div>
        {isAdmin && (
          <>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Unassigned</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
export default EditTicket;
