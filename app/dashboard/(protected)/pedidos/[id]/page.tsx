import { BillingDetail } from "@/components/dashboard/billing-detail"
export default async function OrderDetailPage({params}:{params:Promise<{id:string}>}){return <BillingDetail type="orders" id={(await params).id}/>}
