// Hook Claude Code « PreToolUse » : fait respecter le workflow de branches du projet.
//   main    ← fusions faites UNIQUEMENT par l'utilisateur
//   develop ← fusions des branches de travail, APRÈS validation de l'utilisateur
//   feature/…, fix/…, enhancement/…, docs/…, chore/…, refactor/…, test/… ← tout le travail
// Règles : pas de modification de fichier ni de commit sur main ou develop ; aucune fusion,
// aucun push vers main ; toute fusion ou tout push vers develop demande la validation de l'utilisateur.
// En cas d'erreur inattendue, le hook laisse passer (code de sortie 0, sans sortie).

import { execFileSync } from 'node:child_process';
import { isAbsolute, join, relative, resolve } from 'node:path';

const PROTECTED_BRANCHES = ['main', 'develop'];
const WORK_BRANCH_PATTERN =
  /^(feature|fix|enhancement|docs|chore|refactor|test)\/[a-z0-9][a-z0-9.-]*$/;
const FILE_TOOLS = ['Edit', 'Write', 'NotebookEdit'];
const SHELL_TOOLS = ['Bash', 'PowerShell'];
const BRANCH_HELP =
  "Crée d'abord une branche de travail depuis develop : " +
  '`git switch -c <type>/<description> develop` (types : feature, fix, enhancement, docs, chore, refactor, test).';

function readStdin() {
  return new Promise((resolveInput) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolveInput(data));
  });
}

function getCurrentBranch(cwd) {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function decide(permissionDecision, reason) {
  return { permissionDecision, reason };
}

function isInsideDirectory(filePath, directory) {
  const relativePath = relative(resolve(directory), resolve(filePath));
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath));
}

