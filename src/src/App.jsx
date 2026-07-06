import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Products from './components/Products'
import Industry from './components/Industry'
import Advantages from './components/Advantages'
import About from './components/About'

import Cases from './components/Cases'
import Contact from './components/Contact'
import Footer from './components/Footer'
import FloatingContact from './components/FloatingContact'

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Products />
      <Industry />
      <Advantages />
      <About />
      
      <Cases />
      <div id="contact">
        <Contact />
      </div>
      <Footer />
      <FloatingContact />
    </>
  )
}

export default App



