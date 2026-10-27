export type Remark = string

declare module 'claude-code' {
  interface PluginState {
    handoff: {
      // the Clippy's current random remark; empty while it is quiet
      remark: string
      // the chosen helper (clippy, wizard, dog, cat), read from $.store; empty before the first read
      who: string
      // the behaviour the helper plays for a few seconds; empty when none
      behavior: string
    }
  }
}