// Découpe une commande shell en sous-commandes git : [{ subcommand, args }].
function extractGitCommands(command) {
  const commands = [];
  for (const segment of command.split(/&&|\|\||;|\r?\n|\|/)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    let index = tokens.findIndex((token) => token === 'git' || token === 'git.exe');
    if (index === -1 || tokens.slice(0, index).some((token) => !token.includes('='))) {
      continue;
    }
    index += 1;
    // Options globales de git : -C <chemin>, -c <clé=valeur>, --no-pager…
    while (index < tokens.length && tokens[index].startsWith('-')) {
      index += tokens[index] === '-C' || tokens[index] === '-c' ? 2 : 1;
    }
    if (index < tokens.length) {
      const args = tokens.slice(index + 1).map((token) => token.replace(/^["']|["']$/g, ''));
      commands.push({ subcommand: tokens[index], args });
    }
  }
  return commands;
}

// Branche active après un `git switch` / `git checkout`, ou null si elle ne change pas.
function getBranchAfterSwitch({ subcommand, args }) {
  if (subcommand !== 'switch' && subcommand !== 'checkout') {
    return null;
  }
  const createIndex = args.findIndex((arg) => ['-c', '-C', '-b', '-B', '--create'].includes(arg));
  if (createIndex !== -1) {
    return args[createIndex + 1] ?? null;
  }
  if (args.includes('--')) {
    return null;
  }
  const positional = args.filter((arg) => !arg.startsWith('-'));
  return positional.length === 1 ? positional[0] : null;
}

function checkCreatedBranchName({ subcommand, args }) {
  const isCreation =
    ((subcommand === 'switch' || subcommand === 'checkout') &&
      args.some((arg) => ['-c', '-C', '-b', '-B', '--create'].includes(arg))) ||
    (subcommand === 'branch' && args.length > 0 && !args.some((arg) => arg.startsWith('-')));
  if (!isCreation) {
    return null;
  }
  const name =
    getBranchAfterSwitch({ subcommand, args }) ?? args.find((arg) => !arg.startsWith('-'));
  if (name && !PROTECTED_BRANCHES.includes(name) && !WORK_BRANCH_PATTERN.test(name)) {
    return decide(
      'deny',
      `Nom de branche « ${name} » non conforme. Format attendu : <type>/<description-en-kebab-case>, ` +
        'avec type parmi feature, fix, enhancement, docs, chore, refactor, test (voir docs/CONVENTIONS.md).',
    );
  }
  return null;
}

function checkGitCommand(gitCommand, branch) {
  const { subcommand, args } = gitCommand;
  const isOnProtected = PROTECTED_BRANCHES.includes(branch);
  const mentions = (name) =>
    args.some((arg) => arg === name || arg.endsWith(`:${name}`) || arg === `refs/heads/${name}`);

  const namingDecision = checkCreatedBranchName(gitCommand);
  if (namingDecision) {
    return namingDecision;
  }

  if (
    subcommand === 'branch' &&
    args.some((arg) => ['-d', '-D', '--delete', '-m', '-M'].includes(arg))
  ) {
    if (PROTECTED_BRANCHES.some(mentions)) {
      return decide(
        'deny',
        'Les branches main et develop ne doivent jamais être supprimées ni renommées.',
      );
    }
  }

  if (subcommand === 'commit' && isOnProtected) {
    return decide('deny', `Pas de commit directement sur ${branch}. ${BRANCH_HELP}`);
  }

  const historyCommands = ['merge', 'rebase', 'cherry-pick', 'revert', 'reset', 'am'];
  if (historyCommands.includes(subcommand)) {
    if (branch === 'main') {
      return decide(
        'deny',
        "La branche main est gérée uniquement par l'utilisateur : aucune fusion ni réécriture par Claude.",
      );
    }
    if (branch === 'develop') {
      if (subcommand === 'merge' && !args.includes('--abort')) {
        return decide(
          'ask',
          "Fusion dans develop : à accepter seulement si l'utilisateur a validé la branche dans la conversation.",
        );
      }
      if (!args.includes('--abort')) {
        return decide('deny', `« git ${subcommand} » est interdit sur develop. ${BRANCH_HELP}`);
      }
    }
  }

  if (subcommand === 'push') {
    const deletesProtected =
      (args.includes('--delete') || args.includes('-d')) && PROTECTED_BRANCHES.some(mentions);
    const pushesProtectedByColon = PROTECTED_BRANCHES.some((name) =>
      args.some((arg) => arg === `:${name}`),
    );
    if (deletesProtected || pushesProtectedByColon) {
      return decide('deny', 'Les branches main et develop ne doivent jamais être supprimées.');
    }
    const hasRefspec = args.filter((arg) => !arg.startsWith('-')).length >= 2;
    const targetsMain = mentions('main') || (!hasRefspec && branch === 'main');
    const targetsDevelop = mentions('develop') || (!hasRefspec && branch === 'develop');
    if (targetsMain) {
      return decide('deny', "Seul l'utilisateur pousse vers main.");
    }
    if (targetsDevelop) {
      return decide(
        'ask',
        "Push vers develop : à accepter seulement après validation de la fusion par l'utilisateur.",
      );
    }
    if (args.some((arg) => ['--force', '-f', '--force-with-lease'].includes(arg))) {
      return decide('ask', "Push forcé : à accepter seulement si l'utilisateur l'a demandé.");
    }
  }

  return null;
}

function checkShellCommand(command, cwd) {
  let branch = getCurrentBranch(cwd);
  if (branch === null) {
    return null;
  }
  for (const gitCommand of extractGitCommands(command)) {
    const decision = checkGitCommand(gitCommand, branch);
    if (decision) {
      return decision;
    }
    branch = getBranchAfterSwitch(gitCommand) ?? branch;
  }
  return null;
}

function checkFileEdit(filePath, projectDir) {
  if (
    !filePath ||
    !isInsideDirectory(filePath, projectDir) ||
    isInsideDirectory(filePath, join(projectDir, '.git'))
  ) {
    return null;
  }
  const branch = getCurrentBranch(projectDir);
  if (branch && PROTECTED_BRANCHES.includes(branch)) {
    return decide('deny', `Modification de fichier interdite sur ${branch}. ${BRANCH_HELP}`);
  }
  return null;
}

async function main() {
  const input = JSON.parse(await readStdin());
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
  const toolInput = input.tool_input ?? {};

  let decision = null;
  if (FILE_TOOLS.includes(input.tool_name)) {
    decision = checkFileEdit(toolInput.file_path ?? toolInput.notebook_path, projectDir);
  } else if (SHELL_TOOLS.includes(input.tool_name) && typeof toolInput.command === 'string') {
    decision = checkShellCommand(toolInput.command, input.cwd ?? projectDir);
  }

  if (decision) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: decision.permissionDecision,
          permissionDecisionReason: decision.reason,
        },
      }),
    );
  }
}

main().catch(() => process.exit(0));
