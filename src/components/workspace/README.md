# Workspace System (SaaS)

## Component structure

- `WorkspaceChat`
  - chat UI
  - programmatic Q&A (non-AI) untuk kumpulkan:
    - product
    - target
    - benefit
    - images
  - tombol `Generate Copy`
  - tombol `Download`
- `PaywallModal`
  - muncul saat FREE user trigger paywall

## State machine

State project:
1. `draft`
2. `ready`
3. `generated`

Transition:
- `draft -> ready`: setelah semua field terisi
- `ready -> generated`: setelah AI call sukses

Rules FREE:
- no revision (tidak bisa reset ke draft setelah generated)
- no download
- chat setelah generated kena paywall

## API flow

1. User jawab pertanyaan programmatic (tanpa AI)
2. `saveAnswersDraft()` menyimpan jawaban + update project status ke `ready`
3. `generateCopyOnce()`:
   - cek project `generated_html`
   - jika belum ada, invoke function `generate-copy` (AI dipanggil **sekali**)
   - simpan hasil ke `generated_html`, update status `generated`
4. Trigger paywall:
   - klik `Download` pada FREE
   - kirim chat setelah status `generated` pada FREE
