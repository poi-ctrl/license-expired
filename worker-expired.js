const LICENSES = {
  "BUYER-001": {
    password: "kosong 1",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-002": {
    password: "kosong 2",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-003": {
    password: "kosong 3",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-004": {
    password: "kosong 4",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-005": {
    password: "kosong 5",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-006": {
    password: "kosong 6",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-007": {
    password: "kosong 7",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-008": {
    password: "kosong 8",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-009": {
    password: "kosong 9",
    status: "active",
    expired: "2026-09-30"
  },
  "BUYER-010": {
    password: "kosong 10",
    status: "active",
    expired: "2026-09-30"
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

    // ==========================================
    // OPTIONS
    // ==========================================

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


    // ==========================================
    // ONLY POST
    // ==========================================

    if (request.method !== "POST") {

      return json({
        ok: false,
        message: "Gunakan POST"
      }, 405);

    }


    try {

      // ========================================
      // BACA REQUEST
      // ========================================

      const body = await request.json();

      const license =
        String(body.license || "").trim();

      const password =
        String(body.password || "");

      const device_id =
        body.device_id
          ? String(body.device_id)
          : "";


      // ========================================
      // VALIDASI INPUT
      // ========================================

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


      // ========================================
      // CARI LICENSE
      // ========================================

      const licenseData = LICENSES[license];


      if (!licenseData) {

        return json({
          ok: false,
          message: "License tidak ditemukan"
        }, 404);

      }


      // ========================================
      // CEK PASSWORD
      // ========================================

      if (licenseData.password !== password) {

        return json({
          ok: false,
          message: "Password salah"
        }, 401);

      }


      // ========================================
      // CEK STATUS
      // ========================================

      if (licenseData.status !== "active") {

        return json({
          ok: false,
          message: "License tidak aktif"
        }, 403);

      }


      // ========================================
      // CEK EXPIRED
      // ========================================

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


      // ========================================
      // CEK KV BINDING
      // ========================================

      if (!env.LICENSE) {

        return json({
          ok: false,
          message: "KV binding LICENSE belum tersedia"
        }, 500);

      }


      // ========================================
      // CEK DEVICE YANG SUDAH TERDAFTAR
      // ========================================

      const savedDevice =
        await env.LICENSE.get(license);


      // ========================================
      // LICENSE BELUM TERIKAT
      // ========================================

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


      // ========================================
      // DEVICE SAMA
      // ========================================

      if (savedDevice === device_id) {

        return json({
          ok: true,
          message: "License valid",
          license: license,
          device_id: device_id,
          expired: licenseData.expired
        }, 200);

      }


      // ========================================
      // DEVICE BERBEDA
      // ========================================

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
