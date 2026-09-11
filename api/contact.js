module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  var body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      res.status(400).json({ ok: false, error: "Invalid request body" });
      return;
    }
  }

  if (!body || typeof body !== "object") {
    res.status(400).json({ ok: false, error: "Invalid request body" });
    return;
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    res.status(200).json({ ok: true });
    return;
  }

  var name = typeof body.name === "string" ? body.name.trim() : "";
  var email = typeof body.email === "string" ? body.email.trim() : "";
  var message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    res.status(400).json({
      ok: false,
      error: "Name, email, and message are required.",
    });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({
      ok: false,
      error: "Please provide a valid email address.",
    });
    return;
  }

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      ok: false,
      error: "Email service is not configured.",
    });
    return;
  }

  try {
    var resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Clarity Contact Form <contact@mail.discoverclarity.app>",
        to: "hello@discoverclarity.app",
        reply_to: email,
        subject: "New message from " + name + " via discoverclarity.app",
        text:
          "Name: " +
          name +
          "\nEmail: " +
          email +
          "\n\n" +
          message,
      }),
    });

    if (!resendRes.ok) {
      res.status(502).json({
        ok: false,
        error: "Unable to send message. Please try again.",
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({
      ok: false,
      error: "Unable to send message. Please try again.",
    });
  }
};
