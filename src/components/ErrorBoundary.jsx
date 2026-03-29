import { Component } from 'react';

/**
 * Error Boundary — catches render crashes and offers recovery.
 * Without this, any React error results in a permanent white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SchoolSync] Render crash:', error, errorInfo);
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
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px' }}>
            Keine Sorge — das passiert manchmal. Probier es nochmal oder setze die App zurück.
          </p>
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
