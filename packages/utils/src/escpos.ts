export type PrintableReceiptLine = { label: string; value: string };

export type PrintableReceipt = {
  storeName: string;
  subtitle?: string;
  reference: string;
  lines: PrintableReceiptLine[];
  total: string;
  footer?: string;
};

const ESC = 0x1b;
const GS = 0x1d;
const COLUMN_WIDTH = 32;

/** Cheap thermal printers speak ASCII/CP437, not Unicode -- unsupported glyphs (peso sign, emoji) fall back to "?". */
function textToBytes(text: string): number[] {
  return Array.from(text).map((char) => {
    const code = char.codePointAt(0) ?? 63;
    return code < 128 ? code : 63;
  });
}

function textLine(text = ""): number[] {
  return [...textToBytes(text), 0x0a];
}

function twoColumnLine(label: string, value: string, width = COLUMN_WIDTH): string {
  const gap = Math.max(1, width - label.length - value.length);
  return `${label}${" ".repeat(gap)}${value}`;
}

/**
 * Builds raw ESC/POS command bytes for a simple 32-column thermal receipt.
 * This is a print-layout helper only -- no BIR/legal receipt number, VAT
 * fields, or QR payload is included, matching ReceiptPreview.tsx's existing
 * "preview only" contract (those require a server-issued document).
 */
export function buildReceiptEscPos(receipt: PrintableReceipt): Uint8Array {
  const bytes: number[] = [];
  const divider = "-".repeat(COLUMN_WIDTH);

  bytes.push(ESC, 0x40); // initialize printer
  bytes.push(ESC, 0x61, 0x01); // center align
  bytes.push(GS, 0x21, 0x11); // double width + height
  bytes.push(...textLine(receipt.storeName));
  bytes.push(GS, 0x21, 0x00); // back to normal size
  if (receipt.subtitle) bytes.push(...textLine(receipt.subtitle));

  bytes.push(ESC, 0x61, 0x00); // left align
  bytes.push(...textLine(divider));
  bytes.push(...textLine(`Ref: ${receipt.reference}`));
  bytes.push(...textLine(divider));

  for (const item of receipt.lines) {
    bytes.push(...textLine(twoColumnLine(item.label, item.value)));
  }

  bytes.push(...textLine(divider));
  bytes.push(ESC, 0x45, 0x01); // bold on
  bytes.push(...textLine(twoColumnLine("TOTAL", receipt.total)));
  bytes.push(ESC, 0x45, 0x00); // bold off

  if (receipt.footer) {
    bytes.push(...textLine(""));
    bytes.push(ESC, 0x61, 0x01);
    bytes.push(...textLine(receipt.footer));
  }

  bytes.push(...textLine(""));
  bytes.push(...textLine(""));
  bytes.push(GS, 0x56, 0x42, 0x00); // partial cut

  return new Uint8Array(bytes);
}
