export default function DashboardHeader() {
  return (
    <header>
      <div className="flex items-center justify-between py-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Loyalty Program
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage levels, users, and rewards
          </p>
        </div>
      </div>
    </header>
  );
}
