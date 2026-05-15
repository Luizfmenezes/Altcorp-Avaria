import { FormEvent, useEffect, useState } from "react";
import { Plus, ShieldCheck, Power } from "lucide-react";
import { api } from "../api/client";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [open, setOpen] = useState(false);

  function load() { api.get("/api/v1/users").then((r) => setItems(r.data)); }
  useEffect(load, []);

  async function toggle(u: User) {
    if (u.is_active) {
      if (!confirm(`Inativar ${u.name}?`)) return;
      await api.delete(`/api/v1/users/${u.id}`);
    } else {
      await api.patch(`/api/v1/users/${u.id}`, { is_active: true });
    }
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Gestão de Usuários</h1>
          <p className="text-sm text-navy-500">Cadastro de operadores, gestores e inspetores. Apenas administradores.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={16} /> Novo usuário</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-50/60 text-left text-xs font-semibold uppercase tracking-widest text-navy-500">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Perfil</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-navy-50/40">
                <td className="px-5 py-3 font-semibold text-navy-900">{u.name}</td>
                <td className="px-5 py-3 text-navy-600">{u.email}</td>
                <td className="px-5 py-3">
                  <span className="badge bg-brand-50 text-brand-700"><ShieldCheck size={11} /> {u.role}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`badge ${u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-navy-100 text-navy-600"}`}>
                    {u.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => toggle(u)} className="btn-ghost"><Power size={14} /> {u.is_active ? "Inativar" : "Ativar"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <UserModal onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function UserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "inspector" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/v1/users", form);
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card animate-slide-up">
        <h2 className="text-xl font-bold text-navy-900">Novo usuário</h2>
        <div className="mt-5 space-y-4">
          <div><label className="label-form">Nome</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label-form">E-mail</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label-form">Senha temporária</label><input required type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div>
            <label className="label-form">Perfil</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Administrador</option>
              <option value="analyst">Analista / Gestor</option>
              <option value="inspector">Inspetor (PWA)</option>
            </select>
          </div>
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={loading} className="btn-primary">Criar</button>
        </div>
      </form>
    </div>
  );
}
