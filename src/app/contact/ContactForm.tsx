"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitContact } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContact, null);

  if (state?.success) {
    return (
      <div className="mt-10 rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900 dark:bg-green-950">
        <p className="text-lg font-semibold text-green-800 dark:text-green-300">
          Message sent!
        </p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Thanks for reaching out. I'll get back to you soon.
        </p>
      </div>
    );
  }

  const errors =
    state && !state.success && "errors" in state ? state.errors : {};
  const globalError =
    state && !state.success && "error" in state ? state.error : null;
  const values =
    state && !state.success && "values" in state ? state.values : null;

  return (
    <form action={formAction} className="mt-10 space-y-6">
      {/* Honeypot — hidden from humans, filled by bots */}
      <input
        name="website"
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        autoComplete="off"
      />

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
          placeholder="Jane Smith"
          defaultValue={values?.fullName}
        />
        {errors && "fullName" in errors && errors.fullName && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.fullName[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
          placeholder="jane@example.com"
          defaultValue={values?.email}
        />
        {errors && "email" in errors && errors.email && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="mt-1.5 block w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400"
          placeholder="What's on your mind?"
          defaultValue={values?.message}
        />
        {errors && "message" in errors && errors.message && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.message[0]}
          </p>
        )}
      </div>

      <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!} />

      {globalError && (
        <p className="text-sm text-red-600 dark:text-red-400">{globalError}</p>
      )}

      <SubmitButton />
    </form>
  );
}
