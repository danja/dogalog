# Dogalog Tutorial: Learning Prolog Through Livecoding

Welcome to Dogalog! This tutorial will teach you both **Prolog** (a logic programming language) and **livecoding** (creating music by writing code in real-time). By the end, you'll understand how declarative logic can create compelling musical patterns.

## Table of Contents

- [Part I: Prolog Fundamentals](#part-i-prolog-fundamentals)
- [Part II: Your First Sounds](#part-ii-your-first-sounds)
- [Part III: Musical Patterns](#part-iii-musical-patterns)
- [Part IV: Advanced Techniques](#part-iv-advanced-techniques)
- [Part V: Prolog Deep Dive](#part-v-prolog-deep-dive)
- [Next Steps](#next-steps)

---

## Part I: Prolog Fundamentals

### What is Prolog?

Prolog (Programming in Logic) is a **declarative** programming language. Instead of telling the computer *how* to do something step-by-step, you declare *what* is true and let the computer figure out the details.

Think of it like this:
- **Imperative** (JavaScript, Python): "Go to the store, buy milk, come back"
- **Declarative** (Prolog): "I need milk" (the system figures out how to get it)

### Facts: Declaring Truth

In Prolog, we declare **facts** — statements that are simply true. Facts form the **Knowledge Base** of your program.

**Format**: `relation(entity1, entity2, ...).`

**Examples**:
```prolog
singer(sonu).        % sonu is a singer
friends(raju, mahesh).  % raju and mahesh are friends
odd_number(5).       % 5 is an odd number
```

**Key points**:
- Relations (like `singer`, `friends`) start with **lowercase**
- Entities are enclosed in **parentheses** and separated by **commas**
- Every fact ends with a **period** `.`
- `%` starts a comment

### Queries: Asking Questions

Once you have facts, you can **query** the Knowledge Base. In traditional Prolog, queries start with `?-`.

```prolog
?- singer(sonu).
Output: Yes.

?- odd_number(7).
Output: No.
```

The first query succeeds because `singer(sonu)` is in our Knowledge Base. The second fails because we never declared `odd_number(7)`.

**In Dogalog**: Instead of typing queries manually, the engine automatically queries `event(Voice, Pitch, Vel, T)` on every beat. Your job is to write rules that answer this query with musical events!

### Variables: The Power of Logic

**Variables** in Prolog start with **uppercase** or `_`. They represent unknown values that Prolog will try to find.

```prolog
% Facts
instrument(kick).
instrument(snare).
instrument(hat).

% Query with a variable
?- instrument(X).
X = kick ;     % First solution
X = snare ;    % Second solution
X = hat.       % Third solution
```

Prolog finds *all* values of `X` that make the query true. This is called **backtracking** — Prolog explores all possibilities.

**Special variable** `_` (underscore):
- Means "I don't care about this value"
- Fresh every time (won't unify with itself)
- Example: `event(kick, _, _, T)` matches any Pitch and Velocity

### Unification: Pattern Matching

**Unification** is how Prolog matches patterns. Two terms unify if they can be made identical.

```prolog
% These unify:
kick = kick              % Atoms match
X = 5                    % Variable binds to 5
foo(X, 2) = foo(1, Y)    % X=1, Y=2

% These don't unify:
kick = snare             % Different atoms
foo(1, 2) = bar(1, 2)    % Different functors
```

Unification is bidirectional — variables on either side can bind.

### Rules: Logical Inference

**Rules** express conditional truth: "X is true IF Y and Z are true."

**Format**: `head :- goal1, goal2, goal3.`

The `:-` operator means "if" (think of it as a backwards arrow ←).

```prolog
% Facts
loud(kick).
loud(snare).
quiet(hat).

% Rules
drum(X) :- loud(X).      % X is a drum if X is loud
drum(X) :- quiet(X).     % X is a drum if X is quiet

% Query
?- drum(hat).
Yes.  % Matches second rule: hat is quiet, so hat is a drum
```

**Multiple goals** (separated by commas) mean **AND**:

```prolog
heavy(X) :- drum(X), loud(X).
% X is heavy if X is a drum AND X is loud
```

### Lists: Ordered Collections

Lists are written as `[item1, item2, item3]` or using **head|tail** notation:

```prolog
[1, 2, 3]           % A list of three numbers
[H|T]               % H = head (first item), T = tail (rest)
[60, 64, 67, 72]    % MIDI notes (C, E, G, C)

% Head|Tail examples:
[1, 2, 3] = [H|T]   % H = 1, T = [2, 3]
[a] = [H|T]         % H = a, T = []
[] = [H|T]          % Fails (empty list has no head)
```

Lists are fundamental in Prolog and essential for musical patterns!

### Backtracking: Exploring All Possibilities

When Prolog tries to satisfy a goal, it may find multiple solutions. **Backtracking** is how it explores them all.

```prolog
note(60).  % C
note(64).  % E
note(67).  % G

melody(N) :- note(N).

% Query: melody(N)
% Prolog tries:
% 1. note(60) → N = 60 ✓
% 2. (backtrack) note(64) → N = 64 ✓
% 3. (backtrack) note(67) → N = 67 ✓
```

**In Dogalog**: When the engine asks `event(Voice, Pitch, Vel, T)`, backtracking means *multiple events can fire at the same time*. This is how you create chords and polyrhythms!

### Recursion: Repeating Patterns

Recursion is when a rule calls itself. It's the Prolog way to process lists and create loops.

**Classic example**: Walking through a list

```prolog
% Base case: first item of list is the head
first([H|_], H).

% Recursive case: to find any item, try the head, or recurse on tail
member([H|_], H).              % Item is the head
member([_|T], X) :- member(T, X).  % Or it's in the tail

% Usage:
?- member([60, 64, 67], X).
X = 60 ;   % First clause
X = 64 ;   % Second clause, recursion
X = 67.    % Second clause, deeper recursion
```

**Musical recursion** (we'll see this later):

```prolog
% Play each note in a sequence
seq([H|_], H).
seq([_|T], X) :- seq(T, X).

play_notes(N) :- seq([60, 64, 67, 72], N).
event(sine, N, 0.7, T) :- every(T, 0.25), play_notes(N).
% Plays C-E-G-C on every quarter beat
```

---

## Part II: Your First Sounds

Now let's apply Prolog to **livecoding**! In Dogalog, the engine queries `event(Voice, Pitch, Vel, T)` on a rhythmic grid. Your rules define when and how sounds play.

### The `event/4` Predicate

```prolog
event(Voice, Pitch, Velocity, Time)
```

- **Voice**: Instrument name (`kick`, `snare`, `hat`, `clap`, `sine`, `square`, `triangle`, `noise`)
- **Pitch**: MIDI note number (0-127, used by pitched synths like `sine`)
- **Velocity**: Volume/intensity (0.0-1.0, where 1.0 is loudest)
- **Time**: Current time in beats (provided by the scheduler)

**Goal**: Write rules that make `event/4` true when you want a sound to play.

### Tutorial Step 1: Your First Sound

Let's make a kick drum play on every beat.

```prolog
% Kick on every beat
event(kick, 60, 0.8, T) :- beat(T, 1).
```

**Explanation**:
- `event(kick, 60, 0.8, T)` declares a kick drum event
  - Voice: `kick`
  - Pitch: `60` (irrelevant for drums, but required)
  - Velocity: `0.8` (80% volume)
  - Time: `T` (a variable — will unify with the current time)
- `beat(T, 1)` is a **built-in** that succeeds when time `T` falls on a beat boundary
  - `beat(T, 1)` = every beat (downbeat, quarter notes)
  - `beat(T, 2)` = every half beat (eighth notes)
  - `beat(T, 4)` = every quarter beat (sixteenth notes)

**Try it**:
1. Click **Start** in the app to begin audio
2. Paste the code above into the editor
3. You'll hear a steady kick drum on every beat!

**Experiment**:
- Change `0.8` to `0.5` or `1.0` to adjust volume
- Change `beat(T, 1)` to `beat(T, 2)` for faster kicks
- Add a snare: `event(snare, 38, 0.7, T) :- beat(T, 2).`

### Tutorial Step 2: Understanding Beat Divisions

The `beat/2` built-in divides time into regular intervals.

```prolog
% Kick on downbeat (every bar)
event(kick, 60, 1.0, T) :- beat(T, 1).

% Snare on beat 2 (halfway through bar)
event(snare, 60, 0.9, T) :- beat(T, 2).
```

**Common patterns**:
- `beat(T, 1)`: Once per bar (every 4 beats in 4/4 time)
- `beat(T, 2)`: Twice per bar (backbeat: beats 1 and 3)
- `beat(T, 4)`: Four times per bar (every quarter note)

### Tutorial Step 3: Using `every/2` for Precise Timing

For more control, use `every(T, Step)`, which triggers at intervals of `Step` beats.

```prolog
% Kick on downbeat
event(kick, 60, 1.0, T) :- beat(T, 1).

% Fast hi-hats (4 times per beat)
event(hat, 42, 0.6, T) :- every(T, 0.25).
```

**Common intervals**:
- `every(T, 1.0)`: Once per beat (quarter notes)
- `every(T, 0.5)`: Twice per beat (eighth notes)
- `every(T, 0.25)`: Four times per beat (sixteenth notes)
- `every(T, 0.125)`: Eight times per beat (thirty-second notes)

**Example: Basic drum pattern**
```prolog
event(kick, 36, 0.95, T) :- beat(T, 1).      % Kick on every beat
event(snare, 38, 0.85, T) :- beat(T, 2).     % Snare on beats 2 & 4 (backbeat)
event(hat, 42, 0.25, T) :- every(T, 0.5).    % Hi-hats on eighth notes
```

Try this in the app (or load **"Euclidean basics"** from the Examples dropdown)!

### Voices: The Instruments

Dogalog has 8 built-in instruments:

**Drum/Percussion** (ignore Pitch parameter):
- `kick`: Synthesized kick drum
- `snare`: Noise-based snare
- `hat`: Hi-hat (short noise burst)
- `clap`: Layered clap sound
- `noise`: Broadband noise burst

**Pitched Synths** (Pitch is MIDI note):
- `sine`: Pure sine wave (smooth, sub-bass)
- `square`: Square wave (bright, retro)
- `triangle`: Triangle wave (warm, mellow)

**Example: Synth melody**
```prolog
% Simple melody using sine synth
event(sine, 60, 0.7, T) :- every(T, 1.0).    % C (MIDI 60)
event(sine, 64, 0.7, T) :- every(T, 1.0).    % E (MIDI 64)
event(sine, 67, 0.7, T) :- every(T, 1.0).    % G (MIDI 67)
% All three fire together = C major chord!
```

---

## Part III: Musical Patterns

Now we'll add **variation**, **randomness**, and **musical structure** using Prolog's non-determinism.

### Tutorial Step 4: Random Choices with `choose/2`

`choose(List, X)` unifies `X` with each element of `List` through backtracking.

```prolog
% Random velocity (Prolog tries all three)
vel(V) :- choose([0.6, 0.8, 1.0], V).

event(kick, 60, V, T) :- beat(T, 1), vel(V).
event(hat, 60, V, T) :- every(T, 0.5), vel(V).
```

**What happens?**
- On each beat, Prolog backtracks through `choose([0.6, 0.8, 1.0], V)`
- All three velocities are tried → three kick events fire (layered)
- This creates a "thick" sound with multiple velocity layers

**For true randomness**, use `pick/2` instead:

```prolog
vel(V) :- pick([0.6, 0.8, 1.0], V).  % Picks ONE random value
```

**Musical application**:
```prolog
% Random drum voice on every quarter beat
drum(V) :- pick([kick, snare, hat, clap], V).
event(V, 60, 0.8, T) :- every(T, 0.25), drum(V).
```

### Tutorial Step 5: Probability with `prob/1`

`prob(P)` succeeds with probability `P` (0.0 to 1.0).

```prolog
% Kick always plays
event(kick, 60, 0.9, T) :- beat(T, 1).

% Snare plays 30% of the time
event(snare, 60, 0.8, T) :- beat(T, 2), prob(0.3).
```

**Why use probability?**
- Adds **humanization** (not every note plays)
- Creates **variation** in otherwise repetitive patterns
- Models **ghost notes** (quiet, sporadic hits)

**Example: Swingy hi-hats**
```prolog
% Dense hat grid with 70% probability
event(hat, 42, 0.2, T) :- every(T, 0.125), prob(0.7).
```

### Tutorial Step 6: Cycling Patterns with `cycle/2`

`cycle(List, X)` steps through a list sequentially, wrapping around. Unlike `choose`, it **maintains state** across calls.

```prolog
% Alternating velocities: 0.8 → 1.0 → 0.9 → 1.1 → repeat
pattern(V) :- cycle([0.8, 1.0, 0.9, 1.1], V).

event(hat, 60, V, T) :- every(T, 0.25), pattern(V).
```

**Result**: On successive sixteenth notes, the hat plays at 0.8, then 1.0, then 0.9, then 1.1, then back to 0.8, etc.

**State persists** even when you edit code! To reset, change examples or reload.

**Musical application: Bassline**
```prolog
% Four-note bass motif that loops
bass_note(N) :- cycle([40, 43, 47, 48], N).  % E, G, B, C
event(sine, N, 0.6, T) :- every(T, 0.5), bass_note(N).
```

### Tutorial Step 7: Euclidean Rhythms with `euc/5`

**Euclidean rhythms** distribute `K` hits as evenly as possible over `N` steps. They appear in music worldwide (son clave, bossa nova, etc.).

**Syntax**: `euc(T, K, N, B, R)`
- `T`: Current time
- `K`: Number of hits
- `N`: Total steps
- `B`: Beat subdivision (e.g., `4` for 16th notes over 4 beats)
- `R`: Rotation (shifts the pattern)

**Example**:
```prolog
% 3 hits over 8 steps = [X . . X . . X .]
event(kick, 60, 1.0, T) :- euc(T, 3, 8, 0.5, 0).

% 5 hits over 8 steps, rotated by 2 = [. . X . X . X . X]
event(snare, 60, 0.8, T) :- euc(T, 5, 8, 0.5, 2).
```

**Classic patterns**:
- `euc(T, 4, 16, 4, 0)`: Four-on-the-floor (kick on every beat)
- `euc(T, 2, 16, 4, 4)`: Backbeat (snare on beats 2 & 4)
- `euc(T, 11, 16, 4, 0)`: Dense hi-hat pattern

Try the **"Euclidean basics"** example to hear these in action!

### Tutorial Step 8: Musical Scales with `scale/5`

`scale(Root, Mode, Degree, Octave, Midi)` converts a scale degree to a MIDI note.

**Syntax**:
- `Root`: MIDI root note (e.g., `60` = C4)
- `Mode`: Scale name (atom, e.g., `ionian`, `dorian`, `minor_pent`)
- `Degree`: Scale degree (1 = root, 3 = third, etc.)
- `Octave`: Octave offset (0 = same octave as root, 1 = one octave up)
- `Midi`: Output MIDI note

**Example: Pentatonic melody**
```prolog
% Cycling through pentatonic scale degrees: 1, 3, 4, 5, 8 (octave)
note(N) :- cycle([1, 3, 4, 5, 8], D), scale(60, minor_pent, D, 0, N).

event(sine, N, 0.8, T) :- every(T, 0.5), note(N).
event(kick, 60, 1.0, T) :- beat(T, 1).
```

**Available modes**:
- `ionian` (major), `dorian`, `phrygian`, `lydian`, `mixolydian`, `aeolian` (natural minor), `locrian`
- `harmonic_minor`, `melodic_minor`
- `major_pent`, `minor_pent`
- `blues`, `whole_tone`, `chromatic`

**Pro tip**: Use multiple clauses to create **harmony**:
```prolog
% C major triad (scale degrees 1, 3, 5)
lead(T, N) :- every(T, 0.25), scale(60, ionian, 1, 0, N).  % C
lead(T, N) :- every(T, 0.25), scale(60, ionian, 3, 0, N).  % E
lead(T, N) :- every(T, 0.25), scale(60, ionian, 5, 0, N).  % G

event(sine, N, 0.5, T) :- lead(T, N).
% All three rules fire → three-note chord on every quarter beat!
```

### Tutorial Step 9: Chords with `chord/4`

`chord(Root, Quality, Octave, Midi)` generates all notes of a chord.

**Syntax**:
- `Root`: MIDI root note
- `Quality`: Chord quality (`maj`, `min`, `dim`, `aug`, `maj7`, `min7`, `dom7`)
- `Octave`: Octave offset
- `Midi`: Output (backtracks through all chord tones)

**Example: Arpeggiated chord**
```prolog
% C major chord notes: 60 (C), 64 (E), 67 (G)
arp(N) :- chord(60, maj, 0, N), choose(N, N).

event(sine, N, 0.7, T) :- every(T, 0.25), arp(N).
event(kick, 60, 1.0, T) :- beat(T, 1).
```

Wait, that looks redundant! Actually:
- `chord(60, maj, 0, N)` unifies `N` with the **list** `[60, 64, 67]`
- We need `choose` to pick individual notes from the list

**Better approach**:
```prolog
arp(Note) :- chord(60, min, 0, Notes), choose(Notes, Note).
event(sine, Note, 0.7, T) :- every(T, 0.25), arp(Note).
```

**Musical context: Chord progression**
```prolog
% Different chords every 4 beats
chord_now(N) :- within(T, 0, 4), chord(60, maj, 0, N).    % C major, bars 1-4
chord_now(N) :- within(T, 4, 8), chord(65, min, 0, N).    % F minor, bars 5-8

event(sine, N, 0.6, T) :- every(T, 1.0), chord_now(N), choose(N, N).
```

---

## Part IV: Advanced Techniques

Now let's explore **time constraints**, **conditionals**, and **combining everything** for complex patterns.

### Tutorial Step 10: Time Constraints with `within/3`

`within(T, Start, End)` succeeds only when `T` is between `Start` and `End` beats.

```prolog
% Intro (0-8 beats): just kick
event(kick, 60, 1.0, T) :- beat(T, 1).

% Verse (8-16 beats): add snare
event(snare, 60, 0.8, T) :- beat(T, 2), within(T, 8, 16).
```

**Use cases**:
- **Song structure**: Intro, verse, chorus, breakdown
- **Fills**: Only play during specific bars
- **Build-ups**: Gradually add elements

**Example: Progressive build**
```prolog
% Kick always plays
event(kick, 36, 0.95, T) :- euc(T, 4, 16, 4, 0).

% Add hats after 4 beats
event(hat, 42, 0.25, T) :- every(T, 0.5), within(T, 4, 999).

% Add snare after 8 beats
event(snare, 38, 0.85, T) :- euc(T, 2, 16, 4, 4), within(T, 8, 999).

% Bass comes in at beat 12
event(sine, N, 0.6, T) :- every(T, 0.5), pick([40,43,47,48], N), within(T, 12, 999).
```

### Tutorial Step 11: Cooldowns with `cooldown/3`

`cooldown(Now, Last, Gap)` prevents events from firing too close together.

**Syntax**: `cooldown(T, state_key, MinGap)`
- `T`: Current time
- `state_key`: A unique atom identifying this cooldown (e.g., `last_fill`)
- `MinGap`: Minimum time (in beats) between triggers

**Example: Snare fills every 4 bars minimum**
```prolog
fill(T) :- beat(T, 1), cooldown(T, last_fill, 16).

event(kick, 60, 1.0, T) :- beat(T, 1).
event(snare, 60, V, T) :- fill(T), choose([0.8, 0.9, 1.0], V), every(T, 0.25).
```

**What happens?**
1. Every beat, Prolog checks `fill(T)`
2. `cooldown(T, last_fill, 16)` succeeds only if 16+ beats have passed since the last fill
3. When it succeeds, the snare plays rapid 16th notes with varying velocity

**Use cases**:
- **Fills**: Snare rolls, tom hits
- **Transitions**: Cymbal crashes
- **Variation**: Occasional accent hits

### Tutorial Step 12: Combining Everything

Now let's combine techniques into a full pattern.

```prolog
% Drums with Euclidean rhythms
drums(kick) :- euc(T, 3, 8, 0.5, 0).
drums(snare) :- euc(T, 5, 8, 0.5, 3).

% Cycling velocities for dynamics
vel(V) :- cycle([0.7, 0.8, 0.9, 1.0], V).

% Melody using Dorian mode (minor with raised 6th)
melody(N) :- scale(60, dorian, D, 0, N), cycle([1, 3, 5, 4], D).

% Events
event(Voice, 60, V, T) :- drums(Voice), every(T, 0.5), vel(V).
event(sine, N, 0.7, T) :- every(T, 1.0), melody(N), prob(0.7).
```

**Analysis**:
- `drums(Voice)` uses **backtracking** to try both `kick` and `snare`
- `vel(V)` **cycles** through dynamic levels
- `melody(N)` **combines** `scale` with `cycle` for a repeating motif
- `prob(0.7)` adds **variation** (melody plays 70% of the time)

Try the **"Polyrhythm + probability"** example to hear a similar pattern!

### Recursion in Music

Remember Prolog recursion? Here's how it works for music:

**Example: Walking through a note sequence**
```prolog
% Base case: first item of list
seq([H|_], H).

% Recursive case: try remaining items
seq([_|T], X) :- seq(T, X).

% Melody: backtrack through all notes in the sequence
mel_note(N) :- seq([72, 74, 76, 79, 81], N).

event(sine, N, 0.65, T) :- every(T, 0.25), mel_note(N).
```

**Result**: On every quarter beat, ALL five notes fire simultaneously (creating a dense cluster).

**For sequential playback** (one note at a time), use `cycle` instead:
```prolog
mel_note(N) :- cycle([72, 74, 76, 79, 81], N).
event(sine, N, 0.65, T) :- every(T, 0.25), mel_note(N).
```

Try the **"Recursive loops"** example for more!

### Advanced Built-ins

**Melodic transforms**:
- `transpose(Note, Offset, Out)`: Shift MIDI note by semitones
- `rotate(List, Shift, OutList)`: Rotate a list by N positions

```prolog
% Original melody
melody([60, 64, 67, 69]).

% Play original
mel1(T, N) :- every(T, 0.25), melody(M), choose(M, N).

% Rotate by 1 and transpose up a fifth (+7 semitones)
mel2(T, N) :- every(T, 0.25), melody(M), rotate(M, 1, R), choose(R, X), transpose(X, 7, N).

event(sine, N, 0.5, T) :- mel1(T, N).
event(square, N, 0.35, T) :- mel2(T, N).
```

See **"Melodic transforms"** example!

**Random generators**:
- `rand(Min, Max, X)`: Random float in range
- `randint(Min, Max, X)`: Random integer in range

```prolog
% Random melody (2-octave range)
chaos(T, N) :- every(T, 0.125), randint(60, 84, N), prob(0.5).

% Random velocity for each note
event(sine, N, V, T) :- chaos(T, N), rand(0.3, 0.9, V).
```

See **"Generative chaos"** example for wild randomness!

**Arithmetic and comparisons**:
- `eq(A, B)`: Deep equality check
- `add(A, B, C)`: C = A + B
- `lt(A, B)`, `gt(A, B)`: Less than, greater than
- Infix: `<`, `>`, `=<`, `>=`, `=:=`, `=\=`

```prolog
% Only play bass in the first 16 beats
event(sine, 40, 0.7, T) :- every(T, 0.5), T < 16.

% Add 7 semitones for a fifth interval
transpose(N, 7, N2) :- add(N, 7, N2).
```

---

## Part V: Prolog Deep Dive

Now that you've made music with Prolog, let's explore the **theory** behind how it works.

### Unification in Detail

**Unification** is the process of making two terms identical by finding variable bindings.

**Rules**:
1. **Atoms** unify if they're the same: `kick = kick` ✓, `kick = snare` ✗
2. **Numbers** unify if equal: `60 = 60` ✓, `60 = 64` ✗
3. **Variables** unify with anything, binding to that value: `X = 60` binds `X` to `60`
4. **Compounds** unify if functors match and all arguments unify:
   - `event(kick, 60, V, T) = event(kick, 60, 0.8, 2.5)` ✓
   - Binds: `V = 0.8`, `T = 2.5`
5. **Lists** unify element-wise:
   - `[1, 2, 3] = [H|T]` → `H = 1`, `T = [2, 3]`

**Occurs check**: Prolog doesn't check if a variable unifies with a term containing itself (this is a feature for efficiency). Example: `X = foo(X)` succeeds (infinite structure).

### Backtracking Mechanics

When Prolog encounters multiple possible solutions, it uses **backtracking** to try them all:

1. **Choose** the first clause that could match
2. **Try** to satisfy all goals in that clause
3. If successful, **yield** a solution
4. If the user asks for more (or code requires it), **backtrack**: undo the last choice and try the next possibility
5. **Repeat** until all possibilities exhausted

**Example**:
```prolog
note(60).
note(64).
note(67).

melody(N) :- note(N).

% Query: melody(X)
% 1. Try note(60) → X = 60 (solution 1)
% 2. Backtrack, try note(64) → X = 64 (solution 2)
% 3. Backtrack, try note(67) → X = 67 (solution 3)
% 4. No more clauses → done
```

**In livecoding**: When the engine queries `event(Voice, Pitch, Vel, T)` at time `T=2.5`, Prolog tries ALL rules. Every successful rule produces an event, so **multiple sounds can play simultaneously**.

### Conjunction (AND) and Disjunction (OR)

**Conjunction** (`,`): All goals must succeed
```prolog
heavy(X) :- drum(X), loud(X).
% X is heavy if X is a drum AND X is loud
```

Goals are tried **left-to-right**. If any fails, the whole conjunction fails.

**Disjunction** (`;`): At least one goal must succeed
```prolog
playable(X) :- drum(X) ; synth(X).
% X is playable if X is a drum OR X is a synth
```

**Grouping with parentheses**:
```prolog
foo(X) :- (a(X) ; b(X)), c(X).
% (a OR b) AND c
```

### Negation as Failure

`\+ Goal` succeeds if `Goal` has **no solutions**.

```prolog
% Play snare only when kick doesn't play
event(snare, 38, 0.8, T) :- every(T, 0.5), \+ beat(T, 1).
```

**Important**: `\+` is "negation as failure," not logical negation. If `Goal` might succeed later with different bindings, `\+ Goal` might be wrong!

**Safe usage**: Use `\+` with **ground terms** (no unbound variables):
```prolog
% Good: checking a specific value
... :- \+ (T =:= 4).

% Risky: unbound variable X
... :- \+ foo(X).
```

### Arithmetic Expressions

Prolog evaluates arithmetic **only when explicitly asked**.

**Infix operators** (evaluated automatically):
- `T < 8`: Evaluates `T` and `8`, compares numerically
- `Vel =:= 0.8`: Numeric equality
- `N1 = (N + 7)`: Unifies `N1` with the **term** `(N + 7)`, doesn't compute!

**Computed with `is/2`** (not built into Dogalog, but standard Prolog):
```prolog
% Standard Prolog
X is 3 + 4.  % X = 7
```

**In Dogalog**, use `add/3`:
```prolog
add(3, 4, X).  % X = 7
```

### The `event/4` Top Goal

Remember: Dogalog's scheduler repeatedly queries `event(Voice, Pitch, Vel, T)` where `T` is the current time.

**Execution model**:
1. Scheduler advances to time `T = 0.0`
2. Query: `event(V, P, Vel, 0.0)`
3. Prolog backtracks through ALL rules, finding every solution
4. Each solution triggers a sound event
5. Scheduler advances to `T = 0.25` (next grid tick)
6. Repeat

**This is why multiple events can play simultaneously**: Each matching rule produces one event!

### Cut (`!`) and Control

**Cut** (`!`) commits to the current choice, preventing backtracking. Dogalog **does not support cut**, but it's worth knowing for standard Prolog.

```prolog
% Standard Prolog (not in Dogalog)
max(X, Y, X) :- X >= Y, !.
max(X, Y, Y).
% The cut prevents trying the second clause if X >= Y
```

**Why no cut in Dogalog?** We *want* backtracking to fire multiple events!

### Anonymous Variables and Singleton Warnings

Variables starting with `_` are **anonymous** — they won't trigger "singleton variable" warnings.

```prolog
% Good: we don't care about Pitch or Velocity
is_kick(T) :- event(kick, _, _, T).

% Warning: P and V are unused (should be _ or _P, _V)
is_kick(T) :- event(kick, P, V, T).
```

---

## Part VI: Example Walkthroughs

Let's analyze some of the built-in examples to see these concepts in action.

### Example: "Euclidean basics (drums + bass)"

```prolog
% Kick: 4 hits over 16 steps, every 4 beats, no rotation
kik(T) :- euc(T, 4, 16, 4, 0).

% Snare: 2 hits over 16 steps, rotated by 4 (backbeat)
snr(T) :- euc(T, 2, 16, 4, 4).

% Hi-hat: 11 hits over 16 steps (dense, syncopated pattern)
hat(T) :- euc(T, 11, 16, 4, 0).

% Map to events
event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.85, T) :- snr(T).
event(hat, 42, 0.25, T) :- hat(T).

% Bass: choose random note every half beat
bass(T, N) :- every(T, 0.5), choose([40, 43, 47, 48], N).
event(sine, N, 0.55, T) :- bass(T, N).
```

**Analysis**:
- Uses **Euclidean rhythms** for organic-sounding drums
- `choose/2` creates **harmonic variation** in the bass (all four notes play simultaneously)
- Velocities are **tuned for balance** (kick loud, hat quiet)

### Example: "Polyrhythm + probability"

```prolog
kik(T) :- beat(T, 3).              % Every 3 beats
snr(T) :- beat(T, 2), prob(0.7).   % Every 2 beats, 70% chance
hat(T) :- beat(T, 5).              % Every 5 beats (polyrhythm!)

fill(T) :- phase(T, 16, 15), prob(0.5).  % Bar-end fill, 50% chance

event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.85, T) :- snr(T).
event(hat, 42, 0.25, T) :- hat(T).
event(hat, 44, 0.40, T) :- fill(T).  % Higher-pitched hat for fills
```

**Analysis**:
- **Polyrhythm**: 3-beat kick vs. 2-beat snare vs. 5-beat hat creates complex interlocking pattern
- `prob/1` adds **humanization** (snare doesn't always hit, fill is occasional)
- `phase(T, 16, 15)` means "step 15 of every 16 steps" = last 16th note of the bar

### Example: "Scales + chord arps"

```prolog
% Ionian (major) scale harmonized: degrees 1, 3, 5, 8
lead(T, N) :- every(T, 0.25), scale(60, ionian, 1, 0, N).  % C
lead(T, N) :- every(T, 0.25), scale(60, ionian, 3, 0, N).  % E
lead(T, N) :- every(T, 0.25), scale(60, ionian, 5, 0, N).  % G
lead(T, N) :- every(T, 0.25), scale(60, ionian, 8, 0, N).  % C (octave)

% A minor7 chord (A-C-E-G)
arp(T, N) :- every(T, 0.5), chord(57, min7, 0, N).

% Drums
kik(T) :- euc(T, 4, 16, 4, 0).
hat(T) :- euc(T, 11, 16, 4, 0).

event(kick, 36, 0.95, T) :- kik(T).
event(hat, 42, 0.25, T) :- hat(T).
event(sine, N, 0.50, T) :- lead(T, N).  % Softer
event(sine, N, 0.60, T) :- arp(T, N).   % Louder
```

**Analysis**:
- **Four clauses for `lead/2`** → all four notes play simultaneously → **chord**
- `chord/4` returns a list, which `arp/2` handles (backtracking through chord tones)
- **Dynamic layering**: Different velocities separate lead from arp

### Example: "Minimal microhouse"

```prolog
kik(T) :- euc(T, 4, 16, 4, 0).       % Steady kick
snr(T) :- phase(T, 8, 4).            % Clap on step 4 of every 8
hat(T) :- every(T, 0.125), prob(0.6).  % Sparse, probabilistic hats
perc(T) :- beat(T, 7), prob(0.3).    % Occasional texture every 7 beats

% Dorian mode bass (minor with raised 6th)
bass(T, N) :- every(T, 0.5), scale(48, dorian, 1, 0, N).  % Root
bass(T, N) :- every(T, 1.0), scale(48, dorian, 5, 0, N).  % 5th

event(kick, 36, 0.95, T) :- kik(T).
event(snare, 38, 0.75, T) :- snr(T).
event(hat, 42, 0.18, T) :- hat(T).   % Very quiet hats
event(hat, 46, 0.22, T) :- perc(T).  % Open hat for texture
event(sine, N, 0.45, T) :- bass(T, N).
```

**Analysis**:
- **Microhouse aesthetic**: Sparse patterns, low velocities, subtle textures
- `phase(T, 8, 4)` for precise **rhythmic placement**
- **Two-note bass** (root + fifth) creates movement without complexity
- `prob/1` ensures patterns never feel mechanical

---

## Next Steps

Congratulations! You've learned Prolog **and** livecoding. Here's what to do next:

### 1. Explore the Examples
Load each example from the dropdown and **study the code**:
- How do they use built-ins?
- How are patterns layered?
- What makes them musical?

### 2. Experiment in the REPL
At the bottom of the app, there's an **interactive REPL** where you can query your code:
```prolog
?- kik(0.5).    % Does the kick play at time 0.5?
?- bass(1.0, N). % What bass notes play at time 1.0?
```

This helps you **debug** and **understand** your patterns!

### 3. Read the Manual
The [Manual](manual.html) covers:
- Complete built-in reference
- Advanced syntax (negation, disjunction, arithmetic)
- Troubleshooting tips

### 4. Check the Cheatsheet
The [Cheatsheet](cheatsheet.html) is a quick reference for syntax and common patterns — perfect for livecoding!

### 5. Dive Deeper into Prolog
If you want to learn **real** Prolog:
- [Learn Prolog Now!](http://www.learnprolognow.org/) (free online book)
- [SWI-Prolog](https://www.swi-prolog.org/) (the most popular Prolog implementation)
- [The Power of Prolog](https://www.metalevel.at/prolog) (video course)

### 6. Share Your Music!
Dogalog is perfect for **livecoding performances**. Share your patterns, perform live, and join the livecoding community!

### 7. Advanced Challenges

Try these to level up:

**Challenge 1: Song Structure**
Create a 32-beat "song" with intro, verse, chorus, and outro using `within/3`.

**Challenge 2: Generative Melody**
Use `randint` and `scale` to create a melody that's different every time but stays in key.

**Challenge 3: Recursive Arpeggio**
Write a recursive rule that plays a chord arpeggio with custom timing (not using `cycle`).

**Challenge 4: Polymeter**
Create a pattern where kick is in 4/4 but snare is in 5/4 (use `phase` or math).

**Challenge 5: Call and Response**
Create two melodic phrases where the second "responds" to the first (use `within` for structure).

---

## Conclusion

You've now learned:
- **Prolog fundamentals**: Facts, rules, queries, unification, backtracking, recursion
- **Livecoding basics**: The `event/4` predicate, rhythm patterns, instruments
- **Musical techniques**: Euclidean rhythms, scales, chords, probability, state
- **Advanced concepts**: Time constraints, cooldowns, recursion, arithmetic

Prolog's **declarative** nature makes it uniquely suited for livecoding: you describe *what* should happen, not *how*. The engine handles the rest through **backtracking** and **unification**.

Now go make some music! 🎵

---

*This tutorial was written for Dogalog v0.1.0. For updates and contributions, visit the [GitHub repository](https://github.com/danja/dogalog).*
