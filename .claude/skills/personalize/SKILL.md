---
name: personalize
description: Write a version of each campaign email for every lead group in leads/leads.csv. Use when a campaign's emails are final and you want one copy per group.
argument-hint: "[campaign folder]"
context: fork
allowed-tools: Read, Glob, Grep, Write
---

# Personalize campaign emails by lead group

## Inputs

The user gives a campaign folder path as an argument (e.g. `campaigns/get-found-online`).

If no argument is given, list the campaign folders that exist under `campaigns/` and stop. Do not proceed without a folder.

## Steps

1. **Read the lead groups.** Read `leads/leads.csv` and extract the distinct values from the `group` column. As of writing these are: `startups`, `established-businesses`, and `existing-clients`.

2. **Find the campaign emails.** Glob for `<campaign folder>/emails/*.md` to get the list of email files.

3. **Read every email.** Read each email file so you have its full content.

4. **Read the brand voice.** Read `brand/voice.md` and follow it for all writing.

5. **Read the email structure rules.** Read `.claude/rules/emails.md` and follow them for every file you write.

6. **Write one version per group per email.** For each email and each group, write a personalized version to:

   ```
   <campaign folder>/groups/<group>/emails/<same file name>
   ```

   Each version must keep **exactly** the same:
   - Subject line
   - Preview text
   - CTA link (URL and button text)
   - Sign-off and footer
   - Overall structure and number of paragraphs

   Each version must **change** exactly two things:
   - **The opening line** (the first sentence of body text after `Hi {{first_name}},`) — rewrite it so it speaks directly to that group's situation.
   - **One example or detail in the body** — swap it for something more relevant to that group.

   Guidelines for each group:
   - **startups** — They are early-stage, building something new, probably wearing many hats. Speak to getting off the ground, making a strong first impression, and not wasting limited budget.
   - **established-businesses** — They already have customers and revenue. Speak to growing further, refreshing an outdated online presence, and standing out in their market.
   - **existing-clients** — They already know and trust us. Speak to building on what we've done together, next steps, and being a partner who's already in their corner.

7. **Reply with a summary only.** When all files are written, reply with:
   - The total number of files written.
   - One example opening line per group (pick from the first email).

   Do not print the full email contents. Keep the summary short.
