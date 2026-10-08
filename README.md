# sample az — Carnival Care telehealth demo

Clickable product demo of a Carnival Care patient journey. Static HTML/CSS/JS, no build step, no backend. All doctors, patients and prices are fictional.

## Run

Open `index.html` in a browser, or serve the folder with any static server.

## Demo flow

1. **Find a doctor** (`#/`) — 12 doctors across 10 departments, filter by department, search, "Available now".
2. **Book** (`#/doctor/<id>`) — consultation type, date, time slot, symptoms, bKash / Nagad / card.
3. **Consult** (`#/consult`) — video call screen with live captions and chat.
   - **Patient view**: prescription appears live as the doctor writes it (auto-plays; ⚡ skips ahead).
   - **Doctor view**: prescription composer — complaints, vitals, diagnosis, medicine search, tests, advice, referral, sign & send.
4. **Patient portal** (`#/dashboard`) — new prescription, buy prescribed medicines (cart + checkout), book home sample collection for ordered tests, book the referred specialist, follow-up, live order tracking.
5. **Prescription** (`#/prescription`) — printable e-prescription (Print / Save PDF).
6. **Doctor portal** (`#/doctor-portal`) — today's queue, start the consultation as the doctor.

Demo state is saved in the browser's `localStorage`; use **Reset demo** in the patient portal sidebar to start over.

## Files

- `index.html` — shell, header, footer
- `css/styles.css` — styles (brand colors from carnivalcare.com)
- `js/data.js` — sample doctors, departments, patient and prescription
- `js/app.js` — router, views and interactions
- `assets/` — Carnival Care logo and favicon from carnivalcare.com
