/**
 * Documentation for all builtin predicates
 */

export const builtinDocs = {
  beat: {
    signature: 'beat(T, N)',
    description: 'Succeeds if time T is on beat N of the current bar',
    params: [
      { name: 'T', type: 'number', desc: 'Current time (passed from event/4)' },
      { name: 'N', type: 'number', desc: 'Beat number (1 = downbeat, 2 = halfway, 4 = quarter notes)' }
    ],
    examples: [
      { code: 'beat(T, 1)', desc: 'Every bar (downbeat)' },
      { code: 'beat(T, 2)', desc: 'Twice per bar' },
      { code: 'beat(T, 4)', desc: 'Every quarter note' }
    ],
    category: 'Timing'
  },

  phase: {
    signature: 'phase(T, N, K)',
    description: 'Succeeds if time T is on phase K of N divisions',
    params: [
      { name: 'T', type: 'number', desc: 'Current time' },
      { name: 'N', type: 'number', desc: 'Total number of phases' },
      { name: 'K', type: 'number', desc: 'Phase number (0 to N-1)' }
    ],
    examples: [
      { code: 'phase(T, 4, 0)', desc: 'First quarter' },
      { code: 'phase(T, 4, 2)', desc: 'Third quarter' }
    ],
    category: 'Timing'
  },

  every: {
    signature: 'every(T, Step)',
    description: 'Succeeds at regular intervals of Step beats',
    params: [
      { name: 'T', type: 'number', desc: 'Current time' },
      { name: 'Step', type: 'number', desc: 'Interval in beats (0.5 = twice per beat)' }
    ],
    examples: [
      { code: 'every(T, 0.25)', desc: '16th notes' },
      { code: 'every(T, 0.5)', desc: '8th notes' },
      { code: 'every(T, 1)', desc: 'Quarter notes' }
    ],
    category: 'Timing'
  },

  euc: {
    signature: 'euc(T, K, N, B, R)',
    description: 'Euclidean rhythm: K hits evenly distributed over N steps',
    params: [
      { name: 'T', type: 'number', desc: 'Current time' },
      { name: 'K', type: 'number', desc: 'Number of hits' },
      { name: 'N', type: 'number', desc: 'Number of steps' },
      { name: 'B', type: 'number', desc: 'Beat subdivision' },
      { name: 'R', type: 'number', desc: 'Rotation offset' }
    ],
    examples: [
      { code: 'euc(T, 3, 8, 0.5, 0)', desc: 'Classic 3-over-8 pattern' },
      { code: 'euc(T, 5, 8, 0.5, 2)', desc: 'Rotated 5-over-8' }
    ],
    category: 'Timing'
  },

  prob: {
    signature: 'prob(P)',
    description: 'Succeeds with probability P (0.0 to 1.0)',
    params: [
      { name: 'P', type: 'number', desc: 'Probability (0.0 = never, 1.0 = always)' }
    ],
    examples: [
      { code: 'prob(0.5)', desc: '50% chance' },
      { code: 'prob(0.2)', desc: '20% chance' }
    ],
    category: 'Random'
  },

  choose: {
    signature: 'choose(List, X)',
    description: 'Unifies X with a random element from List',
    params: [
      { name: 'List', type: 'list', desc: 'List of options' },
      { name: 'X', type: 'any', desc: 'Variable to unify with chosen element' }
    ],
    examples: [
      { code: 'choose([60, 80, 100], V)', desc: 'Random velocity' },
      { code: 'choose([kick, snare, hat], Voice)', desc: 'Random drum' }
    ],
    category: 'Random'
  },

  pick: {
    signature: 'pick(List, X)',
    description: 'Like choose, but backtracks through all elements (non-deterministic)',
    params: [
      { name: 'List', type: 'list', desc: 'List of options' },
      { name: 'X', type: 'any', desc: 'Variable to unify' }
    ],
    examples: [
      { code: 'pick([1, 2, 3], N)', desc: 'Try each number' }
    ],
    category: 'Random'
  },

  cycle: {
    signature: 'cycle(List, X)',
    description: 'Cycles through List elements in sequence, preserving state across updates',
    params: [
      { name: 'List', type: 'list', desc: 'List to cycle through' },
      { name: 'X', type: 'any', desc: 'Variable to unify with current element' }
    ],
    examples: [
      { code: 'cycle([80, 100, 90], V)', desc: 'Rotating velocities' },
      { code: 'cycle([kick, snare], D)', desc: 'Alternating drums' }
    ],
    category: 'Random'
  },

  rand: {
    signature: 'rand(Min, Max, X)',
    description: 'Unifies X with a random float between Min and Max',
    params: [
      { name: 'Min', type: 'number', desc: 'Minimum value (inclusive)' },
      { name: 'Max', type: 'number', desc: 'Maximum value (exclusive)' },
      { name: 'X', type: 'number', desc: 'Output variable' }
    ],
    examples: [
      { code: 'rand(0.5, 1.0, V)', desc: 'Random velocity multiplier' }
    ],
    category: 'Random'
  },

  randint: {
    signature: 'randint(Min, Max, X)',
    description: 'Unifies X with a random integer between Min and Max',
    params: [
      { name: 'Min', type: 'number', desc: 'Minimum value (inclusive)' },
      { name: 'Max', type: 'number', desc: 'Maximum value (exclusive)' },
      { name: 'X', type: 'number', desc: 'Output variable' }
    ],
    examples: [
      { code: 'randint(60, 100, V)', desc: 'Random velocity' }
    ],
    category: 'Random'
  },

  scale: {
    signature: 'scale(Root, Mode, Degree, Oct, Midi)',
    description: 'Converts scale degree to MIDI note number',
    params: [
      { name: 'Root', type: 'number', desc: 'Root MIDI note (60 = C4)' },
      { name: 'Mode', type: 'atom', desc: 'Scale mode (major, minor, dorian, etc.)' },
      { name: 'Degree', type: 'number', desc: 'Scale degree (1-based)' },
      { name: 'Oct', type: 'number', desc: 'Octave offset' },
      { name: 'Midi', type: 'number', desc: 'Output MIDI note' }
    ],
    examples: [
      { code: 'scale(60, major, 1, 0, N)', desc: 'C major tonic' },
      { code: 'scale(60, minor_pent, 3, 1, N)', desc: 'Pentatonic, octave up' }
    ],
    category: 'Musical'
  },

  chord: {
    signature: 'chord(Root, Quality, Oct, Midi)',
    description: 'Generates chord tones (backtracks through notes)',
    params: [
      { name: 'Root', type: 'number', desc: 'Root MIDI note' },
      { name: 'Quality', type: 'atom', desc: 'Chord quality (maj, min, dim, aug, etc.)' },
      { name: 'Oct', type: 'number', desc: 'Octave offset' },
      { name: 'Midi', type: 'number', desc: 'Output note (backtracks)' }
    ],
    examples: [
      { code: 'chord(60, minor, 0, N)', desc: 'C minor triad' },
      { code: 'chord(60, maj7, 0, N)', desc: 'C major 7th' }
    ],
    category: 'Musical'
  },

  transpose: {
    signature: 'transpose(Note, Offset, Out)',
    description: 'Transposes a MIDI note by a semitone offset',
    params: [
      { name: 'Note', type: 'number', desc: 'Input MIDI note' },
      { name: 'Offset', type: 'number', desc: 'Semitones to transpose' },
      { name: 'Out', type: 'number', desc: 'Output note' }
    ],
    examples: [
      { code: 'transpose(60, 7, N)', desc: 'Perfect fifth up' },
      { code: 'transpose(60, -12, N)', desc: 'Octave down' }
    ],
    category: 'Musical'
  },

  rotate: {
    signature: 'rotate(List, Shift, OutList)',
    description: 'Rotates a list by Shift positions',
    params: [
      { name: 'List', type: 'list', desc: 'Input list' },
      { name: 'Shift', type: 'number', desc: 'Positions to rotate' },
      { name: 'OutList', type: 'list', desc: 'Rotated list' }
    ],
    examples: [
      { code: 'rotate([1,2,3], 1, L)', desc: 'L = [2,3,1]' }
    ],
    category: 'Logic'
  },

  range: {
    signature: 'range(Start, End, Step, X)',
    description: 'Backtracks through numbers from Start to End',
    params: [
      { name: 'Start', type: 'number', desc: 'Start value' },
      { name: 'End', type: 'number', desc: 'End value (exclusive)' },
      { name: 'Step', type: 'number', desc: 'Step size' },
      { name: 'X', type: 'number', desc: 'Output value' }
    ],
    examples: [
      { code: 'range(1, 8, 1, D)', desc: 'Scale degrees 1-7' }
    ],
    category: 'Logic'
  },

  eq: {
    signature: 'eq(A, B)',
    description: 'Succeeds if A equals B',
    params: [
      { name: 'A', type: 'any', desc: 'First value' },
      { name: 'B', type: 'any', desc: 'Second value' }
    ],
    examples: [
      { code: 'eq(X, 5)', desc: 'Check if X is 5' }
    ],
    category: 'Logic'
  },

  lt: {
    signature: 'lt(A, B)',
    description: 'Succeeds if A is less than B',
    params: [
      { name: 'A', type: 'number', desc: 'First number' },
      { name: 'B', type: 'number', desc: 'Second number' }
    ],
    examples: [
      { code: 'lt(T, 16)', desc: 'Before beat 16' }
    ],
    category: 'Logic'
  },

  gt: {
    signature: 'gt(A, B)',
    description: 'Succeeds if A is greater than B',
    params: [
      { name: 'A', type: 'number', desc: 'First number' },
      { name: 'B', type: 'number', desc: 'Second number' }
    ],
    examples: [
      { code: 'gt(T, 8)', desc: 'After beat 8' }
    ],
    category: 'Logic'
  },

  within: {
    signature: 'within(T, Start, End)',
    description: 'Succeeds if T is between Start and End (inclusive)',
    params: [
      { name: 'T', type: 'number', desc: 'Time value' },
      { name: 'Start', type: 'number', desc: 'Start time' },
      { name: 'End', type: 'number', desc: 'End time' }
    ],
    examples: [
      { code: 'within(T, 8, 16)', desc: 'Beats 8-16 (verse)' }
    ],
    category: 'Logic'
  },

  distinct: {
    signature: 'distinct(List)',
    description: 'Succeeds if all elements in List are unique',
    params: [
      { name: 'List', type: 'list', desc: 'List to check' }
    ],
    examples: [
      { code: 'distinct([1,2,3])', desc: 'Succeeds' },
      { code: 'distinct([1,1,2])', desc: 'Fails' }
    ],
    category: 'Logic'
  },

  cooldown: {
    signature: 'cooldown(Now, Last, Gap)',
    description: 'Succeeds if Gap time has passed since last trigger',
    params: [
      { name: 'Now', type: 'number', desc: 'Current time' },
      { name: 'Last', type: 'atom', desc: 'Cooldown key (unique identifier)' },
      { name: 'Gap', type: 'number', desc: 'Minimum time between triggers' }
    ],
    examples: [
      { code: 'cooldown(T, fill, 4)', desc: 'Fill every 4+ beats' }
    ],
    category: 'Logic'
  },

  add: {
    signature: 'add(A, B, C)',
    description: 'Arithmetic: C = A + B',
    params: [
      { name: 'A', type: 'number', desc: 'First number' },
      { name: 'B', type: 'number', desc: 'Second number' },
      { name: 'C', type: 'number', desc: 'Result' }
    ],
    examples: [
      { code: 'add(60, 12, N)', desc: 'N = 72 (octave up)' }
    ],
    category: 'Arithmetic'
  }
};

/**
 * Get documentation for a builtin
 * @param {string} name - Builtin name
 * @returns {object|null} Documentation object or null
 */
export function getBuiltinDoc(name) {
  return builtinDocs[name] || null;
}

/**
 * Get all builtins in a category
 * @param {string} category - Category name
 * @returns {Array} Array of builtin names
 */
export function getBuiltinsByCategory(category) {
  return Object.keys(builtinDocs).filter(
    name => builtinDocs[name].category === category
  );
}

/**
 * Get all categories
 * @returns {Array} Array of category names
 */
export function getCategories() {
  const categories = new Set();
  Object.values(builtinDocs).forEach(doc => categories.add(doc.category));
  return Array.from(categories);
}
