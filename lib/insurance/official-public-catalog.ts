export type OfficialInsuranceProduct = { company: string; name: string; category: string; summary: string; source: string; note?: string };
/** Publicly described insurer products. Informational catalog only; not live quotations or an insurer API. */
export const officialInsuranceProducts: OfficialInsuranceProduct[] = [
  { company:"ซัมซุง ประกันชีวิต", name:"พรีเมียร์ ไลฟ์ 90/20", category:"ประกันชีวิต", summary:"ประกันชีวิตตลอดชีพ คุ้มครองถึงอายุ 90 ปี", source:"https://samsunglife.co.th/all-products/" },
  { company:"ซัมซุง ประกันชีวิต", name:"ตลอดชีพ ฟาสท์ โพรเทคชัน 90/5", category:"ประกันชีวิต", summary:"ชำระเบี้ย 5 ปี คุ้มครองยาวถึงอายุ 90 ปี ตามเงื่อนไข", source:"https://samsunglife.co.th/all-products/" },
  { company:"ซัมซุง ประกันชีวิต", name:"ดีไลท์ 24/24", category:"ประกันชีวิต", summary:"ผลิตภัณฑ์สะสมทรัพย์ มีเงินคืนตามเงื่อนไขกรมธรรม์", source:"https://samsunglife.co.th/all-products/" },
  { company:"ซัมซุง ประกันชีวิต", name:"ซัมซุง 888", category:"ประกันชีวิต", summary:"ชำระเบี้ย 8 ปี พร้อมผลประโยชน์ตามเงื่อนไขสัญญา", source:"https://samsunglife.co.th/all-products/product-mix-packages/" },
  { company:"ซัมซุง ประกันชีวิต", name:"สมาร์ทช้อยส์ 95 (สมาร์ท ซีไอ)", category:"ประกันชีวิต", summary:"แผนชีวิตพร้อมความคุ้มครองโรคร้ายแรงตามเงื่อนไข", source:"https://samsunglife.co.th/all-products/product-mix-packages/" },
  { company:"ซัมซุง ประกันชีวิต", name:"ตลอดชีพ 99/20 H&S พลัส", category:"ประกันสุขภาพ", summary:"แผนชีวิตพร้อมสัญญาเพิ่มเติมค่ารักษาพยาบาลตามเงื่อนไข", source:"https://samsunglife.co.th/all-products/product-mix-packages/" },
  { company:"ซัมซุง ประกันชีวิต", name:"ตลอดชีพ 99/20 ลักซ์ชัวรี่ แคร์", category:"ประกันสุขภาพ", summary:"ความคุ้มครองค่ารักษาพยาบาลตามแผนและเงื่อนไข", source:"https://samsunglife.co.th/all-products/product-health/" },
  { company:"ซัมซุง ประกันชีวิต", name:"สมาร์ท พีเอ", category:"ประกันอุบัติเหตุ", summary:"ประกันอุบัติเหตุส่วนบุคคลและผลประโยชน์ตามเงื่อนไข", source:"https://samsunglife.co.th/all-products/" },
  { company:"ซัมซุง ประกันชีวิต", name:"พีเอ พลัส", category:"ประกันอุบัติเหตุ", summary:"ความคุ้มครองการเสียชีวิต สูญเสียอวัยวะ และทุพพลภาพจากอุบัติเหตุ", source:"https://samsunglife.co.th/all-products/" },
  { company:"อินทรประกันภัย", name:"อินชัวร์ ชั้น 1 ซูเปอร์คุ้ม SUV/MPV", category:"ประกันรถยนต์", summary:"ผลิตภัณฑ์ประกันรถยนต์ชั้น 1 สำหรับรถที่เข้าเงื่อนไข ต้องตรวจสอบเบี้ยและความพร้อมจำหน่าย", source:"https://www.indara.co.th/promotion/suv-mpv-special-offer", note:"สิทธิพิเศษ PA ที่ปรากฏบนหน้าแหล่งข้อมูลหมดเขต 31 ต.ค. 2568 ไม่ใช่โปรโมชั่นปัจจุบัน" },
];
