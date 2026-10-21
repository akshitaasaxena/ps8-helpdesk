import { useState, useEffect } from 'react';
import { apiRequest } from '../api';
const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        const data = await apiRequest('/api/departments');
        if (!ignore) setDepartments(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, []);
  const reloadDepartments = async () => {
    try {
      const data = await apiRequest('/api/departments');
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Department name is required');
      return;
    }
    try {
      await apiRequest('/api/departments', 'POST', { name, description });
      setName('');
      setDescription('');
      setSuccess('Department added successfully');
      reloadDepartments();
    } catch (err) {
      setError(err.message);
    }
  };
  const startEdit = (dept) => {
    setEditingId(dept._id);
    setEditName(dept.name);
    setEditDescription(dept.description || '');
    setError('');
    setSuccess('');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
  };
  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');
    if (!editName.trim()) {
      setError('Department name is required');
      return;
    }
    try {
      await apiRequest(`/api/departments/${id}`, 'PUT', {
        name: editName,
        description: editDescription
      });
      setEditingId(null);
      setSuccess('Department updated successfully');
      reloadDepartments();
    } catch (err) {
      setError(err.message);
    }
  };
  const handleDelete = async (id, deptName) => {
    if (!window.confirm(`Are you sure you want to delete department "${deptName}"? Existing ticket references will be cleared safely.`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/api/departments/${id}`, 'DELETE');
      setSuccess('Department deleted successfully');
      reloadDepartments();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Department Management</h1>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="form-card mb-4">
        <h3>Add New Department</h3>
        <form onSubmit={handleCreate} className="inline-form">
          <div className="form-group flex-1">
            <label htmlFor="dept-name">Name *</label>
            <input
              id="dept-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Facilities, Legal, Security"
            />
          </div>
          <div className="form-group flex-2">
            <label htmlFor="dept-desc">Description</label>
            <input
              id="dept-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope and responsibilities"
            />
          </div>
          <button type="submit" className="btn btn-primary align-self-end">Add Department</button>
        </form>
      </div>
      {loading ? (
        <div className="loading">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="empty-state">No departments registered yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d._id}>
                  {editingId === d._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="input-sm"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="input-sm"
                        />
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleUpdate(d._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="font-semibold">{d.name}</td>
                      <td>{d.description || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => startEdit(d)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(d._id, d.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminDepartments;
