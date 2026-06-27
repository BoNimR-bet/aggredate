# Aggredate - No-Sponsor Monetization Plan

This plan avoids sponsors, ads, cold-selling companies, and anything that needs
large traffic before it works. That is a better fit if you are a teen and want
the cleanest path to first money.

The product should stay free with a small "Powered by Aggredate" watermark. The
first paid option should be a tiny remove-watermark license, then bigger optional
help around the free tool.

## The cleanest offer

Sell **Remove Branding** first:

- **$4 per project**.
- Buyer may set `data-branding="false"`.
- No account, no dashboard, no license-key system.
- Works as an honesty-license until demand proves you need enforcement.

This is the cleanest first paid product because it is obvious: people already see
the watermark toggle in the generator. The warning: $4 is low, so do not promise
support. Payment fees will take a chunk. Keep it self-serve.

## The second offer

Sell **Aggredate Pro Pack** as a small digital product:

- 10 polished badge theme presets.
- README badge examples for GitHub repos.
- Launch-page copy snippets.
- Webflow, Framer, WordPress, plain HTML setup recipes.
- A short "launch checklist" for indie projects.
- Optional: one free setup review for early buyers.

Suggested price: **$9** at first, then **$19** after there are examples and proof.

Why this is clean:

- No advertisers.
- No tracking.
- No complicated SaaS billing.
- No need to promise traffic.
- Buyers understand it immediately: "make my launch page look more credible."

## The faster money offer

Offer **done-for-you setup**:

- $29: install Aggredate on one landing page or README.
- $49: install plus customize colors and copy.
- $79: install plus Product Hunt/npm/GitHub launch cleanup.

This can make money before the product has huge usage. The free widget proves you
can do the job; the service charges people who want it done quickly.

## Teen/payment reality

Many payment platforms require the account owner to be 18+. Do not fake this.
Use a parent/guardian account if needed, or use a platform available to minors in
your country. Keep it simple and ask an adult before handling payments, taxes, or
client contracts.

## Growth loop

```
Free badge -> Powered by link -> generator page -> $4 remove branding -> Pro Pack or setup service
```

The free badge is the distribution channel. The paid offer is optional and does
not make the free tool worse.

## Site copy

Use simple copy:

> Aggredate is free with a small Powered by link. Remove it for $4 per project.
> If you want prettier presets and setup recipes, buy the Pro Pack. If you want
> me to install it for you, book a setup.

Avoid hype like "make passive income" or "guaranteed conversions." Sell a small
real improvement.

## First 14 days

1. Deploy the site to Vercel.
2. Put a real checkout link in the page when you have one.
3. Add 5 nice examples using real open-source projects.
4. Post the free generator on Product Hunt, Indie Hackers, r/SideProject, and
   relevant Discord communities.
5. DM 20 small founders with a useful note: "I made you a free live traction badge."
6. Offer to install it for $29 only after they reply positively.

## Pricing math

Small realistic targets:

| Month | Self-serve sales | Setup jobs | Possible revenue |
|-------|------------------|------------|------------------|
| 1 | 10 watermark + 3 Pro at $9 | 1 at $29 | $96 |
| 2 | 30 watermark + 10 Pro at $9 | 3 at $29 | $297 |
| 3 | 60 watermark + 15 Pro at $19 | 5 at $49 | $770 |

These are not guaranteed. They are reachable only if you do the distribution work.

## What to build next

Priority order:

1. README SVG badge endpoint. Done in `api/readme-badge.js`.
2. Generator output for README Markdown.
3. Add a checkout link for the $4 remove-branding license once payment setup is legally sorted.
4. A `PRO_PACK.md` or downloadable folder with theme presets and setup recipes.
5. Example gallery with real projects.
6. Optional hosted API plan later, only if people ask for reliability and caching.

## What not to build yet

- Accounts.
- Dashboards.
- Analytics.
- Complex billing.
- An ad network.

Those are distractions until people are using the badge and asking for help.
