import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Analyze review text using OpenAI to extract insights
 */
async function analyzeReviews(reviewText: string) {
  const prompt = `You are analyzing customer reviews for a nail salon called "G Nail Growth". 

Please analyze the following reviews and provide:

1. Top 5 recurring complaints (if any)
2. Top 5 recurring positives
3. 3 concrete operational recommendations to improve the salon experience

Reviews:
"""
${reviewText}
"""

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "topComplaints": ["complaint 1", "complaint 2", ...],
  "topPositives": ["positive 1", "positive 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

If there are fewer than 5 complaints or positives, include only what you find. Keep each item concise (1-2 sentences max).`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a business analyst specializing in customer experience for service businesses. You analyze reviews and provide actionable insights.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0]?.message?.content || '{}'
  const analysis = JSON.parse(responseText)

  return {
    topComplaints: analysis.topComplaints || [],
    topPositives: analysis.topPositives || [],
    recommendations: analysis.recommendations || [],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewText } = body

    if (!reviewText || typeof reviewText !== 'string') {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      )
    }

    if (reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide more review text to analyze' },
        { status: 400 }
      )
    }

    // Analyze the reviews
    const analysis = analyzeReviews(reviewText)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Review analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze reviews' },
      { status: 500 }
    )
  }
}
