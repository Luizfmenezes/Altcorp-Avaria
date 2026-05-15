import { FormEvent, useEffect, useState } from "react";
import { Plus, Search, Truck } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Gestão de Veículos</h1>
          <p className="text-sm text-navy-500">Cadastro completo da frota e prontuário individual.</p>
        </div>
        {canEdit && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus size={16} /> Novo veículo
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            placeholder="Buscar por placa, prefixo ou modelo..."
            className="input pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/60 text-left text-xs font-semibold uppercase tracking-widest text-navy-500">
            <tr>
              <th className="px-5 py-3">Placa</th>
              <th className="px-5 py-3">Prefixo</th>
              <th className="px-5 py-3">Modelo</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Ano</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {items.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-navy-50/40">
                <td className="px-5 py-3 font-mono font-bold text-navy-900">{v.plate}</td>
                <td className="px-5 py-3 text-navy-600">{v.prefix ?? "—"}</td>
                <td className="px-5 py-3 text-navy-700">{v.model}</td>
                <td className="px-5 py-3 capitalize text-navy-600">{v.vehicle_type === "bus" ? "Ônibus" : "Carro"}</td>
                <td className="px-5 py-3 text-navy-600">{v.year ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`badge ${v.is_active ? "bg-emerald-100 text-emerald-700" : "bg-navy-100 text-navy-600"}`}>
                    {v.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/vehicles/${v.id}`} className="btn-ghost">Prontuário</Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-navy-400"><Truck className="mx-auto mb-2" /> Nenhum veículo encontrado.</td></tr>
            )}
          </tbody>
        </table>
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
      await api.post("/api/v1/vehicles", {
        ...form,
        year: form.year ? Number(form.year) : null,
      });
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-card animate-slide-up">
        <h2 className="text-xl font-bold text-navy-900">Cadastrar veículo</h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <Field label="Placa *"><input required className="input font-mono uppercase" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} /></Field>
          <Field label="Prefixo"><input className="input" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value })} /></Field>
          <Field label="Modelo *" full><input required className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></Field>
          <Field label="Chassi"><input className="input" value={form.chassis} onChange={(e) => setForm({ ...form, chassis: e.target.value })} /></Field>
          <Field label="Ano"><input type="number" className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Field>
          <Field label="Tipo" full>
            <select className="input" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
              <option value="bus">Ônibus</option>
              <option value="car">Carro</option>
            </select>
          </Field>
        </div>
        {error && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={loading} className="btn-primary">Salvar</button>
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
