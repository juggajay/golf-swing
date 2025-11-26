import type { Drill } from "@/types";

export const drillsLibrary: Drill[] = [
  // Setup Drills
  {
    id: "setup-1",
    name: "Mirror Setup Check",
    description: "Perfect your address position using a mirror for instant visual feedback.",
    category: "setup",
    difficulty: "easy",
    relatedFaults: ["poor posture", "incorrect stance width", "bad alignment"],
    instructions: [
      "Stand in front of a full-length mirror with a club",
      "Check that your feet are shoulder-width apart for mid-irons",
      "Verify your knees have a slight flex",
      "Ensure your spine tilts forward from the hips, not the waist",
      "Arms should hang naturally, hands below your chin",
      "Hold this position for 30 seconds, memorizing the feel",
    ],
    equipment: ["Mirror", "Any club"],
    duration: "5 minutes",
  },
  {
    id: "setup-2",
    name: "Alignment Stick Drill",
    description: "Train proper alignment to your target using alignment sticks.",
    category: "setup",
    difficulty: "easy",
    relatedFaults: ["poor alignment", "aim issues", "inconsistent setup"],
    instructions: [
      "Place one alignment stick on the ground pointing at your target",
      "Place another stick parallel to it, where your feet will be",
      "A third stick can go across your toes to check foot alignment",
      "Practice setting up with the sticks until it becomes natural",
      "Remove sticks periodically to test your alignment",
    ],
    equipment: ["2-3 alignment sticks"],
    duration: "10 minutes",
  },
  {
    id: "setup-3",
    name: "Ball Position Ladder",
    description: "Learn correct ball position for every club in your bag.",
    category: "setup",
    difficulty: "easy",
    relatedFaults: ["incorrect ball position", "inconsistent contact"],
    instructions: [
      "Start with your wedge - ball in the center of your stance",
      "Move to 7-iron - ball one ball-width forward of center",
      "Progress to 5-iron - ball two ball-widths forward",
      "Hybrids and fairway woods - ball inside lead heel",
      "Driver - ball opposite lead heel",
      "Practice transitioning between clubs smoothly",
    ],
    equipment: ["Various clubs", "Tees for marking"],
    duration: "15 minutes",
  },

  // Backswing Drills
  {
    id: "backswing-1",
    name: "Takeaway Path Drill",
    description: "Groove a perfect one-piece takeaway that sets up the entire swing.",
    category: "backswing",
    difficulty: "medium",
    relatedFaults: ["inside takeaway", "outside takeaway", "wristy takeaway"],
    instructions: [
      "Place a headcover just outside and behind the ball",
      "Start your takeaway by moving everything together - hands, arms, shoulders",
      "The club should pass over the headcover, not around it",
      "Stop when your hands reach hip height",
      "The club should point at the target line at this position",
      "Repeat 20 times before hitting balls",
    ],
    equipment: ["Headcover", "Any club"],
    duration: "10 minutes",
  },
  {
    id: "backswing-2",
    name: "Shoulder Turn Drill",
    description: "Maximize your shoulder turn for increased power and consistency.",
    category: "backswing",
    difficulty: "medium",
    relatedFaults: ["limited shoulder turn", "all arms swing", "loss of power"],
    instructions: [
      "Cross your arms over your chest, hands on shoulders",
      "Take your golf posture",
      "Rotate your shoulders until your lead shoulder is under your chin",
      "Feel your back facing the target",
      "Hold for 2 seconds, then return",
      "Progress to doing this with a club across your shoulders",
    ],
    equipment: ["None or club"],
    duration: "5 minutes",
  },
  {
    id: "backswing-3",
    name: "Wall Drill for Width",
    description: "Create width in your backswing for more power and consistency.",
    category: "backswing",
    difficulty: "easy",
    relatedFaults: ["narrow backswing", "chicken wing", "loss of width"],
    instructions: [
      "Stand with your trail side against a wall",
      "Take your golf posture with arms extended",
      "Make a backswing - your hands should brush the wall",
      "This ensures you're extending away from your body",
      "If you can't touch the wall, you're collapsing",
      "Practice until the feel is natural",
    ],
    equipment: ["Wall"],
    duration: "5 minutes",
  },

  // Transition Drills
  {
    id: "transition-1",
    name: "Pump Drill",
    description: "Learn the proper sequence of the downswing with this classic drill.",
    category: "transition",
    difficulty: "medium",
    relatedFaults: ["over the top", "early extension", "casting"],
    instructions: [
      "Make a full backswing",
      "Start the downswing but stop when hands reach hip height",
      "Return to the top",
      "Repeat this pump motion 3 times",
      "On the 4th time, complete the swing through the ball",
      "Focus on hips leading, then shoulders, then arms",
    ],
    equipment: ["Any club", "Practice balls"],
    duration: "15 minutes",
  },
  {
    id: "transition-2",
    name: "Step Drill",
    description: "Feel the proper weight shift and sequence in the downswing.",
    category: "transition",
    difficulty: "medium",
    relatedFaults: ["reverse pivot", "poor weight shift", "no hip rotation"],
    instructions: [
      "Start with feet together at address",
      "Make your backswing while stepping your trail foot back",
      "Start the downswing by stepping your lead foot forward",
      "This forces proper weight transfer",
      "Start with half swings, progress to full swings",
      "Eventually hit balls with this drill",
    ],
    equipment: ["Any club", "Practice balls"],
    duration: "10 minutes",
  },
  {
    id: "transition-3",
    name: "Headcover Under Arm Drill",
    description: "Keep your trail arm connected for better sequencing.",
    category: "transition",
    difficulty: "easy",
    relatedFaults: ["flying elbow", "disconnected arms", "over the top"],
    instructions: [
      "Place a headcover or glove under your trail armpit",
      "Make swings keeping the headcover in place",
      "If it falls out, your arm is getting disconnected",
      "This promotes a connected, on-plane swing",
      "Start with half swings, progress to three-quarter",
      "Remove the headcover and try to replicate the feeling",
    ],
    equipment: ["Headcover or glove", "Any club"],
    duration: "10 minutes",
  },

  // Impact Drills
  {
    id: "impact-1",
    name: "Impact Bag Drill",
    description: "Learn the correct impact position through feel and feedback.",
    category: "impact",
    difficulty: "medium",
    relatedFaults: ["scooping", "flipping", "poor contact"],
    instructions: [
      "Set up to an impact bag (or duffel bag with towels)",
      "Make slow swings, stopping at impact into the bag",
      "Check: hands ahead of clubhead, hips open, weight forward",
      "Hold the impact position for 5 seconds",
      "Feel the pressure in your lead side",
      "Repeat until the position feels natural",
    ],
    equipment: ["Impact bag or substitute"],
    duration: "10 minutes",
  },
  {
    id: "impact-2",
    name: "Shaft Lean Drill",
    description: "Train forward shaft lean for compressed, powerful iron shots.",
    category: "impact",
    difficulty: "medium",
    relatedFaults: ["flipping", "thin shots", "no compression"],
    instructions: [
      "Place an alignment stick in the ground, leaning toward target",
      "Set up with the stick just outside your lead hip",
      "Make swings where your hands beat the clubhead to the stick",
      "This trains forward shaft lean at impact",
      "Start with chips, progress to full swings",
      "Focus on the feel, not the visual",
    ],
    equipment: ["Alignment stick", "Irons"],
    duration: "15 minutes",
  },
  {
    id: "impact-3",
    name: "Feet Together Drill",
    description: "Improve balance and center contact through restricted motion.",
    category: "impact",
    difficulty: "easy",
    relatedFaults: ["loss of balance", "inconsistent contact", "swaying"],
    instructions: [
      "Hit shots with your feet completely together",
      "Start with short irons and half swings",
      "This forces you to find the center of the clubface",
      "It also eliminates excessive body movement",
      "Progress to longer clubs as you improve",
      "Great for warming up before a round",
    ],
    equipment: ["Any club", "Practice balls"],
    duration: "10 minutes",
  },

  // Follow Through Drills
  {
    id: "follow-1",
    name: "Finish Position Hold",
    description: "Train a balanced, complete finish for better overall swing.",
    category: "follow_through",
    difficulty: "easy",
    relatedFaults: ["poor balance", "incomplete finish", "deceleration"],
    instructions: [
      "Hit a shot and hold your finish for 5 seconds",
      "Check: weight on lead foot, belt buckle facing target",
      "Trail foot on toe, chest facing target or left of it",
      "You should be able to hold this position easily",
      "If you're falling backward, work on weight transfer",
      "Make this a habit on every practice shot",
    ],
    equipment: ["Any club", "Practice balls"],
    duration: "Ongoing",
  },
  {
    id: "follow-2",
    name: "Swoosh Drill",
    description: "Increase clubhead speed through proper release and extension.",
    category: "follow_through",
    difficulty: "easy",
    relatedFaults: ["deceleration", "loss of speed", "poor extension"],
    instructions: [
      "Hold the club upside down by the clubhead",
      "Make full swings listening for the 'swoosh' sound",
      "The swoosh should be loudest after where the ball would be",
      "If it's before, you're releasing too early",
      "This trains acceleration through the ball",
      "Great for warming up and increasing speed",
    ],
    equipment: ["Any club"],
    duration: "5 minutes",
  },

  // Tempo Drills
  {
    id: "tempo-1",
    name: "1-2-3 Tempo Drill",
    description: "Develop consistent rhythm with a simple counting method.",
    category: "tempo",
    difficulty: "easy",
    relatedFaults: ["quick tempo", "jerky transition", "inconsistent rhythm"],
    instructions: [
      "Count '1' at address, '2' at the top, '3' at impact",
      "The backswing (1 to 2) should take twice as long as downswing (2 to 3)",
      "This creates a 2:1 tempo ratio like tour pros",
      "Say it out loud initially, then internalize",
      "Practice with different clubs",
      "Use a metronome app for more precision",
    ],
    equipment: ["Any club", "Optional: metronome"],
    duration: "10 minutes",
  },
  {
    id: "tempo-2",
    name: "Slow Motion Swings",
    description: "Build awareness and control with ultra-slow practice swings.",
    category: "tempo",
    difficulty: "easy",
    relatedFaults: ["rushed swing", "loss of sequence", "poor body awareness"],
    instructions: [
      "Make a swing in super slow motion (30 seconds)",
      "Feel every position and transition",
      "Notice where you lose balance or connection",
      "Gradually increase speed while maintaining feel",
      "This builds proprioception and body awareness",
      "Do this before hitting balls to warm up",
    ],
    equipment: ["Any club"],
    duration: "5 minutes",
  },

  // Short Game Drills
  {
    id: "shortgame-1",
    name: "Clock Drill for Distance Control",
    description: "Master distance control on pitch shots using arm positions.",
    category: "short_game",
    difficulty: "medium",
    relatedFaults: ["poor distance control", "inconsistent wedge play"],
    instructions: [
      "Think of your swing as a clock face",
      "9 o'clock: hands at hip height in backswing",
      "10:30: hands at chest height",
      "Practice each position and measure the distance",
      "Create your personal distance chart",
      "This gives you reference points for different distances",
    ],
    equipment: ["Wedges", "Practice balls", "Yardage markers"],
    duration: "20 minutes",
  },
  {
    id: "shortgame-2",
    name: "Gate Chipping Drill",
    description: "Improve your chipping accuracy with a simple gate setup.",
    category: "short_game",
    difficulty: "easy",
    relatedFaults: ["inconsistent chipping", "poor direction control"],
    instructions: [
      "Place two tees about 6 inches apart as a gate",
      "Position the gate 3-4 feet in front of you",
      "Chip balls through the gate to a target",
      "This trains a consistent, straight chip stroke",
      "Narrow the gate as you improve",
      "Move the gate to practice different landing spots",
    ],
    equipment: ["Wedge", "Tees", "Practice balls"],
    duration: "15 minutes",
  },
  {
    id: "shortgame-3",
    name: "Ladder Putting Drill",
    description: "Develop distance control on the putting green.",
    category: "short_game",
    difficulty: "easy",
    relatedFaults: ["poor lag putting", "three putts", "distance control"],
    instructions: [
      "Place tees or markers at 10, 20, 30, and 40 feet",
      "Putt to each distance in order (like climbing a ladder)",
      "Focus on getting the ball within 3 feet of each target",
      "If you miss by more, start over from the beginning",
      "This builds pressure and distance awareness",
      "Try the reverse - start far and work closer",
    ],
    equipment: ["Putter", "4-5 tees", "Practice balls"],
    duration: "15 minutes",
  },
];

