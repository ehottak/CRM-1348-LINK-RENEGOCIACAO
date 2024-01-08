import './globals.css'
import type { Metadata } from 'next'
import {Fira_Sans} from "next/font/google";

const firaSans = Fira_Sans({ subsets: ['latin'], weight: '400' });

export const metadata: Metadata = {
  title: 'Renegociação',
  description: '',
}


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
        <div className="rounded-full">
            <link rel="icon" href="/favicon.ico" sizes="any" />
        </div>
        <body className={firaSans.className}>{children}</body>
        </html>
    )
}
