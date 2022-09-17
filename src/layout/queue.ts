import BN from "bn.js";
import { seq, struct, u32, u8, offset } from "buffer-layout";
import { publicKeyLayout, setLayoutDecoder, u128, u64 } from "./base";
import { PublicKey } from "@solana/web3.js";

const EVENT_ITEM_LAYOUT = struct([
  u8("flag"),
  u8("fee_tier"),
  seq(u8(), 6), // padding
  u128("key"),
  publicKeyLayout("owner"),
  u64("quantity"),
  u64("total"),
]);

const QUEUE_LEN = u32("len");

export const EVENT_QUEUE_LAYOUT = struct([
  u64("flag"),
  QUEUE_LEN,
  seq(u8(), 4), // padding
  seq(EVENT_ITEM_LAYOUT, offset(QUEUE_LEN, -8), "items"),
]);

export interface EventItem {
  key: BN;
  owner: PublicKey;
  quantity: BN;
}

export class EventQueue {
  private len: any;
  items: EventItem[];

  constructor(len, items) {
    this.len = len;
    this.items = items;
  }

  allItems(): EventItem[] {
    return this.items;
  }

  get length() {
    return this.len;
  }

  static decode(buffer: Buffer): EventQueue {
    return EVENT_QUEUE_LAYOUT.decode(buffer);
  }
}

setLayoutDecoder(EVENT_QUEUE_LAYOUT, ({ len, items }) => new EventQueue(len, items));
