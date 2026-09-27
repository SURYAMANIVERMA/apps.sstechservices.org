// Pure server-side logic for remote device pairing / registration.
// Extracted so it can be exercised by regression tests without needing
// a real Supabase client. The functions accept any object shaped like
// the admin client's fluent query builder (see the fake used in tests).

export function normalizeDeviceId(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length === 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

export type RegisterInput = {
  deviceId: string;
  pin: string;
  alias?: string | null;
  platform?: string | null;
  appVersion?: string | null;
};

export type RegisterResult =
  | { status: 200; body: { ok: true; deviceId: string } }
  | { status: 403 | 500; body: { error: string } };

export async function runRegisterDevice(admin: any, input: RegisterInput, now = new Date().toISOString()): Promise<RegisterResult> {
  const deviceId = normalizeDeviceId(input.deviceId);
  const pin = input.pin.replace(/\D/g, "");

  const { data: existingClient, error: existingClientError } = await admin
    .from("client_devices")
    .select("device_id,current_pin")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (existingClientError) return { status: 500, body: { error: "Unable to register device" } };

  if (existingClient) {
    if (existingClient.current_pin !== pin) {
      return { status: 403, body: { error: "Device already registered" } };
    }
    const { error: updateError } = await admin
      .from("client_devices")
      .update({
        alias: input.alias || null,
        platform: input.platform || null,
        app_version: input.appVersion || null,
        last_seen: now,
        updated_at: now,
      })
      .eq("device_id", deviceId)
      .eq("current_pin", pin);
    if (updateError) return { status: 500, body: { error: "Unable to register device" } };
    return { status: 200, body: { ok: true, deviceId } };
  }

  const { data: accountDevice, error: accountDeviceError } = await admin
    .from("devices")
    .select("device_id")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (accountDeviceError) return { status: 500, body: { error: "Unable to register device" } };
  if (accountDevice) return { status: 403, body: { error: "Device already registered" } };

  const { error: insertError } = await admin.from("client_devices").insert({
    device_id: deviceId,
    current_pin: pin,
    alias: input.alias || null,
    platform: input.platform || null,
    app_version: input.appVersion || null,
    last_seen: now,
    updated_at: now,
  });
  if (insertError) return { status: 500, body: { error: "Unable to register device" } };
  return { status: 200, body: { ok: true, deviceId } };
}

export type PairInput = {
  partnerDeviceId: string;
  pin: string;
  alias?: string | null;
};

export type PairResult =
  | { ok: true; deviceId: string }
  | { ok: false; error: string };

export async function runPairPartnerDevice(admin: any, input: PairInput, now = new Date().toISOString()): Promise<PairResult> {
  const deviceId = normalizeDeviceId(input.partnerDeviceId);
  const pin = input.pin.replace(/\D/g, "");

  const { data: existingClient, error: existingClientError } = await admin
    .from("client_devices")
    .select("device_id")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (existingClientError) return { ok: false, error: "Unable to pair device" };
  if (existingClient) return { ok: false, error: "Device is already registered" };

  const { data: accountDevice, error: accountDeviceError } = await admin
    .from("devices")
    .select("device_id")
    .eq("device_id", deviceId)
    .maybeSingle();
  if (accountDeviceError) return { ok: false, error: "Unable to pair device" };
  if (accountDevice) return { ok: false, error: "Device is already registered" };

  const { error } = await admin.from("client_devices").insert({
    device_id: deviceId,
    current_pin: pin,
    alias: input.alias || null,
    updated_at: now,
  });
  if (error) return { ok: false, error: "Unable to pair device" };
  return { ok: true, deviceId };
}
