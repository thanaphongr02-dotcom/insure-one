/** Payment methods are capability descriptors, NOT active payment integrations. */
export type PaymentMethodId =
  | "promptpay" | "mobile_banking" | "card" | "ewallet"
  | "installment" | "insurer_direct";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  description: string;
  providerRequired: boolean;
  enabled: boolean;
};

export const paymentMethods: readonly PaymentMethod[] = [
  { id: "promptpay", label: "PromptPay QR", description: "ชำระด้วย QR ที่ออกโดยผู้รับชำระที่ได้รับอนุญาต", providerRequired: true, enabled: false },
  { id: "mobile_banking", label: "Mobile Banking", description: "ชำระผ่านแอปธนาคารตามช่องทางที่ผู้ให้บริการรองรับ", providerRequired: true, enabled: false },
  { id: "card", label: "บัตรเครดิต / เดบิต", description: "ชำระผ่านหน้ารับบัตรของ Payment Gateway (ไม่เก็บข้อมูลบัตรใน INSURE ONE)", providerRequired: true, enabled: false },
  { id: "ewallet", label: "กระเป๋าเงินอิเล็กทรอนิกส์", description: "ขึ้นอยู่กับผู้ให้บริการและบัญชีร้านค้าที่ได้รับอนุมัติ", providerRequired: true, enabled: false },
  { id: "installment", label: "ผ่อนชำระ", description: "ใช้ได้เฉพาะผลิตภัณฑ์และช่องทางที่ได้รับอนุญาต", providerRequired: true, enabled: false },
  { id: "insurer_direct", label: "ชำระกับบริษัทประกันโดยตรง", description: "ดำเนินการผ่านช่องทางทางการของบริษัทประกันตามที่บริษัทอนุญาต", providerRequired: false, enabled: false },
] as const;
