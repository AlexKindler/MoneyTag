import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Sanitize user-provided strings to prevent prompt injection and XSS
function sanitizeInput(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return ""
  return input
    .replace(/[<>{}]/g, "") // strip HTML/template chars
    .replace(/[\x00-\x1F\x7F]/g, "") // strip control characters
    .slice(0, maxLength)
    .trim()
}

export async function POST(req: Request) {
  // Rate limit the explain endpoint
  const ip = getClientIp(req)
  const { success } = rateLimit(ip)
  if (!success) {
    return Response.json(
      { blurb: null, error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { blurb: null, error: "OpenAI API key not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()

    // Validate and sanitize all inputs
    const name = sanitizeInput(body.name, 200)
    const sourceCode = sanitizeInput(body.sourceCode, 50)
    const category = sanitizeInput(body.category, 50)
    const depth = typeof body.depth === "number" ? body.depth : -1
    const amount = typeof body.amount === "number" ? body.amount : 0
    const outlayAmount = typeof body.outlayAmount === "number" ? body.outlayAmount : null
    const parentTrail = Array.isArray(body.parentTrail)
      ? body.parentTrail.map((t: unknown) => sanitizeInput(t, 200)).filter(Boolean).slice(0, 10)
      : []

    if (!name) {
      return Response.json({ blurb: null, error: "Invalid input" }, { status: 400 })
    }

    if (depth !== 3) {
      return Response.json({ blurb: null }, { status: 200 })
    }

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Math.abs(amount))

    const formattedOutlay = outlayAmount
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(Math.abs(outlayAmount))
      : null

    const fundingPath = parentTrail.join(" → ") + " → " + name

    const prompt = `You are a U.S. federal budget expert writing for ordinary citizens. Given the following federal spending line item, write a clear, informative 3-4 sentence explanation of what this money is actually being spent on in practical, real-world terms. Avoid jargon. Help a regular citizen understand exactly what services, programs, or activities this funding supports and how it impacts their daily life or community.

Spending Line Item:
- Name: ${name}
- Source Code: ${sourceCode}
- Obligated Amount: ${formattedAmount}
${formattedOutlay ? `- Outlayed Amount: ${formattedOutlay}` : ""}
- Spending Category: ${category || "Unknown"}
- Funding Path: ${fundingPath}

Write a concise but informative explanation (3-4 sentences, no bullet points). Start directly with what the money pays for. Do not repeat the name or amount.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 250,
    })

    return Response.json({ blurb: text })
  } catch (error) {
    console.error("Error generating spending explanation:", error)
    return Response.json(
      { blurb: null, error: "Failed to generate explanation" },
      { status: 500 }
    )
  }
}
