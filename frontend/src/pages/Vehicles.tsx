import { FormEvent, useEffect, useRef, useState } from "react";
import { Plus, Search, Truck, Car, ArrowUpRight, X, Pencil, ImagePlus, Loader2, Upload, FileSpreadsheet, Check, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { api, extractErrorMsg } from "../api/client";
import { useAuth } from "../stores/auth";

interface Vehicle {
  id: number;
  plate: string;
  prefix?: string | null;
  model: string;
  chassis?: string | null;
  year?: number | null;
  vehicle_type: string;
  is_active: boolean;
  default_photo_url?: string | null;
}

export function Vehicles() {
  const role = useAuth((s) => s.user?.role);
  const canEdit = role === "admin" || role === "analyst";
  const [items, setItems] = useState<Vehicle[]>([]);
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [importing, setImporting] = useState(false);

  function load() {
    api.get("/api/v1/vehicles", { params: { q: q || undefined } }).then((r) => setItems(r.data));
  }

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q]);

  const active = items.filter((i) => i.is_active).length;

  return (
    <div className="mx-auto max-w-[1480px] space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow">Frota corporativa</div>
          <h1 className="display-lg mt-1 text-balance text-ink-900">Gestão de Veículos</h1>
          <p className="mt-2 max-w-xl text-[14px] text-ink-500">
            Cadastro completo da frota e prontuário individual de cada unidade.
          </p>
        </div>
        {canEdit && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <button onClick={() => setImporting(true)} className="btn-secondary w-full self-start sm:w-auto">
              <Upload size={14} /> Importar planilha
            </button>
            <button onClick={() => setCreating(true)} className="btn-lime w-full self-start sm:w-auto">
              <Plus size={14} /> Novo veículo
            </button>
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <div className="card flex items-center justify-between p-4 sm:p-5">
          <div>
            <div className="eyebrow text-[10px]">Total</div>
            <div className="mt-1 stat-num text-2xl sm:text-3xl font-medium text-ink-900">{items.length}</div>
          </div>
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-ink-900 text-lime-400">
            <Truck size={16} />
          </div>
        </div>
        <div className="card flex items-center justify-between p-4 sm:p-5">
          <div>
            <div className="eyebrow text-[10px]">Ativos</div>
            <div className="mt-1 stat-num text-2xl sm:text-3xl font-medium text-success-500">{active}</div>
          </div>
          <span className="badge bg-success-500/15 text-success-600 text-[10px] sm:text-[11px]">Operando</span>
        </div>
        <div className="card flex items-center justify-between p-4 sm:p-5 col-span-2 sm:col-span-1">
          <div>
            <div className="eyebrow text-[10px]">Inativos</div>
            <div className="mt-1 stat-num text-2xl sm:text-3xl font-medium text-ink-400">{items.length - active}</div>
          </div>
          <span className="badge bg-ink-100 text-ink-700 text-[10px] sm:text-[11px]">Manutenção</span>
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

      {/* Table card — desktop table + mobile cards */}
      <div className="card overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-50">
              <tr className="text-left">
                {["", "Placa", "Prefixo", "Modelo", "Tipo", "Ano", "Status", ""].map((h, i) => (
                  <th key={i} className="px-5 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((v) => (
                <tr key={v.id} className="group transition-colors hover:bg-paper-50">
                  <td className="py-3 pl-5">
                    <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-xl border border-ink-100 bg-paper-50">
                      {v.default_photo_url ? (
                        <img src={v.default_photo_url} alt="" className="h-full w-full object-cover" />
                      ) : v.vehicle_type === "car" ? (
                        <Car size={15} className="text-ink-300" />
                      ) : (
                        <Truck size={15} className="text-ink-300" />
                      )}
                    </div>
                  </td>
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
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => setEditing(v)}
                          aria-label={`Editar ${v.plate}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-ink-100 text-ink-500 transition-all hover:border-ink-900 hover:text-ink-900"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      <Link
                        to={`/vehicles/${v.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 transition-all group-hover:border-ink-900 group-hover:bg-ink-900 group-hover:text-paper-50"
                      >
                        Prontuário <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Truck className="mx-auto mb-2 text-ink-300" />
                    <div className="font-display text-[15px] font-semibold text-ink-900">Nenhum veículo encontrado.</div>
                    <div className="mt-1 text-[12px] text-ink-500">Ajuste o filtro ou cadastre uma nova unidade.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-ink-100">
          {items.length === 0 && (
            <div className="px-5 py-16 text-center">
              <Truck className="mx-auto mb-2 text-ink-300" />
              <div className="font-display text-[15px] font-semibold text-ink-900">Nenhum veículo encontrado.</div>
              <div className="mt-1 text-[12px] text-ink-500">Ajuste o filtro ou cadastre uma nova unidade.</div>
            </div>
          )}
          {items.map((v) => (
            <div key={v.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-100 bg-paper-50">
                {v.default_photo_url ? (
                  <img src={v.default_photo_url} alt="" className="h-full w-full object-cover" />
                ) : v.vehicle_type === "car" ? (
                  <Car size={16} className="text-ink-300" />
                ) : (
                  <Truck size={16} className="text-ink-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[14px] font-bold tracking-wider text-ink-900">{v.plate}</span>
                  <span className={`badge text-[10px] ${v.is_active ? "bg-success-500/15 text-success-600" : "bg-ink-100 text-ink-600"}`}>
                    {v.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-ink-600 truncate">
                  {v.model}{v.prefix ? ` · Prefixo ${v.prefix}` : ""}{v.year ? ` · ${v.year}` : ""}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-ink-400">{v.vehicle_type === "bus" ? "Ônibus" : "Carro"}</span>
                  <Link
                    to={`/vehicles/${v.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-700 underline-offset-2 hover:underline"
                  >
                    Prontuário <ArrowUpRight size={11} />
                  </Link>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setEditing(v)}
                      aria-label={`Editar ${v.plate}`}
                      className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-ink-100 text-ink-500 transition-all hover:border-ink-900 hover:text-ink-900"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {creating && (
        <VehicleModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />
      )}
      {editing && (
        <VehicleModal
          vehicle={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {importing && (
        <ImportModal onClose={() => setImporting(false)} onImported={() => { load(); }} />
      )}
    </div>
  );
}

function VehicleModal({
  vehicle,
  onClose,
  onSaved,
}: {
  vehicle?: Vehicle;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(vehicle);
  const [form, setForm] = useState({
    plate: vehicle?.plate ?? "",
    prefix: vehicle?.prefix ?? "",
    model: vehicle?.model ?? "",
    chassis: vehicle?.chassis ?? "",
    year: vehicle?.year ? String(vehicle.year) : "",
    vehicle_type: vehicle?.vehicle_type ?? "bus",
    is_active: vehicle?.is_active ?? true,
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(vehicle?.default_photo_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        plate: form.plate,
        prefix: form.prefix || null,
        model: form.model,
        chassis: form.chassis || null,
        year: form.year ? Number(form.year) : null,
        vehicle_type: form.vehicle_type,
      };
      if (isEdit && vehicle) {
        await api.patch(`/api/v1/vehicles/${vehicle.id}`, { ...payload, is_active: form.is_active });
      } else {
        await api.post("/api/v1/vehicles", payload);
      }
      onSaved();
    } catch (err: any) {
      setError(extractErrorMsg(err, "Erro ao salvar"));
    } finally {
      setLoading(false);
    }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !vehicle) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post(`/api/v1/vehicles/${vehicle.id}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(data.default_photo_url ?? null);
    } catch (err: any) {
      setError(extractErrorMsg(err, "Erro ao enviar foto"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 backdrop-blur-md animate-fade-in sm:items-center sm:p-4">
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-hero animate-scale-in sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-ink-100 bg-paper-50 px-6 py-4">
          <div>
            <div className="eyebrow">{isEdit ? "Edição" : "Cadastro"}</div>
            <h2 className="display text-lg font-semibold text-ink-900">
              {isEdit ? `Editar ${vehicle?.plate}` : "Novo veículo"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-500 transition-all hover:bg-white hover:text-ink-900">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto sm:max-h-[70vh]">
          {/* Default photo — only after the vehicle exists */}
          <div className="border-b border-ink-100 px-5 py-5 sm:px-6">
            <label className="label-form">Foto padrão do veículo</label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-2xl border border-ink-100 bg-paper-50">
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[11px] text-ink-300">Sem foto</span>
                )}
              </div>
              <div className="flex-1">
                {isEdit ? (
                  <>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                      className="btn-secondary"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      {photoUrl ? "Trocar foto" : "Enviar foto"}
                    </button>
                    <p className="mt-2 text-[11px] text-ink-400">JPEG, PNG ou WebP · até 8 MB.</p>
                  </>
                ) : (
                  <p className="text-[12px] text-ink-400">
                    Salve o veículo primeiro, depois reabra em <span className="font-semibold text-ink-600">Editar</span> para anexar a foto.
                  </p>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPhoto} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <Field label="Placa *">
              <input required className="input-mono uppercase" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Prefixo">
              <input className="input" value={form.prefix ?? ""} onChange={(e) => setForm({ ...form, prefix: e.target.value })} />
            </Field>
            <Field label="Modelo *" full>
              <input required className="input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </Field>
            <Field label="Chassi">
              <input className="input font-mono" value={form.chassis ?? ""} onChange={(e) => setForm({ ...form, chassis: e.target.value })} />
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

            {isEdit && (
              <div className="col-span-2">
                <label className="label-form">Situação</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className="flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-paper-50 px-4 py-3 transition-all hover:border-ink-300"
                >
                  <span className="text-[13px] font-medium text-ink-700">
                    {form.is_active ? "Veículo ativo na operação" : "Veículo inativo / manutenção"}
                  </span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      form.is_active ? "bg-success-500" : "bg-ink-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                        form.is_active ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-4 rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-[13px] font-medium text-danger-600 sm:mx-6">
            {error}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-paper-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Cancelar</button>
          <button disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Salvar alterações" : "Salvar veículo"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label-form">{label}</label>
      {children}
    </div>
  );
}

// ---------- Import Modal ----------

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

const IMPORT_EXAMPLE_CSV = `plate,prefix,model,chassis,year,vehicle_type
ABC1D23,1003,M.Benz OF-1721,9BM384067VB123456,2022,bus
DEF2E34,15040,Volvo B270F,93S270F1234567890,2023,bus
GHI3F45,200,Volkswagen Gol,,2021,car
JKL4G56,,Scania K310,9BSC3101234567890,2024,bus`;

function ImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post<ImportResult>("/api/v1/vehicles/import-xlsx", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      if (data.created > 0) onImported();
    } catch (err: any) {
      setError(extractErrorMsg(err, "Erro ao importar arquivo"));
    } finally {
      setLoading(false);
    }
  }

  async function downloadExample() {
    try {
      const { data } = await api.get("/api/v1/vehicles/import-xlsx/template", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modelo_importacao_veiculos.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Não foi possível baixar o modelo .xlsx.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/60 p-0 backdrop-blur-md animate-fade-in sm:items-center sm:p-4">
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white shadow-hero animate-scale-in sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-ink-100 bg-paper-50 px-6 py-4">
          <div>
            <div className="eyebrow">Importação em lote</div>
            <h2 className="display text-lg font-semibold text-ink-900">Importar veículos por planilha</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-ink-500 transition-all hover:bg-white hover:text-ink-900">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto sm:max-h-[70vh]">
          <div className="space-y-5 p-5 sm:p-6">
            {/* Step 1: Example / template */}
            <div className="rounded-2xl border border-ink-100 bg-paper-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowExample(!showExample)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-paper-100"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} className="text-ink-600" />
                  <div>
                    <div className="text-[13px] font-semibold text-ink-900">Exemplo de planilha</div>
                    <div className="text-[11px] text-ink-500">Clique para ver o formato esperado</div>
                  </div>
                </div>
                <span className={`text-[11px] font-medium text-ink-400 transition-transform ${showExample ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {showExample && (
                <div className="border-t border-ink-100">
                  <div className="px-5 py-3 bg-ink-900 text-paper-50 overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed font-mono whitespace-pre">{IMPORT_EXAMPLE_CSV}</pre>
                  </div>
                  <div className="px-5 py-3 flex flex-wrap items-center gap-2 text-[11px] text-ink-500">
                    <span>Colunas: <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">plate</code> (obrigatória), <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">model</code> (obrigatória), <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">prefix</code>, <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">chassis</code>, <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">year</code>, <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">vehicle_type</code> (bus/car)</span>
                    <button type="button" onClick={downloadExample} className="ml-auto text-[11px] font-semibold text-ink-700 hover:text-ink-900 underline-offset-2 hover:underline">
                      Baixar exemplo .xlsx
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Upload */}
              <div className="rounded-2xl border-2 border-dashed border-ink-200 bg-paper-50 p-5 text-center transition-colors hover:border-ink-400 sm:p-6">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={onSelect}
              />
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-success-600">
                    <Check size={18} />
                    <span className="text-[14px] font-semibold">{file.name}</span>
                  </div>
                  <div className="text-[12px] text-ink-500">{(file.size / 1024).toFixed(1)} KB</div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-[11px] font-semibold text-ink-700 hover:text-ink-900 underline-offset-2 hover:underline">
                    Selecionar outro arquivo
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-3 w-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                    <Upload size={20} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-ink-900">Clique para selecionar</div>
                    <div className="mt-1 text-[12px] text-ink-500">Apenas arquivos .xlsx (Excel)</div>
                  </div>
                </button>
              )}
            </div>

            {/* Result */}
            {result && (
              <div className={`rounded-2xl border p-4 ${result.errors.length > 0 ? "border-warn-500/30 bg-warn-500/10" : "border-success-500/30 bg-success-500/10"}`}>
                <div className="flex items-start gap-2">
                  {result.errors.length > 0 ? (
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warn-600" />
                  ) : (
                    <Check size={18} className="mt-0.5 text-success-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-ink-900">
                      {result.created} veículo{result.created !== 1 ? "s" : ""} importado{result.created !== 1 ? "s" : ""}
                      {result.skipped > 0 && ` · ${result.skipped} pulado${result.skipped !== 1 ? "s" : ""}`}
                    </div>
                    {result.errors.map((e, i) => (
                      <div key={i} className="mt-1 text-[12px] font-mono text-warn-600">{e}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-[13px] font-medium text-danger-600">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-paper-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">Fechar</button>
          <button disabled={!file || loading} className="btn-lime w-full sm:w-auto">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Importar veículos
          </button>
        </div>
      </form>
    </div>
  );
}
