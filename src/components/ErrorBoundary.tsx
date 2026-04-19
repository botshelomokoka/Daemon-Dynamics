import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('UNCAUGHT_SYSTEM_ERROR:', error, errorInfo);
    
    let detailedInfo = null;
    try {
      if (error.message.startsWith('{')) {
        const parsed = JSON.parse(error.message);
        detailedInfo = JSON.stringify(parsed, null, 2);
      }
    } catch (e) {}

    this.setState({
      errorInfo: detailedInfo || error.stack || null
    });
  }

  private handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-mono text-zinc-300">
          <div className="max-w-2xl w-full border border-red-500/30 bg-red-500/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="w-24 h-24 text-red-500" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-none bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <Terminal className="text-red-500 w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tighter uppercase font-mono">Kernel_Panic // System_Crash</h1>
                <p className="text-[10px] text-red-400 font-mono uppercase tracking-widest">Error_Context: Hardware_Sovereign_OS</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-black border border-white/5 font-mono text-xs overflow-auto max-h-[300px] leading-relaxed">
                <div className="text-red-400 mb-2 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  ERROR_LOG_STREAM:
                </div>
                <pre className="whitespace-pre-wrap break-all text-zinc-400">
                  {this.state.error?.message || 'Unknown kernel exception'}
                  {this.state.errorInfo && `\n\n--- DETAILED_TRACE ---\n${this.state.errorInfo}`}
                </pre>
              </div>
              <p className="text-[11px] text-zinc-500 italic">
                The Sovereign OS has encountered an unrecoverable state. Critical data shards have been locked to prevent corruption.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={this.handleReset}
                className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs rounded-none px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                INITIATE_REBOOT
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="border-zinc-800 text-zinc-500 font-mono text-xs rounded-none"
              >
                RETURN_TO_BASE
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
