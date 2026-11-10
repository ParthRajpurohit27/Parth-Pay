// ============================================================================
// PARTH RAJPUROHIT SOVEREIGN VAULT - CORE ENGINE & SUPABASE SYNC
// ============================================================================

const VAULT_CONFIG = {
  ownerPhone: "9672910018",
  payeeName: "Parth Rajpurohit",
  banks: {
    fampay: {
      code: "fampay",
      label: "FamPay Sovereign",
      upiId: "9672920018@fam",
      badge: "FAMPAY • 9672920018@fam"
    },
    kotak: {
      code: "kotak",
      label: "Kotak Mahindra Bank",
      upiId: "parthrajpurohit@kotakbank",
      badge: "KOTAK • parthrajpurohit@kotakbank"
    }
  },
  links: {
    portfolio: "https://parth27.vercel.app",
    store: "https://aviorcart.vercel.app"
  },
  // Pre-wired for instant Supabase connection or seamless LocalVault fallback
  supabaseUrl: localStorage.getItem("PARTH_SB_URL") || "",
  supabaseAnonKey: localStorage.getItem("PARTH_SB_KEY") || ""
};

class SovereignDatabase {
  constructor() {
    this.sb = null;
    this.initSupabase();
    this.ensureLocalSeed();
  }

  initSupabase() {
    const url = localStorage.getItem("PARTH_SB_URL") || VAULT_CONFIG.supabaseUrl;
    const key = localStorage.getItem("PARTH_SB_KEY") || VAULT_CONFIG.supabaseAnonKey;
    if (url && key && window.supabase) {
      try {
        this.sb = window.supabase.createClient(url, key);
      } catch (e) {
        console.warn("Supabase fallback to Local Storage mirror:", e);
      }
    }
  }

  saveCredentials(url, key) {
    localStorage.setItem("PARTH_SB_URL", url.trim());
    localStorage.setItem("PARTH_SB_KEY", key.trim());
    this.initSupabase();
  }

