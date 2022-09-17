import BN from "bn.js";
import { seq, struct, u32, u8, offset } from "buffer-layout";
import { publicKeyLayout, setLayoutDecoder, u128, u64 } from "./base";
import { PublicKey } from "@solana/web3.js";

const OB_HEADER_LAYOUT = struct([u8("flag"), u32("len")], "header");

const ORDER_LAYOUT = struct([
  u128("key"), // (price, seqNum)
  publicKeyLayout("owner"), // Market user account
  u64("quantity"), // In units of lot size
  u64("clientOrderId"),
  u8("feeTier"),
  u64("total"),
]);

export const OB_LAYOUT = struct([
  OB_HEADER_LAYOUT,
  seq(
    ORDER_LAYOUT,
    offset(OB_HEADER_LAYOUT.layoutFor("len"), OB_HEADER_LAYOUT.offsetOf("len") - OB_HEADER_LAYOUT.span),
    "nodes",
  ),
]);

export interface Order {
  key: BN;
  owner: PublicKey;
  quantity: BN;
  feeTier: number;
  clientOrderId: BN;
  total: BN;
}

export class OrderBook {
  private header: any;
  nodes: any;

  constructor(header, nodes) {
    this.header = header;
    this.nodes = nodes || [];
  }

  get isDescending() {
    return this.header.flag == 1 ? true : false;
  }

  static decode(buffer: Buffer): OrderBook {
    return OB_LAYOUT.decode(buffer);
  }

  static getPriceFromKey(key: BN) {
    return key.ushrn(64);
  }

  get(searchKey: BN | number): Order | null {
    return this.nodes.find((n) => n.key.eq(searchKey));
  }

  get items(): Order[] {
    return this.nodes;
  }

  allItems(descending = false): Order[] {
    return descending != this.isDescending ? this.nodes.slice().reverse() : this.nodes;
  }

  find(clientOrderId: BN | number): Order | null {
    if (!(clientOrderId instanceof BN)) {
      clientOrderId = new BN(clientOrderId);
    }
    return this.nodes.find((n) => n.clientOrderId.eq(clientOrderId));
  }

  findMinMax(isMax: boolean): Order | null {
    return this.allItems(isMax)[0] || null;
  }
}

setLayoutDecoder(OB_LAYOUT, ({ header, nodes }) => new OrderBook(header, nodes));
export const ORDER_SIZE = ORDER_LAYOUT.span as number;
