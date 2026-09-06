---
title: "Billing belongs in the domain"
description: "VAT, reprints and access control are product rules. They should not live only in a PDF."
pubDate: 2026-07-20
tags:
  - PHP
  - Billing
  - Architecture
featured: true
---

“Generate a PDF” is the last step. The cost sits in who can see a bill, what recurs, which VAT applies, and what a reprint means.

On Biller/Inqonto, the durable work was modular structure and explicit tax calculation. If those rules live in the template, the next market or reminder flow will copy them wrong. Organisations pay for **domain modules**, not prettier print CSS.
