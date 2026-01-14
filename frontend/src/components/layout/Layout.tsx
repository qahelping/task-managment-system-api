import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout layout-with-sidebar">
      <Header />
      <Sidebar />
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

