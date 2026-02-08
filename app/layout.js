import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Basic Labs Guide',
    description: 'Electrical Engineering Lab Guide',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="app-wrapper">
                    <Header />
                    <main className="main-content">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
