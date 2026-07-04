import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cafe-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-4">☕</div>
        <h1 className="text-6xl font-bold text-cafe-accent font-display mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-cafe-text font-display mb-3">Page Not Found</h2>
        <p className="text-cafe-text-muted mb-8">
          Oops! Looks like this page has been brewed away. The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button size="lg">Back to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
}
