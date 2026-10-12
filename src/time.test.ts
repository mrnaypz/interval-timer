import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPhases,
  displaySeconds,
  formatEditorTime,
  formatSets,
  formatTotal,
  parseDuration,
  parseSets,
  phaseAt,
  presetLabel,
  workoutSeconds,
} from "./time.ts";

describe("time formatting", () => {
  it("pads sets and editor times", () => {
    assert.equal(formatSets(0), "00");
    assert.equal(formatSets(15), "15");
    assert.equal(formatEditorTime(0), "00.00");
    assert.equal(formatEditorTime(45), "00.45");
    assert.equal(formatEditorTime(90), "01.30");
  });

  it("formats the workout total the way preset buttons show it", () => {
    assert.equal(workoutSeconds(15, 45, 15), 900);
    assert.equal(formatTotal(900), "15:00");
    assert.equal(presetLabel(15, 45, 15), "45/15 - 15:00");
    assert.equal(formatTotal(30 + 30), "1:00");
    assert.equal(formatTotal(3661), "1:01:01");
  });

  it("parses manual entry", () => {
    assert.equal(parseSets("15"), 15);
    assert.equal(parseSets("00"), 0);
    assert.equal(parseSets("100"), null);
    assert.equal(parseDuration("00.45"), 45);
    assert.equal(parseDuration("01.30"), 90);
    assert.equal(parseDuration("1:30"), 90);
    assert.equal(parseDuration("45"), 45);
    assert.equal(parseDuration("00.60"), null);
  });
});

describe("workout phases", () => {
  it("runs a fixed 5 second countdown, then work and rest for every set", () => {
    const phases = buildPhases(2, 45, 15);
    assert.deepEqual(
      phases.map((phase) => [phase.kind, phase.durationMs]),
      [
        ["countdown", 5000],
        ["work", 45000],
        ["rest", 15000],
        ["work", 45000],
        ["rest", 15000],
      ],
    );

    assert.equal(phaseAt(phases, 0).kind, "countdown");
    assert.equal(displaySeconds(phaseAt(phases, 0).remainingMs), 5);
    assert.equal(phaseAt(phases, 4999).kind, "countdown");
    assert.equal(phaseAt(phases, 5000).kind, "work");
    assert.equal(displaySeconds(phaseAt(phases, 5000).remainingMs), 45);
    assert.equal(phaseAt(phases, 5000 + 45000).kind, "rest");
    assert.equal(phaseAt(phases, 5000 + 45000 + 15000 + 45000 + 15000).kind, "done");
  });

  it("skips a zero-length work or rest phase", () => {
    assert.deepEqual(
      buildPhases(1, 30, 0).map((phase) => phase.kind),
      ["countdown", "work"],
    );
    assert.deepEqual(
      buildPhases(1, 0, 30).map((phase) => phase.kind),
      ["countdown", "rest"],
    );
  });
});
