import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { apiRequest } from '../api';
const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !category.trim() || !priority || !description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const created = await apiRequest('/api/tickets', 'POST', {
        title,
        category,
        priority,
        description,
        screenshotUrl
      });
      navigate(`/tickets/${created._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="form-card">
      <div className="card-header">
        <h2>Create Support Ticket</h2>
        <Link to="/tickets" className="btn btn-outline btn-sm">Back to Tickets</Link>
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
            placeholder="Brief summary of the issue"
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
            placeholder="e.g. Technical, Billing, Network, Software"
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
            placeholder="Detailed description of the issue"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="screenshotUrl">Screenshot URL (optional)</label>
          <input
            id="screenshotUrl"
            type="url"
            value={screenshotUrl}
            onChange={(e) => setScreenshotUrl(e.target.value)}
            placeholder="https://example.com/screenshot.png"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};
export default CreateTicket;
