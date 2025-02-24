
import { UserMenu } from "@/components/UserMenu";

export function AppHeader() {
  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sculptify</h1>
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
