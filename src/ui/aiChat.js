/**
 * Lightweight AI chat panel.
 * - Discrete UI: collapsible body, optional endpoint input.
 * - Stays inert/offline if no endpoint is configured or fetch fails.
 * - Uses provided applyCode/runQuery hooks; does not change core behavior.
 */
export class AIChat {
  constructor({ endpoint = '', applyCode, runQuery, getCode }) {
    this.endpoint = endpoint;
    this.applyCode = applyCode;
    this.runQuery = runQuery;
    this.getCode = getCode;
    this.suggestion = { code: '', query: '' };

    this.element = this.createElement();
  }

  createElement() {
    const wrapper = document.createElement('section');
    wrapper.className = 'panel ai-chat';

    const header = document.createElement('div');
    header.className = 'ai-chat__header';
    header.innerHTML = '<h2>AI Helper</h2>';

    const endpointRow = document.createElement('div');
    endpointRow.className = 'ai-chat__endpoint-row';
    const endpointInput = document.createElement('input');
    endpointInput.type = 'text';
    endpointInput.placeholder = 'AI endpoint (e.g., http://localhost:3001/chat)';
    endpointInput.value = this.endpoint;
    endpointInput.className = 'ai-chat__endpoint';
    endpointInput.addEventListener('change', () => {
      this.endpoint = endpointInput.value.trim();
      this.updateOfflineState();
    });
    endpointRow.appendChild(endpointInput);
    header.appendChild(endpointRow);
    wrapper.appendChild(header);

    const body = document.createElement('div');
    body.className = 'ai-chat__body';

    const status = document.createElement('div');
    status.className = 'ai-chat__status';
    status.textContent = this.endpoint ? 'Idle' : 'Offline (no endpoint)';
    this.statusEl = status;
    body.appendChild(status);

    const prompt = document.createElement('textarea');
    prompt.className = 'ai-chat__prompt';
    prompt.rows = 3;
    prompt.placeholder = 'Ask the AI (e.g., "simplify my rules" or "write a swingy hat pattern")';
    this.promptEl = prompt;
    body.appendChild(prompt);

    const actions = document.createElement('div');
    actions.className = 'ai-chat__actions';
    const sendBtn = document.createElement('button');
    sendBtn.className = 'btn ai-chat__send';
    sendBtn.textContent = 'Send to AI';
    sendBtn.addEventListener('click', () => this.send());
    this.sendBtn = sendBtn;

    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn ai-chat__apply';
    applyBtn.textContent = 'Apply Code';
    applyBtn.disabled = true;
    applyBtn.addEventListener('click', () => this.applySuggestion());
    this.applyBtn = applyBtn;

    const queryBtn = document.createElement('button');
    queryBtn.className = 'btn ai-chat__query';
    queryBtn.textContent = 'Run Query';
    queryBtn.disabled = true;
    queryBtn.addEventListener('click', () => this.runSuggestedQuery());
    this.queryBtn = queryBtn;

    actions.appendChild(sendBtn);
    actions.appendChild(applyBtn);
    actions.appendChild(queryBtn);
    body.appendChild(actions);

    const output = document.createElement('div');
    output.className = 'ai-chat__output';
    output.innerHTML = '<div class="ai-chat__placeholder">AI responses will appear here.</div>';
    this.outputEl = output;
    body.appendChild(output);

    wrapper.appendChild(body);
    this.updateOfflineState();
    return wrapper;
  }

  updateOfflineState(isError = false) {
    if (!this.endpoint) {
      this.statusEl.textContent = 'Offline (no endpoint)';
      this.statusEl.dataset.state = 'offline';
      this.sendBtn.disabled = true;
      return;
    }
    if (isError) {
      this.statusEl.textContent = 'Offline (request failed)';
      this.statusEl.dataset.state = 'offline';
      this.sendBtn.disabled = false;
      return;
    }
    this.statusEl.textContent = 'Idle';
    this.statusEl.dataset.state = 'idle';
    this.sendBtn.disabled = false;
  }

  setLoading(loading) {
    this.sendBtn.disabled = loading || !this.endpoint;
    this.statusEl.textContent = loading ? 'Contacting AI…' : this.statusEl.dataset.state === 'offline' ? this.statusEl.textContent : 'Idle';
    this.statusEl.dataset.state = loading ? 'loading' : 'idle';
  }

  setSuggestion({ code = '', query = '' }) {
    this.suggestion = { code, query };
    this.applyBtn.disabled = !code;
    this.queryBtn.disabled = !query;
  }

  applySuggestion() {
    if (this.suggestion.code && this.applyCode) {
      this.applyCode(this.suggestion.code);
    }
  }

  runSuggestedQuery() {
    if (this.suggestion.query && this.runQuery) {
      this.runQuery(this.suggestion.query);
    }
  }

  appendMessage(text, codeApplied = false) {
    const div = document.createElement('div');
    div.className = 'ai-chat__message';
    div.textContent = text;
    this.outputEl.appendChild(div);

    if (codeApplied) {
      const note = document.createElement('div');
      note.className = 'ai-chat__message ai-chat__message--note';
      note.textContent = 'Applied code from AI response.';
      this.outputEl.appendChild(note);
    }
    this.outputEl.appendChild(div);
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  async send() {
    if (!this.endpoint) {
      this.updateOfflineState();
      return;
    }
    const prompt = this.promptEl.value.trim();
    if (!prompt) return;

    this.setLoading(true);
    try {
      const body = {
        prompt,
        code: this.getCode ? this.getCode() : ''
      };
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parsed = this.extractCodeFromMessage(data.message || 'AI responded.');

      // Prefer explicit suggestions, otherwise fall back to extracted code block.
      const codeSuggestion = data.codeSuggestion || parsed.code;
      const querySuggestion = data.querySuggestion || '';
      const displayMessage = parsed.text || data.message || 'AI responded.';

      this.appendMessage(displayMessage, !!parsed.code);
      this.setSuggestion({ code: codeSuggestion, query: querySuggestion });

      // Auto-apply extracted code block if present and we have an apply hook.
      if (parsed.code && this.applyCode) {
        this.applyCode(parsed.code);
      }

      this.statusEl.textContent = 'Ready';
      this.statusEl.dataset.state = 'idle';
      this.promptEl.value = '';
    } catch (err) {
      this.appendMessage(`AI request failed: ${err.message}`);
      this.updateOfflineState(true);
    } finally {
      this.setLoading(false);
    }
  }

  getElement() {
    return this.element;
  }

  extractCodeFromMessage(message) {
    if (!message || typeof message !== 'string') return { text: message, code: '' };
    const match = message.match(/```(?:[a-zA-Z]*)\s*([\s\S]*?)```/);
    if (!match) return { text: message, code: '' };
    const code = match[1].trim();
    const text = message.replace(match[0], '').trim();
    return { text, code };
  }
}
