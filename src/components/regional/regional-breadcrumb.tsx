import Link from "next/link";
import { regionalProductName } from "@/modules/regional/demo";

export function RegionalBreadcrumb({ contextQuery, product }: { contextQuery?: string; product?: string }) {
  if (!contextQuery) return null;
  const name = regionalProductName(product);
  return <aside className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
    <nav aria-label="DEMO yo‘nalishi"><Link className="font-semibold text-green-800 underline" href="/toshkent?district=PISKENT">Toshkent viloyati → Piskent tumani</Link>{name ? ` → ${name}` : ""} → Fermer xo‘jaliklari → Yer uchastkasi → Tavsiya</nav>
    <p className="mt-2">Viloyat ko‘rsatkichlari — ichki DEMO. Quyidagi pilot uchastkalar alohida ma’lumotlar to‘plamidir; ular 448 ta xo‘jalikning to‘liq ro‘yxati emas.</p>
  </aside>;
}
