# Hydra — the product assistant

Hydra is the chat assistant in the bottom-right corner of every page. It answers questions about Western Hardware
Mart's products: what an item is, the sizes it comes in, where it is used, how to use it and its specifications. It
also handles shop questions such as address, timings, phone, delivery and "do you manufacture?".

**No external API.** Everything Hydra knows ships with the website, and it answers inside the visitor's browser.
Nothing is sent anywhere, there is no API key or monthly cost, and it works as long as the page loads.

## How it works

1. **Training, once.** `npm run hydra:train` reads every PDF in `scripts/hydra/catalogues/` plus
   `scripts/hydra/guide.md`. It writes what it learned to `src/app/features/hydra/data/hydra-knowledge.data.ts`,
   along with a summary in `scripts/hydra/training-report.md`.
   * It links each catalogue page to the website product it describes (by model number, Taparia section number or
     product name).
   * From each page it keeps the description, features, applications, how-to notes, technical specifications and
     part numbers.
   * It leaves out **prices**, the manufacturers' own **phone numbers, e-mails, addresses and websites**, sentences
     in a manufacturer's own voice ("we manufacture…", so Hydra never claims Western Hardware Mart makes the
     products), legal small print and drawing dimensions. If anything price-like or contact-like slips through,
     training stops with an error instead of writing it.
   * Spelling slips in the source catalogues are corrected (for example "encapsuiated" becomes "encapsulated").
     Facts are never changed.
2. **Answering.** `src/app/features/hydra/engine/` matches the question against all 640 website products, the 25
   categories, the 6 brands and the learned knowledge. It tolerates spelling mistakes ("guage", "hydralic"), trade
   words ("wrench" for spanner, "NRV" for check valve, "QRC" for coupling, "PT100" for RTD), model and part numbers
   ("KHB2", "AH12-08G-F", "1621-8") and sizes ("1/2 inch", "10 x 11", "DN 25", "3 ton", "18 inch pipe wrench").
   It then builds the answer from the product data and catalogue text. It doesn't invent anything.
3. **Follow-ups.** Hydra remembers what was just discussed, so "what sizes does it come in?", "where is it used?",
   "price?" and "do you have it in 3/4 inch?" refer to the last product.

### What it never does

* **Quote prices.** Price questions get "our team shares prices on request", with a WhatsApp button and a
  pre-filled message.
* **Say "we don't have it."** If a product, brand or size isn't in the catalogue, Hydra says "please contact our
  team for this product — they'll check availability", shows the closest items we do stock, and offers WhatsApp
  and Call buttons.
* **Show the hidden lifting brand,** or claim that Western Hardware Mart manufactures anything.

## Day-to-day

| Task | What to do |
| --- | --- |
| Ask Hydra something from the terminal | `npm run hydra:ask -- "khb2 sizes" "where is it used?"` |
| Check a list of questions | `npm run hydra:ask -- --file scripts/hydra/test-questions.txt` |
| Add or replace a catalogue | Put the PDF in `scripts/hydra/catalogues/`, run `npm run hydra:train`, then build and deploy |
| Change shop answers or general notes | Edit `scripts/hydra/guide.md` (shop FAQs, category notes, glossary), then `npm run hydra:train` |
| Add products to the website | Edit the product data as usual. Hydra picks up new products automatically on the next build, so retraining is only needed for new catalogue text |

Training takes a few seconds. Commit the regenerated `hydra-knowledge.data.ts` with your change.

**Image-only PDFs.** Some PDFs are pictures of text, with nothing selectable, so they can't be read directly. For
those, put a `.txt` file with the same name next to the PDF. `asian-iso7241-qrc.txt` and `asian-flat-face-qrc.txt`
show the format. The trainer warns you when a PDF has no readable text and no `.txt` file next to it.

**The PDFs stay private.** `scripts/hydra/catalogues/*.pdf` is in `.gitignore`, so the catalogues (including the
Taparia price list) are never pushed to GitHub or published on the website. Only the trained knowledge, which has
no prices in it, is committed. Keep the PDFs on your computer if you want to retrain later.

## On the website

* **The button** (`hydra-launcher.component.ts`) appears once a page has finished loading. Nothing is added to the
  prerendered HTML, so SEO and first paint are unaffected. It adds about 5 KB (compressed) to the first load.
* **The chat window** (`hydra-panel.component.ts`), together with the engine and the knowledge, is about 40 KB
  compressed. It loads only when a visitor hovers over or taps the button.
* On phones the chat opens full screen. On product pages the button sits above the sticky WhatsApp/Email bar.
* The conversation is kept for the browser tab (session storage), so it survives moving between pages.
* It is keyboard and screen-reader friendly: Esc closes the chat, and new answers are announced. An axe scan of the
  open chat found no issues.
* **Mascot.** Hydra is an original vector character (`hydra-mascot.component.ts`) with the WHM mark on its chest,
  pressure-gauge ears and an oil-drop antenna. It blinks, floats, waves on the welcome screen and looks thoughtful
  while "typing". All motion stops for visitors who turn on reduced motion. `docs/hydra/hydra-mascot.svg` and the
  `.png` next to it are copies for social media or print.

## Limits worth knowing

Hydra is a search-and-answer assistant built on your catalogues, not a general AI chatbot. It answers well about
products, sizes, uses, specifications and the shop. It won't write essays or answer questions outside that range;
for anything it can't place, it hands over to the team. Coverage follows the catalogues:

* Polyhydron and Asian Hydraulic datasheets give the richest answers.
* Taparia answers come from the product tables (sizes and part numbers).
* Yuken and Hydroline items have only short descriptions on the site, so Hydra uses the general notes in
  `guide.md` and refers detailed questions to the team.
