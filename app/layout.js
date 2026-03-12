import './globals.css';
import 'katex/dist/katex.min.css';
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeHandler from '@/components/ThemeHandler';

export const metadata = {
    title: 'Bhilai EE Labs',
    description: 'Electrical Engineering Lab Guide',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <ThemeHandler />
                    <div className="app-wrapper">
                        <Header />
                        <main className="main-content">
                            {children}
                        </main>
                        <Footer />
                    </div>
                    <Analytics />
                </AuthProvider>
            </body>
        </html>
    );
}
