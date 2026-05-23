import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { get } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const filesToTest = [
  'index.html',
  'compare.html',
  'VPBank_TinChap_TheChap_Calculator.html',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  const chrome = candidates.find((candidate) => existsSync(candidate));
  assert(chrome, 'Chrome/Edge not found. Set CHROME_PATH to run smoke tests.');
  return chrome;
}

function httpJson(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function waitForVersion(port, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      return await httpJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await sleep(100);
    }
  }
  throw new Error('Timed out waiting for Chrome DevTools endpoint.');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(child, timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (child.exitCode !== null || child.killed) {
      resolve();
      return;
    }

    const timer = setTimeout(resolve, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function removeTempDir(dir) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(250);
    }
  }
}

class Cdp {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();

    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });

    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }

      const callbacks = this.listeners.get(message.method);
      if (callbacks) {
        for (const callback of callbacks) callback(message);
      }
    });
  }

  on(method, callback) {
    const callbacks = this.listeners.get(method) || [];
    callbacks.push(callback);
    this.listeners.set(method, callbacks);
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;

    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.ws.send(JSON.stringify(payload));
    return promise;
  }

  close() {
    this.ws.close();
  }
}

async function evalPage(cdp, sessionId, expression) {
  const result = await cdp.send(
    'Runtime.evaluate',
    {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    },
    sessionId,
  );

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  }
  return result.result.value;
}

async function createPage(cdp) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', {
    targetId,
    flatten: true,
  });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Log.enable', {}, sessionId);
  return { targetId, sessionId };
}

async function navigate(cdp, sessionId, url) {
  const loaded = new Promise((resolve) => {
    const handler = (message) => {
      if (message.sessionId === sessionId) resolve();
    };
    cdp.on('Page.loadEventFired', handler);
  });

  await cdp.send('Page.navigate', { url }, sessionId);
  await loaded;
  await sleep(500);
}

