// SERVER-ONLY. Makes one private copy of a PDF for one buyer: their email is printed faintly on every page
// (so a leaked copy can be traced) and the file is locked with a password (AES-256) that only they get.
import { randomBytes, randomInt } from "crypto";
import { PDFArray, PDFDocument, PDFName, PDFRawStream, StandardFonts, decodePDFRawStream, degrees, rgb, type PDFPage } from "@cantoo/pdf-lib";

// no 0/O/1/l/I so the password is easy to read out and type
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makePdfPassword(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

// Gary's source PDFs already carry a big "garybookshelf" mark made with a 7% fill opacity. Some phone PDF viewers ignore that
// opacity and draw it solid black over the text (a buyer's screenshot, 15 Nov 2026), while the same viewers draw our own pdf-lib text
// correctly. So the source mark is switched off (text render mode 3 = invisible, which every viewer honours) and drawn again
// with the same look by pdf-lib. If a page does not look like the expected source, it is left exactly as it was.
function readPageContent(doc: PDFDocument, page: PDFPage): Uint8Array | null {
  const parts: Uint8Array[] = [];
  const collect = (obj: unknown): boolean => {
    const resolved = doc.context.lookup(obj as never);
    if (resolved instanceof PDFArray) {
      for (let i = 0; i < resolved.size(); i++) if (!collect(resolved.get(i))) return false;
      return true;
    }
    if (resolved instanceof PDFRawStream) {
      parts.push(decodePDFRawStream(resolved).decode());
      return true;
    }
    return false;
  };
  const contents = page.node.Contents();
  if (!contents || !collect(contents)) return null;
  const total = parts.reduce((n, p) => n + p.length + 1, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
    out[at++] = 10; // a newline between streams, as a reader would see them
  }
  return out;
}

// Returns true when the page's big watermark (the last text block, set in 96-unit type) was found and switched off.
function hideSourceWatermark(doc: PDFDocument, page: PDFPage): boolean {
  try {
    const bytes = readPageContent(doc, page);
    if (!bytes) return false;
    const text = Buffer.from(bytes).toString("latin1");
    const found = [...text.matchAll(/\/F\d+ 96 Tf/g)];
    const last = found[found.length - 1];
    if (!last || last.index === undefined || last.index < text.length - 3000) return false;
    const cut = last.index + last[0].length;
    const patched = text.slice(0, cut) + " 3 Tr" + text.slice(cut);
    const ref = doc.context.register(doc.context.flateStream(Buffer.from(patched, "latin1")));
    page.node.set(PDFName.of("Contents"), ref);
    return true;
  } catch (e) {
    console.error("could not switch off the source watermark", e);
    return false;
  }
}

export async function personalizePdf(source: Uint8Array, email: string, password: string, orderId = ""): Promise<Uint8Array> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: false });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  // standard fonts only know basic Latin, so anything else in the email is dropped from the watermark
  const label = email.replace(/[^\x20-\x7E]/g, "");

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();

    // the big brand mark: the source's own one is switched off and redrawn in the same place, faint, black, tilted like the original
    if (hideSourceWatermark(doc, page)) {
      const mark = "garybookshelf";
      const unit = boldFont.widthOfTextAtSize(mark, 1);
      const angle = (35 * Math.PI) / 180;
      const markSize = (width * 0.85) / Math.cos(angle) / unit; // spans about 85% of the page width along its tilt
      const markWidth = boldFont.widthOfTextAtSize(mark, markSize);
      page.drawText(mark, {
        x: width / 2 - (markWidth / 2) * Math.cos(angle) + (markSize * 0.3) * Math.sin(angle),
        y: height / 2 - (markWidth / 2) * Math.sin(angle) - (markSize * 0.3) * Math.cos(angle),
        size: markSize,
        font: boldFont,
        color: rgb(0, 0, 0),
        opacity: 0.08,
        rotate: degrees(35),
      });
    }

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
