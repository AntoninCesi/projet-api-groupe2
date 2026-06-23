import Sidebar from './Sidebar';
import RailHome from './RailHome';
import BottomNav from './BottomNav';

// Coquille responsive : < lg rien (page mobile centrée + BottomNav),
// >= lg grille tri-colonne sidebar · contenu · rail. Le contenu ne change pas.
export default function Shell({ children, rail = <RailHome />, wide = false }) {
  return (
    <div className="lg:mx-auto lg:grid lg:min-h-screen lg:max-w-[1500px] lg:grid-cols-[266px_minmax(0,1fr)_340px]">
      <Sidebar />

      <main className="mx-auto min-h-screen max-w-md bg-background px-5 pb-28 lg:max-w-none lg:bg-transparent lg:px-11 lg:pb-24 lg:pt-8">
        <div className={`lg:mx-auto ${wide ? 'lg:max-w-[768px]' : 'lg:max-w-[600px]'}`}>{children}</div>
      </main>

      {rail}

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
