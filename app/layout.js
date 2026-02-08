import './globals.css';

export const metadata = {
    title: 'Basic Labs Guide',
    description: 'Electrical Engineering Lab Guide',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
