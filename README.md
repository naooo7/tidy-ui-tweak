# Smart Drill Enhancer

https://github.com/naooo7/smart-drill-quest Fix and complete ONLY the following three areas in the existing FastLearner app.

IMPORTANT:

- Do NOT rebuild the app.

- Do NOT redesign the existing UI.

- Do NOT change unrelated pages.

- Reuse the existing catalog, question data, drill/session logic, and storage system.

- Do NOT add a large question bank.

- Preserve the existing warm/brown visual identity.

1. DRILL FUNCTIONALITY

The Drill flow must follow this exact hierarchy:

Exam → Subtest → Material → Drill Settings → Questions

The Material level MUST appear before starting questions.

For SKD, use these exact materials:

TWK:

- Nasionalisme

- Integritas

- Bela Negara

- Pilar Negara

- Bahasa Negara

TIU:

- Verbal Analogi

- Verbal Silogisme

- Verbal Analitis

- Numerik Berhitung

- Numerik Deret Angka

- Numerik Perbandingan Kuantitatif

- Numerik Soal Cerita

- Figural Analogi

- Figural Ketidaksamaan

- Figural Serial

TKP:

- Pelayanan Publik

- Jejaring Kerja

- Sosial Budaya

- Teknologi Informasi dan Komunikasi

- Profesionalisme

- Anti Radikalisme

After selecting SKD → TWK/TIU/TKP, these materials MUST appear as selectable options.

Do NOT skip the Material level.

For UTBK, make these selectable:

- PU

- PPU

- PBM

- PK

- LBI

- LBE

- PM

Psikotes, TPA, and TBI must also use their existing catalog/categories.

Remove the current "prototype", "coming soon", or disabled placeholder behavior from valid existing Drill options.

When a material is selected, the Drill session MUST actually filter questions by:

- exam

- subtest

- material

Existing Drill settings must continue to work:

- question count

- difficulty

- question status

- Challenge mode

Start Drill must work for every valid selection that has questions.

Do not create another taxonomy/sub-material layer.

2. PROFILE — TARGET INSTITUTION

Add a Target Institution section to the existing Profile page.

Create these 4 example institutions:

- PKN STAN

- UNPAD — Universitas Padjadjaran

- UI — Universitas Indonesia

- ITB — Institut Teknologi Bandung

Requirements:

- User can select one target institution.

- User can change the selected institution later.

- Show the selected institution name in Profile.

- Show the official institution logo subtly, such as a small logo or low-opacity/watermark treatment.

- Persist the selected institution using the existing localStorage/storage system.

- Structure the institution data so more institutions can easily be added later.

- Use appropriate official logos/assets.

- Keep the existing Profile design.

3. ANSWER OPTION COLOR / CONTRAST FIX

The current brown theme is interfering with answer options.

When an answer is selected, the option background and text can become too similar, causing the answer text to disappear or become difficult to read.

Fix this without redesigning the app.

Answer text MUST remain clearly readable in every state:

- Default/unselected

- Hover

- Selected

- Correct answer

- Incorrect answer

- Disabled/after submission

Requirements:

- Keep the existing warm/brown theme.

- Do NOT replace the entire color palette.

- Do NOT change the overall page design.

- Ensure selected answer text has sufficient contrast against its background.

- Correct and incorrect states must remain visually distinct.

- Preserve the existing rounded cards, spacing, typography, and layout.

- Check both light mode and dark mode if implemented.

- Apply the fix consistently to all answer options throughout the app.

FINAL CHECK:

After implementing these changes:

- Run the build.

- Fix related TypeScript/runtime errors.

- Verify Drill selections actually lead to questions.

- Verify selected materials filter the questions correctly.

- Verify Profile institution selection persists after refresh.

- Verify answer text remains readable after selecting and submitting an answer.

Focus ONLY on these requested fixes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smart-drill-quest-fix.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/23bf4d64-fb52-4ee1-9140-a9f5a5ff6b71).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
