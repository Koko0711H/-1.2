import { useLang } from '../i18n'

function Home3() {
  const { t } = useLang()
  return (
    <div className="home-page home-page-3">
      <section className="home3-hero">
        <div className="home3-overlay">
          <h1>{t('home3Title')}</h1>
          <p>{t('home3Sub')}</p>
          <div className="home3-placeholder">
            <span>{t('home3Placeholder')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home3
