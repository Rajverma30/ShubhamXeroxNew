/** Catches render errors so one broken section never blanks the site. */
import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) { return { error }; }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Storefront error:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    const { children, fallback } = this.props;
    if (!error) return children;
    if (fallback) return fallback;

    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <FiAlertTriangle size={24} />
        </span>
        <h1 className="text-xl font-bold text-ink-900">Something broke on this page</h1>
        <p className="mt-2 max-w-md text-sm text-ink-500">Reloading usually fixes it. If it keeps happening, let us know.</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary">Reload the page</button>
          <a href="/" className="btn-outline">Go home</a>
        </div>
      </div>
    );
  }
}
