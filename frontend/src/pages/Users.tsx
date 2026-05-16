import { FormEvent, useEffect, useState } from "react";
import { Plus, ShieldCheck, Power, X, Users as UsersIcon, Mail } from "lucide-react";
import { api } from "../api/client";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  analyst: "Analista",
  inspector: "Inspetor",
};

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
    <div className="mx-auto max-w-[1480px] space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Acesso</div>
          <h1 className="display-lg mt-1 text-balance text-ink-900">Gestão de Usuários</h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-500">
            Operadores, gestores e inspetores. Apenas administradores podem criar contas.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-lime self-start">
          <Plus size={14} /> Novo usuário
        </button>
      </div>

      <div className="grid gap-4 stagger md:grid-cols-3">
        {items.map((u) => (
          <div key={u.id} className="group relative overflow-hidden rounded-[28px] border border-ink-100 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-hero">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 font-display text-lg font-semibold text-lime-400">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-[15px] font-semibold text-ink-900">{u.name}</div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-500">
                    <Mail size={10} /> {u.email}
                  </div>
                </div>
              </div>
              <span className={`badge ${u.is_active ? "bg-success-500/15 text-success-600" : "bg-ink-100 text-ink-600"}`}>
                {u.is_active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-ink-100 pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-700">
                <ShieldCheck size={11} /> {ROLE_LABEL[u.role] ?? u.role}
              </span>
              <button onClick={() => toggle(u)} className="btn-ghost text-[12px]">
                <Power size={12} /> {u.is_active ? "Inativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full rounded-[28px] border border-dashed border-ink-200 p-12 text-center">
            <UsersIcon className="mx-auto mb-2 text-ink-300" />
            <div className="font-display text-[15px] font-semibold text-ink-900">Nenhum usuário cadastrado.</div>
          </div>
        )}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-md animate-fade-in">
      <form onSubmit={submit} className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-hero animate-scale-in">
        <div className="flex items-center justify-between border-b border-ink-100 bg-paper-50 px-6 py-4">
          <div>
            <div className="eyebrow">Cadastro</div>
            <h2 className="display text-lg font-semibold text-ink-900">Novo usuário</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-500 transition-all hover:bg-white hover:text-ink-900">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="label-form">Nome completo</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-form">E-mail</label>
            <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label-form">Senha temporária</label>
            <input required type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label-form">Perfil</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Administrador</option>
              <option value="analyst">Analista / Gestor</option>
              <option value="inspector">Inspetor (PWA)</option>
            </select>
          </div>
          {error && (
            <div className="rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-[13px] font-medium text-danger-600">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-ink-100 bg-paper-50 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={loading} className="btn-primary">Criar usuário</button>
        </div>
      </form>
    </div>
  );
}
