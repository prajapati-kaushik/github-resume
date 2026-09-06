---
title: "Modernising a live healthcare platform"
description: "How I sequence Symfony work when patients and professionals already depend on the system."
pubDate: 2026-08-12
tags:
  - PHP
  - Symfony
  - Healthcare
featured: true
---

On a live portal, the question is not “when is the rewrite done?” It is “which capability moves next, and what stays stable for everything still on the old path?”

I start with what changes often or fails often. Those slices fund the scaffolding: Symfony beside existing routes, a database both sides can use without corrupting data. Progress is when **new work has an obvious home** — not when every file has a new namespace.

That is the modernisation I offer an organisation: sequenced, reversible, and compatible with a release calendar.
