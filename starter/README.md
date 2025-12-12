# Prolog‑like Livecoding Music (in your browser)

Make drum patterns and bass lines by writing tiny, sentence‑like rules. No coding setup needed.

## What you need
- A modern browser (Chrome, Edge, Firefox, Safari).
- Your device **not** on silent/mute. On iPhone/iPad, flip the hardware mute switch off.

## How to run
1. Put these four files in one folder:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md` (this file)
2. Double‑click `index.html` to open it in your browser.
3. Click **Evaluate Rules**, then click **Start** to hear sound.
4. Change BPM/Swing with the sliders.
5. Edit rules in the big text box and click **Evaluate Rules** again to apply.

> If you hear nothing, click the page once and then press **Start** (browsers block audio until you interact).

## What are “rules”?
Rules are little statements like this:
```
kick(T)  :- euc(T, 4, 16, 4, 0).
```
Read it as: “At time `T`, the *kick* should play if an **Euclidean rhythm** with 4 hits over 16 steps (in 4/4 time) says so.”

The system repeatedly asks:
```
event(Voice, Pitch, Velocity, Time).
```
Every matching result becomes a sound.

## Euclidean rhythms (the fun part)
This project includes a builtin:
```
euc(T, K, N, B, R)
```
- **K** = number of hits
- **N** = total steps per bar
- **B** = beats per bar (use 4 for 4/4, 3 for 3/4, etc.)
- **R** = rotation (shift the pattern right by R steps)

### Examples
Four‑on‑the‑floor kick (4 hits over 16 steps):
```
kik(T) :- euc(T, 4, 16, 4, 0).
event(kick, 36, 0.95, T) :- kik(T).
```
Backbeat snare on 2 and 4 (rotate by 4 steps):
```
snr(T) :- euc(T, 2, 16, 4, 4).
event(snare, 38, 0.90, T) :- snr(T).
```
Busy hi‑hat (11 hits over 16 steps):
```
hat1(T) :- euc(T, 11, 16, 4, 0).
event(hat, 42, 0.30, T) :- hat1(T).
```

## Choosing notes for melodies/bass
Pick from a list at certain times:
```
bass(T, N) :- every(T, 0.5), choose([40,43,47,48], N).
event(sine, N, 0.55, T) :- bass(T, N).
```
Here `N` is a MIDI note number (40 = E2, 48 = C3).

## Handy built‑ins
- `every(T, Step)` – true at multiples of a beat step (e.g., 0.25 = sixteenth notes)
- `beat(T, N)` – true on N sub‑divisions per beat
- `phase(T, N, K)` – true on the K‑th step within N steps per bar
- `prob(P)` – passes randomly with probability P (0..1)
- `choose([a,b,c], X)` – picks each element on separate passes
- `euc(T, K, N, B, R)` – Euclidean rhythm (explained above)

## Tips
- After editing rules, click **Evaluate Rules** to apply changes.
- Use **Swing** to add groove; it delays every second 1/8th note slightly.
- If timing sounds off, reduce **Lookahead** or CPU‑heavy browser tabs.

## Troubleshooting
- **No sound:** press **Start** after clicking on the page; check device volume/mute; on iOS disable silent mode.
- **Choppy timing:** close other heavy tabs; try lowering Swing; keep the window visible.
- **Weird errors:** check your punctuation—every rule ends with a period `.`

## License
Feel free to use and modify for jams, performances, or teaching.
