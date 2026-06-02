import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-sm text-destructive">Algo deu errado nesta seção.</p>
          <button
            className="text-sm text-primary underline underline-offset-2 hover:opacity-80"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-w-lg rounded bg-muted p-3 text-left text-xs text-muted-foreground whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
