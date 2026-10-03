import test from "node:test";
import assert from "node:assert/strict";
import {
  seedState,
  stateSchema,
  documentSubtotal,
  documentTotal,
  paidAmount,
  balance,
  invoiceStatus,
  qualify,
  rescoreLead,
  welcome,
  fillTemplate,
  documentHTML,
  campaignRecipients,
  dispatchCampaign,
  normalizePhone,
  today,
  money,
} from "../lib/crm-model.ts";

test("seed and JSON backup round-trip validate", () => {
  const state = seedState();
  assert.deepEqual(stateSchema.parse(JSON.parse(JSON.stringify(state))), state);
  assert.equal(state.settings.brand, "Abundance Group");
  assert.equal(
    state.integrations.some((p) => p.enabled),
    false,
  );
});

test("invoice tax, partial payments and settlement are calculated from records", () => {
  const s = seedState(),
    d = s.documents.find((d) => d.type === "Invoice");
  assert.equal(documentSubtotal(d), 220000);
  assert.equal(documentTotal(d), 259600);
  assert.equal(paidAmount(s, d), 150000);
  assert.equal(balance(s, d), 109600);
  assert.equal(invoiceStatus(s, d), "Part paid");
  s.payments.push({
    id: "PAY-FINAL",
    documentId: d.id,
    amount: 109600,
    date: today(),
    method: "UPI",
    reference: "Demo settlement",
  });
  assert.equal(balance(s, d), 0);
  assert.equal(invoiceStatus(s, d), "Paid");
  assert.equal(stateSchema.safeParse(s).success, true);
  assert.equal(documentTotal({ seats: 3, fee: 99.99, tax: 18 }), 353.96);
  assert.match(money(10.25), /10\.25/);
});

test("backup rejects overpayments, non-invoice payments and cancelled paid invoices", () => {
  for (const mutate of [
    (s) => (s.payments[0].amount = 999999),
    (s) => (s.payments[0].documentId = s.documents[0].id),
    (s) => (s.documents[1].status = "Cancelled"),
    (s) => (s.payments[0].amount = 0),
  ]) {
    const s = seedState();
    mutate(s);
    assert.equal(stateSchema.safeParse(s).success, false);
  }
});

test("backup rejects duplicate IDs, contacts, providers and orphan records", () => {
  for (const mutate of [
    (s) => s.leads.push(structuredClone(s.leads[0])),
    (s) => (s.leads[1].phone = "+91 " + s.leads[0].phone),
    (s) => (s.messages[0].leadId = "missing"),
    (s) => s.closedThreads.push("missing"),
    (s) => s.campaigns[0].recipientIds.push("missing"),
    (s) => (s.integrations[1].provider = s.integrations[0].provider),
    (s) => (s.settings.team[1].name = s.settings.team[0].name),
  ]) {
    const s = seedState();
    mutate(s);
    assert.equal(stateSchema.safeParse(s).success, false);
  }
  assert.equal(normalizePhone("+91 90000 00001"), "9000000001");
});

test("backup rejects invalid dates, stages, schedules and unsafe attachment URLs", () => {
  for (const mutate of [
    (s) => (s.documents[0].date = "2026-02-30"),
    (s) => (s.documents[0].dueDate = "2020-01-01"),
    (s) => (s.campaigns[0].industry = "unknown"),
    (s) => {
      s.campaigns[0].status = "Scheduled";
      s.campaigns[0].scheduledAt = "";
    },
    (s) =>
      (s.messages[0].attachment = {
        name: "bad.html",
        data: "javascript:alert(1)",
        mime: "text/plain",
      }),
  ]) {
    const s = seedState();
    mutate(s);
    assert.equal(stateSchema.safeParse(s).success, false);
  }
});

test("welcome respects automation and contact opt-in", () => {
  const s = seedState(),
    l = s.leads[0],
    original = s.messages.length;
  s.settings.autoWelcome = false;
  welcome(s, l);
  assert.equal(s.messages.length, original);
  s.settings.autoWelcome = true;
  l.consent = false;
  welcome(s, l);
  assert.equal(s.messages.length, original);
  l.consent = true;
  welcome(s, l);
  assert.equal(s.messages.length, original + 1);
  assert.match(s.messages.at(-1).text, /Arjun Rao/);
  assert.match(s.messages.at(-1).text, /Abundance Group/);
  assert.equal(
    fillTemplate("{name}: {company}, {seats} seats at {brand}", l, "AG"),
    "Arjun Rao: Northstar Labs, 42 seats at AG",
  );
});

test("qualification improves early stages without regressing commercial stages", () => {
  const l = seedState().leads[0];
  assert.equal(qualify(l), 99);
  for (const stage of ["New", "Enquiry"]) {
    l.stage = stage;
    rescoreLead(l);
    assert.equal(l.stage, "Qualified");
  }
  for (const stage of [
    "Qualified",
    "Site Visit",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ]) {
    l.stage = stage;
    rescoreLead(l);
    assert.equal(l.stage, stage);
  }
  l.seats = 1;
  l.budget = 0;
  l.location = "";
  l.moveIn = "";
  l.company = "";
  assert.equal(qualify(l), 40);
});

test("bulk dispatch matches segmentation, excludes non-consenting/archived/lost contacts and is idempotent", () => {
  const s = seedState(),
    c = s.campaigns[0];
  assert.deepEqual(
    campaignRecipients(s, c).map((l) => l.id),
    [s.leads[0].id],
  );
  c.industry = "All";
  c.stage = "All";
  s.leads[1].consent = false;
  s.leads[2].archived = true;
  s.leads[3].stage = "Lost";
  assert.equal(campaignRecipients(s, c).length, 3);
  const before = s.messages.length;
  dispatchCampaign(s, c);
  assert.equal(c.status, "Completed");
  assert.equal(c.recipientIds.length, 3);
  assert.equal(s.messages.length, before + 3);
  assert.match(s.messages.at(-1).text, /Aether Consulting/);
  assert.equal(stateSchema.safeParse(s).success, true);
  assert.throws(() => dispatchCampaign(s, c), /already completed/);
  assert.equal(s.messages.length, before + 3);
});

test("empty audience cannot dispatch; non-WhatsApp demo retains recipient history", () => {
  const s = seedState(),
    c = s.campaigns[0];
  c.industry = "Finance";
  assert.throws(() => dispatchCampaign(s, c), /No opted-in/);
  assert.equal(c.status, "Draft");
  c.stage = "All";
  c.channel = "Email";
  const before = s.messages.length;
  dispatchCampaign(s, c);
  assert.equal(c.recipientIds.length, 1);
  assert.equal(s.messages.length, before);
});

test("generated documents escape input, include correct balances and preserve issuer snapshots", () => {
  const s = seedState(),
    d = s.documents[1];
  d.customer.company = '<script>alert("x")</script>';
  d.terms = "<img src=x onerror=alert(1)>";
  s.settings.brand = "Changed brand";
  const html = documentHTML(d, s);
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("<img src=x"), false);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Abundance Group/);
  assert.equal(html.includes("Changed brand"), false);
  assert.match(html, /1,09,600/);
  assert.match(html, /Base rent/);
  assert.match(html, /Client demo document/);
});