  ensureLocalSeed() {
    if (!localStorage.getItem("PARTH_PROFILES")) {
      const initialProfiles = [
        {
          id: "owner-root-27",
          phone: "9672910018",
          email: "owner@parthvault.local",
          real_name: "Parth Rajpurohit",
          username: "parth_kingpin",
          role: "owner",
          passcode: "admin27",
          created_at: new Date().toISOString()
        },
        {
          id: "usr-aarav-01",
          phone: "9876543210",
          email: "aarav@client.local",
          real_name: "Aarav Sharma",
          username: "aarav_sharma",
          role: "user",
          passcode: "1234",
          created_at: new Date().toISOString()
        },
        {
          id: "usr-kabir-02",
          phone: "9123456780",
          email: "kabir@client.local",
          real_name: "Kabir Verma",
          username: "kabir_x",
          role: "user",
          passcode: "1234",
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem("PARTH_PROFILES", JSON.stringify(initialProfiles));
    }

    if (!localStorage.getItem("PARTH_LEDGER")) {
      const today = new Date().toISOString().split("T")[0];
      const sampleLedger = [
        {
          id: "led-101",
          user_id: "usr-aarav-01",
          amount: 2450.50,
          entry_date: today,
          note: "Project Server & Drop Settlement",
          bank_target: "fampay",
          status: "unpaid",
          created_at: new Date().toISOString()
        },
        {
          id: "led-102",
          user_id: "usr-aarav-01",
          amount: 1200.00,
          entry_date: today,
          note: "Initial Retainer Tranche",
          bank_target: "kotak",
          status: "paid",
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: "led-103",
          user_id: "usr-kabir-02",
          amount: 850.75,
          entry_date: today,
          note: "AVIORCART Bulk Fulfillment",
          bank_target: "fampay",
          status: "unpaid",
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem("PARTH_LEDGER", JSON.stringify(sampleLedger));
    }

    if (!localStorage.getItem("PARTH_REQUESTS")) {
      const sampleRequests = [
        {
          id: "req-501",
          user_id: "usr-aarav-01",
          amount: 450.50,
          bank_target: "fampay",
          request_type: "partial",
          utr_reference: "UPI-41982371982",
          status: "pending",
          visible_to_user: true,
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem("PARTH_REQUESTS", JSON.stringify(sampleRequests));
    }
  }

  // --- PROFILES ---
  async getProfiles() {
    if (this.sb) {
      const { data, error } = await this.sb.from("profiles").select("*").order("created_at", { ascending: true });
      if (!error && data) {
        localStorage.setItem("PARTH_PROFILES", JSON.stringify(data));
        return data;
      }
    }
    return JSON.parse(localStorage.getItem("PARTH_PROFILES") || "[]");
  }

  async findUserByIdentifier(identifier) {
    const clean = identifier.trim().toLowerCase();
    const profiles = await this.getProfiles();
    return profiles.find(
      p => p.phone === clean || (p.email && p.email.toLowerCase() === clean) || (p.username && p.username.toLowerCase() === clean)
    );
  }

  async createUser({ phone, email, real_name, username, passcode }) {
    const newProfile = {
      id: crypto.randomUUID ? crypto.randomUUID() : "usr-" + Date.now(),
      phone: phone.trim(),
      email: (email || `${phone.trim()}@parthvault.local`).trim(),
      real_name: real_name.trim(),
      username: (username || real_name.toLowerCase().replace(/\s+/g, "_")).trim(),
      role: phone.trim() === VAULT_CONFIG.ownerPhone ? "owner" : "user",
      passcode: (passcode || "1234").trim(),
      created_at: new Date().toISOString()
    };

    if (this.sb) {
      const { data, error } = await this.sb.from("profiles").insert([newProfile]).select().single();
      if (!error && data) {
        const list = JSON.parse(localStorage.getItem("PARTH_PROFILES") || "[]");
        list.push(data);
        localStorage.setItem("PARTH_PROFILES", JSON.stringify(list));
        return data;
      }
    }

    const list = JSON.parse(localStorage.getItem("PARTH_PROFILES") || "[]");
    list.push(newProfile);
    localStorage.setItem("PARTH_PROFILES", JSON.stringify(list));
    return newProfile;
  }

  async updateUsername(userId, newUsername) {
    if (this.sb) {
      await this.sb.from("profiles").update({ username: newUsername, updated_at: new Date().toISOString() }).eq("id", userId);
    }
    const list = JSON.parse(localStorage.getItem("PARTH_PROFILES") || "[]");
    const idx = list.findIndex(u => u.id === userId);
    if (idx !== -1) {
      list[idx].username = newUsername;
      localStorage.setItem("PARTH_PROFILES", JSON.stringify(list));
    }
    return true;
  }

  async deleteUserOrHistory(userId, mode = "history") {
    if (mode === "user") {
      if (this.sb) {
        await this.sb.from("profiles").delete().eq("id", userId);
      }
      let profiles = JSON.parse(localStorage.getItem("PARTH_PROFILES") || "[]");
      profiles = profiles.filter(p => p.id !== userId);
      localStorage.setItem("PARTH_PROFILES", JSON.stringify(profiles));
    }

    if (this.sb) {
      await this.sb.from("ledger_entries").delete().eq("user_id", userId);
      await this.sb.from("payment_requests").delete().eq("user_id", userId);
    }
    let ledger = JSON.parse(localStorage.getItem("PARTH_LEDGER") || "[]");
    ledger = ledger.filter(l => l.user_id !== userId);
    localStorage.setItem("PARTH_LEDGER", JSON.stringify(ledger));

    let reqs = JSON.parse(localStorage.getItem("PARTH_REQUESTS") || "[]");
    reqs = reqs.filter(r => r.user_id !== userId);
    localStorage.setItem("PARTH_REQUESTS", JSON.stringify(reqs));
    return true;
  }

  // --- LEDGER ---
  async getLedger(userId = null) {
    if (this.sb) {
      let query = this.sb.from("ledger_entries").select("*").order("created_at", { ascending: false });
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query;
      if (!error && data) {
        if (!userId) localStorage.setItem("PARTH_LEDGER", JSON.stringify(data));
        return data;
      }
    }
    const all = JSON.parse(localStorage.getItem("PARTH_LEDGER") || "[]");
    return userId ? all.filter(item => item.user_id === userId) : all;
  }

  async addLedgerEntry({ user_id, amount, entry_date, note, bank_target, status = "unpaid" }) {
    const entry = {
      id: crypto.randomUUID ? crypto.randomUUID() : "led-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      user_id,
      amount: parseFloat(Number(amount).toFixed(2)),
      entry_date: entry_date || new Date().toISOString().split("T")[0],
      note: note || "Vault Credit Allocation",
      bank_target: bank_target || "fampay",
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      created_at: new Date().toISOString()
    };

    if (this.sb) {
      const { data, error } = await this.sb.from("ledger_entries").insert([entry]).select().single();
      if (!error && data) {
        const list = JSON.parse(localStorage.getItem("PARTH_LEDGER") || "[]");
        list.unshift(data);
        localStorage.setItem("PARTH_LEDGER", JSON.stringify(list));
        return data;
      }
    }

    const list = JSON.parse(localStorage.getItem("PARTH_LEDGER") || "[]");
    list.unshift(entry);
    localStorage.setItem("PARTH_LEDGER", JSON.stringify(list));
    return entry;
  }

  async toggleLedgerStatus(entryId, newStatus) {
    const paidAt = newStatus === "paid" ? new Date().toISOString() : null;
    if (this.sb) {
      await this.sb.from("ledger_entries").update({ status: newStatus, paid_at: paidAt }).eq("id", entryId);
    }
    const list = JSON.parse(localStorage.getItem("PARTH_LEDGER") || "[]");
    const idx = list.findIndex(item => item.id === entryId);
    if (idx !== -1) {
      list[idx].status = newStatus;
      list[idx].paid_at = paidAt;
      localStorage.setItem("PARTH_LEDGER", JSON.stringify(list));
    }
    return true;
  }

  // --- PAYMENT REQUESTS (WITH PARTIAL DEDUCTION & REJECT INVISIBILITY FOR CUSTOMER) ---
  async getPaymentRequests(userId = null) {
    if (this.sb) {
      let query = this.sb.from("payment_requests").select("*").order("created_at", { ascending: false });
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query;
      if (!error && data) {
        if (!userId) localStorage.setItem("PARTH_REQUESTS", JSON.stringify(data));
        return data;
      }
    }
    const all = JSON.parse(localStorage.getItem("PARTH_REQUESTS") || "[]");
    return userId ? all.filter(r => r.user_id === userId) : all;
  }

  async submitPaymentRequest({ user_id, amount, bank_target, request_type = "partial", utr_reference = "" }) {
    const req = {
      id: crypto.randomUUID ? crypto.randomUUID() : "req-" + Date.now(),
      user_id,
      amount: parseFloat(Number(amount).toFixed(2)),
      bank_target: bank_target || "fampay",
      request_type,
      utr_reference: utr_reference || ("UTR" + Math.floor(10000000 + Math.random() * 90000000)),
      status: "pending",
      visible_to_user: true,
      created_at: new Date().toISOString(),
      resolved_at: null
    };

    if (this.sb) {
      const { data, error } = await this.sb.from("payment_requests").insert([req]).select().single();
      if (!error && data) {
        const list = JSON.parse(localStorage.getItem("PARTH_REQUESTS") || "[]");
        list.unshift(data);
        localStorage.setItem("PARTH_REQUESTS", JSON.stringify(list));
        return data;
      }
    }

    const list = JSON.parse(localStorage.getItem("PARTH_REQUESTS") || "[]");
    list.unshift(req);
    localStorage.setItem("PARTH_REQUESTS", JSON.stringify(list));
    return req;
  }

  async resolvePaymentRequest(requestId, decision) {
    // decision = 'approved' | 'rejected'
    const reqList = JSON.parse(localStorage.getItem("PARTH_REQUESTS") || "[]");
    const reqIdx = reqList.findIndex(r => r.id === requestId);
    if (reqIdx === -1) return false;

    const req = reqList[reqIdx];
    req.status = decision;
    req.resolved_at = new Date().toISOString();
    // Critical Requirement: If rejected, disappears from customer's view, stays visible to Owner
    req.visible_to_user = decision !== "rejected";

    if (this.sb) {
      await this.sb
        .from("payment_requests")
        .update({ status: decision, resolved_at: req.resolved_at, visible_to_user: req.visible_to_user })
        .eq("id", requestId);
    }
    localStorage.setItem("PARTH_REQUESTS", JSON.stringify(reqList));

    // If approved, automatically settle/deduct from unpaid ledger entries
    if (decision === "approved") {
      await this.applyApprovedPaymentToLedger(req.user_id, req.amount, req.bank_target);
    }
    return true;
  }

  async applyApprovedPaymentToLedger(userId, paidAmount, bankTarget) {
    let remainingToSettle = parseFloat(Number(paidAmount).toFixed(2));
    const allLedger = await this.getLedger();
    const userUnpaid = allLedger
      .filter(l => l.user_id === userId && l.status === "unpaid")
      .sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));

    for (const item of userUnpaid) {
      if (remainingToSettle <= 0) break;
      const itemAmt = parseFloat(Number(item.amount).toFixed(2));

      if (remainingToSettle >= itemAmt) {
        // Full entry settled
        await this.toggleLedgerStatus(item.id, "paid");
        remainingToSettle = parseFloat((remainingToSettle - itemAmt).toFixed(2));
      } else {
        // Partial deduction: split entry into a paid portion and remaining unpaid balance
        const reducedUnpaid = parseFloat((itemAmt - remainingToSettle).toFixed(2));
        // Update current unpaid item to reduced amount
        if (this.sb) {
          await this.sb.from("ledger_entries").update({ amount: reducedUnpaid }).eq("id", item.id);
        }
        const list = JSON.parse(localStorage.getItem("PARTH_LEDGER") || "[]");
        const idx = list.findIndex(x => x.id === item.id);
        if (idx !== -1) {
          list[idx].amount = reducedUnpaid;
          localStorage.setItem("PARTH_LEDGER", JSON.stringify(list));
        }
        // Record the settled partial payment as a paid ledger record
        await this.addLedgerEntry({
          user_id: userId,
          amount: remainingToSettle,
          entry_date: new Date().toISOString().split("T")[0],
          note: `Partial Payment Settled (${bankTarget.toUpperCase()})`,
          bank_target: bankTarget,
          status: "paid"
        });
        remainingToSettle = 0;
      }
    }
  }
}

window.VaultDB = new SovereignDatabase();

// ============================================================================
// UPI DEEP LINK & QR ENGINE
// ============================================================================
function buildUpiLinks(amount, bankKey = "fampay", note = "Parth Rajpurohit Vault Settlement") {
  const bank = VAULT_CONFIG.banks[bankKey] || VAULT_CONFIG.banks.fampay;
  const cleanAmt = parseFloat(Number(amount || 0).toFixed(2));
  const params = new URLSearchParams({
    pa: bank.upiId,
    pn: VAULT_CONFIG.payeeName,
    am: cleanAmt.toFixed(2),
    cu: "INR",
    tn: note
  });
  const query = params.toString();

  return {
    bank,
    amount: cleanAmt,
    genericUpi: `upi://pay?${query}`,
    gpay: `tez://upi/pay?${query}`,
    phonepe: `phonepe://pay?${query}`,
    paytm: `paytmmp://pay?${query}`,
    fampay: `upi://pay?${query}`,
    bhim: `bhim://pay?${query}`,
    androidIntent: `intent://pay?${query}#Intent;scheme=upi;end`
  };
}

function renderCustomGoldQR(canvasEl, textUrl, bankKey = "fampay") {
  if (!canvasEl) return;
  if (window.QRious) {
    new window.QRious({
      element: canvasEl,
      value: textUrl,
      size: 230,
      background: "#08080c",
      foreground: bankKey === "fampay" ? "#FFD700" : "#00FF87",
      level: "H"
    });
    // Stamp center crest
    const ctx = canvasEl.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.fillStyle = "#08080c";
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(92, 92, 46, 46, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 15px 'Syne', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PR₹", 115, 115);
      ctx.restore();
    }
  }
}

// ============================================================================
// CELESTIAL RAMAYAN / DHAN VARSHA ANIMATION ENGINE (SUN / ECLIPSE / GOLD RAIN)
// ============================================================================
class CelestialCanvasEngine {
  constructor() {
    this.canvas = document.getElementById("bg-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.mode = localStorage.getItem("PARTH_REALM_MODE") || "dhan"; // 'dhan' | 'eclipse' | 'solar'
    this.particles = [];
    this.arrows = [];
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.applyBodyTheme();
    this.spawnParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  cycleRealm() {
    const order = ["dhan", "eclipse", "solar"];
    const nextIdx = (order.indexOf(this.mode) + 1) % order.length;
    this.mode = order[nextIdx];
    localStorage.setItem("PARTH_REALM_MODE", this.mode);
    this.applyBodyTheme();
    this.triggerAstrasBurst();
    this.spawnParticles();
    return this.mode;
  }

  applyBodyTheme() {
    document.body.classList.remove("realm-solar", "realm-eclipse");
    if (this.mode === "solar") document.body.classList.add("realm-solar");
    if (this.mode === "eclipse") document.body.classList.add("realm-eclipse");

    const labelEl = document.getElementById("celestial-mode-label");
    if (labelEl) {
      const names = {
        dhan: "DHAN VARSHA • GOLD RAIN",
        eclipse: "RAMAYAN RAAJ • NIGHT ECLIPSE",
        solar: "SURYA ASTRA • SOLAR FLARE"
      };
      labelEl.textContent = names[this.mode];
    }
  }

  triggerAstrasBurst() {
    for (let i = 0; i < 18; i++) {
      this.arrows.push({
        x: Math.random() * this.canvas.width,
        y: -40,
        vx: (Math.random() - 0.5) * 6,
        vy: 9 + Math.random() * 7,
        len: 60 + Math.random() * 50,
        alpha: 1
      });
    }
  }

  spawnParticles() {
    this.particles = [];
    const count = 65;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vy: 1.2 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.8,
        size: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        char: ["₹", "0", "1", "◈", "❈"][Math.floor(Math.random() * 5)]
      });
    }
  }

  animate() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    for (const p of this.particles) {
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vRot;
      if (p.y > this.canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (this.mode === "dhan") {
        // Falling Gold Mudras & PR Currency Sparks
        ctx.fillStyle = "rgba(255, 215, 0, 0.28)";
        ctx.strokeStyle = "rgba(255, 215, 0, 0.65)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#FFD700";
        ctx.font = "bold 10px 'JetBrains Mono'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("₹", 0, 0);
      } else if (this.mode === "eclipse") {
        // Cyber Matrix / Night Astra Embers
        ctx.fillStyle = "rgba(0, 255, 135, 0.35)";
        ctx.font = `${Math.floor(p.size + 4)}px 'JetBrains Mono'`;
        ctx.fillText(p.char, 0, 0);
      } else {
        // Solar Golden Sparks
        ctx.fillStyle = "rgba(255, 195, 0, 0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Ramayan Celestial Arrows burst on transition
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const a = this.arrows[i];
      a.x += a.vx;
      a.y += a.vy;
      a.alpha -= 0.016;
      if (a.alpha <= 0) {
        this.arrows.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.strokeStyle = `rgba(255, 215, 0, ${a.alpha})`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x - a.vx * 4, a.y - a.len);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Unlock Vault Door Helper
function initVaultDoor() {
  const wrapper = document.getElementById("vault-door");
  const wheel = document.getElementById("vault-wheel");
  if (!wrapper || !wheel) return;

  const unlockNow = () => {
    if (wheel.classList.contains("spinning")) return;
    wheel.classList.add("spinning");
    setTimeout(() => {
      wrapper.classList.add("unlocked");
    }, 450);
  };

  wheel.addEventListener("click", unlockNow);
  setTimeout(unlockNow, 950);
}

document.addEventListener("DOMContentLoaded", () => {
  window.CelestialEngine = new CelestialCanvasEngine();
  initVaultDoor();

  const sunBtn = document.getElementById("celestial-toggle-btn");
  if (sunBtn) {
    sunBtn.addEventListener("click", () => {
      window.CelestialEngine.cycleRealm();
    });
  }
});
