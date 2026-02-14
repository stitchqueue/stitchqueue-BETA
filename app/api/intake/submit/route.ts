import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check — bots fill hidden fields
    if (body.website_url) {
      // Silently succeed so bot thinks it worked
      return NextResponse.json({ success: true });
    }

    const {
      slug,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      clientStreet,
      clientCity,
      clientState,
      clientPostalCode,
      clientCountry,
      quiltWidth,
      quiltLength,
      clientSuppliesBacking,
      clientSuppliesBatting,
      serviceType,
      dueDate,
      description,
    } = body;

    // Validate required fields
    if (!slug || !clientFirstName || !clientLastName || !clientEmail) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Fetch organization by slug
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, intake_form_enabled, intake_auto_response, intake_notification_email, email")
      .eq("intake_form_slug", slug)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    if (!org.intake_form_enabled) {
      return NextResponse.json(
        { error: "This intake form is not currently active" },
        { status: 403 }
      );
    }

    // Create project in estimates stage
    const projectId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { error: insertError } = await supabase.from("projects").insert({
      id: projectId,
      organization_id: org.id,
      stage: "estimates",
      intake_date: now.slice(0, 10),
      client_first_name: clientFirstName.trim(),
      client_last_name: clientLastName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone?.trim() || null,
      client_street: clientStreet?.trim() || null,
      client_city: clientCity?.trim() || null,
      client_state: clientState?.trim() || null,
      client_postal_code: clientPostalCode?.trim() || null,
      client_country: clientCountry?.trim() || null,
      quilt_width: quiltWidth ? parseFloat(quiltWidth) : null,
      quilt_length: quiltLength ? parseFloat(quiltLength) : null,
      client_supplies_backing: clientSuppliesBacking === true,
      client_supplies_batting: clientSuppliesBatting === true,
      service_type: serviceType || null,
      due_date: dueDate || null,
      description: description?.trim() || null,
      requested_date_type: dueDate ? "specific_date" : "no_date",
      source: "intake_form",
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      console.error("Error creating intake project:", insertError);
      return NextResponse.json(
        { error: "Failed to submit request" },
        { status: 500 }
      );
    }

    // Send notification to quilter
    const notifyEmail = org.intake_notification_email || org.email;
    if (resend && notifyEmail) {
      try {
        await resend.emails.send({
          from: "StitchQueue <notifications@stitchqueue.com>",
          to: [notifyEmail],
          subject: `New Client Request from ${clientFirstName} ${clientLastName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #4e283a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 20px;">New Client Request</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p><strong>Client:</strong> ${clientFirstName} ${clientLastName}</p>
                <p><strong>Email:</strong> ${clientEmail}</p>
                ${clientPhone ? `<p><strong>Phone:</strong> ${clientPhone}</p>` : ""}
                ${quiltWidth && quiltLength ? `<p><strong>Quilt Size:</strong> ${quiltWidth}" × ${quiltLength}"</p>` : ""}
                ${serviceType ? `<p><strong>Service:</strong> ${serviceType}</p>` : ""}
                ${dueDate ? `<p><strong>Preferred Date:</strong> ${dueDate}</p>` : ""}
                ${description ? `<p><strong>Notes:</strong> ${description}</p>` : ""}
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/board" style="background: #4e283a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">
                    View in StitchQueue
                  </a>
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send quilter notification:", emailErr);
      }
    }

    // Send auto-response to client
    if (resend && clientEmail && org.intake_auto_response) {
      try {
        const autoBody = org.intake_auto_response
          .replace(/\{client_name\}/g, clientFirstName)
          .replace(/\{business_name\}/g, org.name || "our studio");

        await resend.emails.send({
          from: `${org.name || "StitchQueue"} <notifications@stitchqueue.com>`,
          to: [clientEmail],
          subject: `Request received - ${org.name || "Quilting Studio"}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #4e283a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 20px;">${org.name || "Quilting Studio"}</h1>
              </div>
              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p>${autoBody.replace(/\n/g, "<br>")}</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Failed to send client auto-response:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Intake submission error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
