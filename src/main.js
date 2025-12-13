/**
 * Dogalog - Prolog-based livecoding music environment
 * Entry point
 */
import './style.css';
import { registerSW } from 'virtual:pwa-register';
import { initializeApp } from './app.js';
import { defaultProgram } from './ui/defaultProgram.js';
import { examples } from './ui/examples.js';

const manualLink = `${import.meta.env.BASE_URL}docs/manual.html`;

initializeApp({ manualLink, examples, defaultProgram });

// Kick off the PWA service worker so installs/offline work in production builds.
registerSW({ immediate: true });
