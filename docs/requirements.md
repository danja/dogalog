# Requirements

Dogalog is intended both as a practical livecoding environment as well as an educational tool. In learning how to use the tool the user will simultaneously learn how to program in Prolog.

To these ends, the following are required :

## Livecoding

The system should support realtime in-place editing of the code, with the music playing continually. When editing the current state will be maintained until the code is back into valid Prolog syntax, at which time the new version will replace the current - smoothly, so as to avoid glitches in the music.
The system should support all the basic facilities found in popular livecoding environments such as SuperCollider, Sonic Pi and Strudel and be straightforward to extend.

## Didactic

All major features of the Prolog language should be supported and made use of in the music generation system. A tutorial will be provided which will lead a user from the basics of Prolog into more sophisticated use, with examples generating music in a way that keeps the student's interest. Wherever it can be done without disrupting the flow, guidance should be given within the app itself. 

## Coding Requirements

To simplify maintenance and extensibility the code will be written in a very modular style. Any source file that starts getting large should be refactored into smaller modules. There should be strict separation of concerns without mixing of formats (HTML, CS, JS, Prolog) within individual files. Standard, modern vasnilla JS should be used throughout.
Every significant class and function should be supported by corresponding unit and integration tests, following Vitest conventions.
Best practices will be chosen over quick fixes.  
The application will be built as a PWA, targetting mobile-first but with adaptation to make use of larger screens when available. The app will be published to GitHubPages along with all documentation, organised for easy access.
Comments in the code should be in JSDoc format but kept very brief. Inline comments should only appear where the code isn't self-explanatory or an unusual function idiom is used.