// supabase/functions/generate-certificates/index.ts
// Deno Edge Function — generates per-student PDF certificates from exec-uploaded HTML template.
// Invoke via: supabase.functions.invoke('generate-certificates', { body: { eventId, templateUrl } })

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  PDFDocument,
  PDFFont,
  rgb,
  StandardFonts,
} from "https://esm.sh/pdf-lib@1.17.1";

// ── Constants ────────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STORAGE_BUCKET = "certificates";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escape HTML special characters to prevent XSS in template */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Fill all {{PLACEHOLDER}} tokens in the HTML template string */
function fillTemplate(
  html: string,
  replacements: Record<string, string>
): string {
  let result = html;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${key}}}`, htmlEscape(value));
  }
  return result;
}

/** Format a date string to "DD Month YYYY" */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Generate a short uppercase certificate ID */
function makeCertId(eventId: number, userId: string): string {
  const short = userId.replace(/-/g, "").substring(0, 6).toUpperCase();
  return `ISTE-${eventId}-${short}`;
}

// ── PDF Builder ───────────────────────────────────────────────────────────────
// Builds an A4-landscape PDF styled to match the ISTE SCTCE circuit-trace theme.
// This is the primary render path when an external Gotenberg is not configured.

async function buildCertificatePdf(params: {
  studentName: string;
  eventName: string;
  eventDate: string;
  coordinatorName: string;
  chairName: string;
  certificateId: string;
  category: string;
}): Promise<Uint8Array> {
  const {
    studentName,
    eventName,
    eventDate,
    coordinatorName,
    chairName,
    certificateId,
    category,
  } = params;

  // A4 Landscape: 841.89 x 595.28 pt
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Embed standard fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // ── Color palette ──
  const cream = rgb(0.98, 0.96, 0.92);        // #FAF4EB
  const navy = rgb(0.106, 0.165, 0.290);       // #1B2A4A
  const gold = rgb(0.788, 0.635, 0.153);       // #C9A227
  const midGold = rgb(0.9, 0.75, 0.3);
  const lightGold = rgb(0.97, 0.93, 0.80);

  // ── Background ──
  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });

  // ── Outer gold border ──
  const bm = 22; // border margin
  page.drawRectangle({
    x: bm, y: bm,
    width: width - bm * 2, height: height - bm * 2,
    borderColor: gold, borderWidth: 2.5, color: cream,
  });

  // ── Inner thin border ──
  const bm2 = 30;
  page.drawRectangle({
    x: bm2, y: bm2,
    width: width - bm2 * 2, height: height - bm2 * 2,
    borderColor: midGold, borderWidth: 0.75, color: cream,
  });

  // ── Circuit-trace corner ornaments ──
  const drawCircuitCorner = (ox: number, oy: number, flipX = false, flipY = false) => {
    const sx = flipX ? -1 : 1;
    const sy = flipY ? -1 : 1;
    const lines: [number, number, number, number][] = [
      [0, 0, 40, 0],
      [40, 0, 40, -12],
      [40, -12, 60, -12],
      [60, -12, 60, -6],
      [20, 0, 20, -20],
      [20, -20, 8, -20],
      [8, -20, 8, -35],
      [8, -35, 18, -35],
    ];
    for (const [x1, y1, x2, y2] of lines) {
      page.drawLine({
        start: { x: ox + x1 * sx, y: oy + y1 * sy },
        end:   { x: ox + x2 * sx, y: oy + y2 * sy },
        color: gold, thickness: 1.2, opacity: 0.45,
      });
    }
    const dots: [number, number][] = [[40, 0], [20, 0], [8, -35]];
    for (const [dx, dy] of dots) {
      page.drawCircle({ x: ox + dx * sx, y: oy + dy * sy, size: 2.5, color: gold, opacity: 0.6 });
    }
  };

  drawCircuitCorner(bm + 6, height - bm - 6, false, false);
  drawCircuitCorner(width - bm - 6, height - bm - 6, true, false);
  drawCircuitCorner(bm + 6, bm + 6, false, true);
  drawCircuitCorner(width - bm - 6, bm + 6, true, true);

  // ── ISTE SCTCE Header ──
  const cx = width / 2;
  page.drawText("ISTE STUDENT CHAPTER", {
    x: cx - helveticaBold.widthOfTextAtSize("ISTE STUDENT CHAPTER", 11) / 2,
    y: height - 68,
    size: 11, font: helveticaBold, color: gold,
  });
  page.drawText("SREE CHITRA THIRUNAL COLLEGE OF ENGINEERING", {
    x: cx - helvetica.widthOfTextAtSize("SREE CHITRA THIRUNAL COLLEGE OF ENGINEERING", 8.5) / 2,
    y: height - 82,
    size: 8.5, font: helvetica, color: navy, opacity: 0.7,
  });

  // Thin gold rule under header
  page.drawLine({
    start: { x: cx - 120, y: height - 92 },
    end:   { x: cx + 120, y: height - 92 },
    color: gold, thickness: 0.8, opacity: 0.5,
  });

  // ── "CERTIFICATE OF PARTICIPATION" ──
  const certTitle = "CERTIFICATE OF PARTICIPATION";
  page.drawText(certTitle, {
    x: cx - timesBold.widthOfTextAtSize(certTitle, 26) / 2,
    y: height - 138,
    size: 26, font: timesBold, color: navy,
  });

  // ── Category badge ──
  if (category) {
    const catText = category.toUpperCase();
    const catW = helveticaBold.widthOfTextAtSize(catText, 8) + 20;
    page.drawRectangle({
      x: cx - catW / 2, y: height - 162,
      width: catW, height: 16,
      borderColor: gold, borderWidth: 1, color: lightGold, borderOpacity: 0.7,
    });
    page.drawText(catText, {
      x: cx - helveticaBold.widthOfTextAtSize(catText, 8) / 2,
      y: height - 158,
      size: 8, font: helveticaBold, color: navy,
    });
  }

  // ── "This is to certify that" ──
  page.drawText("This is to certify that", {
    x: cx - timesRoman.widthOfTextAtSize("This is to certify that", 13) / 2,
    y: height - 198,
    size: 13, font: timesRoman, color: navy, opacity: 0.6,
  });

  // ── Student name (large, prominent) ──
  const nameSize = studentName.length > 28 ? 28 : 34;
  page.drawText(studentName, {
    x: cx - timesBold.widthOfTextAtSize(studentName, nameSize) / 2,
    y: height - 240,
    size: nameSize, font: timesBold, color: navy,
  });

  // Underline below name
  const nameW = timesBold.widthOfTextAtSize(studentName, nameSize);
  page.drawLine({
    start: { x: cx - nameW / 2 - 10, y: height - 246 },
    end:   { x: cx + nameW / 2 + 10, y: height - 246 },
    color: gold, thickness: 1,
  });

  // ── "has successfully participated in" ──
  const body1 = "has successfully participated in";
  page.drawText(body1, {
    x: cx - timesRoman.widthOfTextAtSize(body1, 13) / 2,
    y: height - 272,
    size: 13, font: timesRoman, color: navy, opacity: 0.6,
  });

  // ── Event name ──
  const evSize = eventName.length > 45 ? 14 : 17;
  page.drawText(eventName, {
    x: cx - timesBold.widthOfTextAtSize(eventName, evSize) / 2,
    y: height - 300,
    size: evSize, font: timesBold, color: navy,
  });

  // ── Date ──
  const dateLabel = `held on ${eventDate}`;
  page.drawText(dateLabel, {
    x: cx - timesRoman.widthOfTextAtSize(dateLabel, 11) / 2,
    y: height - 322,
    size: 11, font: timesRoman, color: navy, opacity: 0.55,
  });

  // ── Gold divider ──
  page.drawLine({
    start: { x: cx - 180, y: height - 348 },
    end:   { x: cx + 180, y: height - 348 },
    color: gold, thickness: 0.6, opacity: 0.4,
  });

  // ── Signature section ──
  const sigY = height - 392;
  const leftSig = cx - 200;
  const rightSig = cx + 130;

  // Coordinator
  page.drawLine({ start: { x: leftSig, y: sigY }, end: { x: leftSig + 140, y: sigY }, color: navy, thickness: 0.5, opacity: 0.4 });
  page.drawText(coordinatorName || "Coordinator", {
    x: leftSig + 70 - helveticaBold.widthOfTextAtSize(coordinatorName || "Coordinator", 9) / 2,
    y: sigY - 14,
    size: 9, font: helveticaBold, color: navy,
  });
  page.drawText("Event Coordinator", {
    x: leftSig + 70 - helvetica.widthOfTextAtSize("Event Coordinator", 7.5) / 2,
    y: sigY - 26,
    size: 7.5, font: helvetica, color: navy, opacity: 0.5,
  });

  // Chair
  page.drawLine({ start: { x: rightSig, y: sigY }, end: { x: rightSig + 140, y: sigY }, color: navy, thickness: 0.5, opacity: 0.4 });
  page.drawText(chairName || "Chapter Chair", {
    x: rightSig + 70 - helveticaBold.widthOfTextAtSize(chairName || "Chapter Chair", 9) / 2,
    y: sigY - 14,
    size: 9, font: helveticaBold, color: navy,
  });
  page.drawText("Chapter Chairperson", {
    x: rightSig + 70 - helvetica.widthOfTextAtSize("Chapter Chairperson", 7.5) / 2,
    y: sigY - 26,
    size: 7.5, font: helvetica, color: navy, opacity: 0.5,
  });

  // ── ISTE logo circle placeholder (center signature area) ──
  page.drawCircle({ x: cx, y: sigY - 8, size: 22, borderColor: gold, borderWidth: 1.5, color: cream });
  page.drawText("ISTE", { x: cx - 8, y: sigY - 12, size: 7, font: helveticaBold, color: gold });

  // ── Certificate ID footer ──
  page.drawText(`Certificate ID: ${certificateId}`, {
    x: cx - helvetica.widthOfTextAtSize(`Certificate ID: ${certificateId}`, 8) / 2,
    y: bm2 + 10,
    size: 8, font: helvetica, color: navy, opacity: 0.35,
  });

  return await pdfDoc.save();
}

// ── Image-Template PDF Builder ──────────────────────────────────────────────
// Builds a PDF from an execom-uploaded background image + coordinate-based
// vector text overlay. Replaces the old client-side html2canvas path.
// Deterministic, server-side, works for real bulk generation.

type FieldConfig = {
  x: number;
  y: number;
  size: number;
  align?: "left" | "center" | "right";
  font?: "Helvetica" | "HelveticaBold" | "TimesRoman" | "TimesRomanBold";
  color?: string; // hex, e.g. "#1B2A4A"
};

async function buildImageCertificatePdf(params: {
  imageUrl: string;
  fieldPositions: Record<string, FieldConfig>;
  fieldValues: Record<string, string>;
}): Promise<Uint8Array> {
  const { imageUrl, fieldPositions, fieldValues } = params;

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to fetch template image: ${imgRes.status} ${imgRes.statusText}`);
  }
  const imgBytes = new Uint8Array(await imgRes.arrayBuffer());

  const pdfDoc = await PDFDocument.create();

  const isPng = /\.png(\?|$)/i.test(imageUrl) ||
    (imgBytes[0] === 0x89 && imgBytes[1] === 0x50); // PNG magic bytes fallback
  const embeddedImage = isPng
    ? await pdfDoc.embedPng(imgBytes)
    : await pdfDoc.embedJpg(imgBytes);

  const { width, height } = embeddedImage.scale(1);
  const page = pdfDoc.addPage([width, height]);
  page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

  const fonts: Record<string, PDFFont> = {
    Helvetica:      await pdfDoc.embedFont(StandardFonts.Helvetica),
    HelveticaBold:  await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    TimesRoman:     await pdfDoc.embedFont(StandardFonts.TimesRoman),
    TimesRomanBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
  };

  for (const [fieldKey, config] of Object.entries(fieldPositions)) {
    const value = fieldValues[fieldKey];
    if (!value) continue;

    const font = fonts[config.font ?? "Helvetica"] ?? fonts.Helvetica;
    let fontSize = config.size;

    // Auto-shrink long text to fit within 80% of page width
    let textWidth = font.widthOfTextAtSize(value, fontSize);
    const maxWidth = width * 0.8;
    while (textWidth > maxWidth && fontSize > 8) {
      fontSize -= 1;
      textWidth = font.widthOfTextAtSize(value, fontSize);
    }

    let drawX = config.x;
    if (config.align === "center") {
      drawX = config.x - textWidth / 2;
    } else if (config.align === "right") {
      drawX = config.x - textWidth;
    }

    const colorHex = config.color ?? "#000000";
    const r = parseInt(colorHex.slice(1, 3), 16) / 255;
    const g = parseInt(colorHex.slice(3, 5), 16) / 255;
    const b = parseInt(colorHex.slice(5, 7), 16) / 255;

    page.drawText(value, {
      x: drawX,
      y: config.y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
    });
  }

  return await pdfDoc.save();
}

