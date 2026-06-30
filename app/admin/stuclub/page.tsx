import { StuclubManager } from "@/components/admin/StuclubManager";

export const dynamic = "force-dynamic";

export default function AdminStuclubPage() {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-slate-950 px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-2xl font-bold text-white">STUClub Management</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage members, points, tiers and loyalty coupons.
        </p>
      </div>
      <div className="mx-auto w-full max-w-6xl">
        <StuclubManager />
      </div>
    </div>
  );
}
