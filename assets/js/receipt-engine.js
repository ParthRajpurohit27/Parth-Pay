// ============================================================================
// PARTH RAJPUROHIT OFFICIAL DIGITAL RECEIPT GENERATOR (PNG & PDF)
// Includes Gold Seal, Signature, Bank Route, and clickable/printed promotions
// for aviorcart.vercel.app & parth27.vercel.app
// ============================================================================

async function generateOfficialReceipt({ user, ledgerList, summary, format = "png" }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");

  // 1. Background Obsidian & Gold Luxury Frame
  const bgGrad = ctx.createLinearGradient(0, 0, 1000, 1350);
  bgGrad.addColorStop(0, "#08090d");
  bgGrad.addColorStop(0.5, "#121008");
  bgGrad.addColorStop(1, "#06070a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1000, 1350);

  // Outer Gold Border
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 940, 1290);

  // Inner Filigree Border
  ctx.strokeStyle = "rgba(255, 215, 0, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(44, 44, 912, 1262);

  // Header Crest & Title
  ctx.fillStyle = "#FFD700";
  ctx.font = "800 34px 'Syne', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SOVEREIGN VAULT STATEMENT & RECEIPT", 500, 105);

  ctx.fillStyle = "#00FF87";
  ctx.font = "600 16px 'JetBrains Mono', monospace";
  ctx.fillText("ISSUED BY PARTH RAJPUROHIT • VERIFIED CRYPTOGRAPHIC LEDGER", 500, 140);

  // Divider
  ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
  ctx.beginPath();
  ctx.moveTo(80, 170);
  ctx.lineTo(920, 170);
  ctx.stroke();

  // Client Details Box
  ctx.textAlign = "left";
  ctx.fillStyle = "#9BA1AB";
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  ctx.fillText("ACCOUNT HOLDER (LOCKED REAL NAME):", 80, 215);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 24px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(user.real_name || "Valued Client", 80, 248);

  ctx.fillStyle = "#9BA1AB";
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  ctx.fillText(`USERNAME: @${user.username}   |   PHONE: ${user.phone}`, 80, 280);

  ctx.textAlign = "right";
  ctx.fillStyle = "#FFD700";
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  ctx.fillText(`STATEMENT ID: #PR-${Date.now().toString().slice(-6)}`, 920, 215);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`DATE: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`, 920, 248);
  ctx.fillStyle = "#00FF87";
  ctx.fillText("PAYEE: PARTH RAJPUROHIT", 920, 280);

  // Financial Summary Cards
  const cards = [
    { label: "TOTAL ALLOCATED", val: `INR ${summary.total.toFixed(2)}`, color: "#FFFFFF", x: 80 },
    { label: "TOTAL PAID", val: `INR ${summary.paid.toFixed(2)}`, color: "#00FF87", x: 375 },
    { label: "PENDING BALANCE", val: `INR ${summary.pending.toFixed(2)}`, color: "#FFD700", x: 670 }
  ];

  cards.forEach(c => {
    ctx.fillStyle = "rgba(255, 215, 0, 0.06)";
    ctx.strokeStyle = "rgba(255, 215, 0, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(c.x, 315, 250, 95);
    ctx.strokeRect(c.x, 315, 250, 95);

    ctx.textAlign = "left";
    ctx.fillStyle = "#9BA1AB";
    ctx.font = "600 13px 'JetBrains Mono', monospace";
    ctx.fillText(c.label, c.x + 18, 348);

    ctx.fillStyle = c.color;
    ctx.font = "800 22px 'JetBrains Mono', monospace";
    ctx.fillText(c.val, c.x + 18, 386);
  });

  // Table Header
  ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
  ctx.fillRect(80, 445, 840, 44);
  ctx.fillStyle = "#FFD700";
  ctx.font = "700 14px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("DATE", 100, 472);
  ctx.fillText("DESCRIPTION / NOTE", 240, 472);
  ctx.fillText("BANK CHANNEL", 560, 472);
  ctx.fillText("STATUS", 720, 472);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", 900, 472);

  // Table Rows (Up to 10 most recent entries)
  let y = 525;
  const rows = ledgerList.slice(0, 10);
  rows.forEach((item, idx) => {
    if (idx % 2 === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.fillRect(80, y - 28, 840, 40);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "500 14px 'JetBrains Mono', monospace";
    ctx.fillText(item.entry_date || "-", 100, y);
    ctx.fillText((item.note || "Vault Entry").slice(0, 30), 240, y);
    ctx.fillStyle = "#FFD700";
    ctx.fillText(item.bank_target === "kotak" ? "KOTAK BANK" : "FAMPAY UPI", 560, y);
    ctx.fillStyle = item.status === "paid" ? "#00FF87" : "#FF2A54";
    ctx.fillText(item.status.toUpperCase(), 720, y);

    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 15px 'JetBrains Mono', monospace";
    ctx.fillText(`INR ${Number(item.amount).toFixed(2)}`, 900, y);
    y += 42;
  });

  // Official Stamp & Signature of Parth Rajpurohit
  const sealY = 1020;
  // Circular Gold Wax Seal
  ctx.save();
  ctx.translate(220, sealY);
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 62, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#FFD700";
  ctx.font = "800 13px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL SEAL", 0, -24);
  ctx.font = "800 18px 'Syne', sans-serif";
  ctx.fillText("PARTH", 0, 2);
  ctx.fillText("RAJPUROHIT", 0, 22);
  ctx.fillStyle = "#00FF87";
  ctx.font = "700 11px 'JetBrains Mono', monospace";
  ctx.fillText("VERIFIED AUTHENTIC", 0, 44);
  ctx.restore();

  // Digital Signature Block
  ctx.textAlign = "right";
  ctx.fillStyle = "#FFD700";
  ctx.font = "italic 36px Georgia, serif";
  ctx.fillText("Parth Rajpurohit", 890, sealY - 5);

  ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
  ctx.beginPath();
  ctx.moveTo(620, sealY + 12);
  ctx.lineTo(900, sealY + 12);
  ctx.stroke();

  ctx.fillStyle = "#9BA1AB";
  ctx.font = "600 13px 'JetBrains Mono', monospace";
  ctx.fillText("AUTHORIZED SIGNATORY • PARTH RAJPUROHIT", 890, sealY + 35);
  ctx.fillText("UPI: 9672920018@fam  |  parthrajpurohit@kotakbank", 890, sealY + 55);

  // Promotional Banner Footer (aviorcart.vercel.app & parth27.vercel.app)
  ctx.fillStyle = "rgba(255, 215, 0, 0.12)";
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 1.5;
  ctx.fillRect(80, 1145, 840, 125);
  ctx.strokeRect(80, 1145, 840, 125);

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFD700";
  ctx.font = "800 18px 'Syne', sans-serif";
  ctx.fillText("EXPLORE PARTH RAJPUROHIT'S OFFICIAL DIGITAL ECOSYSTEM", 500, 1182);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  ctx.fillText("Premium E-Commerce Storefront: https://aviorcart.vercel.app", 500, 1215);
  ctx.fillStyle = "#00FF87";
  ctx.fillText("Official Developer Portfolio: https://parth27.vercel.app", 500, 1245);

  const fileName = `Parth_Rajpurohit_Receipt_${(user.username || "Client")}_${Date.now().toString().slice(-4)}`;

  if (format === "pdf" && window.jspdf) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [1000, 1350] });
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 1000, 1350);
    // Add clickable promotional links inside the PDF
    pdf.link(80, 1195, 840, 30, { url: "https://aviorcart.vercel.app" });
    pdf.link(80, 1225, 840, 35, { url: "https://parth27.vercel.app" });
    pdf.save(`${fileName}.pdf`);
  } else {
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
}

window.generateOfficialReceipt = generateOfficialReceipt;
