import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Experience from './components/Experience';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Footer from './components/Footer';
import usePageTracking from './hooks/usePageTracking';

function App() {
  usePageTracking();
  return (
    <div className="min-h-screen relative text-white font-inter overflow-x-hidden">
      <ThreeBackground />
      <Navbar />

      <main className="relative z-10">
        <Hero />
        <About />
        <Services />
        <Experience />
        <Portfolio />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

export default App;
