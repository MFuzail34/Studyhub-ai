

# Update UPI Payment ID

## What changes
Replace the hardcoded UPI ID `studifyhub@upi` with `9663849103@fam` in the Upgrade page where UPI payment links are generated.

## Files to edit
- **`src/pages/Upgrade.tsx`** — Change the `UPI_ID` constant from `"studifyhub@upi"` to `"9663849103@fam"`. This affects all three places the UPI ID appears: the constant declaration, the payment instructions display, and both UPI deep link generations.

This is a single-line constant change — all UPI links and display text reference this constant, so updating it once covers the entire flow.

