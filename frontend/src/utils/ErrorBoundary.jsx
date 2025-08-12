import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 ErrorBoundary caught an error:", error, errorInfo);
    console.info("📝 Clear message:", error.message);

    // Optional: Send error to your logging service
    // logErrorToService({ error, errorInfo });
    
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      return (
        <div style={{ padding: 20, textAlign: "center", color: "#b00" }}>
          <h2>⚠ Oops! Something went wrong.</h2>
          <p>
            We encountered an unexpected issue.  
            Try refreshing the page or going back to the homepage.
          </p>

          {/* Friendly message for normal users */}
          <pre style={{
            background: "#ffeaea",
            padding: "10px",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            fontSize: "14px",
            textAlign: "left"
          }}>
            {error?.message}
          </pre>

          {/* Developer-friendly debug info */}
          {errorInfo && (
            <details style={{
              marginTop: "10px",
              textAlign: "left",
              background: "#f9f9f9",
              padding: "10px",
              borderRadius: "5px",
              fontSize: "13px",
              whiteSpace: "pre-wrap"
            }}>
              <summary>Technical Details</summary>
              {error?.toString()}
              <br />
              {errorInfo.componentStack}
            </details>
          )}

          <div style={{ marginTop: "15px" }}>
            <button onClick={this.handleRetry}>🔄 Retry</button>
            <button onClick={() => (window.location.href = "/")}>
              🏠 Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
