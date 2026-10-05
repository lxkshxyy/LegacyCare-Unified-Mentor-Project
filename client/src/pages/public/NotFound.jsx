import { Link } from 'react-router-dom';
import { LotusMark } from '../../components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <LotusMark className="h-14 w-14" />
      <h1 className="mt-6 text-3xl">This page could not be found</h1>
      <p className="mt-2 text-muted">The link may be old or mistyped.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
