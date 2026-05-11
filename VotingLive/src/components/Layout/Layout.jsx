import { Outlet } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import { Toaster } from "react-hot-toast";
import ElectionBanner from "../ElectionStatus/ElectionBanner";

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex ">
    
      <Navigation />
      
      <div className="fixed top-14 lg:top-0 left-0 lg:left-64 right-0 z-[45]">
        <ElectionBanner />
      </div>

      
      <main className="lg:ml-64 w-full min-h-screen pt-28 lg:pt-12 transition-all duration-300 overflow-x-hidden">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <Outlet />
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default Layout;
