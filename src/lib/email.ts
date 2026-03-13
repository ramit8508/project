type OtpEmail = {
  to: string;
  code: string;
};

export async function sendResetOtpEmail({ to, code }: OtpEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "no-reply@yourwish.ai";

  if (!apiKey) {
    return { ok: false, reason: "RESEND_NOT_CONFIGURED" } as const;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your Wish AI password reset code",
      text: `Your reset code is: ${code}`,
      html: `<p>Your reset code is:</p><p style="font-size:20px; font-weight:700;">${code}</p>`,
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: "RESEND_FAILED" } as const;
  }

  return { ok: true } as const;
}
