import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass } = await request.json();

    if (!smtp_host || !smtp_user || !smtp_pass) {
      return Response.json({ error: 'Missing SMTP credentials' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port || 587,
      secure: (smtp_port || 587) === 465,
      auth: { user: smtp_user, pass: smtp_pass },
      connectionTimeout: 10000,
    });

    await transporter.verify();

    return Response.json({ success: true, message: 'SMTP connection successful!' });
  } catch (error) {
    return Response.json(
      { error: `SMTP connection failed: ${error.message}` },
      { status: 400 }
    );
  }
}
