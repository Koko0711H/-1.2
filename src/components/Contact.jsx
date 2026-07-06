import { useState } from "react"
import { useLang } from "../i18n"

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" })
  const { t } = useLang()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = (e) => {
    e.preventDefault()
    alert(t("formThanks"))
    setForm({ name: "", phone: "", email: "", message: "" })
  }

  return (
    <section className="contact-section">
      <div className="contact-inner">
        <div className="contact-info">
          <h3>{t("contactTitle")}</h3>
          {[
            { icon: "📍", label: t("contactAddr"), value: t("contactAddrVal") },
            { icon: "📞", label: t("contactPhone"), value: "18205938836" },
            { icon: "✉️", label: t("contactEmail"), value: "info@shenchai.com" },
            { icon: "🕐", label: t("contactHours"), value: t("contactHoursVal") },
            { icon: "🔬", label: t("contactRdBase"), value: t("contactRdBaseVal") },
            { icon: "🏭", label: t("contactProdBase"), value: t("contactProdBaseVal") },
            { icon: "🏢", label: t("contactOpsCenter"), value: t("contactOpsCenterVal") },
          ].map((item, i) => (
            <div className="contact-info-item" key={i}>
              <div className="icon">{item.icon}</div>
              <div className="detail">
                <h4>{item.label}</h4>
                <p>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>{t("formTitle")}</h3>
          {[
            { label: t("formName"), name: "name", type: "text", ph: t("formNamePh") },
            { label: t("formPhone"), name: "phone", type: "tel", ph: t("formPhonePh") },
            { label: t("formEmail"), name: "email", type: "email", ph: t("formEmailPh") },
          ].map((field, i) => (
            <div className="form-group" key={i}>
              <label>{field.label}</label>
              <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.ph} required />
            </div>
          ))}
          <div className="form-group">
            <label>{t("formMsg")}</label>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder={t("formMsgPh")} required></textarea>
          </div>
          <button type="submit" className="submit-btn">{t("formSubmit")}</button>
        </form>
      </div>
    </section>
  )
}

export default Contact
