# Design brief — StudentSafe Europe

Working notes for the 2026 rebrand. Written before implementation, critiqued, revised.

## Audience, in priority order

1. **A student** who has hit a problem and is trying to work out whether anyone has
   thought about this. Needs, in seconds: who these people are, whether this is a
   place that can help, and what is actually here. Will not read a manifesto.
2. **A researcher, ombudsperson or quality-assurance officer** deciding whether this
   is citable. Needs: method, sources, verification status, limits, corrections.
3. **A journalist or policy officer** looking for a defensible claim about one country.
4. **A potential contributor or reviewer.**

Audience 1 arrives most often and leaves fastest. Audience 2 decides whether the work
survives contact with an institution. The site must serve both without the first
having to wade through the second's apparatus.

## Primary job of the site

Make it obvious that StudentSafe Europe exists, what it is doing now, and how anyone
can check the work — without overstating how much has been done.

## Brand hierarchy (the correction)

| Level | Name | Role |
| --- | --- | --- |
| Organisation | **StudentSafe Europe** | The association. Wordmark, masthead, every `<title>`, metadata, footer. Statutory EN name (Statute Art. 2). |
| Legal name | StudentSafe Europa | Croatian statutory name. Appears in About and the footer imprint, not in the masthead. |
| Short form | StudentSafe | Permitted short name; used where space is tight. |
| Framework | **StudentSafe Standard** | The statutory name of the methodology (Statute Art. 9). Currently published as v0.1.1. |
| Programme | Academic Safeguard Europe (ASE) | Subordinate. The research initiative and the legacy name of the Standard. Never the organisation. |
| Campaign | Safe to Speak | A campaign, never the organisation. |

Grounded in the signed Statute: Art. 2 (names), Art. 3 (Zagreb, EHEA), Art. 5 (English
may be the primary working language), Art. 6 (principles), Art. 7 (mission and the
definition of "student protection mechanisms"), Art. 9 (objectives, incl. the Standard).

**Not established and therefore not publishable:** registry number, completed
registration, officers, contact address, funding, partners, any operational service.

## Route map

Existing English routes are preserved; nothing moves in this pass.

```
/                     Home
/about/               About StudentSafe Europe (organisation, governance, limits)
/problem/             Why protection has to be structural
/demands/             Policy asks (advocacy, labelled as such)
/take-action/         Get involved (role-specific, honest about what exists)
/standard/            The StudentSafe Standard
/methodology/         Method, + /methodology/changelog/
/evidence/            Overview: scope, status, one specimen, index
/evidence/library/    The reading library
/europe/ /countries/ /institutions/ /compare/ /sources/ /data/ /corrections/
```

## Design tokens

Light-first. The old scheme (navy #0a1628 / cream #f3efe6 / signal yellow #f5c518,
full-bleed dark↔light slabs every section) is retired.

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#F7F9F8` | Page ground |
| `--surface` | `#FFFFFF` | Raised cards, table rows |
| `--surface-2` | `#DDEBE7` | Pale mineral fills, quiet panels |
| `--ink` | `#193239` | Body and headings |
| `--ink-2` | `#3C5C63` | Secondary prose |
| `--ink-3` | `#527078` | Metadata, captions |
| `--brand` | `#2D645D` | Primary actions, selected brand elements |
| `--brand-dark` | `#1F4A45` | Hover/active, brand ground |
| `--rule` | `#C9D8D4` | Hairlines |
| `--alert` | `#9A4A41` | Cautions only, never decoration |

Type: **Source Sans 3** for interface and body, **Source Serif 4** for a small number of
editorial moments and quotations. Both self-hosted. Literata is retained only where an
existing quotation depends on it.

Scale: `--fs-h1: clamp(2rem, 4.2vw, 3.25rem)` — no 104px headings. Body 17–18px,
measure 62–72ch, section padding `clamp(2.5rem, 5vw, 4.5rem)`.

## Homepage wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ [mark] StudentSafe Europe          Mission Work Research      │
│        Student protection in HE    Get involved About  EN|HR  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Students should be safe to speak up.                         │
│                                                               │
│  We work to make protection from retaliation, fair complaint  │
│  procedures and effective remedies part of higher education   │
│  across Europe.                                               │
│                                                               │
│  [ Explore our work ]   View our research →                   │
│                                                               │
│  ── independent association · Zagreb · non-profit ──          │
├──────────────────────────────────────────────────────────────┤
│  WHAT WE DO                                                   │
│  ┌────────────┬────────────┬────────────┐                    │
│  │ Standard   │ Research   │ Advocacy   │                    │
│  │ 12 safegu. │ published  │ policy     │                    │
│  │ v0.1.1     │ rules read │ asks       │                    │
│  │ draft      │ against it │            │                    │
│  │ NOW        │ NOW        │ NOW        │                    │
│  └────────────┴────────────┴────────────┘                    │
├──────────────────────────────────────────────────────────────┤
│  WHERE THE RESEARCH STANDS                                    │
│  Croatia + 1 university · 24 findings · 0 independently       │
│  verified · all provisional, AI-assisted                      │
│  [small honest strip — not a 27 trophy]      See the evidence→│
├──────────────────────────────────────────────────────────────┤
│  Choose a path: researcher · institution · student · support  │
│  Honest boundary line. Compact footer + imprint.              │
└──────────────────────────────────────────────────────────────┘
```

Target: 3–4 desktop viewports, down from 9.3.

## Self-critique, and what changed because of it

**Draft 1 read like a generic NGO template.** The failures, and the fixes:

1. *Three equal cards for Standard / Research / Advocacy is the single most templated
   block on the internet.* Kept the three workstreams, because they are genuinely the
   three things this organisation does, but each carries a status line — what exists
   now versus what is being built — so the block does work no icon trio does.
2. *"Explore our work" is a non-verb.* Kept only because it is honest: there is no
   petition, no sign-up and no case intake to send anyone to. A stronger CTA would be
   a lie. The honesty is the point, and the secondary CTA goes to something concrete.
3. *A hero with a huge headline and two buttons is exactly what every AI site produces.*
   The differentiator is not the shape but the refusal of the usual furniture: no
   stock photograph, no abstract gradient, no counter animation, no "trusted by" row.
   The hero carries one sentence of mission and one line of provenance.
4. *The "27 Member States in scope" graphic is a trophy for work not done.* Replaced by
   a scope-and-status strip that leads with what is actually finished: one country, one
   university, 24 provisional findings, zero independently verified.
5. *A yellow ticker is a protest device, not an organisational one.* Removed entirely.

**What stays deliberately unfashionable:** no rounded cards everywhere, no shadows,
hairline rules instead of borders on everything, and research pages that look like
documents rather than dashboards.

## Visual signature

One motif: **the open channel** — a thin mineral-green rule that breaks and resumes,
used at section joins and beside the brand mark. It reads as a route that stays open.
It is drawn in CSS, carries no meaning that is not also in text, and never animates
except where it marks an interaction. No shield, no EU stars, no seal imitation. The
association's statutory seal is a separate legal artefact and is not reproduced here.
