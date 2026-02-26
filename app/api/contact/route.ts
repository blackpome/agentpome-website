// app/api/contact/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    
    const { email, message } = await req.json();

    if (!email || !message) {
        return NextResponse.json({ error: "Missing fields" })
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const ownerHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <!-- Link to Public Sans (fallbacks to Arial in most email clients) -->
          <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Public Sans', Arial, sans-serif;
              background-color: #f5f5f5;
              padding: 20px;
              margin: 0;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: 'Public Sans', Arial, sans-serif;">
          <div style="text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <!-- Card container -->
                  <table style="width: 320px; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" cellpadding="0" cellspacing="0" border="0">

                    <!-- Message Content -->
                    <tr>
                      <td style="padding: 24px; font-size: 14px; color: #000000; line-height: 1.4; text-align: left; font-family: 'Public Sans', Arial, sans-serif;">
                        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">New Contact Message</h2>
                        <p style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 0 0 20px;">
                            <strong>From : </strong>${email}<br/><br/>
                            <strong>Message : </strong>${message}
                        </p>
                      </td>
                    </tr>

                    <!-- Logo at bottom-right via nested table row -->
                    <tr>
                      <td style="padding: 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="width: 100%;"></td>
                            <td style="padding: 0;">
                              <img
                                src="${process.env.DOMAIN}/bP_Right.png"
                                alt="Logo"
                                width="150"
                                height="150"
                                style="display: block; border-bottom-right-radius: 12px;"
                              />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
    `;

    const userHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <!-- Link to Public Sans (fallbacks to Arial in most email clients) -->
          <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Public Sans', Arial, sans-serif;
              background-color: #f5f5f5;
              padding: 20px;
              margin: 0;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: 'Public Sans', Arial, sans-serif;">
          <div style="text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <!-- Card container -->
                  <table style="width: 320px; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" cellpadding="0" cellspacing="0" border="0">

                    <!-- Message Content -->
                    <tr>
                      <td style="padding: 24px; font-size: 14px; color: #000000; line-height: 1.4; text-align: left; font-family: 'Public Sans', Arial, sans-serif;">
                        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Thanks for reaching out!</h2>
                        <p style="margin: 0 0 12px;">We received your message and will get back to you soon.</p>
                        <p style="background: #f9f9f9; padding: 12px; border-radius: 8px; margin: 0 0 20px;">
                          <strong>Your message : </strong>${message}
                        </p>
                        <p style="margin: 0;">BR | AgentPome</p>
                      </td>
                    </tr>

                    <!-- Logo at bottom-right via nested table row -->
                    <tr>
                      <td style="padding: 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="width: 100%;"></td>
                            <td style="padding: 0;">
                              <img
                                src="${process.env.DOMAIN}/bP_Right.png"
                                alt="Logo"
                                width="150"
                                height="150"
                                style="display: block; border-bottom-right-radius: 12px;"
                              />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
    `;


    try {
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: process.env.SMTP_EMAIL,
            subject: "New Contact Form Submission",
            html: ownerHtml,
        });

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: "Thank you for contacting us",
            html: userHtml,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

}