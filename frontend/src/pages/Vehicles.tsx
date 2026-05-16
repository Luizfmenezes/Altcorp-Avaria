import { FormEvent, useEffect, useState } from "react";
import { Plus, Search, Truck, ArrowUpRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../stores/auth";

interface Vehicle {
  id: number;
  plate: string;
  prefix?: string | null;
  model: string;
  year?: number | null;
  vehicle_type: string;
  is_active: boolean;
}

export function Vehicles() {
  const role = useAuth((s) => s.user?.role);
  const canEdit = role === "admin" || role === "analyst";
  const [items, setItems] = useState<Vehicle[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  function load() {
    api.get("/api/v1/vehicles", { params: { q: q || undefined } }).then((r) => setItems(r.data));
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q]);

  const active = items.filter((i) => i.is_active).length;

  return (
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Frota corporativa</div>
          <h1 className="display-lg mt-1 text-balance text-ink-900">Gestão de Veículos</h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-500">
            Cadastro completo da frota e prontuário individual de cada unidade.
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setOpen(true)} className="btn-lime self-start">
            <Plus size={14} /> Novo veículo
          </button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center justify-between p-5">
          <div>
            <div className="eyebrow">Total</div>
            <div className="mt-1 stat-num text-3xl font-medium text-ink-900">{items.length}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-lime-400">
            <Truck size={16} />
          </div>
        </div>
        <div className="card flex items-center justify-between p-5">
          <div>
            <div className="eyebrow">Ativos</div>
            <div className="mt-1 stat-num text-3xl font-medium text-success-500">{active}</div>
          </div>
          <span className="badge bg-success-500/15 text-success-600">Operando</span>
        </div>
        <div className="card flex items-center justify-between p-5">
          <div>
            <div className="eyebrow">Inativos</div>
            <div className="mt-1 stat-num text-3xl font-medium text-ink-400">{items.length - active}</div>
          </div>
          <span className="badge bg-ink-100 text-ink-700">Manutenção</span>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Buscar por placa, prefixo ou modelo…"
            className="input pl-11"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-50">
              <tr className="text-left">
                {["Placa", "Prefixo", "Modelo", "Tipo", "Ano", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((v) => (
                <tr key={v.id} className="group transition-colors hover:bg-paper-50">
                  <td className="px-5 py-4 font-mono text-[13.5px] font-bold tracking-wider text-ink-900">{v.plate}</td>
                  <td className="px-5 py-4 text-[13px] text-ink-600">{v.prefix ?? "—"}</td>
                  <td className="px-5 py-4 text-[13px] font-medium text-ink-900">{v.model}</td>
                  <td className="px-5 py-4 text-[12.5px] text-ink-600">{v.vehicle_type === "bus" ? "Ônibus" : "Carro"}</td>
                  <td className="px-5 py-4 text-[12.5px] text-ink-600">{v.year ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${v.is_active ? "bg-success-500/15 text-success-600" : "bg-ink-100 text-ink-600"}`}>
                      {v.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/vehicles/${v.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 transition-all group-hover:border-ink-900 group-hover:bg-ink-900 group-hover:text-paper-50">
                      Prontuário <ArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Truck className="mx-auto mb-2 text-ink-300" />
                    <div className="font-display text-[15px] font-semibold text-ink-900">Nenhum veículo encontrado.</div>
                    <div className="mt-1 text-[12px] text-ink-500">Ajuste o filtro ou cadastre uma nova unidade.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && <VehicleModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function VehicleModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ plate: "", prefix: "", model: "", chassis: "", year: "", vehicle_type: "bus" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/v1/vehicles", { ...form, year: form.year ? Number(form.year) : null });
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-md animate-fade-in">
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-hero animate-scale-in">
        <div className="flex items-center justify-between border-b border-ink-100 bg-paper-50 px-6 py-4">
          <div>
            <div className="eyebrow">Cadastro</div>
            <h2 className="display text-lg font-semibold text-ink-900">Novo veículo</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-500 transition-all hover:bg-white hover:text-ink-900">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <Field label="Placa *">
            <input required className="input-mono uppercase" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Prefixo">
            <input className="input" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} />
          </Field>
          <Field label="Modelo *" full>
            <input required className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </Field>
          <Field label="Chassi">
            <input className="input font-mono" value={form.chassis} onChange={(e) => setForm({ ...form, chassis: e.target.value })} />
          </Field>
          <Field label="Ano">
            <input type="number" className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </Field>
          <Field label="Tipo" full>
            <select className="input" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
              <option value="bus">Ônibus</option>
              <option value="car">Carro</option>
            </select>
          </Field>
        </div>
        {error && (
          <div className="mx-6 mb-4 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-[13px] font-medium text-danger-600">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-ink-100 bg-paper-50 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={loading} className="btn-primary">Salvar veículo</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="label-form">{label}</label>
      {children}
    </div>
  );
}
