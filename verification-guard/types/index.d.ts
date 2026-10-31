export type ClaimKind = 'tests' | 'api' | 'verified' | 'done' | 'safe'

export interface Claim {
  kind: ClaimKind
  quote: string
}

export type EvKind = 'edit' | 'test' | 'http' | 'browser' | 'read' | 'run' | 'other'

export interface Entry {
  n: number
  turn: number
  tool: string
  kind: EvKind
  label: string
  ok: boolean
}

export interface Row {
  claim: Claim
  supported: boolean
  /** why it is unsupported, or what supports it */
  note: string
}

export interface Assessment {
  rows: Row[]
  supported: number
  status: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED'
}

declare module 'claude-code' {
  interface PluginState {
    'verification-guard': {
      history: {
        ledger: Entry[]
        log: { turn: number; a: Assessment }[]
        turn: number
        n: number
      }
    }
  }
}
