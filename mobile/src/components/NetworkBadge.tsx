import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { onSyncChange, pendingCount, syncNow } from "../sync/syncQueue";

export function NetworkBadge() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const u1 = () => setOnline(true);
    const u2 = () => setOnline(false);
    window.addEventListener("online", u1);
    window.addEventListener("offline", u2);
    const refresh = () => pendingCount().then(setPending);
    refresh();
    const off = onSyncChange(refresh);
    const id = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("online", u1);
      window.removeEventListener("offline", u2);
      off();
      clearInterval(id);
    };
  }, []);

  let label = "Online";
  let cls = "bg-emerald-100 text-emerald-700";
  let Icon: any = Wifi;
  if (!online) { label = "Offline"; cls = "bg-rose-100 text-rose-700"; Icon = WifiOff; }
  else if (pending > 0) { label = `Sincronizando (${pending})`; cls = "bg-amber-100 text-amber-700"; Icon = RefreshCw; }

  return (
    <button onClick={() => syncNow()} className={`badge ${cls}`}>
      <Icon size={12} className={pending > 0 && online ? "animate-spin" : ""} />
      {label}
    </button>
  );
}
