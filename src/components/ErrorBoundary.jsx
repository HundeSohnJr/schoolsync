import { Component } from 'react';

/**
 * Error Boundary — catches render crashes and offers recovery.
 * Without this, any React error results in a permanent white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SchoolSync] Render crash:', error, errorInfo);
    this.setState({ errorInfo });
    // Persist the most recent crash to localStorage for later debugging
    try {
      localStorage.setItem('schoolsync-last-crash', JSON.stringify({
        message: error?.message || String(error),
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack || '',
        timestamp: new Date().toISOString(),
        url: window.location.href,
      }));
    } catch (e) {
      // storage full or unavailable, ignore
    }
  }

  handleReset = () => {
    // Clear corrupted state and reload
    try {
      localStorage.removeItem('schoolsync-data');
    } catch (e) {
      // localStorage might be full or inaccessible
    }
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
            Ups, da ist etwas schiefgelaufen!
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1rem', maxWidth: '400px' }}>
            Keine Sorge — das passiert manchmal. Probier es nochmal oder setze die App zurück.
          </p>
          {this.state.error && (
            <details style={{
              marginBottom: '1.5rem',
              maxWidth: '500px',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: '#991b1b',
              background: '#fee2e2',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #fecaca',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                Technische Details (für Papa)
              </summary>
              <div style={{ marginTop: '0.5rem', fontFamily: 'monospace', wordBreak: 'break-word' }}>
                <strong>{this.state.error.message || String(this.state.error)}</strong>
                {this.state.errorInfo?.componentStack && (
                  <pre style={{
                    marginTop: '0.5rem',
                    fontSize: '0.65rem',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}>
                    {this.state.errorInfo.componentStack.trim().split('\n').slice(0, 10).join('\n')}
                  </pre>
                )}
              </div>
            </details>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Nochmal versuchen
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              App zurücksetzen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
