import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const pageUrl = formData.get("pageUrl") as string;
    const userAgent = formData.get("userAgent") as string;
    const screenshot = formData.get("screenshot") as File | null;

    // Validate required fields
    if (!email || !category || !description) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["bug", "confusion", "idea", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: "Invalid category" },
        { status: 400 }
      );
    }

    let screenshotUrl: string | null = null;

    // Upload screenshot if provided
    if (screenshot && screenshot.size > 0) {
      const fileExt = screenshot.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const arrayBuffer = await screenshot.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("feedback-screenshots")
        .upload(fileName, buffer, {
          contentType: screenshot.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Screenshot upload error:", uploadError);
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from("feedback-screenshots")
          .getPublicUrl(fileName);
        screenshotUrl = urlData.publicUrl;
      }
    }

    // Insert feedback into database
    const { data: feedbackData, error: insertError } = await supabaseAdmin
      .from("feedback")
      .insert({
        user_email: email,
        category,
        description,
        screenshot_url: screenshotUrl,
        page_url: pageUrl,
        user_agent: userAgent,
        status: "new",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { message: "Failed to save feedback" },
        { status: 500 }
      );
    }

    // Send email notification
    if (process.env.RESEND_API_KEY) {
      const categoryEmoji: Record<string, string> = {
        bug: "🐛",
        confusion: "😕",
        idea: "💡",
        other: "📝",
      };

      const categoryLabel: Record<string, string> = {
        bug: "Bug Report",
        confusion: "Confusing UX",
        idea: "Feature Idea",
        other: "Other Feedback",
      };

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "StitchQueue <feedback@stitchqueue.com>",
            to: ["beta@stitchqueue.com"],
            subject: `${categoryEmoji[category]} ${categoryLabel[category]} from ${email}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #4e283a; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">
                    ${categoryEmoji[category]} ${categoryLabel[category]}
                  </h1>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 16px 0;"><strong>From:</strong> ${email}</p>
                  
                  <p style="margin: 0 0 8px 0;"><strong>Description:</strong></p>
                  <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 16px;">
                    <p style="margin: 0; white-space: pre-wrap;">${description}</p>
                  </div>
                  
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                    <strong>Page:</strong> ${pageUrl}
                  </p>
                  
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    <strong>Browser:</strong> ${userAgent}
                  </p>
                  
                  ${
                    screenshotUrl
                      ? `
                    <div style="margin-top: 16px;">
                      <p style="margin: 0 0 8px 0;"><strong>Screenshot:</strong></p>
                      <a href="${screenshotUrl}" style="color: #4e283a;">View Screenshot</a>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log("Resend API response:", emailResponse.status, emailResult);

        if (emailResponse.ok) {
          console.log("Email notification sent successfully");
        } else {
          console.error("Email send failed:", emailResult);
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }
    }

    return NextResponse.json({
      message: "Feedback submitted successfully",
      id: feedbackData.id,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}