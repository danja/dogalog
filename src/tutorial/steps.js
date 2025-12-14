/**
 * Tutorial steps content
 * Progressive tutorial for learning Dogalog
 */

export const tutorialSteps = [
  {
    title: 'Welcome to Dogalog',
    content: `Dogalog is a livecoding music environment where you write Prolog-like rules to create rhythmic patterns.

The engine asks <code>event(Voice, Pitch, Vel, T)</code> every step and plays matching results.

📖 For a complete guide to Prolog and livecoding, see the <a href="docs/tutorial.html" target="_blank">Full Tutorial</a>.`,
    code: `% Try your first sound - a kick drum on every beat
event(kick, 60, 80, T) :- beat(T, 1).`,
    action: 'Click Start, then try changing the code!'
  },

  {
    title: 'Understanding Beat',
    content: `The <code>beat(T, N)</code> builtin checks if time T is on beat N.

Beat 1 = downbeat (every bar)
Beat 2 = halfway through bar
Beat 4 = every quarter note`,
    code: `% Kick on downbeat, snare on beat 2
event(kick, 60, 100, T) :- beat(T, 1).
event(snare, 60, 90, T) :- beat(T, 2).`,
    action: 'Try beat(T, 4) for faster patterns'
  },

  {
    title: 'Using Every',
    content: `The <code>every(T, Step)</code> builtin triggers at regular intervals.

every(T, 0.5) = twice per beat
every(T, 0.25) = four times per beat`,
    code: `% Fast hi-hats
event(kick, 60, 100, T) :- beat(T, 1).
event(hat, 60, 60, T) :- every(T, 0.25).`,
    action: 'Experiment with different step values'
  },

  {
    title: 'Random Choices',
    content: `Use <code>choose(List, X)</code> to pick random elements from a list.

This adds variation to your patterns!`,
    code: `% Random velocity
vel(V) :- choose([60, 80, 100], V).

event(kick, 60, V, T) :- beat(T, 1), vel(V).
event(hat, 60, V, T) :- every(T, 0.5), vel(V).`,
    action: 'Try choose with drum voices instead'
  },

  {
    title: 'Probability',
    content: `The <code>prob(P)</code> builtin succeeds with probability P (0.0 to 1.0).

Great for creating variation and humanization!`,
    code: `% 70% chance kick, 30% chance snare hits
event(kick, 60, 90, T) :- beat(T, 1).
event(snare, 60, 80, T) :- beat(T, 2), prob(0.3).`,
    action: 'Try different probabilities'
  },

  {
    title: 'Cycling Patterns',
    content: `<code>cycle(List, X)</code> picks elements in sequence, wrapping around.

Perfect for repeating patterns with variation!`,
    code: `% Alternating velocities
pattern(V) :- cycle([80, 100, 90, 110], V).

event(hat, 60, V, T) :- every(T, 0.25), pattern(V).`,
    action: 'State persists across code changes!'
  },

  {
    title: 'Euclidean Rhythms',
    content: `<code>euc(T, K, N, B, R)</code> generates Euclidean rhythms.
- K hits in N steps
- B is beat subdivision
- R rotates the pattern`,
    code: `% Classic 3-over-4 rhythm
event(kick, 60, 100, T) :- euc(T, 3, 8, 0.5, 0).
event(snare, 60, 80, T) :- euc(T, 5, 8, 0.5, 2).`,
    action: 'Try different K and N values'
  },

  {
    title: 'Musical Scales',
    content: `<code>scale(Root, Mode, Degree, Oct, Midi)</code> converts scale degrees to MIDI notes.

Use with the <code>sine</code> voice for melodies!`,
    code: `% Pentatonic melody
note(N) :- cycle([1, 3, 4, 5, 8], D), scale(60, minor_pent, D, 0, N).

event(sine, N, 80, T) :- every(T, 0.5), note(N).
event(kick, 60, 100, T) :- beat(T, 1).`,
    action: 'Try different modes and roots'
  },

  {
    title: 'Chords',
    content: `<code>chord(Root, Quality, Oct, Midi)</code> generates chord tones.

Combine with choose for arpeggios!`,
    code: `% Arpeggiated chord
arp(N) :- chord(60, minor, 0, Notes), choose(Notes, N).

event(sine, N, 70, T) :- every(T, 0.25), arp(N).
event(kick, 60, 100, T) :- beat(T, 1).`,
    action: 'Try maj, min, dim, aug chords'
  },

  {
    title: 'Conditionals',
    content: `Use <code>within(T, Start, End)</code> to trigger patterns during specific time ranges.

Great for song structure!`,
    code: `% Intro (0-8 beats): just kick
event(kick, 60, 100, T) :- beat(T, 1).

% Verse (8-16 beats): add snare
event(snare, 60, 80, T) :- beat(T, 2), within(T, 8, 16).`,
    action: 'Build a complete song structure'
  },

  {
    title: 'Cooldowns',
    content: `<code>cooldown(Now, Last, Gap)</code> prevents rapid retriggering.

Use for fills and transitions!`,
    code: `% Snare fill every 4 bars minimum
fill(T) :- beat(T, 1), cooldown(T, last_fill, 4).

event(kick, 60, 100, T) :- beat(T, 1).
event(snare, 60, V, T) :- fill(T), choose([80,90,100], V), every(T, 0.25).`,
    action: 'Adjust the gap parameter'
  },

  {
    title: 'Combining Techniques',
    content: `Now combine everything you've learned!

Layer rhythms, add melodies, use probability for variation, and create dynamic arrangements.`,
    code: `% Full pattern combining techniques
drums(kick) :- euc(T, 3, 8, 0.5, 0).
drums(snare) :- euc(T, 5, 8, 0.5, 3).

vel(V) :- cycle([70, 80, 90, 100], V).
melody(N) :- scale(60, dorian, D, 0, N), cycle([1, 3, 5, 4], D).

event(Voice, 60, V, T) :- drums(Voice), every(T, 0.5), vel(V).
event(sine, N, 70, T) :- every(T, 1), melody(N), prob(0.7).`,
    action: 'Create your own unique pattern!'
  },

  {
    title: 'Tutorial Complete!',
    content: `Congratulations! You've learned the fundamentals of Dogalog.

Next steps:
- 📖 Read the <a href="docs/tutorial.html" target="_blank">Full Tutorial</a> to learn Prolog deeply
- 📚 Check the <a href="docs/manual.html" target="_blank">Manual</a> for complete built-in reference
- 📝 Use the <a href="docs/cheatsheet.html" target="_blank">Cheatsheet</a> for quick syntax lookup
- 🎵 Explore the examples in the dropdown
- 💡 Experiment with the REPL (bottom of page) to test queries
- 🎹 Create your own unique patterns!

Remember: Code changes apply automatically, and state persists (use example selector to reset).`,
    code: `% Your canvas awaits!
event(kick, 60, 100, T) :- beat(T, 1).`,
    action: 'Start creating music!'
  }
];
