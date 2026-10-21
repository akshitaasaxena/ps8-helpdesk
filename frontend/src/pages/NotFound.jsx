import { Link } from 'react-router';
const NotFound = () => {
  return (
    <div className="auth-card text-center">
      <h2>404 - Page Not Found</h2>
      <p className="mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
};
export default NotFound;
