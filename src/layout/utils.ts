import { seq } from "buffer-layout";
import { PublicKey } from "@solana/web3.js";

import { u64 } from "./base";
import { BN } from "@project-serum/anchor";

const PublicKeyAlignedBytesLayout = seq(u64(""), 4);

export function publicKeyToAlignedBytes(pubkey: PublicKey): BN[] {
  return PublicKeyAlignedBytesLayout.decode(pubkey.toBuffer());
}

export function publicKeyComparator(a: PublicKey, b: PublicKey) {
  const aa = publicKeyToAlignedBytes(a);
  const bb = publicKeyToAlignedBytes(b);
  for (const i in aa) {
    const diff = aa[i].sub(bb[i]);
    if (!diff.isZero()) {
      return Number(diff.toString());
    }
  }
  return 0;
}
