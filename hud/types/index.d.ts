export type Limit = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    hud: {
      limits: Limit[]
      usd: number | null
      // true while the limits shown were saved by an earlier session and no reply has refreshed them
      stale: boolean
      // epoch ms of the last finished turn; 0 before the first
      lastReplyAt: number
      // bumped every second while the cache countdown runs
      tick: number
      // context fill, percent, from the last measurement
      ctx: number
      // the limit windows show the time to their reset instead of the percent
      showTimes: boolean
    }
  }
}
