import nodemailer from "nodemailer";

export async function sendReferralEmails({
  referralId,
  data,
}: {
  referralId: string;
  data: any;
}) {
  const clientName = data.client?.fullName || "Unknown Client";
  const clientEmail = data.client?.email || "";
  const referrerName = data.referrer?.referrerName || "Self Referral";
  const paymentType = data.paymentType || "Unknown";
  const host = process.env.SMTP_HOST || "mail.smtp2go.com";
  const port = parseInt(process.env.SMTP_PORT || "2525");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || "community@thecarefirstphysiotherapyservice.com.au";
  const fromName = process.env.SMTP_FROM_NAME || "The Care First Physiotherapy Service";
  const adminEmail = "community@thecarefirstphysiotherapyservice.com.au";

  const emailDetailsHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #799A29; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: white;">New Referral Received</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9; color: white;">Referral ID: ${referralId}</p>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px 0;">Hello Intake Team,</p>
        <p style="margin: 0 0 20px 0;">A new physiotherapy referral has been successfully submitted online and is awaiting clinical review in the Admin Dashboard.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 30%; font-size: 14px;">Client Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${clientName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Client Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${clientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Client Phone:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.client?.phoneNumber || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Client Address:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.client?.address || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Date of Birth:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.client?.dob ? new Date(data.client.dob).toLocaleDateString() : "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Gender:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.client?.gender || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Reason for Referral:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.client?.reasonForReferral || "N/A"}</td>
          </tr>
        </table>

        <h3 style="margin: 20px 0 10px 0; font-size: 16px; font-weight: bold; color: #799A29; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px;">Payment & Scheduling Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 30%; font-size: 14px;">Payment Type:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${paymentType}</td>
          </tr>
          ${data.paymentType === "NDIS" ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">NDIS Management:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.ndisDetails?.managementType || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">NDIS Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.ndisDetails?.participantId || "N/A"}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Appointment Type:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.preferredAppointmentType || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Preferred Days:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${Array.isArray(data.preferredDays) ? data.preferredDays.join(", ") : (data.preferredDays || "N/A")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Preferred Time:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.preferredTime || "N/A"}</td>
          </tr>
        </table>

        <h3 style="margin: 20px 0 10px 0; font-size: 16px; font-weight: bold; color: #799A29; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px;">Medical & Goals</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 30%; font-size: 14px;">Primary Diagnosis:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.medicalHistory?.primaryDiagnosis || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Client Goals:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.goals?.clientGoals || "N/A"}</td>
          </tr>
        </table>

        <h3 style="margin: 20px 0 10px 0; font-size: 16px; font-weight: bold; color: #799A29; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px;">Referrer Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 30%; font-size: 14px;">Referrer Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${referrerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Company/Clinic:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${data.referrer?.companyName || "N/A"}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/referrals" style="background-color: #799A29; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View in Admin Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        &copy; ${new Date().getFullYear()} The Care First Physiotherapy Service. All rights reserved.
      </div>
    </div>
  `;

  const clientConfirmationHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #799A29; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: white;">Booking Referral Submitted</h1>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px 0;">Dear ${clientName},</p>
        <p style="margin: 0 0 16px 0;">Thank you for submitting your physiotherapy referral booking request. We have successfully received your form details.</p>
        <p style="margin: 0 0 20px 0;">Our clinical intake coordinator is currently reviewing your medical information and preferences. We will contact you shortly to coordinate your first consultation.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Service Profile Summary:</h3>
          <p style="margin: 0; font-size: 13px; color: #4b5563;">Selected Payment Option: <strong>${paymentType}</strong>. Our team will verify plan details and eligibility constraints to structure the optimal care plan for you.</p>
        </div>

        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">If you have any questions or urgent updates in the meantime, please feel free to reach out to us at <a href="mailto:${adminEmail}" style="color: #799A29; font-weight: bold;">${adminEmail}</a>.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        &copy; ${new Date().getFullYear()} The Care First Physiotherapy Service. All rights reserved.
      </div>
    </div>
  `;

  if (user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    try {
      // 1. Send Admin Notification
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail,
        subject: `[New Referral] ${clientName} - ${paymentType}`,
        html: emailDetailsHtml,
      });

      // 2. Send Client Confirmation
      if (clientEmail) {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: clientEmail,
          subject: `Physiotherapy Referral Received - The Care First`,
          html: clientConfirmationHtml,
        });
      }

      console.log("Referral emails sent successfully.");
    } catch (err) {
      console.error("Nodemailer error:", err);
    }
  } else {
    console.log("---------------- DRY RUN EMAIL MODE ----------------");
    console.log("No SMTP credentials set. Logging emails locally:");
    console.log(`[Admin Email to ${adminEmail}]`);
    console.log(`[Client Email to ${clientEmail}]`);
    console.log("----------------------------------------------------");
  }
}

export async function sendContactLeadEmail({
  fullName,
  email,
  phoneNumber,
  message,
  serviceInterest,
}: {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  message: string;
  serviceInterest?: string | null;
}) {
  const host = process.env.SMTP_HOST || "mail.smtp2go.com";
  const port = parseInt(process.env.SMTP_PORT || "2525");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL || "community@thecarefirstphysiotherapyservice.com.au";
  const fromName = process.env.SMTP_FROM_NAME || "The Care First Physiotherapy Service";
  const adminEmail = "community@thecarefirstphysiotherapyservice.com.au";

  const emailDetailsHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #799A29; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: white;">New Contact Form Submission</h1>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px 0;">Hello Team,</p>
        <p style="margin: 0 0 20px 0;">A new contact form submission has been received from the website.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; width: 150px; font-size: 14px;">Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Phone:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${phoneNumber || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; font-size: 14px;">Service Interest:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">${serviceInterest || "N/A"}</td>
          </tr>
        </table>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #374151;">Message:</h3>
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/leads" style="background-color: #799A29; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View in Admin Dashboard</a>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        &copy; ${new Date().getFullYear()} The Care First Physiotherapy Service. All rights reserved.
      </div>
    </div>
  `;

  const clientConfirmationHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #799A29; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: bold; color: white;">Thank You for Contacting Us</h1>
      </div>
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px 0;">Dear ${fullName},</p>
        <p style="margin: 0 0 16px 0;">Thank you for reaching out to The Care First Physiotherapy Service. We have successfully received your message.</p>
        <p style="margin: 0 0 20px 0;">Our team will review your inquiry and get back to you as soon as possible.</p>
        
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">If you have any urgent questions, please feel free to reach out to us at <a href="mailto:${adminEmail}" style="color: #799A29; font-weight: bold;">${adminEmail}</a>.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        &copy; ${new Date().getFullYear()} The Care First Physiotherapy Service. All rights reserved.
      </div>
    </div>
  `;

  if (user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    try {
      // 1. Send Admin Notification
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: adminEmail,
        subject: `[New Contact Lead] ${fullName}`,
        html: emailDetailsHtml,
        replyTo: email,
      });

      // 2. Send Client Confirmation
      if (email) {
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          subject: `Thank you for contacting The Care First Physiotherapy`,
          html: clientConfirmationHtml,
        });
      }

      console.log("Contact lead emails sent successfully.");
    } catch (err) {
      console.error("Nodemailer error sending contact lead:", err);
    }
  } else {
    console.log("---------------- DRY RUN EMAIL MODE ----------------");
    console.log(`No SMTP credentials set. Logging contact email to ${adminEmail}:`);
    console.log(`From: ${fullName} <${email}>`);
    console.log(`Message: ${message}`);
    console.log("----------------------------------------------------");
  }
}
