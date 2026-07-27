import { useAppSelector } from "@/store/hooks";

const AdminSettings = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] text-accent mb-2">
          PREFERENCES
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your admin profile and store preferences.
        </p>
      </div>

      <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-xl text-foreground mb-4">
          Admin Account
        </h3>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-muted-foreground mb-1">
              EMAIL
            </dt>
            <dd className="text-foreground">
              {user?.email || "admin@bambotia.com"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] tracking-[0.3em] text-muted-foreground mb-1">
              ROLE
            </dt>
            <dd className="text-foreground">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default AdminSettings;
