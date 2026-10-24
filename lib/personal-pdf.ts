// SERVER-ONLY. Makes one private copy of a PDF for one buyer: their email is printed faintly on every page
// (so a leaked copy can be traced) and the file is locked with a password (AES-256) that only they get.
import { randomBytes, randomInt } from "crypto";
import { PDFDocument, StandardFonts, degrees, rgb } from "@cantoo/pdf-lib";

// no 0/O/1/l/I so the password is easy to read out and type
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makePdfPassword(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export async function personalizePdf(source: Uint8Array, email: string, password: string, orderId = ""): Promise<Uint8Array> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: false });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  // standard fonts only know basic Latin, so anything else in the email is dropped from the watermark
  const label = email.replace(/[^\x20-\x7E]/g, "");

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();

    const big = `Licensed to ${label}`;
    const size = Math.max(14, Math.min(36, (width * 0.8) / (big.length * 0.5)));
    const textWidth = font.widthOfTextAtSize(big, size);
    // centred on the page, tilted, light enough not to get in the way of reading
    page.drawText(big, {
      x: width / 2 - (textWidth / 2) * Math.cos(Math.PI / 6),
      y: height / 2 - (textWidth / 2) * Math.sin(Math.PI / 6),
      size,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.16,
      rotate: degrees(30),
    });

    // Gary's mark (so the notes are always credited to him) and who the copy belongs to
    const brand = "garybookshelf  |  @gary_bookshelf";
    page.drawText(brand, { x: 24, y: 26, size: 9, font, color: rgb(0.55, 0.28, 0.15), opacity: 0.7 });
    page.drawText(`For ${label} only. Do not share.`, { x: 24, y: 14, size: 8, font, color: rgb(0.4, 0.4, 0.4), opacity: 0.55 });

    // tiny, very faint order code in the top corner: lets Gary trace a leak even if the footer is cropped out
    if (orderId) page.drawText(orderId, { x: width - 190, y: height - 10, size: 4, font, color: rgb(0.5, 0.5, 0.5), opacity: 0.18 });
  }

  doc.setProducer("garybookshelf");
  doc.setCreator("garybookshelf (@gary_bookshelf)");
  if (orderId) doc.setSubject(`licensed:${orderId}`);

  doc.encrypt({
    userPassword: password,
    ownerPassword: randomBytes(18).toString("hex"),
    permissions: { printing: "lowResolution", modifying: false, copying: false, annotating: false, fillingForms: false },
  });

  return doc.save();
}
