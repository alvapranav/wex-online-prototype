import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Set this environment variable to disable certificate verification
    // WARNING: This is insecure and should only be used for local development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17"
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(error, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    // Reset the environment variable after the request is complete
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
}
