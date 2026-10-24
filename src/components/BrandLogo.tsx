import { useTranslation } from "react-i18next";

export default function BrandLogo({
  className = "",
  size = 56,
  decorative = false,
}: {
  className?: string;
  size?: number;
  decorative?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/uchral-logo.png?v=deel"
      alt={decorative ? "" : t("brand.logoAlt")}
      width={size}
      height={size}
      decoding="async"
    />
  );
}
