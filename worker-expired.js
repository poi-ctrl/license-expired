const LICENSES = {
  "BUYER-001": {
    "password": "kosong 1",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-002": {
    "password": "kosong 2",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-003": {
    "password": "kosong 3",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-004": {
    "password": "kosong 4",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-005": {
    "password": "kosong 5",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-006": {
    "password": "kosong 6",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-007": {
    "password": "kosong 7",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-008": {
    "password": "kosong 8",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-009": {
    "password": "kosong 9",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-010": {
    "password": "kosong 10",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, message: "Gunakan POST" }, 405);
    }

    try {
      const body = await request.json();
      const license = String(body.license || "").trim();
      const password = String(body.password || "");
      const device_id = body.device_id ? String(body.device_id) : null;

      if (!license || !password) {
        return json({ ok: false, message: "License dan password wajib diisi" }, 400);
      }

      const licenseData = LICENSES[license];

      if (!licenseData) {
        return json({ ok: false, message: "License tidak ditemukan" }, 404);
      }

      if (licenseData.password !== password) {
        return json({ ok: false, message: "Password salah" }, 401);
      }

      if (licenseData.status !== "active") {
        return json({ ok: false, message: "License tidak aktif" }, 403);
      }

      if (licenseData.expired !== "lifetime") {
        const expired = new Date(licenseData.expired + "T23:59:59Z");

        if (Number.isNaN(expired.getTime())) {
          return json({ ok: false, message: "Format expired tidak valid" }, 500);
        }

        if (new Date() > expired) {
          return json({
            ok: false,
            message: "License sudah expired",
            expired: licenseData.expired
          }, 403);
        }
      }

      return json({
        ok: true,
        message: "License valid",
        license,
        expired: licenseData.expired,
        device_id
      });
    } catch (error) {
      return json({ ok: false, message: "Request tidak valid" }, 400);
    }
  }
};