// ── Google Slides Presentation Template PDF Builder ─────────────────────────
async function buildGoogleSlidesCertificatePdf(params: {
  slideBytes: Uint8Array;
  slideWidth: number;
  slideHeight: number;
  contentWidth: number;
  isDark: boolean;
  bgR: number;
  bgG: number;
  bgB: number;
  studentName: string;
  fieldPositions?: Record<string, FieldConfig>;
}): Promise<Uint8Array> {
  const {
    slideBytes,
    slideWidth,
    slideHeight,
    contentWidth,
    isDark,
    bgR,
    bgG,
    bgB,
    studentName,
    fieldPositions,
  } = params;

  const pdfDoc = await PDFDocument.create();
  const embeddedImage = await pdfDoc.embedPng(slideBytes);
  const page = pdfDoc.addPage([contentWidth, slideHeight]);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: slideWidth,
    height: slideHeight,
  });

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (fieldPositions && Object.keys(fieldPositions).length > 0 && fieldPositions.student_name) {
    const pos = fieldPositions.student_name;
    let fontSize = pos.size || Math.round(slideHeight * 0.06);
    let textWidth = helveticaBold.widthOfTextAtSize(studentName, fontSize);
    let drawX = pos.x;
    if (pos.align === "center") {
      drawX = pos.x - textWidth / 2;
    } else if (pos.align === "right") {
      drawX = pos.x - textWidth;
    }

    let color = isDark ? rgb(1, 1, 1) : rgb(0.08, 0.12, 0.22);
    if (pos.color && pos.color.startsWith("#")) {
      const r = parseInt(pos.color.slice(1, 3), 16) / 255;
      const g = parseInt(pos.color.slice(3, 5), 16) / 255;
      const b = parseInt(pos.color.slice(5, 7), 16) / 255;
      color = rgb(r, g, b);
    }

    page.drawText(studentName, {
      x: drawX,
      y: pos.y,
      size: fontSize,
      font: helveticaBold,
      color,
    });
  } else {
    // Default dynamic replacement: cover {{student_name}} placeholder and draw name centered
    const eraseH = slideHeight * 0.105;
    const eraseW = contentWidth * 0.60;
    const eraseX = (contentWidth - eraseW) / 2;
    const eraseY = slideHeight * 0.435;

    const eraseColor = isDark
      ? rgb(bgR / 255, bgG / 255, bgB / 255)
      : rgb(0.98, 0.98, 0.98);
    const textColor = isDark ? rgb(1, 1, 1) : rgb(0.08, 0.12, 0.22);

    page.drawRectangle({
      x: eraseX,
      y: eraseY,
      width: eraseW,
      height: eraseH,
      color: eraseColor,
    });

    let fontSize = Math.round(slideHeight * 0.058);
    let textWidth = helveticaBold.widthOfTextAtSize(studentName, fontSize);
    while (textWidth > contentWidth * 0.70 && fontSize > 14) {
      fontSize -= 2;
      textWidth = helveticaBold.widthOfTextAtSize(studentName, fontSize);
    }

    const textX = (contentWidth - textWidth) / 2;
    const textY = eraseY + (eraseH - fontSize) / 2 + 2;

    page.drawText(studentName, {
      x: textX,
      y: textY,
      size: fontSize,
      font: helveticaBold,
      color: textColor,
    });
  }

  return await pdfDoc.save();
}

