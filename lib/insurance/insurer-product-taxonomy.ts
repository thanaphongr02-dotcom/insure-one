/**
 * Insurance taxonomy for a multi-insurer marketplace.
 * Each insurer may have any number of categories and products.
 * A category listed here is NOT a claim that an insurer sells it,
 * and is NOT authorization for INSURE ONE to distribute it.
 */
export const insuranceCategories = [
  { id: "motor", name: "ประกันรถยนต์", group: "non_life", subtypes: ["ชั้น 1", "ชั้น 2+", "ชั้น 3+", "ชั้น 2", "ชั้น 3", "พ.ร.บ."] },
  { id: "motorcycle", name: "ประกันรถจักรยานยนต์", group: "non_life", subtypes: ["ภาคสมัครใจ", "พ.ร.บ."] },
  { id: "ev", name: "ประกันรถยนต์ไฟฟ้า", group: "non_life", subtypes: ["รถยนต์ไฟฟ้า", "แบตเตอรี่และอุปกรณ์ตามเงื่อนไข"] },
  { id: "health_non_life", name: "ประกันสุขภาพวินาศภัย", group: "non_life", subtypes: ["ผู้ป่วยใน", "ผู้ป่วยนอก", "โรคร้ายแรงตามเงื่อนไข"] },
  { id: "personal_accident", name: "ประกันอุบัติเหตุ", group: "non_life", subtypes: ["ส่วนบุคคล", "กลุ่ม"] },
  { id: "travel", name: "ประกันเดินทาง", group: "non_life", subtypes: ["ในประเทศ", "ต่างประเทศ"] },
  { id: "home_property", name: "ประกันบ้านและทรัพย์สิน", group: "non_life", subtypes: ["บ้าน", "อัคคีภัย", "ทรัพย์สิน"] },
  { id: "business", name: "ประกันธุรกิจ", group: "non_life", subtypes: ["SME", "โรงงาน", "ความเสี่ยงภัยทุกชนิดตามกรมธรรม์"] },
  { id: "agriculture", name: "ประกันการเกษตร", group: "non_life", subtypes: ["พืชผล", "ปศุสัตว์", "ความเสี่ยงทางการเกษตร"] },
  { id: "marine", name: "ประกันภัยทางทะเลและขนส่ง", group: "non_life", subtypes: ["สินค้า", "ตัวเรือ", "ขนส่ง"] },
  { id: "liability", name: "ประกันความรับผิด", group: "non_life", subtypes: ["ความรับผิดต่อบุคคลภายนอก", "วิชาชีพ", "สินค้า"] },
  { id: "engineering", name: "ประกันภัยวิศวกรรม", group: "non_life", subtypes: ["ก่อสร้าง", "เครื่องจักร", "อุปกรณ์อิเล็กทรอนิกส์"] },
  { id: "credit_surety", name: "ประกันสินเชื่อและค้ำประกัน", group: "non_life", subtypes: ["สินเชื่อ", "ค้ำประกันตามเงื่อนไข"] },
  { id: "misc_non_life", name: "ประกันวินาศภัยอื่น ๆ", group: "non_life", subtypes: ["ตามผลิตภัณฑ์ที่บริษัทได้รับอนุมัติ"] },
  { id: "life", name: "ประกันชีวิต", group: "life", subtypes: ["ตลอดชีพ", "สะสมทรัพย์", "ชั่วระยะเวลา", "บำนาญ", "ควบการลงทุนตามเงื่อนไข"] },
  { id: "life_health_rider", name: "สัญญาเพิ่มเติมสุขภาพและอุบัติเหตุของประกันชีวิต", group: "life", subtypes: ["สุขภาพ", "อุบัติเหตุ", "โรคร้ายแรง"] },
] as const;

export type InsuranceCategoryId = (typeof insuranceCategories)[number]["id"];

export type InsurerProductRecord = {
  insurerId: string;
  productId: string;
  categoryId: InsuranceCategoryId;
  subtype: string;
  productName: string;
  verifiedWithInsurer: boolean;
  authorizedForDistribution: boolean;
  licenseScopeVerified: boolean;
  published: boolean;
};

export function canPublishProduct(product: InsurerProductRecord): boolean {
  return product.published && product.verifiedWithInsurer &&
    product.authorizedForDistribution && product.licenseScopeVerified;
}

export function categoriesForInsurer(
  insurerId: string,
  products: readonly InsurerProductRecord[],
): InsuranceCategoryId[] {
  return Array.from(new Set(products.filter(p => p.insurerId === insurerId && canPublishProduct(p)).map(p => p.categoryId)));
}
