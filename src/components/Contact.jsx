import { useLang } from "../i18n"

function Contact() {
  const { t } = useLang()

  const serviceCards = [
    { image: "/service/service-selection.jpg", tag: t("service1Tag"), title: t("service1Title"), desc: t("service1Desc") },
    { image: "/service/service-delivery.jpg", tag: t("service2Tag"), title: t("service2Title"), desc: t("service2Desc") },
    { image: "/service/service-support.jpg", tag: t("service3Tag"), title: t("service3Title"), desc: t("service3Desc") },
  ]

  const locations = [
    { code: "R&D", label: t("contactRdBase"), value: t("contactRdBaseVal") },
    { code: "MFG", label: t("contactProdBase"), value: t("contactProdBaseVal") },
    { code: "OPS", label: t("contactOpsCenter"), value: t("contactOpsCenterVal") },
  ]

  return (
    <section className="contact-section" id="service">
      <div className="service-shell service-command-shell">
        <header className="service-command-heading">
          <div>
            <span>{t("serviceEyebrow")}</span>
            <h2>{t("serviceTitle")}</h2>
          </div>
          <p>{t("serviceLead")}</p>
        </header>

        <section className="service-contact-console" aria-label={t("serviceContactTitle")}>
          <header className="service-console-intro">
            <div>
              <span>{t("serviceDeskEyebrow")}</span>
              <h3>{t("serviceContactTitle")}</h3>
            </div>
            <p>{t("servicePhoneHint")}</p>
          </header>

          <div className="service-console-grid">
            <div className="service-console-primary">
              <a className="service-console-phone" href="tel:+8618205938836">
                <span>TEL / {t("contactPhone")}</span>
                <strong>+86 182 0593 8836</strong>
                <small>{t("servicePhoneHint")}</small>
                <i aria-hidden="true">↗</i>
              </a>
              <a className="service-console-detail service-console-email" href="mailto:flydeerpower@googlel.com">
                <span>EMAIL / {t("contactEmail")}</span>
                <strong>flydeerpower@googlel.com</strong>
                <small>{t("serviceEmailHint")}</small>
                <i aria-hidden="true">↗</i>
              </a>
            </div>

            <div className="service-console-details">
              <div className="service-console-detail">
                <span>HQ / {t("contactAddr")}</span>
                <strong>{t("contactAddrVal")}</strong>
                <small>{t("serviceAddressHint")}</small>
              </div>
              <div className="service-console-detail service-console-hours">
                <span>HRS / {t("contactHours")}</span>
                <strong>{t("contactHoursVal")}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="service-stage" aria-label={t("serviceScope")}>
          <div className="service-stage-heading">
            <span>{t("serviceScope")}</span>
            <span>01 — 03</span>
          </div>
          <div className="service-stage-grid">
            {serviceCards.map((item, index) => (
              <article className="service-stage-card" key={item.title}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="service-stage-shade" aria-hidden="true" />
                <div className="service-stage-copy">
                  <span>{String(index + 1).padStart(2, "0")} / {item.tag}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="service-footprint">
          <div className="service-footprint-heading">
            <span>{t("serviceFootprintEyebrow")}</span>
            <h3>{t("serviceFootprintTitle")}</h3>
            <p>{t("serviceFootprintLead")}</p>
          </div>
          <div className="service-location-grid">
            {locations.map((item) => (
              <article className="service-location-card" key={item.code}>
                <span>{item.code}</span>
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Contact
