import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { name, sourceCode, amount, outlayAmount, category, parentTrail, depth } = await req.json()

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

    console.log("[v0] Calling generateText with @ai-sdk/openai gpt-4o-mini")
    console.log("[v0] API key present:", !!process.env.OPENAI_API_KEY)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 250,
    })

    console.log("[v0] Got response text:", text?.substring(0, 100))
    return Response.json({ blurb: text })
  } catch (error) {
    console.error("[v0] Error generating spending explanation:", error)
    return Response.json(
      { blurb: null, error: "Failed to generate explanation" },
      { status: 500 }
    )
  }
}
