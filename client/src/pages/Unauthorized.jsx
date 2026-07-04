import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-cafe-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-4">🔒</div>
        <h1 className="text-6xl font-bold text-cafe-accent font-display mb-2">401</h1>
        <h2 className="text-2xl font-semibold text-cafe-text font-display mb-3">Access Denied</h2>
        <p className="text-cafe-text-muted mb-8">
          You don't have permission to access this page. Please log in with valid credentials to continue.
        </p>
        <Link to="/login">
          <Button size="lg">Go to Login</Button>
        </Link>
      </motion.div>
    </div>
  );
}
