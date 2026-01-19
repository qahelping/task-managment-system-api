import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { CreateBoardModal } from '@/components/modals/CreateBoardModal';
import { useUIStore } from '@/stores/uiStore';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { modals } = useUIStore();

  return (
    <>
      <div className="sky" aria-hidden="true"></div>
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
      {modals.createBoard && <CreateBoardModal />}
    </>
  );
};

