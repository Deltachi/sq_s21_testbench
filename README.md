# Softwarequalität SS2021 Testbench
Eine Testbench zum Testen des ILIAS-Prüfungsserves mit Selenium und Jest und Typescript.
## Was du benötigst:
- Einen Editor/IDE (z.B. VS Code)
- Node.js
- npm
- ..das wars!

## Installation
1. Klone das Repo
2. Führe `npm install` im Projektordner aus um alle Abhängigkeiten automatisch zu installieren
   - selenium-webdriver
   - geckodriver
   - typescript
   - ts-node
   - jest
   - nodemon (optional)

## Compile and Test
Die Tests werden in den `src/` Ordner geschrieben. Entweder in die `main.test.ts` oder in eine eigene Datei nach folgender Benennung: `*.test.ts`
Um die Typescript Datei zu kompilieren und die Tests auszuführen, führe `npm run test` im Projektordner aus. Dieser Befehl erstellt ausführbare JS Dateien im `build/` Ordner und führt alle `*.test.js` - Dateien als eigene Test-Suites aus.

## Hinweise
Achte darauf, den Jest-Tests genug Zeit zu geben, da der Webdriver je nach Verbindung und Server eine gefühlte Ewigkeit zum Behandeln der Tests braucht.
