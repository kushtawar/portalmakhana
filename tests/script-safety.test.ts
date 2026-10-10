// Rebrand text rules and the --apply database guard. No database connection is made.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import mongoose from "mongoose";
import { planTextChanges, replaceBrand } from "../scripts/lib/rebrand";
import { databaseNameFromUri, resolveScriptTarget } from "../scripts/lib/targetDatabase";

describe("replaceBrand", () => {
  it("writes the brand as exactly 'PatnaMakhana' in text", () => {
    assert.equal(replaceBrand("Shrestha (by ItarIntakes)"), "Shrestha (by PatnaMakhana)");
    assert.equal(replaceBrand("ITARINTAKES KNOWLEDGE SERIES"), "PatnaMakhana KNOWLEDGE SERIES");
    assert.equal(replaceBrand("brand such as itarintakes, this"), "brand such as PatnaMakhana, this");
    assert.equal(replaceBrand("Itar Intakes Team"), "PatnaMakhana Team");
  });

  it("keeps slugs and paths lowercase", () => {
    assert.equal(replaceBrand("itarintakes-now-ships-pan-india"), "patnamakhana-now-ships-pan-india");
    assert.equal(replaceBrand("/stories/itarintakes-now-ships"), "/stories/patnamakhana-now-ships");
  });

  it("never changes URLs (the S3 bucket is named itarintakes)", () => {
    const url = "https://itarintakes.s3.eu-central-1.amazonaws.com/media/products/a.jpg";
    assert.equal(replaceBrand(url), url);
  });

  it("leaves unrelated text alone", () => {
    assert.equal(replaceBrand("Premium Makhana from Patna"), "Premium Makhana from Patna");
  });
});

describe("planTextChanges", () => {
  it("only reports changed strings; numbers, ids, dates and URLs are untouched", () => {
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      name: "Silver Makhana",
      variants: [{ id: "v1", sku: "SHR-SLV-250", price: 225, stock: 1000 }],
      gstRate: 5,
      imagePath: "https://itarintakes.s3.eu-central-1.amazonaws.com/media/x.jpg",
      attributes: [{ label: "Brand", value: "Shrestha (by ItarIntakes)" }],
      createdAt: new Date(),
    };
    assert.deepEqual(planTextChanges(doc), [
      { path: "attributes.0.value", before: "Shrestha (by ItarIntakes)", after: "Shrestha (by PatnaMakhana)" },
    ]);
  });

  it("returns nothing once already rebranded (safe to re-run)", () => {
    assert.deepEqual(planTextChanges({ author: "PatnaMakhana Team", slug: "patnamakhana-now" }), []);
  });
});

describe("database target guard", () => {
  const atlas = "mongodb+srv://user:p%40ss@cluster0.example.mongodb.net/itarintakes?retryWrites=true";

  it("reads the database name from the URI path", () => {
    assert.equal(databaseNameFromUri(atlas), "itarintakes");
    assert.equal(databaseNameFromUri("mongodb://127.0.0.1:27018/itarintakes_phase1_test?replicaSet=rs0"), "itarintakes_phase1_test");
    assert.equal(databaseNameFromUri("mongodb://h1:1,h2:2/db?x=1"), "db");
    assert.equal(databaseNameFromUri("mongodb+srv://u:p@cluster0.example.mongodb.net/?retryWrites=true"), "");
  });

  it("allows preview without --db", () => {
    assert.deepEqual(resolveScriptTarget(["node", "s.ts"], atlas), { apply: false, databaseName: "itarintakes" });
  });

  it("refuses --apply without a matching --db", () => {
    assert.throws(() => resolveScriptTarget(["--apply"], atlas), /needs --db/);
    assert.throws(() => resolveScriptTarget(["--apply", "--db=quizapp"], atlas), /needs --db/);
    assert.deepEqual(resolveScriptTarget(["--apply", "--db=itarintakes"], atlas), {
      apply: true,
      databaseName: "itarintakes",
    });
  });

  it("refuses a URI with no database name (would silently use 'test')", () => {
    assert.throws(
      () => resolveScriptTarget([], "mongodb+srv://u:p@cluster0.example.mongodb.net/?retryWrites=true"),
      /does not name a database/
    );
  });

  it("never includes credentials in its error messages", () => {
    try {
      resolveScriptTarget(["--apply"], atlas);
    } catch (error) {
      assert.ok(!(error as Error).message.includes("p%40ss"));
      assert.ok(!(error as Error).message.includes("user:"));
    }
  });
});
