import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function ServerError() {
  return (
    <div className="min-h-screen bg-cafe-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-4">⚙️</div>
        <h1 className="text-6xl font-bold text-cafe-accent font-display mb-2">500</h1>
        <h2 className="text-2xl font-semibold text-cafe-text font-display mb-3">Something Went Wrong</h2>
        <p className="text-cafe-text-muted mb-8">
          Our coffee machine seems to be having trouble. Please try refreshing the page or come back later.
        </p>
        <Button size="lg" onClick={() => window.location.reload()}>Refresh Page</Button>
      </motion.div>
    </div>
  );
}
