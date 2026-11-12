import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync("/dev/stdin", "utf8"));
const tool = input.tool_name;
const params = input.tool_input ?? {};

const ALWAYS_BLOCK = [
  "send-broadcast",
  "create-automation",
  "send-inbox-draft",
  "send-new-inbox-email",
];

if (ALWAYS_BLOCK.includes(tool)) {
  console.log(`Blocked ${tool}: this tool can reach whole lists of people.`);
  process.exit(2);
}

if (tool === "send-email" || tool === "send-batch-emails") {
  const myEmail = (process.env.MY_EMAIL ?? "").toLowerCase();

  const collect = (obj) => {
    const addrs = [];
    for (const field of ["to", "cc", "bcc"]) {
      const val = obj[field];
      if (!val) continue;
      const list = Array.isArray(val) ? val : [val];
      for (const entry of list) {
        if (typeof entry === "string") addrs.push(entry);
        else if (entry?.email) addrs.push(entry.email);
      }
    }
    return addrs;
  };

  let addresses;
  if (tool === "send-batch-emails" && Array.isArray(params.emails)) {
    addresses = params.emails.flatMap(collect);
  } else {
    addresses = collect(params);
  }

  for (const addr of addresses) {
    const lower = addr.toLowerCase();
    if (!lower.endsWith("@resend.dev") && lower !== myEmail) {
      console.log(`Blocked: ${addr} is not a @resend.dev test address or your own email.`);
      process.exit(2);
    }
  }
}

process.exit(0);
