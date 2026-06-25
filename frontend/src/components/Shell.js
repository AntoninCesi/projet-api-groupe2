import Sidebar from './Sidebar';
import RailHome from './RailHome';
import BottomNav from './BottomNav';

// responsive shell: below lg a centered mobile page + BottomNav,
// from lg a three column grid sidebar / content / rail.
// wide gives a page a roomier content column when it needs it.
// focused drops the rail + bottom nav for full-screen flows (edit, chat).
export default function Shell({ children, rail = <RailHome />, wide = false, focused = false }) {
  return (
    <div
      className={`lg:mx-auto lg:grid lg:min-h-screen lg:max-w-[1500px] ${
        focused ? 'lg:grid-cols-[266px_minmax(0,1fr)_266px]' : 'lg:grid-cols-[266px_minmax(0,1fr)_340px]'
      }`}
    >
      <Sidebar />

      <main
        className={`mx-auto min-h-screen max-w-md bg-background px-5 lg:mx-0 lg:max-w-none lg:bg-transparent lg:px-11 lg:pt-8 ${
          focused ? 'pb-12 lg:pb-12' : 'pb-28 lg:pb-24'
        }`}
      >
        <div className={`lg:mx-auto lg:w-full ${wide ? 'lg:max-w-[860px]' : 'lg:max-w-[600px]'}`}>{children}</div>
      </main>

      {!focused && rail}

      {!focused && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