// ── Main Handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse request body
    const body = (await req.json()) as {
      eventId: number;
      templateUrl?: string;
      chairName?: string;
      coordinatorName?: string;
      forceRegenerate?: boolean;
    };

    const {
      eventId,
      templateUrl,
      chairName: bodyChair,
      coordinatorName: bodyCoord,
      forceRegenerate,
    } = body;

    if (!eventId) {
      return new Response(JSON.stringify({ error: "eventId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Fetch event metadata ──
    const { data: event, error: evErr } = await supabase
      .from("events")
      .select(
        "id, title, date, coordinator_name, chair_name, category, template_url, " +
          "certificate_template_type, certificate_image_url, certificate_field_positions"
      )
      .eq("id", eventId)
      .single();

    if (evErr || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // If new template or execom names are passed, synchronize them to the event
    if (templateUrl || bodyChair || bodyCoord) {
      await supabase
        .from("events")
        .update({
          ...(templateUrl
            ? {
                template_url: templateUrl.trim(),
                certificate_image_url: templateUrl.trim(),
                certificate_template_type: "slides",
              }
            : {}),
          ...(bodyChair ? { chair_name: bodyChair.trim() } : {}),
          ...(bodyCoord ? { coordinator_name: bodyCoord.trim() } : {}),
        })
        .eq("id", eventId);
    }

    const eventTitle      = (event.title as string) ?? "ISTE Event";
    const eventDate       = formatDate((event.date as string) ?? "");
    const coordinatorName = bodyCoord || (event.coordinator_name as string) || "Event Coordinator";
    const chairName       = bodyChair || (event.chair_name as string) || "Chapter Chair";
    const category        = (event.category as string) ?? "General";

    // ── Fetch attendees from attendance table, resolving names from profiles & users ──
    const userMap = new Map<string, string>();

    const { data: attRows } = await supabase
      .from("attendance")
      .select("user_id")
      .eq("event_id", eventId);

    const userIds = Array.from(
      new Set((attRows ?? []).map((r: { user_id: string }) => r.user_id).filter(Boolean))
    );

    if (userIds.length > 0) {
      // 1. Try profiles table
      try {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        for (const p of profs ?? []) {
          if (p.id && p.name && p.name.trim()) {
            userMap.set(p.id, p.name.trim());
          }
        }
      } catch (_) {}

      // 2. Try users table for missing or default names
      const missingUids = userIds.filter(
        (uid) => !userMap.has(uid) || userMap.get(uid) === "Member"
      );
      if (missingUids.length > 0) {
        try {
          const { data: uRows } = await supabase
            .from("users")
            .select("id, name")
            .in("id", missingUids);
          for (const u of uRows ?? []) {
            if (u.id && u.name && u.name.trim()) {
              userMap.set(u.id, u.name.trim());
            }
          }
        } catch (_) {}
      }

      // 3. Ensure all user_ids have an entry
      for (const uid of userIds) {
        if (!userMap.has(uid)) {
          userMap.set(uid, "Member");
        }
      }
    }

    if (userMap.size === 0) {
      return new Response(
        JSON.stringify({
          generated: 0,
          skipped_existing: 0,
          errors: [],
          message: "No attendees found",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Fetch already-issued certificates ──
    const { data: existing } = await supabase
      .from("certificates")
      .select("user_id")
      .eq("event_id", eventId);

    const existingUserIds = new Set(
      (existing ?? []).map((r: { user_id: string }) => r.user_id)
    );

    // If explicit templateUrl or forceRegenerate is set, overwrite existing
    const shouldOverwrite = forceRegenerate || !!templateUrl;

    // ── Dynamic Google Slides Template Preparation ──
    const templateLink =
      (templateUrl as string) ||
      (event.template_url as string) ||
      (event.certificate_image_url as string) ||
      "";

    const slideMatch = templateLink.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    let slideBytes: Uint8Array | null = null;
    let slideWidth = 960;
    let slideHeight = 540;
    let contentWidth = 960;
    let isDark = false;
    let bgR = 0, bgG = 0, bgB = 0;

    if (slideMatch) {
      try {
        const slideId = slideMatch[1];
        const res = await fetch(
          `https://docs.google.com/presentation/d/${slideId}/export/png`
        );
        if (res.ok) {
          slideBytes = new Uint8Array(await res.arrayBuffer());
          const dv = new DataView(
            slideBytes.buffer,
            slideBytes.byteOffset,
            slideBytes.byteLength
          );
          slideWidth = dv.getUint32(16);
          slideHeight = dv.getUint32(20);
          contentWidth = slideWidth;

          try {
            let pos = 8;
            const chunks: Uint8Array[] = [];
            while (pos < slideBytes.length) {
              const len = dv.getUint32(pos);
              const type = String.fromCharCode(
                slideBytes[pos + 4],
                slideBytes[pos + 5],
                slideBytes[pos + 6],
                slideBytes[pos + 7]
              );
              if (type === "IDAT") {
                chunks.push(slideBytes.subarray(pos + 8, pos + 8 + len));
              }
              pos += 8 + len + 4;
            }
            const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
            const merged = new Uint8Array(totalLen);
            let curOff = 0;
            for (const c of chunks) {
              merged.set(c, curOff);
              curOff += c.length;
            }

            const ds = new DecompressionStream("deflate");
            const writer = ds.writable.getWriter();
            writer.write(merged);
            writer.close();
            const decompressed = new Uint8Array(
              await new Response(ds.readable).arrayBuffer()
            );

            const colorType = slideBytes[25];
            const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
            const rowSize = 1 + slideWidth * bytesPerPixel;

            // Check if right edge has white canvas padding
            const cy = Math.floor(slideHeight / 2);
            const rowOff = cy * rowSize;
            const rightPixelOff = rowOff + 1 + (slideWidth - 10) * bytesPerPixel;
            if (
              decompressed[rightPixelOff] > 250 &&
              decompressed[rightPixelOff + 1] > 250 &&
              decompressed[rightPixelOff + 2] > 250
            ) {
              for (let x = slideWidth - 1; x >= 0; x--) {
                let allWhite = true;
                for (const y of [
                  Math.floor(slideHeight * 0.2),
                  Math.floor(slideHeight * 0.5),
                  Math.floor(slideHeight * 0.8),
                ]) {
                  const off = y * rowSize + 1 + x * bytesPerPixel;
                  if (
                    decompressed[off] < 240 ||
                    decompressed[off + 1] < 240 ||
                    decompressed[off + 2] < 240
                  ) {
                    allWhite = false;
                    break;
                  }
                }
                if (!allWhite) {
                  contentWidth = x + 1;
                  break;
                }
              }
            }

            // Sample background color near center of certificate
            const sampleX = Math.floor(contentWidth * 0.25);
            const sampleY = Math.floor(slideHeight * 0.5);
            const sOff = sampleY * rowSize + 1 + sampleX * bytesPerPixel;
            bgR = decompressed[sOff];
            bgG = decompressed[sOff + 1];
            bgB = decompressed[sOff + 2];
            isDark = bgR * 0.299 + bgG * 0.587 + bgB * 0.114 < 128;
          } catch (e) {
            console.warn("PNG decompression inspection note:", e);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Google Slides export:", err);
      }
    }

    // ── Generate per attendee ──
    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [userId, studentName] of userMap.entries()) {
      if (existingUserIds.has(userId) && !shouldOverwrite) {
        skipped++;
        continue;
      }

      try {
        const certId      = makeCertId(eventId, userId);
        const storagePath = `${eventId}/${userId}.pdf`;
        let   certUrl     = "";
        let   pdfBytes: Uint8Array;

        if (slideBytes) {
          // Dynamic Google Slides presentation template path
          pdfBytes = await buildGoogleSlidesCertificatePdf({
            slideBytes,
            slideWidth,
            slideHeight,
            contentWidth,
            isDark,
            bgR,
            bgG,
            bgB,
            studentName,
            fieldPositions: event.certificate_field_positions as Record<string, FieldConfig>,
          });
        } else if (
          event.certificate_template_type === "image" &&
          event.certificate_image_url
        ) {
          // Image template + coordinate overlay
          const fieldPositions =
            (event.certificate_field_positions as Record<string, FieldConfig>) ?? {};
          const fieldValues: Record<string, string> = {
            student_name:     studentName,
            event_name:       eventTitle,
            event_date:       eventDate,
            certificate_id:   certId,
            coordinator_name: coordinatorName,
            chair_name:       chairName,
          };
          pdfBytes = await buildImageCertificatePdf({
            imageUrl: event.certificate_image_url as string,
            fieldPositions,
            fieldValues,
          });
        } else {
          // Standard built-in circuit certificate fallback
          pdfBytes = await buildCertificatePdf({
            studentName,
            eventName: eventTitle,
            eventDate,
            coordinatorName,
            chairName,
            certificateId: certId,
            category,
          });
        }

        const { error: uploadErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadErr) {
          errors.push(`Upload failed for ${userId}: ${uploadErr.message}`);
          continue;
        }

        const { data: pubUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        certUrl = pubUrlData?.publicUrl ?? "";

        // ── Upsert certificate row (updating existing if overwriting) ──
        const { error: upsertErr } = await supabase.from("certificates").upsert(
          {
            event_id:        eventId,
            user_id:         userId,
            student_name:    studentName,
            certificate_url: certUrl,
            storage_path:    storagePath,
            issued_at:       new Date().toISOString(),
            title:           `Certificate of Participation — ${eventTitle}`,
            description:     `Awarded for attending ${eventTitle} on ${eventDate}`,
            file_url:        certUrl,
          },
          { onConflict: "event_id,user_id" }
        );

        if (upsertErr) {
          errors.push(`DB upsert failed for ${userId}: ${upsertErr.message}`);
          continue;
        }

        generated++;
      } catch (e) {
        errors.push(`Error for ${userId}: ${String(e)}`);
      }
    }

    // ── Mark event attendance as finalized ──
    await supabase
      .from("events")
      .update({ attendance_finalized: true })
      .eq("id", eventId);

    return new Response(
      JSON.stringify({
        generated,
        skipped_existing: skipped,
        total: userMap.size,
        errors,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

