const resend = require('resend')('<YOUR_RESEND_API_KEY>'); // Use env variable ideally

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage } = req.body;

  try {
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h1>${subject}</h1>
        <p>${customMessage}</p>
        <p>Sent via <strong>GreetingCardGenius</strong></p>
      </div>
    `;

    const response = await resend.emails.send({
      from: 'Greeting Card Genius <cards@greetingcardgenius.com.au>',
      to: toEmail,
      subject,
      html: emailHtml,
    });

    return res.status(200).json({ message: 'Email sent successfully!', data: response });
  } catch (error) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error });
  }
};
