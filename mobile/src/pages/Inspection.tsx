import { useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Camera, X, Save, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { db } from "../db/dexie";
import { scheduleBackgroundSync, syncNow } from "../sync/syncQueue";
import { AreaPicker } from "../components/AreaPicker";

interface DamageDraft {
  id: string;
  area_code: string;
  severity: "low" | "medium" | "high";
  description: string;
  x_pct?: number;
  y_pct?: number;
  photos: { id: string; blob: Blob; url: string; content_type: string }[];
}

function uuid() {
  return (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function severityLabel(severity: DamageDraft["severity"]) {
  switch (severity) {
    case "low":
      return "Leve";
    case "high":
      return "Severa";
    default:
      return "Moderada";
  }
}

export function Inspection() {
  const { type } = useParams();
  const inspectionType = type === "return" ? "return" : "exit";
  const nav = useNavigate();
  const [plate, setPlate] = useState("");
  const [notes, setNotes] = useState("");
  const [damages, setDamages] = useState<DamageDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeDamageRef = useRef<string | null>(null);
  const plateInputId = "inspection-plate";
  const notesInputId = "inspection-notes";

  function addArea(area: { code: string; label: string }, x: number, y: number) {
    const id = uuid();
    setDamages((prev) => [...prev, { id, area_code: area.code, severity: "medium", description: area.label, x_pct: x, y_pct: y, photos: [] }]);
  }

  function removeDamage(id: string) {
    setDamages((prev) => prev.filter((d) => d.id !== id));
  }

  function updateDamage(id: string, patch: Partial<DamageDraft>) {
    setDamages((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function openCamera(damageId: string) {
    activeDamageRef.current = damageId;
    fileRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !activeDamageRef.current) return;
    const damageId = activeDamageRef.current;
    for (const f of files) {
      try {
        const compressed = await imageCompression(f, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
        const url = URL.createObjectURL(compressed);
        const photo = { id: uuid(), blob: compressed, url, content_type: "image/jpeg" };
        setDamages((prev) =>
          prev.map((d) => (d.id === damageId ? { ...d, photos: [...d.photos, photo] } : d))
        );
      } catch (err) {
        console.error(err);
      }
    }
    e.target.value = "";
  }

  async function save() {
    if (!plate.trim()) { setError("Informe a placa do veículo."); return; }
    setSaving(true);
    setError(null);
    try {
      const allPhotos = damages.flatMap((d) =>
        d.photos.map((p) => ({ id: p.id, blob: p.blob, content_type: p.content_type }))
      );
      await db.inspections.put({
        uuid: uuid(),
        vehicle_plate: plate.toUpperCase().trim(),
        inspection_type: inspectionType,
        status: damages.length > 0 ? "with_damage" : "approved",
        notes: notes || undefined,
        damages: damages.map((d) => ({
          area_code: d.area_code,
          severity: d.severity,
          description: d.description,
          x_pct: d.x_pct,
          y_pct: d.y_pct,
        })),
        performed_at: new Date().toISOString(),
        photos: allPhotos,
        created_at: Date.now(),
        attempts: 0,
        status_sync: "pending",
      });
      await scheduleBackgroundSync();
      void syncNow();
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Erro ao salvar localmente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="rounded-xl p-2 text-ink-700 active:bg-ink-50"><ArrowLeft size={20} /></Link>
        <div className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-900">
          {inspectionType === "exit" ? "Vistoria de Saída" : "Vistoria de Retorno"}
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-4 p-4 pb-32">
        <div className="card p-4 animate-fade-in">
          <label htmlFor={plateInputId} className="label-form">Placa</label>
          <input
            id={plateInputId}
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="ABC1D23"
            autoCapitalize="characters"
            className="input font-mono text-2xl font-bold tracking-widest"
          />
        </div>

        <div className="card p-4">
          <AreaPicker
            marks={damages.map((d) => ({ area_code: d.area_code, x_pct: d.x_pct, y_pct: d.y_pct }))}
            onPick={(a, x, y) => addArea(a, x, y)}
          />
        </div>

        {damages.map((d) => (
          <div key={d.id} className="card p-4 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">Área</div>
                <div className="font-semibold text-ink-900">{d.description || d.area_code}</div>
              </div>
              <button onClick={() => removeDamage(d.id)} className="rounded-xl p-2 text-danger-600 active:bg-danger-500/10"><X size={18} /></button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["low","medium","high"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateDamage(d.id, { severity: s })}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-all ${
                    d.severity === s ? "border-ink-900 bg-ink-900 text-paper-50" : "border-ink-200 bg-white text-ink-700"
                  }`}
                >
                  {severityLabel(s)}
                </button>
              ))}
            </div>
            <textarea
              value={d.description}
              onChange={(e) => updateDamage(d.id, { description: e.target.value })}
              placeholder="Descrição da avaria"
              rows={2}
              className="input mt-3 text-sm"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {d.photos.map((p) => (
                <div key={p.id} className="relative h-20 w-20 overflow-hidden rounded-xl bg-ink-100">
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              <button onClick={() => openCamera(d.id)} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-500 transition-transform active:scale-95">
                <Camera size={20} />
                <span className="text-[10px] font-semibold">Foto</span>
              </button>
            </div>
          </div>
        ))}

        <div className="card p-4">
          <label htmlFor={notesInputId} className="label-form">Observações</label>
          <textarea
            id={notesInputId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input text-sm"
            placeholder="Notas gerais da vistoria (opcional)"
          />
        </div>

        {error && <div className="rounded-2xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm font-medium text-danger-600">{error}</div>}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur-xl shadow-[0_-8px_24px_-12px_rgba(10,10,12,0.12)]">
        <div className="mb-2 flex items-center justify-between text-xs">
          {damages.length === 0 ? (
            <span className="badge bg-emerald-100 text-emerald-700"><CheckCircle2 size={12} /> Aprovado (sem avarias)</span>
          ) : (
            <span className="badge bg-danger-500/15 text-danger-600"><AlertTriangle size={12} /> {damages.length} avaria(s)</span>
          )}
        </div>
        <button disabled={saving} onClick={save} className="btn-primary w-full">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar registro
        </button>
      </footer>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={onFileSelected} />
    </div>
  );
}
