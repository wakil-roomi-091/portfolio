import Hero from '../components/home/Hero';
import Marquee from '../components/home/Marquee';
import Projects from '../components/home/Projects';
import About from '../components/home/About';
import Contact from '../components/home/Contact';

const Home = ({ dark }) => {
  return (
    <>
      <Hero dark={dark} />
      <Marquee dark={dark} />
      <Projects dark={dark} />
      <About dark={dark} />
      <Contact dark={dark} />
    </>
  );
};

export default Home;