import { useEffect } from 'react'
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
  useEffect(() => {
    const scrollToHashTarget = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return

      const scroll = () => {
        const target = document.getElementById(id)
        if (!target) return

        const headerHeight = document.querySelector('.header')?.offsetHeight ?? 0
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight
        window.scrollTo({ top, behavior: 'auto' })
      }

      requestAnimationFrame(() => requestAnimationFrame(scroll))
      window.setTimeout(scroll, 300)
    }

    scrollToHashTarget()
    window.addEventListener('hashchange', scrollToHashTarget)
    return () => window.removeEventListener('hashchange', scrollToHashTarget)
  }, [])

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



