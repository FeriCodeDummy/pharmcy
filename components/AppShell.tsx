"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {ReactNode} from "react";


export function AppShell({ children }: { children: ReactNode }) {
    const nav = [
        { href: "/drugs", label: "Drugs" },
    ];
    const pathname = usePathname();
    return (
        <div className=" grid min-h-screen grid-cols-[220px_1fr]">
            <aside className="border-r border-neutral-800 bg-neutral-900/50 p-3">
                <div className="mb-4 px-2 text-lg font-semibold tracking-tight">Pharmacy</div>
                <nav className="space-y-1">
                    {nav.map(i => (
                        <Link key={i.href} href={i.href} className={`block rounded-lg px-3 py-2 text-sm hover:bg-neutral-800 ${pathname===i.href?"bg-neutral-800 text-white":"text-neutral-300"}`}>
                            {i.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <div className="flex min-h-screen flex-col">
                <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}