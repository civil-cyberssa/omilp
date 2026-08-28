import { BillingDetail } from "@/components/dashboard/billing-detail"
export default async function SubscriptionDetailPage({params}:{params:Promise<{id:string}>}){return <BillingDetail type="subscriptions" id={(await params).id}/>}
