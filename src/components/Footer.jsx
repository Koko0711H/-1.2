import { useLang } from '../i18n'

function Footer() {
  const { t } = useLang()

  return (
    <footer className="footer">
      <div className="footer-system-line">
        <span>SHENCHAI POWER SYSTEMS</span>
        <span>ENGINEERED FOR CONTINUOUS DUTY</span>
      </div>
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="FlyDeer 深柴动力" className="footer-logo" />
          <p>ShenChai Power — Professional diesel generator sets for global customers.</p>
        </div>
        <div className="footer-col">
          <h4>{t('footerProducts')}</h4>
          <ul>
            <li><a href="#products">{t('footerProd1')}</a></li>
            <li><a href="#products">{t('footerProd2')}</a></li>
            <li><a href="#products">{t('footerProd3')}</a></li>
            <li><a href="#products">{t('footerProd4')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footerAbout')}</h4>
          <ul>
            <li><a href="#about">{t('footerAboutLink1')}</a></li>
            <li><a href="#about">{t('footerAboutLink2')}</a></li>
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
