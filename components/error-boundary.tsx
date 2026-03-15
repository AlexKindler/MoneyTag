"use client"

import React from "react"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-background px-4">
          <div className="flex items-center gap-3 border border-destructive bg-destructive/10 px-6 py-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <h2 className="font-mono text-sm font-bold text-destructive">SYSTEM ERROR</h2>
              <p className="font-mono text-[10px] text-destructive/80">
                Something went wrong rendering this view.
              </p>
            </div>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="border border-primary bg-primary/10 px-4 py-2 font-mono text-xs text-primary transition-colors hover:bg-primary/20"
          >
            RETRY
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
