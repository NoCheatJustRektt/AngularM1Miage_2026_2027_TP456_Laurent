// Hook Claude Code « UserPromptSubmit » : enregistre chaque prompt, horodaté, dans docs/RAPPORT_IA.md.
// La journalisation ne s'active que si "enabled" vaut true dans prompt-log.config.json.
// Le hook ne doit jamais bloquer un prompt : toute erreur est ignorée (code de sortie 0).

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOOKS_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR ?? join(HOOKS_DIR, '..', '..');
const CONFIG_PATH = join(HOOKS_DIR, 'prompt-log.config.json');
const REPORT_PATH = join(PROJECT_DIR, 'docs', 'RAPPORT_IA.md');
const ENTRY_TITLE_PATTERN = /^## Prompt n°\d+/gm;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
  });
}

function formatLocalTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

// Le bloc de code doit être délimité par plus d'accents graves que la plus longue série du prompt.
function buildFence(text) {
  const longestRun = Math.max(0, ...(text.match(/`+/g) ?? []).map((run) => run.length));
  return '`'.repeat(Math.max(4, longestRun + 1));
}

async function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  if (!config.enabled || !existsSync(REPORT_PATH)) {
    return;
  }

  const input = JSON.parse(await readStdin());
  const prompt = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!prompt) {
    return;
  }

  const report = readFileSync(REPORT_PATH, 'utf8');
  const entryNumber = (report.match(ENTRY_TITLE_PATTERN) ?? []).length + 1;
  const timestamp = formatLocalTimestamp(new Date());
  const fence = buildFence(prompt);

  const entry = [
    '',
    '---',
    '',
    `## Prompt n°${entryNumber} — ${timestamp}`,
    '',
    '### Prompt',
    '',
    `${fence}text`,
    prompt,
    fence,
    '',
    '### Compte rendu de la réponse',
    '',
    '_À compléter par Claude à la fin de la réponse._',
    '',
  ].join('\n');

  appendFileSync(REPORT_PATH, entry, 'utf8');

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext:
          `Ce prompt a été enregistré dans docs/RAPPORT_IA.md (Prompt n°${entryNumber}, ${timestamp}). ` +
          'À la fin de ta réponse, remplace « À compléter par Claude » de cette entrée par le compte rendu ' +
          'détaillé de la réponse, au format décrit en tête de docs/RAPPORT_IA.md.',
      },
    }),
  );
}

main().catch(() => process.exit(0));
