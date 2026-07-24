# Checklist: forms

Forms are where good UI goes to die. Most fail on labels, errors,
mobile keyboards, and validation timing.

## Labels

- [ ] Every field has a visible label (placeholder is not a label).
- [ ] Label persists when the field is filled.
- [ ] Required fields marked with text ("required") or a clear icon,
      never color only.
- [ ] Optional fields explicitly marked if the convention is "required
      by default" (and vice versa). Pick one and stick to it.

## Input types

- [ ] `type="email"`, `type="tel"`, `type="url"`, `type="number"`,
      `type="date"` used where appropriate.
- [ ] `inputMode` set for numeric / decimal / search inputs (gives
      mobile users the right keyboard).
- [ ] `autocomplete` set on every credential, address, and contact
      field with the correct token (e.g., `current-password`,
      `street-address`, `family-name`).
- [ ] `enterKeyHint` set so the return key reads correctly
      ("Next", "Done", "Send", "Search").
- [ ] Native pickers (date, color) used where they're better than a
      custom UI.

## Validation

- [ ] Validation timing is intentional: typically on blur for
      individual fields, on submit for the form.
- [ ] No premature "this field is required" while the user is still
      typing.
- [ ] Error message is specific ("Email must include an @ sign") not
      generic ("Invalid").
- [ ] Server-side error message surfaces field-by-field, not as a
      page-level alert.
- [ ] Successful submission is unambiguous (redirect, in-place
      success state, or persistent confirmation).

## Errors

- [ ] Errors not color-only: icon + text.
- [ ] Errors visible to screen readers (`aria-describedby`,
      `aria-invalid`, `aria-live` for newly-appearing errors).
- [ ] Error scrolls into view if it's off-screen on submit.
- [ ] Focus moves to the first invalid field on submit.

## Layout

- [ ] One column on mobile; multi-column on desktop only when fields
      are short and related (city / state / zip).
- [ ] Field widths reflect expected input length (zip code is short,
      address line is long).
- [ ] Logical grouping: related fields together, with a visible group
      label.
- [ ] Spacing between fields is consistent and comfortable.

## Submission

- [ ] Submit button shows a loading state on click; double-submit is
      blocked.
- [ ] Submit button is disabled until required fields are filled
      enough to attempt, *or* it submits and surfaces specific errors.
      Don't do both timidly.
- [ ] Cancel / back action is present and clearly secondary to submit.
- [ ] On success, the form does not stay in a "submitted, did
      anything happen?" state.

## Sensitive data

- [ ] Passwords have show/hide toggle (and the toggle is announced to
      screen readers).
- [ ] Payment fields use the correct `autocomplete` tokens (`cc-
      number`, `cc-exp`, `cc-csc`).
- [ ] Card number formats with spaces but submits clean digits.
- [ ] OTP / 2FA inputs use `inputMode="numeric"` and
      `autocomplete="one-time-code"`.
- [ ] No password "strength" tone-policing: show meter, don't shame.

## Mobile specifics

- [ ] Focused field scrolls into view above the keyboard.
- [ ] "Done" / "Next" affordance is reachable above the keyboard.
- [ ] Body font on inputs ≥ 16px (or iOS will zoom).
- [ ] Sticky submit button does not collide with the keyboard.

## Long forms

- [ ] Progress is shown (step X of Y) on multi-step forms.
- [ ] Users can return to previous steps without losing data.
- [ ] Draft state persists across navigation (localStorage / server).
- [ ] Sections are collapsible if the form is dense.

## Honesty

- [ ] "Continue" never starts a payment.
- [ ] Pre-checked checkboxes are minimal and disclosed.
- [ ] Newsletter opt-ins are opt-in, not opt-out.
- [ ] Free-trial CTA discloses card-charging if a card is required.

## Common misses

- [ ] No `<label>`: only a `<div>` next to the input. Screen readers
      can't see this.
- [ ] Password field with `autocomplete="off"` blocking password
      managers.
- [ ] Error color too close to the surface color in dark mode.
- [ ] Submit button disabled until form is "valid" but no indication
      of which field still needs attention.
- [ ] Forms that lose input on a network error.
