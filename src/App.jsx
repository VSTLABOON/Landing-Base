import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Catalogo from './components/sections/Catalogo';
import Servicios from './components/sections/Servicios';
import Testimonios from './components/sections/Testimonios';
import Beneficios from './components/sections/Beneficios';
import Flores from './components/sections/Flores';
import Cobertura from './components/sections/Cobertura';
import Nosotros from './components/sections/Nosotros';
import Galeria from './components/sections/Galeria';
import InstagramFeed from './components/sections/InstagramFeed';
import CartDrawer from './components/ui/CartDrawer';
import GlobalFeatures from './components/ui/GlobalFeatures';

function App() {
  return (
    <>
      <GlobalFeatures />
      <Header />
      
      <main className="min-h-screen">
        <Hero />
        <Catalogo />
        <Servicios />
        <Testimonios />
        <Beneficios />
        <Flores />
        <Cobertura />
        <Nosotros />
        <Galeria />
        <InstagramFeed slug="flores-del-corazon" />
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}

export default App;
