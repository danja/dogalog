export const defaultProgram = `
% --- Example rules: Euclidean + basics ---
% K hits over N steps per bar, in B=4 beats per bar, rotated by R steps

% Four-on-the-floor kick: E(4,16) in 4/4
kik(T)   :- euc(T, 4, 16, 4, 0).
% Backbeat snare: E(2,16) rotated 4 -> steps 4 & 12
snr(T)   :- euc(T, 2, 16, 4, 4).
% Hats: Euclidean 11 over 16 for a busy texture
hat1(T)  :- euc(T,11, 16, 4, 0).

% Simple bass that chooses notes every 1/2 beat
bass(T,N) :- every(T,0.5), choose([40,43,47,48], N).

% Lead using scale helper (Ionian / major), degree -> midi
lead(T,N) :- every(T,0.25), scale(60, ionian, 1, 0, N). % C major tonic
lead(T,N) :- every(T,0.25), scale(60, ionian, 3, 0, N). % mediant
lead(T,N) :- every(T,0.25), scale(60, ionian, 5, 0, N). % dominant

% Chord arpeggio in a minor triad
arp(T,N) :- every(T,0.5), chord(57, min, 0, N).

% Map to playable events
event(kick,  36, 0.95, T) :- kik(T).
event(snare, 38, 0.90, T) :- snr(T).
event(hat,   42, 0.30, T) :- hat1(T).
event(sine,   N, 0.55, T) :- bass(T, N).
event(sine,   N, 0.40, T) :- lead(T, N).
event(sine,   N, 0.45, T) :- arp(T, N).

% Sprinkle extra ghost hats with probability on 1/8s
hat1(T) :- every(T,0.125), prob(0.2).
`;
