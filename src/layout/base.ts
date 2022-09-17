// @ts-nocheck

import { Blob } from "buffer-layout";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

class PublicKeyLayout extends Blob {
  constructor(property) {
    super(32, property);
  }

  decode(b, offset) {
    return new PublicKey(super.decode(b, offset));
  }

  encode(src, b, offset) {
    return super.encode(src.toBuffer(), b, offset);
  }
}

export function publicKeyLayout(property) {
  return new PublicKeyLayout(property);
}

class BNLayout extends Blob {
  decode(b, offset) {
    return new BN(super.decode(b, offset), 10, "le");
  }

  encode(src, b, offset) {
    return super.encode(src.toArrayLike(Buffer, "le", this.span), b, offset);
  }
}

export function u64(property) {
  return new BNLayout(8, property);
}

export function u128(property) {
  return new BNLayout(16, property);
}

export function accountFlagsLayout(property = "accountFlags") {
  return ACCOUNT_FLAGS_LAYOUT.replicate(property);
}

export function setLayoutDecoder(layout, decoder) {
  const originalDecode = layout.decode;
  layout.decode = function decode(b, offset = 0) {
    return decoder(originalDecode.call(this, b, offset));
  };
}

export function setLayoutEncoder(layout, encoder) {
  const originalEncode = layout.encode;
  layout.encode = function encode(src, b, offset) {
    return originalEncode.call(this, encoder(src), b, offset);
  };
  return layout;
}
