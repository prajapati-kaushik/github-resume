---
title: "ZwangerenPortaal — live healthcare platform"
category: "Healthcare"
description: "PHP/Symfony backend on a Dutch patient portal used by over 2.5 million new parents. The value is continuity: the product stays live while architecture and APIs improve."
featured: true
order: 1
technologies:
  - PHP
  - Symfony
  - APIs
  - Microservices
  - MySQL
  - Docker
website: "https://www.zwangerenportaal.nl/"
---

## The problem

[ZwangerenPortaal.nl](https://www.zwangerenportaal.nl/) is a patient portal in the Netherlands serving over 2.5 million new parents, built with [LinkORB Engineering](http://engineering.linkorb.com/). Healthcare software cannot go down for rewrites — expectant parents and midwives depend on it daily. The challenge: improve the architecture and add new features without disrupting a system that must stay live.

## My approach

I worked as part of the backend team for over a decade, delivering incremental improvements rather than risky big-bang changes:

- **Incremental migration**: Moved legacy PHP code toward maintainable Symfony modules, one domain at a time
- **API development**: Built and extended APIs that integrate with hospital systems, appointment scheduling, and patient records
- **Zero-downtime deployments**: Structured releases so the platform stayed available through every change
- **Long-term ownership**: Understood the full system deeply enough to make safe, confident changes

## Results

- Platform has shipped continuously for 10+ years without major outages during my tenure
- New features now land in well-structured Symfony code instead of accumulating technical debt
- Backend architecture supports the product roadmap without requiring a rewrite

## For organisations

This is what **long-running product engineering** looks like: keep the live system reliable, improve it in safe steps, and ship new backend work — all while remote from India on EU hours.
