import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GOLF_ANALYSIS_SYSTEM_PROMPT = `You are an expert PGA-level golf instructor analyzing a golf swing video/image sequence. You have decades of experience teaching golfers of all levels and can identify swing mechanics issues with precision.

Analyze the following aspects of this swing in detail:

1. SETUP & ADDRESS
- Stance width relative to club selection
- Ball position
- Spine tilt and posture
- Grip position (if visible)
- Weight distribution
- Alignment to target

2. BACKSWING
- Takeaway path (inside, outside, or on-plane)
- Wrist hinge timing
- Hip rotation amount
- Shoulder turn (coil)
- Maintaining spine angle
- Weight transfer to trail side
- Club position at top (across the line, laid off, or parallel)

3. TRANSITION & DOWNSWING
- Sequence initiation (hips leading vs arms/shoulders)
- Lag retention
- Swing plane (over-the-top, on-plane, or under)
- Hip clearance
- Maintaining posture

4. IMPACT
- Shaft lean (forward press)
- Hip position (open to target)
- Head position (behind ball)
- Weight distribution
- Hand position relative to club head

5. FOLLOW-THROUGH & FINISH
- Extension through the ball
- Balance at finish
- Full rotation
- Weight transfer completion

For each area, provide:
- What the golfer is doing well (strengths)
- What needs improvement (with specific, actionable drills)
- Severity rating (minor / moderate / major)
- Estimated impact on ball flight

Be encouraging but honest. Focus on the most impactful improvements first.

IMPORTANT: You must respond with valid JSON only, no additional text.`;

const ANALYSIS_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    overall_rating: {
      type: "string",
      description: "Rating out of 10, e.g., '7.5/10'",
    },
    handicap_estimate: {
      type: "string",
      description: "Estimated handicap range, e.g., '12-18'",
    },
    swing_type: {
      type: "string",
      description: "Modern, Classic, Stack-and-Tilt, or hybrid",
    },
    primary_ball_flight: {
      type: "string",
      description: "Likely ball flight: Fade, Draw, Slice, Hook, Straight, Push, Pull",
    },
    analysis: {
      type: "object",
      properties: {
        setup: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["minor", "moderate", "major"] },
                  drill: { type: "string" },
                  impact: { type: "string" },
                },
                required: ["issue", "severity", "drill", "impact"],
              },
            },
          },
          required: ["score", "strengths", "improvements"],
        },
        backswing: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["minor", "moderate", "major"] },
                  drill: { type: "string" },
                  impact: { type: "string" },
                },
                required: ["issue", "severity", "drill", "impact"],
              },
            },
          },
          required: ["score", "strengths", "improvements"],
        },
        transition: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["minor", "moderate", "major"] },
                  drill: { type: "string" },
                  impact: { type: "string" },
                },
                required: ["issue", "severity", "drill", "impact"],
              },
            },
          },
          required: ["score", "strengths", "improvements"],
        },
        impact: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["minor", "moderate", "major"] },
                  drill: { type: "string" },
                  impact: { type: "string" },
                },
                required: ["issue", "severity", "drill", "impact"],
              },
            },
          },
          required: ["score", "strengths", "improvements"],
        },
        follow_through: {
          type: "object",
          properties: {
            score: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["minor", "moderate", "major"] },
                  drill: { type: "string" },
                  impact: { type: "string" },
                },
                required: ["issue", "severity", "drill", "impact"],
              },
            },
          },
          required: ["score", "strengths", "improvements"],
        },
      },
      required: ["setup", "backswing", "transition", "impact", "follow_through"],
    },
    priority_fixes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rank: { type: "number" },
          issue: { type: "string" },
          explanation: { type: "string" },
          drills: { type: "array", items: { type: "string" } },
          expected_improvement: { type: "string" },
        },
        required: ["rank", "issue", "explanation", "drills", "expected_improvement"],
      },
    },
    practice_plan: {
      type: "object",
      properties: {
        range_session: { type: "array", items: { type: "string" } },
        at_home_drills: { type: "array", items: { type: "string" } },
      },
      required: ["range_session", "at_home_drills"],
    },
  },
  required: [
    "overall_rating",
    "handicap_estimate",
    "swing_type",
    "primary_ball_flight",
    "analysis",
    "priority_fixes",
    "practice_plan",
  ],
};

export async function analyzeSwingFrames(
  frames: string[],
  cameraAngle: string = "unknown",
  clubUsed: string = "unknown"
) {
  const imageContent = frames.map((frame) => ({
    type: "image_url" as const,
    image_url: {
      url: frame.startsWith("data:") ? frame : `data:image/jpeg;base64,${frame}`,
      detail: "low" as const, // Use low detail for faster processing
    },
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Faster model, still great at vision tasks
    messages: [
      {
        role: "system",
        content: GOLF_ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this golf swing sequence. The images show key positions: Address, Top of Backswing, Impact, and Finish.

Camera angle: ${cameraAngle}
Club used: ${clubUsed}

Provide a comprehensive analysis in JSON format.`,
          },
          ...imageContent,
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2500,
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No analysis content received from OpenAI");
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse analysis response");
  }
}

export async function detectCameraAngle(frame: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: 'What is the camera angle for this golf swing video? Respond with only one of: "dtl" (down the line, behind the golfer), "face_on" (facing the golfer from in front), or "unknown".',
          },
          {
            type: "image_url",
            image_url: {
              url: frame.startsWith("data:")
                ? frame
                : `data:image/jpeg;base64,${frame}`,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 20,
  });

  const angle = response.choices[0]?.message?.content?.toLowerCase().trim();
  if (angle === "dtl" || angle === "face_on") {
    return angle;
  }
  return "unknown";
}
