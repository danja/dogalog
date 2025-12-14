export const defaultProgram = `
% --- Welcome to Dogalog! Euclidean rhythms + melodic basics ---
% Edit this code and hear changes in realtime!

% DRUMS: Euclidean rhythms distribute K hits over N steps
% euc(T, K, N, BeatsPerBar, Rotation)

% Four-on-the-floor kick: 4 hits over 16 steps = every quarter note
kik(T)   :- euc(T, 4, 16, 4, 0).

% Backbeat snare: 2 hits over 16, rotated 4 steps = beats 2 & 4
snr(T)   :- euc(T, 2, 16, 4, 4).

% Dense Euclidean hat pattern: 11 hits over 16 steps
hat1(T)  :- euc(T, 11, 16, 4, 0).

% Sprinkle extra ghost hats with 20% probability on 1/8th notes
hat1(T)  :- every(T, 0.125), prob(0.2).

% BASS: choose([List], Out) non-deterministically picks from list
% every(T, Duration) fires every Duration beats
bass(T,N) :- every(T, 0.5), choose([40,43,47,48], N).

% LEAD: Multiple clauses create harmony (all fire simultaneously)
% scale(Root, Mode, Degree, Octave, Out) converts scale degree to MIDI
lead(T,N) :- every(T, 0.25), scale(60, ionian, 1, 0, N). % Tonic (C)
lead(T,N) :- every(T, 0.25), scale(60, ionian, 3, 0, N). % 3rd (E)
lead(T,N) :- every(T, 0.25), scale(60, ionian, 5, 0, N). % 5th (G)

% CHORD: chord(Root, Quality, Octave, Out) yields all chord tones
% A minor triad arpeggiated every half beat
arp(T,N) :- every(T, 0.5), chord(57, min, 0, N).

% MAP TO EVENTS: event(Instrument, Pitch, Velocity, Time)
% The system queries event/4 on each time step
event(kick,  36, 0.95, T) :- kik(T).
event(snare, 38, 0.90, T) :- snr(T).
event(hat,   42, 0.30, T) :- hat1(T).
event(sine,   N, 0.55, T) :- bass(T, N).
event(sine,   N, 0.40, T) :- lead(T, N).
event(sine,   N, 0.45, T) :- arp(T, N).
`;
