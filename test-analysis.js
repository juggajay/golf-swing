// Test script to analyze a golf swing video
// Run with: node test-analysis.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if ffmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (e) {
  console.error('FFmpeg is not installed. Please install it first.');
  console.log('Windows: winget install ffmpeg');
  console.log('Or download from: https://ffmpeg.org/download.html');
  process.exit(1);
}

const VIDEO_PATH = './test-swing.mp4';
const FRAMES_DIR = './test-frames';

// Create frames directory
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR);
}

console.log('Extracting frames from video...');

// Get video duration
const durationOutput = execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${VIDEO_PATH}"`
).toString().trim();
const duration = parseFloat(durationOutput);
console.log(`Video duration: ${duration.toFixed(2)} seconds`);

// Extract 4 key frames at specific percentages
const framePositions = [
  { name: 'address', percent: 0.05 },
  { name: 'top', percent: 0.35 },
  { name: 'impact', percent: 0.55 },
  { name: 'finish', percent: 0.90 },
];

const frames = [];

for (const pos of framePositions) {
  const time = duration * pos.percent;
  const outputPath = path.join(FRAMES_DIR, `${pos.name}.jpg`);

  // Extract frame at specific time, resize to 512px width
  execSync(
    `ffmpeg -y -ss ${time} -i "${VIDEO_PATH}" -vframes 1 -vf "scale=512:-1" -q:v 2 "${outputPath}"`,
    { stdio: 'ignore' }
  );

  // Read as base64
  const imageBuffer = fs.readFileSync(outputPath);
  const base64 = imageBuffer.toString('base64');
  frames.push(`data:image/jpeg;base64,${base64}`);

  console.log(`Extracted ${pos.name} frame at ${time.toFixed(2)}s (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
}

console.log('\nTotal frames extracted:', frames.length);
console.log('Total payload size:', (frames.reduce((acc, f) => acc + f.length, 0) / 1024 / 1024).toFixed(2), 'MB');

// Now test the OpenAI API directly
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeSwing() {
  console.log('\nSending to OpenAI GPT-4o for analysis...');
  const startTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert golf instructor. Analyze the golf swing shown in these images and provide feedback in JSON format with this structure:
{
  "overall_rating": "X/10",
  "handicap_estimate": "XX-XX",
  "swing_type": "Modern/Classic/etc",
  "primary_ball_flight": "Fade/Draw/etc",
  "analysis": {
    "setup": { "score": X, "strengths": ["..."], "improvements": [{"issue": "...", "severity": "minor/moderate/major", "drill": "...", "impact": "..."}] },
    "backswing": { "score": X, "strengths": ["..."], "improvements": [...] },
    "transition": { "score": X, "strengths": ["..."], "improvements": [...] },
    "impact": { "score": X, "strengths": ["..."], "improvements": [...] },
    "follow_through": { "score": X, "strengths": ["..."], "improvements": [...] }
  },
  "priority_fixes": [{ "rank": 1, "issue": "...", "explanation": "...", "drills": ["..."], "expected_improvement": "..." }],
  "practice_plan": { "range_session": ["..."], "at_home_drills": ["..."] }
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this golf swing. Images show: Address, Top of Backswing, Impact, and Finish positions.',
            },
            ...frames.map(frame => ({
              type: 'image_url',
              image_url: { url: frame, detail: 'low' },
            })),
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
      temperature: 0.5,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nAnalysis completed in ${elapsed} seconds!`);
    console.log('Tokens used:', response.usage?.total_tokens);

    const analysis = JSON.parse(response.choices[0].message.content);
    console.log('\n--- ANALYSIS RESULTS ---\n');
    console.log(JSON.stringify(analysis, null, 2));

    // Save results
    fs.writeFileSync('./test-analysis-result.json', JSON.stringify(analysis, null, 2));
    console.log('\nResults saved to test-analysis-result.json');

  } catch (error) {
    console.error('\nError during analysis:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

analyzeSwing();
