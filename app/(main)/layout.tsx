import Navbar from "@/components/Navbar";
import NavigationMenu from "@/components/NavigationMenu";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <NavigationMenu />
    </>
  );
}