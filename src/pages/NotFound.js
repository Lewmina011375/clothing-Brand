import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-gray-400">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        This page could not be found.
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        The link may be broken or the page may have been removed.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="btn-primary"
        >
          Back to Pandora home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;

