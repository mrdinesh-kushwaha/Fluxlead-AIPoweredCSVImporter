import { test } from "node:test";
import assert from "node:assert/strict";
import {
  coerceCrmStatus,
  coerceDataSource,
  coerceDate,
  isImportable,
  normalizeAiRecord,
} from "../src/services/crm.service";

test("coerceCrmStatus accepts only the four allowed values", () => {
  assert.equal(coerceCrmStatus("good_lead_follow_up"), "GOOD_LEAD_FOLLOW_UP");
  assert.equal(coerceCrmStatus("SALE_DONE"), "SALE_DONE");
  assert.equal(coerceCrmStatus("Interested"), null);
  assert.equal(coerceCrmStatus(undefined), null);
});

test("coerceDataSource is strict and defaults to null when unsure", () => {
  assert.equal(coerceDataSource("eden_park"), "eden_park");
  assert.equal(coerceDataSource("Eden Park Towers"), null);
  assert.equal(coerceDataSource(""), null);
});

test("coerceDate only accepts values new Date() can parse", () => {
  assert.equal(coerceDate("2026-05-13 14:20:48"), "2026-05-13 14:20:48");
  assert.equal(coerceDate("not-a-date"), null);
  assert.equal(coerceDate(""), null);
});

test("isImportable requires an email or a mobile number", () => {
  const withEmail = normalizeAiRecord({ email: "a@b.com" });
  const withMobile = normalizeAiRecord({ mobile_without_country_code: "9876543210" });
  const withNeither = normalizeAiRecord({ name: "No Contact" });

  assert.equal(isImportable(withEmail), true);
  assert.equal(isImportable(withMobile), true);
  assert.equal(isImportable(withNeither), false);
});

test("normalizeAiRecord escapes newlines so rows stay single-line", () => {
  const record = normalizeAiRecord({
    email: "a@b.com",
    crm_note: "Line one\nLine two",
  });
  assert.equal(record.crm_note, "Line one\\nLine two");
});

test("normalizeAiRecord lowercases email", () => {
  const record = normalizeAiRecord({ email: "John.Doe@Example.COM" });
  assert.equal(record.email, "john.doe@example.com");
});
