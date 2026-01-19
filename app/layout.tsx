import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CS2 战术决策系统 - CS2 TACTICS',
    description: '专业级实时战术辅助平台。合规、安全、高效。',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@900&family=Outfit:wght@900&family=Roboto+Mono:wght@300&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            </head>
            <body className="selection:bg-cs-orange selection:text-white">
                {children}
            </body>
        </html>
    );
}
