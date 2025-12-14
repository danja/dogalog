/**
 * Optional AI/automation bridge using window.postMessage.
 * Inert unless a message with { source: 'dogalog-ai-bridge', action: ... } is sent.
 * Actions: setCode (string), runQuery (string), getCode (responds with payload).
 */
export function registerAIBridge({ setCode, getCode, runQuery }) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    const msg = event?.data;
    if (!msg || msg.source !== 'dogalog-ai-bridge') return;
    const { action, payload, id } = msg;

    if (action === 'setCode') {
      setCode?.(typeof payload === 'string' ? payload : '');
      return;
    }

    if (action === 'runQuery') {
      runQuery?.(typeof payload === 'string' ? payload : '');
      return;
    }

    if (action === 'getCode') {
      const code = typeof getCode === 'function' ? getCode() : '';
      try {
        event.source?.postMessage?.({
          source: 'dogalog-ai-bridge',
          id,
          action: 'code',
          payload: code
        }, event.origin || '*');
      } catch (err) {
        // Swallow errors to keep bridge optional and non-breaking.
      }
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
