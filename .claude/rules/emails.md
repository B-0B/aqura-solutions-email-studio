---
paths:
  - "campaigns/**/emails/*.md"
---

Every email file must follow this structure, top to bottom:

1. **Subject line** — First line must be `Subject: ...` with the text after "Subject: " no longer than 50 characters.
2. **Preview text** — Second line must be `Preview: ...` with the text after "Preview: " no longer than 90 characters.
3. **Greeting** — Greet the reader using the merge tag `{{first_name}}`.
4. **One main link** — Include exactly one call-to-action link, formatted as `[Button text](https://aqurasolutions.example/get-started)`. The button text can vary, but the URL must be exactly `https://aqurasolutions.example/get-started`. No other links in the body.
5. **Sign-off** — End the body with the campaign email sign-off from brand/voice.md:

   Warm regards,
   The Aqura Solutions Team

6. **Footer** — After the sign-off, close with these two lines as plain text:

   You're getting this because you're on the Aqura Solutions contact list.
   Aqura Solutions, {{company_address}} · Unsubscribe: {{unsubscribe_url}}
