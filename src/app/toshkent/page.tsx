import type { Metadata } from "next";
import { RegionalDashboard } from "@/components/regional/regional-dashboard";
export const metadata:Metadata={title:"Toshkent viloyati — SMART EKIN",description:"Toshkent viloyati uchun ichki DEMO: xarita, Piskent tumani va mahsulotlar prognozi."};
export default async function ToshkentPage({searchParams}:{searchParams:Promise<{district?:string;product?:string}>}){
  const query=await searchParams;
  return <RegionalDashboard initialDistrict={typeof query.district==="string"?query.district:undefined} initialProduct={typeof query.product==="string"?query.product:undefined}/>;
}
