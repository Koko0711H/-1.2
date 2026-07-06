import { useLang } from '../i18n'

function Home2() {
  const { t } = useLang()
  return (
    <div className="home-page home-page-2">
      <section className="home2-hero">
        <div className="home2-overlay">
          <h1>{t('home2Title')}</h1>
          <p>{t('home2Sub')}</p>
          <div className="home2-placeholder">
            <span>{t('home2Placeholder')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home2
