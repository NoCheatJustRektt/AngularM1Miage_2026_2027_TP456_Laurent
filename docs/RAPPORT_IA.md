# Rapport d'utilisation de l'IA

> Journal de tous les prompts envoyés à l'assistant IA (Claude Code) **pendant le développement** de StudyShare, avec leur horodatage et un compte rendu détaillé de chaque réponse.

## Fonctionnement

- **Début de la journalisation :** au lancement de l'étape 0 (mise en place). Les échanges de la phase de conception ne sont pas journalisés ; leur résultat est la documentation de `docs/`.
- **Enregistrement automatique :** un hook Claude Code (`.claude/hooks/log-prompt.mjs`, déclaré dans `.claude/settings.json`) ajoute chaque prompt **mot pour mot**, avec la date et l'heure de la machine, dès son envoi. Il est activé par `"enabled": true` dans `.claude/hooks/prompt-log.config.json`.
- **Compte rendu :** à la fin de chaque réponse, Claude remplace « À compléter par Claude » par le compte rendu, au format ci-dessous.
- **Numérotation :** les entrées sont numérotées dans l'ordre (`Prompt n°1`, `Prompt n°2`…). Ne pas modifier les titres, le hook s'en sert pour compter.

**État actuel :** 🔲 journalisation **inactive** (elle sera activée au début de l'étape 0).

## Format d'une entrée

````markdown
## Prompt n°N — AAAA-MM-JJ HH:MM:SS

### Prompt

```text
Le prompt, mot pour mot.
```

### Compte rendu de la réponse

**Résumé :** ce que la réponse a fait, en une ou deux phrases.

**Étape :** n° et nom de l'étape (voir docs/ROADMAP.md).

**Actions réalisées :**
- …

**Fichiers créés ou modifiés :**
- `chemin/du/fichier` — ce qui a changé

**Décisions prises :** … (avec le numéro d'ADR s'il y en a une)

**Tests :** tests ajoutés, commande lancée, résultat (réussis / échoués).

**Points en suspens :** ce qui n'est pas fait ou pas vérifié, questions posées à l'utilisateur.
````

---

## Journal

_Aucune entrée pour l'instant._
