export type Remark = string

declare module 'claude-code' {
  interface PluginState {
    handoff: {
      // the Clippy's current random remark; empty while it is quiet
      remark: string
    }
  }
}
