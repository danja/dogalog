/**
 * Tutorial Overlay UI
 * Non-blocking overlay for displaying tutorial steps
 */
import { tutorialSteps } from './steps.js';

export class TutorialOverlay {
  constructor(tutorialManager, applyCode) {
    this.manager = tutorialManager;
    this.applyCode = applyCode;
    this.element = null;
    this.visible = false;

    this.createOverlay();
    this.setupEventListeners();
  }

  /**
   * Create overlay DOM structure
   */
  createOverlay() {
    // Overlay container
    this.element = document.createElement('div');
    this.element.className = 'tutorial-overlay';
    this.element.style.display = 'none';

    // Content card
    const card = document.createElement('div');
    card.className = 'tutorial-card';

    // Header
    const header = document.createElement('div');
    header.className = 'tutorial-header';

    this.titleElement = document.createElement('h3');
    this.titleElement.className = 'tutorial-title';
    header.appendChild(this.titleElement);

    this.progressElement = document.createElement('div');
    this.progressElement.className = 'tutorial-progress';
    header.appendChild(this.progressElement);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tutorial-close btn';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close tutorial');
    closeBtn.onclick = () => this.hide();
    header.appendChild(closeBtn);

    card.appendChild(header);

    // Content
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'tutorial-content';
    card.appendChild(this.contentElement);

    // Action prompt
    this.actionElement = document.createElement('div');
    this.actionElement.className = 'tutorial-action';
    card.appendChild(this.actionElement);

    // Navigation
    const nav = document.createElement('div');
    nav.className = 'tutorial-nav';

    this.prevBtn = document.createElement('button');
    this.prevBtn.className = 'btn';
    this.prevBtn.textContent = 'Previous';
    this.prevBtn.onclick = () => this.manager.previous();
    nav.appendChild(this.prevBtn);

    this.tryBtn = document.createElement('button');
    this.tryBtn.className = 'btn primary';
    this.tryBtn.textContent = 'Try This Code';
    this.tryBtn.onclick = () => this.loadStepCode();
    nav.appendChild(this.tryBtn);

    this.nextBtn = document.createElement('button');
    this.nextBtn.className = 'btn primary';
    this.nextBtn.textContent = 'Next';
    this.nextBtn.onclick = () => this.handleNext();
    nav.appendChild(this.nextBtn);

    card.appendChild(nav);

    // Keyboard hint
    const hint = document.createElement('div');
    hint.className = 'tutorial-hint';
    hint.innerHTML = 'Use <kbd>←</kbd> <kbd>→</kbd> to navigate';
    card.appendChild(hint);

    this.element.appendChild(card);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tutorial manager events
    this.manager.on('step', (stepIndex) => this.showStep(stepIndex));
    this.manager.on('start', () => this.show());
    this.manager.on('complete', () => this.onComplete());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.visible) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.manager.previous();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        this.loadStepCode();
      }
    });
  }

  /**
   * Show specific tutorial step
   * @param {number} stepIndex
   */
  showStep(stepIndex) {
    const step = tutorialSteps[stepIndex];
    if (!step) {
      this.manager.complete();
      return;
    }

    // Update title and progress
    this.titleElement.textContent = step.title;
    this.progressElement.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`;

    // Update content (allow HTML for code tags)
    this.contentElement.innerHTML = step.content;

    // Update action
    this.actionElement.innerHTML = `<strong>→</strong> ${step.action}`;

    // Update navigation buttons
    this.prevBtn.disabled = stepIndex === 0;

    const isLastStep = stepIndex === tutorialSteps.length - 1;
    this.nextBtn.textContent = isLastStep ? 'Finish' : 'Next';

    // Show overlay if hidden
    if (!this.visible) {
      this.show();
    }
  }

  /**
   * Load current step's code into editor
   */
  loadStepCode() {
    const step = tutorialSteps[this.manager.getCurrentStep()];
    if (step && step.code) {
      this.applyCode(step.code.trim());
      this.hide();
    }
  }

  /**
   * Handle next button click
   */
  handleNext() {
    const currentStep = this.manager.getCurrentStep();
    if (currentStep === tutorialSteps.length - 1) {
      this.manager.complete();
    } else {
      this.manager.next();
    }
  }

  /**
   * Handle tutorial completion
   */
  onComplete() {
    this.hide();

    // Show completion message
    const message = document.createElement('div');
    message.className = 'tutorial-complete-toast';
    message.textContent = '✓ Tutorial completed! Keep experimenting.';
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }

  /**
   * Show overlay
   */
  show() {
    this.visible = true;
    this.element.style.display = 'flex';
    this.showStep(this.manager.getCurrentStep());
  }

  /**
   * Hide overlay
   */
  hide() {
    this.visible = false;
    this.element.style.display = 'none';
  }

  /**
   * Toggle overlay visibility
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Get overlay DOM element
   * @returns {HTMLElement}
   */
  getElement() {
    return this.element;
  }
}
