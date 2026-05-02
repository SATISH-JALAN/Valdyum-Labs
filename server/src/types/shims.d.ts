declare module 'bs58' {
  export function decode(input: string): Uint8Array;
  export function encode(input: Uint8Array): string;
  const bs58: {
    decode: typeof decode;
    encode: typeof encode;
  };
  export default bs58;
}

declare module '@t54-labs/clawcredit-sdk' {
  export class ClawCredit {
    constructor(options: { agentName: string; apiToken?: string });
    register(options: { inviteCode: string; runtimeEnv?: string; model?: string }): Promise<any>;
    pay(options: any): Promise<any>;
    getDashboardLink(): Promise<{ url: string; [key: string]: unknown }>;
    getPrequalificationStatus(): Promise<any>;
    getRepaymentUrgency(): Promise<any>;
    getBalance(): Promise<any>;
    getRepaymentStatus(): Promise<any>;
    getPromotions(): Promise<any>;
    redeemPromotion(code: string): Promise<any>;
    submitPrequalificationContext(options: { runtimeEnv?: string; model?: string }): Promise<any>;
  }

  export function wrapOpenAI<T>(client: T): T;
  export function withTrace<T>(callback: () => Promise<T>): Promise<T>;
}
