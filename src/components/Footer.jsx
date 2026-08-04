import { useLang } from '../i18n'
import { withLanguage } from '../languageRouting'

function Footer() {
  const { lang, t } = useLang()

  return (
    <footer className="footer">
      <div className="footer-system-line">
        <span>FLYDEER POWER SYSTEMS</span>
        <span>ENGINEERED FOR CONTINUOUS DUTY</span>
      </div>
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.svg" alt="FLYDEER POWER 深柴能源" className="footer-logo" />
          <p>FLYDEER POWER — Professional diesel generator sets for global customers.</p>
        </div>
        <div className="footer-col">
          <h4>{t('footerProducts')}</h4>
          <ul>
            <li><a href={withLanguage('/products/silent/', lang)}>{t('footerProd1')}</a></li>
            <li><a href={withLanguage('/products/open-frame-1200/', lang)}>{t('footerProd2')}</a></li>
            <li><a href={withLanguage('/products/mobile-trailer/', lang)}>{t('footerProd3')}</a></li>
            <li><a href="#products">{t('footerProd4')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footerAbout')}</h4>
          <ul>
            <li><a href={withLanguage('/about/index.html', lang)}>{t('footerAboutLink1')}</a></li>
            <li><a href="#advantages">{t('footerAboutLink2')}</a></li>
            <li><a href="#cases">{t('footerAboutLink3')}</a></li>
            <li><a href="#contact">{t('footerAboutLink4')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footerContact')}</h4>
          <ul>
            <li><a href="tel:+8618205938836">+86 182 0593 8836</a></li>
            <li><a href="mailto:flydeerpower@googlel.com">flydeerpower@googlel.com</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">{t('footerCopyright')}</div>
    </footer>
  )
}

export default Footer
