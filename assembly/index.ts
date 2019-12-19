
export const UINT8ARRAY = idof<Uint8Array>();

function KSA(key: String): Uint8Array {
  const keyArray = new Uint8Array(key.length);

  for (let n = 0; n < keyArray.length; n++) {
    keyArray[n] = <u8>key.charCodeAt(n);
  }

  const S = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    S[i] = <u8>i;
  }

  let j: i32 = 0;

  for (let i = 0; i < 256; i++) {
    j = (j + <i32>S[i] + keyArray[i % keyArray.length]) % 256;

    let tmp: u8 = S[i];
    S[i] = S[j];
    S[j] = tmp;
  }

  return S;
}

function PRGA(buffer: Uint8Array, S: Uint8Array): Uint8Array {
  let i = 0;
  let j = 0;

  for (let n = 0; n < buffer.length; n++) {
    i = (i + 1) % 256;
    j = (j + <i32>S[i]) % 256;

    let tmp: u8 = S[i];
    S[i] = S[j];
    S[j] = tmp;

    let K: u8 = S[(<i32>S[i] + <i32>S[j]) % 256];
    buffer[n] ^= K;
  }

  return buffer;
}

export function RC4(key: String, buffer: Uint8Array): Uint8Array {
  return PRGA(buffer, KSA(key));
}

// vim:ts=2:sw=2:et:syn=typescript:
