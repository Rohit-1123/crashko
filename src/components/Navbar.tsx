"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/trends", label: "Trends" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "User"}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white ring-2 ring-white dark:ring-slate-800">
      {initials}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Crashko
          </span>
        </Link>

        {/* Desktop nav + auth */}
        <div className="hidden items-center gap-1 sm:flex">
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {status !== "loading" && (
            <div className="ml-2 border-l border-slate-200 pl-3 dark:border-slate-700">
              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center rounded-full transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                    aria-label="Account menu"
                    aria-expanded={dropdownOpen}
                  >
                    <Avatar src={session.user?.image} name={session.user?.name} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <Avatar src={session.user?.image} name={session.user?.name} />
                        <div className="min-w-0">
                          {session.user?.name && (
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {session.user.name}
                            </p>
                          )}
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut({ callbackUrl: "/login" });
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  Sign in with Google
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {open ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            ) : (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pb-3 dark:border-slate-800 dark:bg-slate-900 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile auth */}
          {status !== "loading" && (
            <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800">
              {session ? (
                <div className="px-3 py-2">
                  <div className="flex items-center gap-3 pb-2">
                    <Avatar src={session.user?.image} name={session.user?.name} />
                    <div className="min-w-0">
                      {session.user?.name && (
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {session.user.name}
                        </p>
                      )}
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="px-1 py-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg bg-sky-500 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-sky-600"
                  >
                    Sign in with Google
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