export function getDrillsByCategory(category: string): Drill[] {
  return drillsLibrary.filter((drill) => drill.category === category);
}

export function getDrillsByFault(fault: string): Drill[] {
  const faultLower = fault.toLowerCase();
  return drillsLibrary.filter((drill) =>
    drill.relatedFaults.some((f) => f.toLowerCase().includes(faultLower))
  );
}

export function getDrillById(id: string): Drill | undefined {
  return drillsLibrary.find((drill) => drill.id === id);
}

export function searchDrills(query: string): Drill[] {
  const queryLower = query.toLowerCase();
  return drillsLibrary.filter(
    (drill) =>
      drill.name.toLowerCase().includes(queryLower) ||
      drill.description.toLowerCase().includes(queryLower) ||
      drill.relatedFaults.some((f) => f.toLowerCase().includes(queryLower))
  );
}

export function getRecommendedDrills(priorityFixes: { issue: string; drills: string[] }[]): Drill[] {
  const recommendedDrills: Drill[] = [];

  for (const fix of priorityFixes) {
    // Try to find drills that match by name
    for (const drillName of fix.drills) {
      const matchingDrills = drillsLibrary.filter(
        (d) => d.name.toLowerCase().includes(drillName.toLowerCase())
      );
      recommendedDrills.push(...matchingDrills);
    }

    // Also find drills by fault
    const faultDrills = getDrillsByFault(fix.issue);
    recommendedDrills.push(...faultDrills);
  }

  // Remove duplicates
  const uniqueDrills = Array.from(new Set(recommendedDrills.map((d) => d.id)))
    .map((id) => drillsLibrary.find((d) => d.id === id)!)
    .filter(Boolean);

  return uniqueDrills.slice(0, 6); // Return top 6 recommended drills
}
