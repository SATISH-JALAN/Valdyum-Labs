declare module 'bs58' {
  export function decode(input: string): Uint8Array;
  export function encode(input: Uint8Array): string;
  const bs58: {
    decode: typeof decode;
    encode: typeof encode;
  };
  export default bs58;
}