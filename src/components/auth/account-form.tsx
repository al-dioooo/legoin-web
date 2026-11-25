"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import {
  isEmail,
  type PasswordProblem,
  passwordProblem,
  safeNext,
} from "@/lib/account-rules";
import { ApiError, AuthError, logIn, register } from "@/lib/api";

type Copy = Dictionary["auth"];
export type AccountFormMode = "login" | "register";

type Problems = { email?: string; password?: string };

function problemsFor(
  email: string,
  password: string,
  mode: AccountFormMode,
  errors: Copy["errors"],
): Problems {
  const problems: Problems = {};
  if (!isEmail(email)) problems.email = errors.email;
  const problem: PasswordProblem | undefined = passwordProblem(password, {
    forLogIn: mode === "login",
  });
  if (problem === "long") problems.password = errors.passwordLong;
  else if (problem === "short") {
    problems.password =
      mode === "login" ? errors.passwordMissing : errors.passwordShort;
  }
  return problems;
}

function failureFor(error: unknown, errors: Copy["errors"]) {
  if (error instanceof AuthError) return errors[error.reason];
  if (error instanceof ApiError && error.reason === "network") {
    return errors.network;
  }
  return errors.generic;
}

/** Where to go once logged in: `?next=` when it's a page here, else scanning. */
function destination(locale: Locale) {
  const next = new URLSearchParams(window.location.search).get("next");
  return safeNext(next, `/${locale}/scan`);
}

/**
 * Logging in, or making an account. The fields are checked here first, so
 * people read what's wrong in their language; the backend checks again.
 * Once it works, the page they came for opens.
 */
export function AccountForm({
  mode,
  copy,
  locale,
}: {
  mode: AccountFormMode;
  copy: Copy;
  locale: Locale;
}) {
  const router = useRouter();
  const id = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [problems, setProblems] = useState<Problems>({});
  const [failure, setFailure] = useState<string>();
  const [pending, setPending] = useState(false);
  const text = copy[mode];

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    const found = problemsFor(email, password, mode, copy.errors);
    setProblems(found);
    setFailure(undefined);
    if (found.email) return emailRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();
    setPending(true);
    try {
      await (mode === "login" ? logIn : register)(email, password);
      router.replace(destination(locale));
    } catch (error) {
      setFailure(failureFor(error, copy.errors));
      setPending(false);
    }
  }

  const describedBy = (field: keyof Problems, hint?: string) =>
    [problems[field] && `${id}-${field}-error`, hint]
      .filter(Boolean)
      .join(" ") || undefined;
  const inputClass =
    "min-h-12 w-full rounded-control border-[2.5px] border-ink bg-card px-4 text-base font-medium text-ink";

  return (
    // noValidate: our own messages, in the page's language, instead of the browser's.
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby="account-title"
      className="mt-[calc(var(--stud)*1.5)] rounded-card border-[2.5px] border-ink bg-card p-5 shadow-card sm:p-6"
    >
      <div className="grid gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          {copy.email}
          <input
            ref={emailRef}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            disabled={pending}
            aria-invalid={problems.email ? true : undefined}
            aria-describedby={describedBy("email")}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </label>
        {problems.email && (
          <p
            id={`${id}-email-error`}
            className="-mt-2 text-sm font-semibold text-danger"
          >
            {problems.email}
          </p>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          {copy.password}
          <input
            ref={passwordRef}
            type="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            disabled={pending}
            aria-invalid={problems.password ? true : undefined}
            aria-describedby={describedBy(
              "password",
              mode === "register" ? `${id}-password-hint` : undefined,
            )}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        </label>
        {mode === "register" && (
          <p
            id={`${id}-password-hint`}
            className="-mt-2 text-sm text-ink-secondary"
          >
            {copy.passwordHint}
          </p>
        )}
        {problems.password && (
          <p
            id={`${id}-password-error`}
            className="-mt-2 text-sm font-semibold text-danger"
          >
            {problems.password}
          </p>
        )}
      </div>
      {/* Read out as it appears, like the field messages focus brings up. */}
      <p
        role="alert"
        className="mt-4 text-sm font-semibold text-danger empty:hidden"
      >
        {failure}
      </p>
      <Button type="submit" disabled={pending} className="mt-5 w-full">
        {pending ? copy.busy : text.submit}
      </Button>
      <p className="mt-5 text-sm text-ink-secondary">
        {text.switchPrompt}{" "}
        <Suspense
          fallback={<SwitchLink mode={mode} copy={copy} locale={locale} />}
        >
          <SwitchLinkWithNext mode={mode} copy={copy} locale={locale} />
        </Suspense>
      </p>
      {mode === "login" && (
        <p className="mt-2 text-sm text-ink-secondary">{copy.login.noReset}</p>
      )}
    </form>
  );
}

type SwitchProps = { mode: AccountFormMode; copy: Copy; locale: Locale };

/** The other form keeps `?next=`, once the page knows its query. */
function SwitchLinkWithNext(props: SwitchProps) {
  const next = useSearchParams().get("next");
  return <SwitchLink {...props} next={next} />;
}

function SwitchLink({
  mode,
  copy,
  locale,
  next,
}: SwitchProps & { next?: string | null }) {
  const other = mode === "login" ? "register" : "login";
  const kept = next ? safeNext(next, "") : "";
  return (
    <Link
      href={`/${locale}/${other}${kept ? `?next=${encodeURIComponent(kept)}` : ""}`}
      className="font-semibold text-ink underline decoration-2 underline-offset-4"
    >
      {copy[mode].switchLink}
    </Link>
  );
}
