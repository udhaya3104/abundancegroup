import { z } from "zod";

export const STAGES = [
  "New",
  "Enquiry",
  "Qualified",
  "Site Visit",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;
export const SOURCES = [
  "Google Ads",
  "Meta Ads",
  "LinkedIn",
  "Justdial",
  "Website",
  "Referral",
  "Manual",
] as const;
export const INDUSTRIES = [
  "IT / SaaS",
  "Finance",
  "Creative Agency",
  "Legal Services",
  "E-commerce",
  "Consulting",
  "Other",
] as const;
export const DOC_TYPES = [
  "Proposal",
  "Quotation",
  "Invoice",
  "Rental Agreement",
] as const;
export const PROVIDERS = [
  "WhatsApp Business",
  "Meta Ads",
  "Google Ads",
  "LinkedIn",
  "Justdial",
  "Email / SMTP",
  "GPT qualification",
] as const;
const id = z.string().min(1).max(100);
const text = z.string().max(10000);
const amount = z.number().finite().nonnegative().max(100000000);
const stamp = z.string().datetime();
const date = z.string().date();
const localTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  .refine(
    (v) => Number.isFinite(Date.parse(v + ":00+05:30")),
    "Invalid date and time",
  );
export const leadSchema = z.object({
  id,
  name: z.string().min(1).max(120),
  company: z.string().min(1).max(160),
  phone: z.string().max(30),
  email: z.string().max(150),
  industry: z.enum(INDUSTRIES),
  source: z.enum(SOURCES),
  seats: z.number().int().min(1).max(10000),
  budget: amount,
  location: z.string().min(1).max(160),
  moveIn: z.union([date, z.literal("")]),
  stage: z.enum(STAGES),
  score: z.number().min(0).max(100),
  owner: z.string().max(120),
  consent: z.boolean(),
  archived: z.boolean(),
  createdAt: stamp,
  notes: z.array(z.object({ id, text, at: stamp })).max(1000),
});
const messageSchema = z.object({
  id,
  leadId: id,
  text,
  direction: z.enum(["in", "out", "system"]),
  at: stamp,
  attachment: z
    .object({
      name: z.string().max(200),
      data: z
        .string()
        .max(350000)
        .regex(
          /^data:(image\/png|image\/jpeg|text\/plain);base64,[A-Za-z0-9+/]*={0,2}$/,
        ),
      mime: z.enum(["image/png", "image/jpeg", "text/plain"]),
    })
    .optional(),
});
const campaignSchema = z.object({
  id,
  name: z.string().min(1).max(160),
  channel: z.enum(["WhatsApp", "Email", "SMS"]),
  industry: z.enum(["All", ...INDUSTRIES]),
  stage: z.enum(["All", ...STAGES]),
  template: text,
  status: z.enum(["Draft", "Scheduled", "Completed", "Cancelled"]),
  scheduledAt: z.union([localTime, z.literal("")]),
  recipientIds: z.array(id).max(10000),
  createdAt: stamp,
  sentAt: stamp.optional(),
});
const documentSchema = z.object({
  id,
  leadId: id,
  type: z.enum(DOC_TYPES),
  status: z.enum(["Draft", "Sent", "Accepted", "Signed", "Cancelled"]),
  seats: z.number().int().min(1).max(10000),
  fee: amount,
  tax: z.number().min(0).max(100),
  deposit: amount,
  terms: text,
  date,
  dueDate: date,
  createdAt: stamp,
  issuer: z.object({
    brand: z.string().min(1).max(120),
    address: text,
    email: text,
  }),
  customer: z.object({
    name: text,
    company: text,
    location: text,
    email: text,
  }),
});
const settingsSchema = z.object({
  brand: z.string().min(1).max(120),
  address: z.string().min(1).max(500),
  email: z.string().email(),
  capacity: z.number().int().min(1).max(10000),
  tax: z.number().min(0).max(100),
  depositMonths: z.number().min(0).max(24),
  terms: text,
  welcome: text,
  followup: text,
  autoWelcome: z.boolean(),
  autoQualify: z.boolean(),
  autoAssign: z.boolean(),
  team: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        role: z.enum(["Administrator", "Sales", "Accounts"]),
        email: z.string().email(),
      }),
    )
    .min(1)
    .max(50),
});
export const stateSchema = z
  .object({
    version: z.literal(1),
    leads: z.array(leadSchema).max(10000),
    messages: z.array(messageSchema).max(20000),
    campaigns: z.array(campaignSchema).max(1000),
    documents: z.array(documentSchema).max(5000),
    payments: z
      .array(
        z.object({
          id,
          documentId: id,
          amount: amount.positive(),
          date,
          method: z.enum(["Bank transfer", "UPI", "Cash", "Card"]),
          reference: text,
        }),
      )
      .max(10000),
    expenses: z
      .array(
        z.object({
          id,
          category: z.string().min(1).max(100),
          description: text,
          amount: amount.positive(),
          date,
        }),
      )
      .max(10000),
    tasks: z
      .array(
        z.object({
          id,
          leadId: id,
          type: z.enum(["Site visit", "Follow-up", "Call"]),
          due: localTime,
          owner: text,
          note: text,
          completed: z.boolean(),
        }),
      )
      .max(10000),
    activities: z
      .array(
        z.object({
          id,
          leadId: z.string().optional(),
          text,
          at: stamp,
          read: z.boolean(),
        }),
      )
      .max(2000),
    integrations: z
      .array(
        z.object({
          provider: z.enum(PROVIDERS),
          enabled: z.boolean(),
          account: z.string().max(200),
          campaign: z.string().max(200),
          lastTest: stamp.optional(),
        }),
      )
      .length(PROVIDERS.length),
    closedThreads: z.array(id).max(10000),
    unreadThreads: z.array(id).max(10000),
    settings: settingsSchema,
  })
  .superRefine((s, ctx) => {
    const unique = (items: { id: string }[], label: string) => {
      if (new Set(items.map((x) => x.id)).size !== items.length)
        ctx.addIssue({ code: "custom", message: `Duplicate ${label} IDs` });
    };
    [
      s.leads,
      s.messages,
      s.campaigns,
      s.documents,
      s.payments,
      s.expenses,
      s.tasks,
      s.activities,
    ].forEach((items, i) => unique(items, String(i)));
    if (
      new Set(s.integrations.map((x) => x.provider)).size !== PROVIDERS.length
    )
      ctx.addIssue({ code: "custom", message: "Invalid provider list" });
    const leadIds = new Set(s.leads.map((l) => l.id)),
      invoiceIds = new Set(
        s.documents
          .filter((d) => d.type === "Invoice" && d.status !== "Cancelled")
          .map((d) => d.id),
      );
    if (
      [...s.messages, ...s.documents, ...s.tasks].some(
        (x) => !leadIds.has(x.leadId),
      ) ||
      s.payments.some((p) => !invoiceIds.has(p.documentId)) ||
      [
        ...s.closedThreads,
        ...s.unreadThreads,
        ...s.campaigns.flatMap((c) => c.recipientIds),
        ...s.activities.flatMap((a) => (a.leadId ? [a.leadId] : [])),
      ].some((id) => !leadIds.has(id))
    )
      ctx.addIssue({
        code: "custom",
        message: "Backup contains missing record references",
      });
    if (s.campaigns.some((c) => c.status === "Scheduled" && !c.scheduledAt))
      ctx.addIssue({
        code: "custom",
        message: "Scheduled campaign needs a date and time",
      });
    if (s.documents.some((d) => d.dueDate < d.date))
      ctx.addIssue({
        code: "custom",
        message: "Document due date cannot precede issue date",
      });
    if (
      !s.settings.team.some((t) => t.role === "Administrator") ||
      !s.settings.team.some((t) => t.role === "Sales")
    )
      ctx.addIssue({
        code: "custom",
        message: "Keep an administrator and a sales owner",
      });
    const phones = s.leads.map((l) => normalizePhone(l.phone)).filter(Boolean);
    if (new Set(phones).size !== phones.length)
      ctx.addIssue({ code: "custom", message: "Duplicate contact phone" });
    if (
      new Set(s.settings.team.map((t) => t.name.toLowerCase())).size !==
        s.settings.team.length ||
      new Set(s.settings.team.map((t) => t.email.toLowerCase())).size !==
        s.settings.team.length
    )
      ctx.addIssue({ code: "custom", message: "Duplicate team member" });
    for (const d of s.documents)
      if (
        s.payments
          .filter((p) => p.documentId === d.id)
          .reduce((sum, p) => sum + p.amount, 0) >
        documentTotal(d) + 0.01
      )
        ctx.addIssue({
          code: "custom",
          message: "Payments exceed invoice amount",
        });
  });