async function runPageSmoke(cdp, file) {
  const url = pathToFileURL(path.join(repoRoot, file)).href;
  const errors = [];
  const { targetId, sessionId } = await createPage(cdp);

  cdp.on('Runtime.exceptionThrown', (message) => {
    if (message.sessionId === sessionId) {
      errors.push(message.params.exceptionDetails?.text || 'Uncaught runtime exception');
    }
  });
  cdp.on('Log.entryAdded', (message) => {
    if (message.sessionId === sessionId && message.params.entry.level === 'error') {
      errors.push(message.params.entry.text);
    }
  });

  await navigate(cdp, sessionId, url);

  const pageState = await evalPage(
    cdp,
    sessionId,
    `(() => {
      const canvas = document.querySelector('#ch');
      const ctx = canvas?.getContext('2d');
      const image = ctx && canvas.width && canvas.height
        ? Array.from(ctx.getImageData(0, 0, Math.min(canvas.width, 80), Math.min(canvas.height, 80)).data)
        : [];
      return {
        ready: document.readyState,
        title: document.title,
        canvasWidth: canvas?.width || 0,
        canvasHeight: canvas?.height || 0,
        canvasHasPixels: image.some((value, index) => index % 4 === 3 && value > 0),
        summary: document.querySelector('#s-tc-ttl')?.textContent || '',
        hasPrivacy: document.body.innerText.includes('không gửi lên server') && document.body.innerText.includes('30 ngày'),
        hasCompareLink: !!document.querySelector('a[href="compare.html"]'),
        hasHomeLink: !!document.querySelector('a[href="index.html"]'),
      };
    })()`,
  );

  assert(pageState.ready === 'complete', `${file}: document did not finish loading.`);
  assert(pageState.canvasWidth > 0 && pageState.canvasHeight > 0, `${file}: chart canvas has invalid dimensions.`);
  assert(pageState.canvasHasPixels, `${file}: chart canvas appears blank.`);
  assert(pageState.summary.includes('Tổng trả:'), `${file}: TC summary is missing.`);
  assert(pageState.hasPrivacy, `${file}: privacy disclaimer is missing.`);

  await evalPage(
    cdp,
    sessionId,
    `(() => {
      const input = document.querySelector('#stv');
      input.value = '2.000.000.000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`,
  );
  await sleep(250);

  const updatedSummary = await evalPage(
    cdp,
    sessionId,
    `document.querySelector('#s-tc-ttl')?.textContent || ''`,
  );
  assert(updatedSummary !== pageState.summary, `${file}: summary did not update after changing loan amount.`);

  const historyState = await evalPage(
    cdp,
    sessionId,
    `(() => {
      localStorage.clear();
      window.saveToHistory();
      const saved = JSON.parse(localStorage.getItem('vpbank_history') || '[]').length;
      window.confirm = () => true;
      window.clearHistory();
      const cleared = JSON.parse(localStorage.getItem('vpbank_history') || '[]').length;
      return { saved, cleared };
    })()`,
  );
  assert(historyState.saved > 0, `${file}: history did not save.`);
  assert(historyState.cleared === 0, `${file}: history did not clear.`);

  if (file === 'index.html') {
    assert(pageState.hasCompareLink, `${file}: missing relative link to compare.html.`);

    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true,
      },
      sessionId,
    );
    await sleep(100);

    const presetState = await evalPage(
      cdp,
      sessionId,
      `(() => {
        const preset = document.querySelector('#ratePreset');
        const rate = document.querySelector('#lTC');
        const disclaimerVisible = (() => {
          const text = 'Lãi suất trên là ví dụ tham khảo. MSO nhập lãi suất thực tế theo sản phẩm.';
          const node = Array.from(document.querySelectorAll('.fld-hint')).find((el) => el.textContent.includes(text));
          if (!node) return false;
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })();

        preset.value = '15';
        preset.dispatchEvent(new Event('change', { bubbles: true }));
        const afterPreset = {
          rate: rate.value,
          selectValue: preset.value,
          activePreset,
          note: document.querySelector('#preset-note')?.textContent || '',
          summary: document.querySelector('#s-tc-ttl')?.textContent || '',
        };

        rate.value = '18';
        rate.dispatchEvent(new Event('input', { bubbles: true }));
        const afterManual = {
          rate: rate.value,
          selectValue: preset.value,
          activePreset,
          note: document.querySelector('#preset-note')?.textContent || '',
          summary: document.querySelector('#s-tc-ttl')?.textContent || '',
        };

        localStorage.clear();
        window.saveToHistory();
        preset.value = '21';
        preset.dispatchEvent(new Event('change', { bubbles: true }));
        window.loadFromHistory(0);
        const afterLoad = {
          rate: rate.value,
          selectValue: preset.value,
          activePreset,
          note: document.querySelector('#preset-note')?.textContent || '',
        };

        return { disclaimerVisible, afterPreset, afterManual, afterLoad };
      })()`,
    );

    assert(presetState.disclaimerVisible, `${file}: preset disclaimer is missing or hidden.`);
    assert(presetState.afterPreset.rate === '15', `${file}: preset did not update TC rate.`);
    assert(presetState.afterPreset.selectValue === '15', `${file}: preset select did not keep selected value.`);
    assert(presetState.afterPreset.activePreset === '15', `${file}: activePreset was not set after selecting preset.`);
    assert(
      presetState.afterPreset.note.includes('Dùng để minh hoạ kịch bản trả nợ'),
      `${file}: preset note did not show preset advisor wording.`,
    );
    assert(presetState.afterManual.rate === '18', `${file}: manual TC rate edit did not apply.`);
    assert(presetState.afterManual.selectValue === '', `${file}: manual TC rate edit did not clear preset select.`);
    assert(presetState.afterManual.activePreset === null, `${file}: manual TC rate edit did not clear activePreset.`);
    assert(
      presetState.afterManual.note.includes('Đang dùng lãi suất tùy chỉnh của MSO'),
      `${file}: manual TC rate edit did not show custom advisor wording.`,
    );
    assert(presetState.afterLoad.selectValue === '', `${file}: history load did not clear preset select.`);
    assert(presetState.afterLoad.activePreset === null, `${file}: history load did not clear activePreset.`);
    assert(
      presetState.afterLoad.note.includes('Đang dùng lãi suất tùy chỉnh của MSO'),
      `${file}: history load did not show custom advisor wording.`,
    );
  }
  if (file === 'compare.html') {
    assert(pageState.hasHomeLink, `${file}: missing relative link to index.html.`);
  }

  await cdp.send('Target.closeTarget', { targetId });
  assert(errors.length === 0, `${file}: browser errors:\n${errors.join('\n')}`);
  console.log(`PASS ${file}`);
}

function runStaticChecks() {
  const compare = readFileSync(path.join(repoRoot, 'compare.html'), 'utf8');
  const offline = readFileSync(path.join(repoRoot, 'VPBank_TinChap_TheChap_Calculator.html'), 'utf8');
  const index = readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

  assert(index.includes('href="compare.html"'), 'index.html must link to compare.html with a relative path.');
  assert(compare.includes('href="index.html"'), 'compare.html must link to index.html with a relative path.');
  assert(
    /feeBaoHiem\s*\*\s*Math\.ceil\(KH\s*\/\s*12\)/.test(compare),
    'compare.html must calculate insurance fee per year using Math.ceil(KH / 12).',
  );
  assert(compare === offline, 'Offline share file must be identical to compare.html.');
}

async function main() {
  runStaticChecks();

  const chrome = findChrome();
  const port = 9300 + Math.floor(Math.random() * 500);
  const userDataDir = mkdtempSync(path.join(tmpdir(), 'vpbank-smoke-'));
  const chromeProcess = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  try {
    const version = await waitForVersion(port);
    const cdp = new Cdp(version.webSocketDebuggerUrl);
    await cdp.ready;

    for (const file of filesToTest) {
      await runPageSmoke(cdp, file);
    }

    cdp.close();
    console.log('Smoke release checks passed.');
  } finally {
    chromeProcess.kill();
    await waitForExit(chromeProcess);
    await removeTempDir(userDataDir);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
