import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-500 max-w-md mb-8">
            An unexpected error occurred while rendering the application. 
            {this.state.error?.message && <span className="block mt-2 font-mono text-xs bg-white border border-slate-200 p-2 rounded text-red-600">{this.state.error.message}</span>}
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-medium flex items-center gap-2 transition-colors border border-slate-300 shadow-sm"
          >
            <RefreshCw size={18} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;