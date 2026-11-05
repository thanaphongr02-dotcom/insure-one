"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/Lib/supabase";

type Prospect = {
 id:string; supplied_name:string; verified_legal_name:string|null;
 regulatory_status:string; contract_status:string; appointment_verified:boolean;
 api_access_approved:boolean; commission_agreement_verified:boolean; notes:string|null;
};
const statuses = [
 ["contacting","กำลังติดต่อ"],["negotiating","เจรจา"],["pending_signature","รอลงนาม"],
 ["signed","ลงนามแล้ว"],["rejected","ไม่ดำเนินการ"]
];
export default function InsurerPartnershipsAdminPage(){
 const [rows,setRows]=useState<Prospect[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [saving,setSaving]=useState<string|null>(null);
 const [search,setSearch]=useState("");
 const [isAdmin,setIsAdmin]=useState(false);
 const [loadFailed,setLoadFailed]=useState(false);
 useEffect(()=>{let active=true;(async()=>{
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(!active)return;
  if(authError||!user){setError("กรุณาเข้าสู่ระบบ");setLoading(false);return;}
  const {data:admin,error:adminError}=await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
  if(!active)return;
  if(adminError||!admin){setError("ไม่มีสิทธิ์ผู้ดูแลระบบ");setLoading(false);return;}
  setIsAdmin(true);
  const {data,error:readError}=await supabase.from("insurer_partnerships").select("id,supplied_name,verified_legal_name,regulatory_status,contract_status,appointment_verified,api_access_approved,commission_agreement_verified,notes").order("id");
  if(!active)return;
  if(readError){setLoadFailed(true);setError("ไม่สามารถโหลดทะเบียนบริษัทได้: "+readError.message);}
  else setRows((data||[]) as Prospect[]);
  setLoading(false);
 })();return()=>{active=false};},[]);
 const filtered=useMemo(()=>rows.filter(x=>(x.supplied_name+" "+(x.verified_legal_name||"")).toLowerCase().includes(search.toLowerCase())),[rows,search]);
 async function updateStatus(row:Prospect,next:string){
  if(!isAdmin||saving)return;
  if(next==="signed"){setError("ต้องตรวจสอบและบันทึกสัญญาจริงก่อน ไม่อนุญาตให้ยืนยันการลงนามผ่านหน้าติดตามเบื้องต้น");return;}
  setSaving(row.id);setError("");
  const {data,error:updateError}=await supabase.from("insurer_partnerships").update({contract_status:next,updated_at:new Date().toISOString()}).eq("id",row.id).select("id").single();
  if(updateError||!data)setError("บันทึกไม่สำเร็จ: "+(updateError?.message||"ไม่ได้รับข้อมูลยืนยัน"));
  else setRows(old=>old.map(x=>x.id===row.id?{...x,contract_status:next}:x));
  setSaving(null);
 }
 return <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>
  <h1>INSURE ONE · ติดตามบริษัทคู่ค้า</h1>
  <p>ทะเบียนภายในเท่านั้น — รายชื่อยังไม่ยืนยันสถานะทางกฎหมายหรือสิทธิ์จำหน่าย ห้ามนำไปแสดงเป็นบริษัทพันธมิตรที่ได้รับอนุญาต</p>
  {loading?<p>กำลังตรวจสอบสิทธิ์...</p>:error&&!isAdmin?<p role="alert">{error}</p>:<>
   {!loadFailed&&<p>ทั้งหมด {rows.length} บริษัท · ลงนามตามฐานข้อมูล {rows.filter(x=>x.contract_status==="signed").length} บริษัท · API อนุมัติ {rows.filter(x=>x.api_access_approved).length} บริษัท</p>}
   <input aria-label="ค้นหาบริษัท" placeholder="ค้นหาบริษัท" value={search} onChange={e=>setSearch(e.target.value)} style={{padding:10,maxWidth:"100%",width:340}}/>
   {error&&<p role="alert" style={{color:"#b42318"}}>{error}</p>}
   {!loadFailed&&<div style={{overflowX:"auto",marginTop:16}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
    <thead><tr><th>บริษัท (ชื่อที่แจ้ง)</th><th>สถานะสัญญา</th><th>ตรวจสอบนิติบุคคล</th><th>สิทธิ์ตัวแทน</th><th>API</th></tr></thead>
    <tbody>{filtered.map(x=><tr key={x.id} style={{borderTop:"1px solid #ddd"}}>
     <td style={{padding:10}}>{x.supplied_name}</td>
     <td><select aria-label={"สถานะ "+x.supplied_name} value={x.contract_status} disabled={!!saving||x.contract_status==="signed"} onChange={e=>updateStatus(x,e.target.value)}>
      {statuses.map(([v,l])=><option key={v} value={v} disabled={v==="signed"}>{l}</option>)}
     </select></td>
     <td>{x.regulatory_status==="verified_active"?"ตรวจสอบแล้ว":"รอตรวจสอบ"}</td>
     <td>{x.appointment_verified?"ตรวจสอบแล้ว":"ยังไม่ยืนยัน"}</td>
     <td>{x.api_access_approved?"อนุมัติ":"ยังไม่อนุมัติ"}</td>
    </tr>)}</tbody>
   </table></div>}
   <p>การยืนยันสัญญา สิทธิ์ตัวแทน และ API ต้องผ่านการตรวจสอบเอกสารและกระบวนการอนุมัติแยกต่างหาก</p>
  </>}
 </main>;
}
