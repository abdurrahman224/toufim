import React, { Component } from 'react';
import toast from 'react-hot-toast';

/**
 * Report errors to an external monitoring service.
 * Swap the body of this function with your Sentry / Datadog / etc. SDK call.
 */
function reportError(error, errorInfo) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    return;
  }

  // Production: send to error monitoring service
  // Example — Sentry:
  //   Sentry.captureException(error, { extra: errorInfo });
  //
  // Example — custom endpoint:
  try {
    const payload = JSON.stringify({
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
    navigator.sendBeacon(
      '/api/errors',
      new Blob([payload], { type: 'application/json' }),
    );
  } catch {
    // Silently ignore — never throw from error reporter
  }
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    reportError(error, errorInfo);
    toast.error('Something went wrong');
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center'>
            <h1 className='text-2xl font-bold text-red-600 mb-4'>
              Something went wrong
            </h1>
            <p className='text-gray-600 mb-2'>
              We apologize for the inconvenience.
            </p>
            <div className='flex gap-3 justify-center'>
              <button
                onClick={this.handleReset}
                className='bg-[#F48525] text-white px-6 py-2 rounded-md hover:bg-[#e07520] transition'
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className='bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition'
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
