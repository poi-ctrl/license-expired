const LICENSES = {
  "BUYER-001": {
    "password": "kosong 1",
    "status": "active",
    "expired": "2026-09-10",
    "device_id": null
  },
  "ADIKKK": {
    "password": "naomi01",
    "status": "active",
    "expired": "2026-09-10",
    "device_id": null
  },
  "KHOLIS": {
    "password": "kholis01",
    "status": "active",
    "expired": "2026-09-10",
    "device_id": null
  },
  "ALDI": {
    "password": "aldi01",
    "status": "active",
    "expired": "2026-09-10",
    "device_id": null
  },
  "BYTEN": {
    "password": "byten01",
    "status": "active",
    "expired": "2026-09-10",
    "device_id": null
  },
  "TOKYO": {
    "password": "rendy660715",
    "status": "active",
    "expired": "2026-09-10",
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
  },
  "BUYER-011": {
    "password": "kosong 11",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-012": {
    "password": "kosong 12",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-013": {
    "password": "kosong 13",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-014": {
    "password": "kosong 14",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-015": {
    "password": "kosong 15",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-016": {
    "password": "kosong 16",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-017": {
    "password": "kosong 17",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-018": {
    "password": "kosong 18",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-019": {
    "password": "kosong 19",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  },
  "BUYER-020": {
    "password": "kosong 20",
    "status": "active",
    "expired": "2026-09-30",
    "device_id": null
  }
};


function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}


export default {

  async fetch(request, env) {

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

      return json({
        ok: false,
        message: "Gunakan POST"
      }, 405);

    }


    try {

      const body = await request.json();

      const license =
        String(body.license || "").trim();

      const password =
        String(body.password || "");

      const device_id =
        body.device_id
          ? String(body.device_id)
          : "";


      if (!license || !password) {

        return json({
          ok: false,
          message: "License dan password wajib diisi"
        }, 400);

      }


      if (!device_id) {

        return json({
          ok: false,
          message: "Device ID tidak ditemukan"
        }, 400);

      }


      const licenseData = LICENSES[license];


      if (!licenseData) {

        return json({
          ok: false,
          message: "License tidak ditemukan"
        }, 404);

      }


      if (licenseData.password !== password) {

        return json({
          ok: false,
          message: "Password salah"
        }, 401);

      }


      if (licenseData.status !== "active") {

        return json({
          ok: false,
          message: "License tidak aktif"
        }, 403);

      }


      if (licenseData.expired !== "lifetime") {

        const expired =
          new Date(
            licenseData.expired + "T23:59:59Z"
          );


        if (Number.isNaN(expired.getTime())) {

          return json({
            ok: false,
            message: "Format expired tidak valid"
          }, 500);

        }


        if (new Date() > expired) {

          return json({
            ok: false,
            message: "License sudah expired",
            expired: licenseData.expired
          }, 403);

        }

      }


      if (!env.LICENSE) {

        return json({
          ok: false,
          message: "KV binding LICENSE belum tersedia"
        }, 500);

      }


      const savedDevice =
        await env.LICENSE.get(license);


      if (!savedDevice) {

        await env.LICENSE.put(
          license,
          device_id
        );


        return json({
          ok: true,
          message: "License berhasil diaktifkan",
          license: license,
          device_id: device_id,
          expired: licenseData.expired
        }, 200);

      }


      if (savedDevice === device_id) {

        return json({
          ok: true,
          message: "License valid",
          license: license,
          device_id: device_id,
          expired: licenseData.expired
        }, 200);

      }


      return json({
        ok: false,
        message: "License sudah terikat ke device lain"
      }, 403);


    } catch (error) {

      return json({
        ok: false,
        message: "ERROR SERVER",
        error: String(error)
      }, 500);

    }

  }

};

