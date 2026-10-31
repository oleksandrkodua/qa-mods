export interface Step {
  n: number
  tool: string
  path: string
  diff: string
}

declare module 'claude-code' {
  interface PluginState {
    'replay-theater': { replay: { steps: Step[]; cursor: number } }
  }
}
