import { useEffect, useId, useState } from "react"

export const PRODUCT_SITES = [
  { label: "静音型发电机组", labelEn: "Silent Generator Set", url: "/products/silent/" },
  { label: "开架型发电机组", labelEn: "Open-frame Generator Set", url: "/products/open-frame-1200/" },
  { label: "开架型发电机组（小）", labelEn: "Compact Open-frame Set", url: "/products/open-frame-500/" },
  { label: "移动拖车式发电机组", labelEn: "Mobile Trailer Generator", url: "/products/mobile-trailer/" },
  { label: "高压配电系统", labelEn: "High-voltage System", url: "/products/high-voltage/" },
]

export function ProductBrowseMenu({ lang, localize, visible }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const currentPath = typeof window === "undefined" ? "" : window.location.pathname
  const zh = lang === "zh"

  useEffect(() => {
    if (!visible) setOpen(false)
  }, [visible])

  return (
    <div className={"inquiry-product-browser" + (open ? " is-open" : "")}>
      <button
        type="button"
        className="inquiry-browse-toggle"
        onClick={() => setOpen((expanded) => !expanded)}
        aria-expanded={open}
        aria-controls={menuId}
        tabIndex={visible ? 0 : -1}
      >
        <span>{zh ? "浏览其他产品" : "Browse Other Products"}</span>
        <span className="inquiry-browse-arrow" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div id={menuId} className="inquiry-browse-menu">
          {PRODUCT_SITES.map((site) => {
            const isCurrent = typeof window !== "undefined" &&
              new URL(site.url, window.location.origin).pathname === currentPath
            return (
              <a
                key={site.url}
                href={localize(site.url)}
                className={isCurrent ? "active" : ""}
                aria-current={isCurrent ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {zh ? site.label : site.labelEn}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
