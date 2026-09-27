import { describe, expect, it } from "vitest";
import { runPairPartnerDevice, runRegisterDevice } from "@/lib/remote-logic";

/**
 * Fake supabase-js query builder that operates on an in-memory table map.
 * Supports the subset used by the register/pair handlers:
 *   .from(table).select(cols).eq(col, val).maybeSingle()
 *   .from(table).update(patch).eq(...).eq(...)
 *   .from(table).insert(row)
 */
function createFakeAdmin(initial: Record<string, any[]> = {}) {
  const tables: Record<string, any[]> = {
    client_devices: [],
    devices: [],
    ...initial,
  };

  function from(table: string) {
    const filters: Array<[string, any]> = [];
    let mode: "select" | "update" | "insert" | null = null;
    let patch: any = null;

    const applyFilters = () =>
      tables[table].filter((row) => filters.every(([k, v]) => row[k] === v));

    const chain: any = {
      select() {
        mode = "select";
        return chain;
      },
      insert(row: any) {
        mode = "insert";
        tables[table] = tables[table] ?? [];
        // Simulate the PK conflict that a real DB would raise on duplicate device_id.
        if (tables[table].some((r) => r.device_id === row.device_id)) {
          return Promise.resolve({ data: null, error: { message: "duplicate key" } });
        }
        tables[table].push({ ...row });
        return Promise.resolve({ data: row, error: null });
      },
      update(p: any) {
        mode = "update";
        patch = p;
        return chain;
      },
      eq(col: string, val: any) {
        filters.push([col, val]);
        if (mode === "update") {
          // update returns a thenable once the last .eq resolves the chain
          return {
            eq: (c2: string, v2: any) => {
              filters.push([c2, v2]);
              const rows = applyFilters();
              rows.forEach((r) => Object.assign(r, patch));
              return Promise.resolve({ data: rows, error: null });
            },
            then: (resolve: any) => {
              const rows = applyFilters();
              rows.forEach((r) => Object.assign(r, patch));
              resolve({ data: rows, error: null });
            },
          };
        }
        return chain;
      },
      maybeSingle() {
        const rows = applyFilters();
        return Promise.resolve({ data: rows[0] ?? null, error: null });
      },
    };
    return chain;
  }

  return { from, _tables: tables };
}

describe("device_id_takeover regression — /api/public/remote/register", () => {
  it("inserts a brand-new device", async () => {
    const admin = createFakeAdmin();
    const res = await runRegisterDevice(admin, { deviceId: "123456789", pin: "1234" });
    expect(res.status).toBe(200);
    expect(admin._tables.client_devices).toHaveLength(1);
    expect(admin._tables.client_devices[0].current_pin).toBe("1234");
  });

  it("REJECTS overwriting an existing device with a different PIN (403)", async () => {
    const admin = createFakeAdmin({
      client_devices: [{ device_id: "123-456-789", current_pin: "1111", alias: "victim" }],
    });
    const res = await runRegisterDevice(admin, {
      deviceId: "123-456-789",
      pin: "9999",
      alias: "attacker",
    });
    expect(res.status).toBe(403);
    // The victim row must be untouched — no PIN or alias overwrite.
    expect(admin._tables.client_devices[0].current_pin).toBe("1111");
    expect(admin._tables.client_devices[0].alias).toBe("victim");
  });

  it("allows metadata refresh when the caller proves ownership with the correct PIN", async () => {
    const admin = createFakeAdmin({
      client_devices: [{ device_id: "123-456-789", current_pin: "1111", alias: "old" }],
    });
    const res = await runRegisterDevice(admin, {
      deviceId: "123-456-789",
      pin: "1111",
      alias: "new",
    });
    expect(res.status).toBe(200);
    expect(admin._tables.client_devices[0].current_pin).toBe("1111");
    expect(admin._tables.client_devices[0].alias).toBe("new");
  });

  it("refuses to shadow a device_id that already belongs to an account device", async () => {
    const admin = createFakeAdmin({
      devices: [{ device_id: "123-456-789", pin: "5555" }],
    });
    const res = await runRegisterDevice(admin, { deviceId: "123-456-789", pin: "9999" });
    expect(res.status).toBe(403);
    expect(admin._tables.client_devices).toHaveLength(0);
  });
});

describe("device_id_takeover regression — pairPartnerDevice", () => {
  it("pairs a brand-new partner device", async () => {
    const admin = createFakeAdmin();
    const res = await runPairPartnerDevice(admin, { partnerDeviceId: "123456789", pin: "1234" });
    expect(res.ok).toBe(true);
    expect(admin._tables.client_devices).toHaveLength(1);
  });

  it("REJECTS pairing when the device_id already exists in client_devices, regardless of PIN", async () => {
    const admin = createFakeAdmin({
      client_devices: [{ device_id: "123-456-789", current_pin: "1111", alias: "victim" }],
    });

    // Same PIN — still rejected: pair must never overwrite.
    const sameRes = await runPairPartnerDevice(admin, {
      partnerDeviceId: "123-456-789",
      pin: "1111",
    });
    expect(sameRes.ok).toBe(false);

    // Different PIN — also rejected.
    const diffRes = await runPairPartnerDevice(admin, {
      partnerDeviceId: "123-456-789",
      pin: "9999",
      alias: "attacker",
    });
    expect(diffRes.ok).toBe(false);

    // Victim row must remain unchanged.
    expect(admin._tables.client_devices).toHaveLength(1);
    expect(admin._tables.client_devices[0].current_pin).toBe("1111");
    expect(admin._tables.client_devices[0].alias).toBe("victim");
  });

  it("REJECTS pairing when the device_id belongs to an account device", async () => {
    const admin = createFakeAdmin({
      devices: [{ device_id: "123-456-789", pin: "5555" }],
    });
    const res = await runPairPartnerDevice(admin, {
      partnerDeviceId: "123-456-789",
      pin: "9999",
    });
    expect(res.ok).toBe(false);
    expect(admin._tables.client_devices).toHaveLength(0);
  });
});