export type CRMState = z.infer<typeof stateSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type CRMDocument = z.infer<typeof documentSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Stage = Lead["stage"];
export const STORAGE_KEY = "abundance.crm.v1";
export const uid = (prefix = "REC") =>
  `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
export const now = () => new Date().toISOString();
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
export const compactMoney = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : money(n);
export const displayDate = (s: string) =>
  s
    ? new Date(
        s.length === 10
          ? s + "T12:00:00+05:30"
          : s.length === 16
            ? s + ":00+05:30"
            : s,
      ).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        ...(s.length > 10 ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "Not scheduled";
export const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(-10);
export const qualify = (l: Lead) =>
  Math.min(
    99,
    30 +
      (l.seats >= 20 ? 20 : 10) +
      (l.budget > 0 ? 20 : 0) +
      (l.location ? 10 : 0) +
      (l.moveIn ? 14 : 0) +
      (l.company ? 5 : 0),
  );
export function rescoreLead(l: Lead) {
  l.score = qualify(l);
  if (l.score >= 80 && ["New", "Enquiry"].includes(l.stage))
    l.stage = "Qualified";
}
export function campaignRecipients(
  s: CRMState,
  c: Pick<Campaign, "industry" | "stage">,
) {
  return s.leads.filter(
    (l) =>
      !l.archived &&
      l.consent &&
      l.stage !== "Lost" &&
      (c.industry === "All" || l.industry === c.industry) &&
      (c.stage === "All" || l.stage === c.stage),
  );
}
export function dispatchCampaign(s: CRMState, c: Campaign) {
  if (!["Draft", "Scheduled"].includes(c.status))
    throw new Error("Campaign already completed or cancelled");
  const recipients = campaignRecipients(s, c);
  if (!recipients.length) throw new Error("No opted-in recipients");
  c.recipientIds = recipients.map((l) => l.id);
  c.status = "Completed";
  c.sentAt = now();
  if (c.channel === "WhatsApp")
    recipients.forEach((l) =>
      s.messages.push({
        id: uid("MSG"),
        leadId: l.id,
        text: fillTemplate(c.template, l, s.settings.brand),
        direction: "out",
        at: now(),
      }),
    );
  activity(
    s,
    `${c.name}: ${c.channel} dispatch simulated for ${recipients.length} contacts`,
  );
}
export const documentSubtotal = (d: Pick<CRMDocument, "seats" | "fee">) =>
  Math.round(d.seats * d.fee * 100) / 100;
export const documentTotal = (d: Pick<CRMDocument, "seats" | "fee" | "tax">) =>
  Math.round(documentSubtotal(d) * (1 + d.tax / 100) * 100) / 100;
export const paidAmount = (s: CRMState, d: CRMDocument) =>
  s.payments
    .filter((p) => p.documentId === d.id)
    .reduce((sum, p) => sum + p.amount, 0);
export const balance = (s: CRMState, d: CRMDocument) =>
  Math.max(0, Math.round((documentTotal(d) - paidAmount(s, d)) * 100) / 100);
export const invoiceStatus = (s: CRMState, d: CRMDocument) =>
  d.status === "Cancelled"
    ? "Cancelled"
    : balance(s, d) === 0
      ? "Paid"
      : paidAmount(s, d) > 0
        ? "Part paid"
        : d.dueDate < today()
          ? "Overdue"
          : "Due";
export function activity(s: CRMState, text: string, leadId?: string) {
  s.activities.unshift({
    id: uid("ACT"),
    text,
    leadId,
    at: now(),
    read: false,
  });
  s.activities = s.activities.slice(0, 2000);
}
export function fillTemplate(template: string, l: Lead, brand: string) {
  return template
    .replace(/\{name\}/g, l.name)
    .replace(/\{company\}/g, l.company)
    .replace(/\{seats\}/g, String(l.seats))
    .replace(/\{brand\}/g, brand);
}
export function welcome(s: CRMState, l: Lead) {
  if (s.settings.autoWelcome && l.consent)
    s.messages.push({
      id: uid("MSG"),
      leadId: l.id,
      direction: "out",
      text: fillTemplate(s.settings.welcome, l, s.settings.brand),
      at: now(),
    });
}
export function download(
  filename: string,
  content: string,
  type = "text/plain",
) {
  window.dispatchEvent(
    new CustomEvent("abundance:export", {
      detail: { filename, content, type },
    }),
  );
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCSV(
  filename: string,
  rows: (string | number | boolean)[][],
) {
  const cell = (v: string | number | boolean) => {
    let s = String(v);
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  download(
    filename,
    "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}
export function seedState(): CRMState {
  const date = today(),
    at = now();
  const settings: CRMState["settings"] = {
    brand: "Abundance Group",
    address: "OMR, Chennai, Tamil Nadu",
    email: "hello@abundance.example",
    capacity: 250,
    tax: 18,
    depositMonths: 2,
    terms:
      "Base rent: ₹0 under the zero rental concept. Monthly workspace service fees cover the selected facilities. Deposit, taxes, service scope, tenure and exit conditions must be confirmed in the final commercial offer. This is a sample document for client demonstration.",
    welcome:
      "Hi {name} 👋 Welcome to {brand}. I’m Nia, your workspace assistant. How many seats do you need, what is your preferred location, and when would you like to move in?",
    followup:
      "Hi {name}, following up on your {seats}-seat workspace requirement for {company}. Would you like to schedule a visit with {brand}?",
    autoWelcome: true,
    autoQualify: true,
    autoAssign: true,
    team: [
      {
        name: "Arun Kumar",
        role: "Administrator",
        email: "arun@abundance.example",
      },
      {
        name: "Sanjay Kumar",
        role: "Sales",
        email: "sanjay@abundance.example",
      },
      { name: "Priya Iyer", role: "Sales", email: "priya@abundance.example" },
      { name: "Divya R", role: "Accounts", email: "divya@abundance.example" },
    ],
  };
  const names = [
    [
      "Arjun Rao",
      "Northstar Labs",
      "IT / SaaS",
      "Google Ads",
      42,
      320000,
      "Qualified",
    ],
    [
      "Meera Iyer",
      "Finpilot Advisory",
      "Finance",
      "Meta Ads",
      18,
      140000,
      "Proposal",
    ],
    [
      "Karthik S",
      "Pixelmint Studio",
      "Creative Agency",
      "LinkedIn",
      12,
      95000,
      "Enquiry",
    ],
    [
      "Nisha Thomas",
      "LegalArc Partners",
      "Legal Services",
      "Justdial",
      8,
      72000,
      "New",
    ],
    [
      "Rahul Dev",
      "Orbit Commerce",
      "E-commerce",
      "Google Ads",
      30,
      210000,
      "Negotiation",
    ],
    [
      "Vikram Shah",
      "Aether Consulting",
      "Consulting",
      "Referral",
      22,
      220000,
      "Won",
    ],
  ];
  const leads = names.map(
    (x, i) =>
      ({
        id: `LD-${2481 - i}`,
        name: x[0],
        company: x[1],
        industry: x[2],
        source: x[3],
        seats: x[4],
        budget: x[5],
        stage: x[6],
        phone: `900000000${i}`,
        email: `contact${i + 1}@demo.example`,
        location: "OMR, Chennai",
        moveIn: date,
        score: [94, 88, 81, 76, 91, 92][i],
        owner: i % 2 ? "Priya Iyer" : "Sanjay Kumar",
        consent: true,
        archived: false,
        createdAt: at,
        notes: [],
      }) as Lead,
  );
  const documents: CRMDocument[] = [
    {
      id: "QTN-1048",
      leadId: leads[0].id,
      type: "Proposal",
      status: "Draft",
      seats: 42,
      fee: 7600,
      tax: 18,
      deposit: 638400,
      terms: settings.terms,
      date,
      dueDate: date,
      createdAt: at,
      issuer: {
        brand: settings.brand,
        address: settings.address,
        email: settings.email,
      },
      customer: {
        name: leads[0].name,
        company: leads[0].company,
        email: leads[0].email,
        location: leads[0].location,
      },
    },
    {
      id: "INV-0904",
      leadId: leads[5].id,
      type: "Invoice",
      status: "Sent",
      seats: 22,
      fee: 10000,
      tax: 18,
      deposit: 0,
      terms: settings.terms,
      date,
      dueDate: date,
      createdAt: at,
      issuer: {
        brand: settings.brand,
        address: settings.address,
        email: settings.email,
      },
      customer: {
        name: leads[5].name,
        company: leads[5].company,
        email: leads[5].email,
        location: leads[5].location,
      },
    },
  ];
  return {
    version: 1,
    leads,
    settings,
    documents,
    payments: [
      {
        id: "PAY-DEMO",
        documentId: "INV-0904",
        amount: 150000,
        date,
        method: "Bank transfer",
        reference: "Sample opening collection",
      },
    ],
    expenses: [
      {
        id: "EXP-DEMO",
        category: "Utilities",
        description: "Sample monthly facility utilities",
        amount: 48000,
        date,
      },
    ],
    messages: [
      {
        id: "MSG-1",
        leadId: leads[0].id,
        text: fillTemplate(settings.welcome, leads[0], settings.brand),
        direction: "out",
        at,
      },
      {
        id: "MSG-2",
        leadId: leads[0].id,
        text: "We need 42 seats on OMR within 30 days. Our budget is ₹3.2 lakhs per month.",
        direction: "in",
        at,
      },
    ],
    campaigns: [
      {
        id: "CMP-001",
        name: "OMR site visit invitation",
        channel: "WhatsApp",
        industry: "All",
        stage: "Qualified",
        template: settings.followup,
        status: "Draft",
        scheduledAt: "",
        recipientIds: [],
        createdAt: at,
      },
    ],
    tasks: [
      {
        id: "TSK-001",
        leadId: leads[0].id,
        type: "Site visit",
        due: date + "T16:30",
        owner: "Sanjay Kumar",
        note: "Show the 42-seat managed office.",
        completed: false,
      },
    ],
    activities: [
      {
        id: "ACT-1",
        leadId: leads[0].id,
        text: "Arjun Rao qualified · 42 seats · OMR",
        at,
        read: false,
      },
    ],
    integrations: PROVIDERS.map((provider) => ({
      provider,
      enabled: false,
      account: "",
      campaign: "",
    })),
    closedThreads: [],
    unreadThreads: [leads[0].id],
  };
}

function escapeHTML(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function documentHTML(d: CRMDocument, s: CRMState) {
  const h = escapeHTML;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${h(d.id)} · ${h(d.issuer.brand)}</title><style>body{font:15px system-ui;color:#192b40;max-width:850px;margin:40px auto;padding:25px}header{border-bottom:3px solid #087f83;padding-bottom:20px}h1{color:#087f83}table{border-collapse:collapse;width:100%;margin:25px 0}th,td{padding:12px;text-align:left;border-bottom:1px solid #dce4eb}.terms{white-space:pre-wrap;line-height:1.7;background:#f5f8fa;padding:20px}.totals{text-align:right}.muted{color:#64748b}@media print{body{margin:0}}</style></head><body><header><h1>${h(d.issuer.brand)}</h1><p>${h(d.issuer.address)} · ${h(d.issuer.email)}</p></header><h2>${h(d.type)} ${h(d.id)}</h2><p>Date: ${h(d.date)} · Due / valid until: ${h(d.dueDate)} · Status: ${h(d.type === "Invoice" ? invoiceStatus(s, d) : d.status)}</p><h3>Prepared for ${h(d.customer.company)}</h3><p>${h(d.customer.name)} · ${h(d.customer.email)}<br>${h(d.customer.location)}</p><table><tr><th>Workspace charges</th><th>Seats</th><th>Per seat</th><th>Amount</th></tr><tr><td>Base rent — zero rental concept</td><td>${d.seats}</td><td>₹0</td><td>₹0</td></tr><tr><td>Monthly service fee</td><td>${d.seats}</td><td>${money(d.fee)}</td><td>${money(documentSubtotal(d))}</td></tr></table><div class="totals"><p>Tax (${d.tax}%): ${money(documentTotal(d) - documentSubtotal(d))}</p><h3>Monthly total: ${money(documentTotal(d))}</h3><p>Refundable deposit (separate): ${money(d.deposit)}</p>${d.type === "Invoice" ? `<p>Received: ${money(paidAmount(s, d))} · Balance: ${money(balance(s, d))}</p>` : ""}</div><h3>Terms & conditions</h3><div class="terms">${h(d.terms)}</div>${d.type === "Rental Agreement" ? "<p>Workspace provider: __________________<br><br>Customer: __________________<br><br>Date: __________________</p>" : ""}<p class="muted">Client demo document. Commercial terms and signature status are recorded locally; no external delivery or e-signature verification.</p></body></html>`;
}
