import { describe, it, expect } from "vitest";
import { calcStreak, XP_PER_TASK, XP_PERFECT_DAY, XP_PER_STAGE, MAX_STAGE } from "./useStreak";
import type { Task } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a local-midnight Date from year/month(1-based)/day */
function d(year: number, month: number, day: number, hour = 0): Date {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

/** ISO timestamp string for a given local date + optional hour */
function ts(year: number, month: number, day: number, hour = 12): string {
  return new Date(year, month - 1, day, hour, 0, 0).toISOString();
}

let idCounter = 0;
function makeTask(overrides: Partial<Task> = {}): Task {
  idCounter++;
  return {
    id: `task-${idCounter}`,
    title: `Task ${idCounter}`,
    createdAt: "2026-03-01",
    completedDates: [],
    completedTimestamps: {},
    deletedDates: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Reference dates (week of Mon 2026-03-30)
// ---------------------------------------------------------------------------
//   Sat 2026-03-28  ← 2 days before Monday
//   Sun 2026-03-29  ← yesterday
//   Mon 2026-03-30  ← today (reference "now")
//   Tue 2026-03-31  ← tomorrow / "now + 1 day"
//   Tue 2026-03-31 00:01 ← the "clock just ticked past midnight" scenario

const MON = d(2026, 3, 30);         // today
const TUE_0001 = d(2026, 3, 31, 0); // Tuesday 00:00 — SAT is now 3 days back

// Date keys
const MON_KEY = "2026-03-30";
const SUN_KEY = "2026-03-29";
const SAT_KEY = "2026-03-28";
const FRI_KEY = "2026-03-27";
const TUE_KEY = "2026-03-31";

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("calcStreak", () => {

  // ── Baseline ──────────────────────────────────────────────────────────────

  it("returns 0 when there are no tasks", () => {
    expect(calcStreak([], MON).streak).toBe(0);
  });

  it("returns 0 when today has tasks but none are done", () => {
    const tasks = [makeTask({ date: MON_KEY })];
    expect(calcStreak(tasks, MON).streak).toBe(0);
  });

  it("counts today when all tasks for today are done", () => {
    const tasks = [makeTask({ date: MON_KEY, completedDates: [MON_KEY] })];
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  // ── Future days ───────────────────────────────────────────────────────────

  it("does NOT count a future day even if marked done", () => {
    const tasks = [makeTask({ date: TUE_KEY, completedDates: [TUE_KEY] })];
    expect(calcStreak(tasks, MON).streak).toBe(0);
  });

  // ── Retroactive window (≤ 2 calendar days back) ──────────────────────────

  it("counts yesterday (1 day back) if marked done — retro", () => {
    const tasks = [makeTask({ date: SUN_KEY, completedDates: [SUN_KEY] })];
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  it("counts Saturday (2 days back) if marked done — retro", () => {
    const tasks = [makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] })];
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  it("Saturday + Sunday both done → streak 2 (no need for today)", () => {
    const tasks = [
      makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] }),
      makeTask({ date: SUN_KEY, completedDates: [SUN_KEY] }),
    ];
    expect(calcStreak(tasks, MON).streak).toBe(2);
  });

  // ── KEY SCENARIO: retro Saturday should show immediately without Sunday ───

  it("Saturday done → streak=1 even though Sunday is NOT done yet (pending skip)", () => {
    // Sunday has a task but user hasn't marked it yet.
    // Saturday is within the 2-day window → should still count.
    const tasks = [
      makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] }),  // done
      makeTask({ date: SUN_KEY, completedDates: [] }),          // pending
    ];
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  it("Saturday done → streak goes to 2 once Sunday is also done", () => {
    const tasks = [
      makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] }),
      makeTask({ date: SUN_KEY, completedDates: [SUN_KEY] }),
    ];
    expect(calcStreak(tasks, MON).streak).toBe(2);
  });

  // ── THE CRITICAL EDGE CASE: Tuesday 00:01 — Saturday is now 3 days back ──

  it("🕛 Tuesday 00:01 — Saturday (now 3 days back) breaks the streak if marked late", () => {
    // User marked Saturday DURING Tuesday — timestamp is Tuesday, not Saturday.
    // daysBack = 3 → outside retro window → on-time check applies.
    // completedTimestamps[SAT_KEY] = Tuesday → toDateKey(ts) ≠ SAT_KEY → fails.
    const tasks = [
      makeTask({
        date: SAT_KEY,
        completedDates: [SAT_KEY],
        completedTimestamps: { [SAT_KEY]: ts(2026, 3, 31, 0) }, // marked on Tuesday
      }),
    ];
    expect(calcStreak(tasks, TUE_0001).streak).toBe(0);
  });

  it("🕛 Tuesday 00:01 — Saturday was marked ON Saturday (on-time) → still counts", () => {
    // Same scenario but the user marked it on Saturday itself → on-time.
    const tasks = [
      makeTask({
        date: SAT_KEY,
        completedDates: [SAT_KEY],
        completedTimestamps: { [SAT_KEY]: ts(2026, 3, 28, 14) }, // marked Saturday afternoon
      }),
    ];
    expect(calcStreak(tasks, TUE_0001).streak).toBe(1);
  });

  it("🕛 Tuesday 00:01 — Saturday pending (not done) → streak 0, NOT pending-skip", () => {
    // Saturday is now 3 days back — beyond the retro window.
    // An incomplete day at 3+ days back is a truly missed day → streak breaks.
    const tasks = [makeTask({ date: SAT_KEY, completedDates: [] })];
    expect(calcStreak(tasks, TUE_0001).streak).toBe(0);
  });

  // ── Legacy data (no timestamps) ───────────────────────────────────────────

  it("legacy completion with no timestamp is treated as on-time (no streak wipe)", () => {
    const tasks = [
      makeTask({
        date: FRI_KEY,
        completedDates: [FRI_KEY],
        completedTimestamps: {}, // no timestamp stored
      }),
    ];
    // Friday is 3 days back; no timestamp → treated as on-time → counts
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  // ── Neutral (empty) days ──────────────────────────────────────────────────

  it("a day with no tasks at all is neutral and does not break streak", () => {
    // Friday has no tasks, Saturday is done → streak counts Saturday
    const tasks = [makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] })];
    // Friday (3 days back) is empty — should be skipped, not break chain
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  // ── Partial completion ────────────────────────────────────────────────────

  it("1 of 3 tasks done on Saturday → streak continues (partial = success)", () => {
    const tasks = [
      makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] }), // done
      makeTask({ date: SAT_KEY, completedDates: [] }),         // not done
      makeTask({ date: SAT_KEY, completedDates: [] }),         // not done
    ];
    expect(calcStreak(tasks, MON).streak).toBe(1);
  });

  it("0 of 3 tasks done on Saturday (within retro window) → pending, streak 0", () => {
    // All three tasks exist for Saturday but none completed.
    // Saturday is 2 days back (≤2) → pending skip, doesn't break streak,
    // but there's nothing further back either → streak stays 0.
    const tasks = [
      makeTask({ date: SAT_KEY, completedDates: [] }),
      makeTask({ date: SAT_KEY, completedDates: [] }),
      makeTask({ date: SAT_KEY, completedDates: [] }),
    ];
    expect(calcStreak(tasks, MON).streak).toBe(0);
  });

  it("0 of 3 tasks done on Saturday (outside retro window, Tuesday) → streak breaks → 0", () => {
    // Saturday is now 3 calendar days back from Tuesday → no longer pending.
    // Zero completions = truly missed → streak resets.
    const tasks = [
      makeTask({ date: SAT_KEY, completedDates: [] }),
      makeTask({ date: SAT_KEY, completedDates: [] }),
      makeTask({ date: SAT_KEY, completedDates: [] }),
    ];
    expect(calcStreak(tasks, TUE_0001).streak).toBe(0);
  });

  // ── XP / stage ────────────────────────────────────────────────────────────

  it("no completions → stage 1, growthPct 0", () => {
    const { stage, growthPct } = calcStreak([], MON);
    expect(stage).toBe(1);
    expect(growthPct).toBe(0);
  });

  it("1 task completed (sole task that day) → stage 1, growthPct = XP_PER_TASK + XP_PERFECT_DAY", () => {
    // One task, completed — it's also the only task so perfect-day bonus fires too
    const tasks = [makeTask({ date: MON_KEY, completedDates: [MON_KEY] })];
    const { stage, growthPct } = calcStreak(tasks, MON);
    expect(stage).toBe(1);
    expect(growthPct).toBe(XP_PER_TASK + XP_PERFECT_DAY);
  });

  it("perfect day (all tasks done) adds XP_PERFECT_DAY bonus", () => {
    // Two tasks on Monday, both done → 2 × XP_PER_TASK + XP_PERFECT_DAY
    const tasks = [
      makeTask({ date: MON_KEY, completedDates: [MON_KEY] }),
      makeTask({ date: MON_KEY, completedDates: [MON_KEY] }),
    ];
    const { growthPct } = calcStreak(tasks, MON);
    expect(growthPct).toBe(2 * XP_PER_TASK + XP_PERFECT_DAY);
  });

  it("partial day (not all tasks done) gives NO perfect-day bonus", () => {
    // Two tasks, only one done → only XP_PER_TASK (no bonus)
    const tasks = [
      makeTask({ date: MON_KEY, completedDates: [MON_KEY] }),
      makeTask({ date: MON_KEY, completedDates: [] }),
    ];
    const { growthPct } = calcStreak(tasks, MON);
    expect(growthPct).toBe(XP_PER_TASK);
  });

  it("enough completions to level up to stage 2", () => {
    // Each day has exactly 1 task → earns XP_PER_TASK + XP_PERFECT_DAY per day.
    // Days needed = XP_PER_STAGE / (XP_PER_TASK + XP_PERFECT_DAY) rounded up.
    const xpPerDay = XP_PER_TASK + XP_PERFECT_DAY; // 15
    const daysNeeded = Math.ceil(XP_PER_STAGE / xpPerDay); // 7 days → 105 XP
    const tasks: Task[] = [];
    for (let i = 0; i < daysNeeded; i++) {
      // Use unique date keys spread back from SAT (all in the past, on-time for streak)
      const dateKey = `2026-03-${String(28 - i).padStart(2, "0")}`;
      tasks.push(makeTask({
        date: dateKey,
        completedDates: [dateKey],
        completedTimestamps: { [dateKey]: new Date(2026, 2, 28 - i, 12).toISOString() },
      }));
    }
    const totalXp = daysNeeded * xpPerDay; // 105
    const expectedStage = Math.min(Math.floor(totalXp / XP_PER_STAGE) + 1, MAX_STAGE);
    const expectedPct = totalXp % XP_PER_STAGE;
    const { stage, growthPct } = calcStreak(tasks, MON);
    expect(stage).toBe(expectedStage);
    expect(growthPct).toBe(expectedPct);
  });

  it("XP overflows correctly into a higher stage with leftover growthPct", () => {
    // Strategy: use 14 single-task days (14 × 15 XP = 210 XP total).
    // 210 XP → stage = floor(210/100)+1 = 3, growthPct = 210 % 100 = 10.
    const days = 14;
    const xpPerDay = XP_PER_TASK + XP_PERFECT_DAY; // 15 (1 task/day = perfect day)
    const tasks: Task[] = [];
    for (let i = 0; i < days; i++) {
      const dateKey = `2026-03-${String(28 - i).padStart(2, "0")}`;
      tasks.push(makeTask({
        date: dateKey,
        completedDates: [dateKey],
        completedTimestamps: { [dateKey]: new Date(2026, 2, 28 - i, 12).toISOString() },
      }));
    }
    const totalXp = days * xpPerDay; // 210
    const expectedStage = Math.min(Math.floor(totalXp / XP_PER_STAGE) + 1, MAX_STAGE); // 3
    const expectedPct = totalXp % XP_PER_STAGE; // 10
    const { stage, growthPct } = calcStreak(tasks, MON);
    expect(stage).toBe(expectedStage);  // 3
    expect(growthPct).toBe(expectedPct); // 10
  });

  it("stage is capped at MAX_STAGE even with huge XP", () => {
    const tasks: Task[] = [];
    for (let i = 0; i < 500; i++) {
      tasks.push(makeTask({ date: SAT_KEY, completedDates: [SAT_KEY] }));
    }
    const { stage, growthPct } = calcStreak(tasks, MON);
    expect(stage).toBe(MAX_STAGE);
    expect(growthPct).toBeLessThan(100); // capped at 99
  });

  it("future completion does NOT count toward XP", () => {
    const tasks = [makeTask({ date: TUE_KEY, completedDates: [TUE_KEY] })];
    const { stage, growthPct } = calcStreak(tasks, MON);
    expect(stage).toBe(1);
    expect(growthPct).toBe(0);
  });
});
