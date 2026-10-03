"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  Megaphone,
  FileText,
  Receipt,
  Landmark,
  Plug,
  Settings,
  Search,
  Bell,
  Plus,
  Building2,
  Sparkles,
  Phone,
  MessageCircle,
  CalendarDays,
  Play,
  Bot,
  IndianRupee,
  Target,
  CheckCircle2,
  Send,
  TrendingUp,
  Download,
  Paperclip,
  CheckCheck,
  Globe2,
  Mail,
  Pencil,
  Archive,
  RotateCcw,
  Check,
  List,
  Columns3,
  Menu,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";
import {
  STAGES,
  SOURCES,
  INDUSTRIES,
  DOC_TYPES,
  STORAGE_KEY,
  stateSchema,
  seedState,
  uid,
  now,
  today,
  money,
  compactMoney,
  displayDate,
  normalizePhone,
  qualify,
  rescoreLead,
  campaignRecipients,
  dispatchCampaign,
  activity,
  welcome,
  fillTemplate,
  documentTotal,
  documentSubtotal,
  balance,
  paidAmount,
  invoiceStatus,
  download,
  exportCSV,
  documentHTML,
  type CRMState,
  type Lead,
  type CRMDocument,
  type Campaign,
  type Message,
  type Stage,
} from "@/lib/crm-model";

type Modal = {
  kind:
    | "lead"
    | "task"
    | "campaign"
    | "document"
    | "preview"
    | "payment"
    | "expense"
    | "integration"
    | "notifications"
    | "simulation";
  id?: string;
  leadId?: string;
  type?: string;
} | null;
type API = {
  s: CRMState;
  change: (fn: (s: CRMState) => void, msg?: string) => boolean;
  nav: (view: string, stage?: Stage, board?: boolean) => void;
  openLead: (id: string) => void;
  modal: (m: Modal) => void;
  ask: (title: string, text: string, run: () => void) => void;
  chat: (id: string) => void;
};
const Context = createContext<API | null>(null);
const useCRM = () => useContext(Context)!;
const NAV = [
  ["Overview", LayoutDashboard],
  ["Leads", Users],
  ["Conversations", MessagesSquare],
  ["Campaigns", Megaphone],
  ["Documents", FileText],
  ["Billing", Receipt],
  ["Accounts", Landmark],
  ["Integrations", Plug],
  ["Settings", Settings],
] as const;
const colors = [
  "#2986b0",
  "#089990",
  "#9271ca",
  "#c8922c",
  "#c45a82",
  "#24885a",
  "#168657",
  "#7c8796",
];

function Badge({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar">
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function Pick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="crm-pick">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="crm-select">
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="crm-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="crm-empty">
      <Search />
      <p>{text}</p>
    </div>
  );
}
function Heading({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: ReactNode;
}) {
  return (
    <div className="title crm-title">
      <div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
      <div className="crm-buttons">{children}</div>
    </div>
  );
}
function Action({
  children,
  onClick,
  primary = false,
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={primary ? "primary" : "crm-btn"}
    >
      {children}
    </button>
  );
}
function CardHead({
  title,
  sub,
  action,
  onClick,
}: {
  title: string;
  sub: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="phead">
      <div>
        <h3>{title}</h3>
        <small>{sub}</small>
      </div>
      {action && <button onClick={onClick}>{action}</button>}
    </div>
  );
}
function Metric({
  icon: I,
  name,
  value,
  note,
}: {
  icon: typeof Users;
  name: string;
  value: string;
  note: string;
}) {
  return (
    <div className="metric">
      <div>
        <i>
          <I />
        </i>
      </div>
      <p>{name}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function leadCSV(ls: Lead[]) {
  exportCSV("abundance-leads.csv", [
    [
      "ID",
      "Name",
      "Company",
      "Phone",
      "Email",
      "Industry",
      "Source",
      "Seats",
      "Monthly budget",
      "Location",
      "Move-in",
      "Stage",
      "Score",
      "Owner",
      "Opt-in",
    ],
    ...ls.map((l) => [
      l.id,
      l.name,
      l.company,
      l.phone,
      l.email,
      l.industry,
      l.source,
      l.seats,
      l.budget,
      l.location,
      l.moveIn,
      l.stage,
      l.score,
      l.owner,
      l.consent,
    ]),
  ]);
}
function appendMessage(
  s: CRMState,
  leadId: string,
  text: string,
  direction: "in" | "out" | "system" = "out",
) {
  s.messages.push({ id: uid("MSG"), leadId, text, direction, at: now() });
  if (direction === "in" && !s.unreadThreads.includes(leadId))
    s.unreadThreads.push(leadId);
}

export default function CRMApp() {
  const [state, setState] = useState<CRMState | null>(null),
    ref = useRef<CRMState | null>(null);
  const [loadError, setLoadError] = useState(false),
    [storageProblem, setStorageProblem] = useState("");
  const [view, setView] = useState("Overview"),
    [selected, setSelected] = useState<string | null>(null),
    [modal, setModal] = useState<Modal>(null);
  const [question, setQuestion] = useState<{
      title: string;
      text: string;
      run: () => void;
    } | null>(null),
    [thread, setThread] = useState("");
  const [global, setGlobal] = useState(""),
    [mobile, setMobile] = useState(false);
  const [leadRoute, setLeadRoute] = useState({ stage: "All", board: false });
  const [exportFile, setExportFile] = useState<{
    filename: string;
    content: string;
    url: string;
  } | null>(null);
  useEffect(() => {
    let previousURL = "";
    const handle = (event: Event) => {
      const { filename, content, type } = (
        event as CustomEvent<{
          filename: string;
          content: string;
          type: string;
        }>
      ).detail;
      if (previousURL) URL.revokeObjectURL(previousURL);
      previousURL = URL.createObjectURL(new Blob([content], { type }));
      setExportFile({ filename, content, url: previousURL });
    };
    window.addEventListener("abundance:export", handle);
    return () => {
      window.removeEventListener("abundance:export", handle);
      if (previousURL) URL.revokeObjectURL(previousURL);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    // Load browser-only persistence after hydration without server/client mismatch.
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const s = raw ? stateSchema.parse(JSON.parse(raw)) : seedState();
        ref.current = s;
        setState(s);
        if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {
        setLoadError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const change = (fn: (s: CRMState) => void, msg?: string) => {
    if (!ref.current) return false;
    try {
      const next = structuredClone(ref.current);
      fn(next);
      stateSchema.parse(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      ref.current = next;
      setState(next);
      setStorageProblem("");
      if (msg) toast.success(msg);
      return true;
    } catch (error) {
      const isStorageError = error instanceof DOMException;
      if (isStorageError)
        setStorageProblem(
          "Could not save this change. Storage may be full or unavailable. Export a backup in Settings and remove large attachments before retrying.",
        );
      toast.error(
        isStorageError
          ? "Change was not saved. Your existing data is preserved."
          : error instanceof Error
            ? `Change was not saved: ${error.message.slice(0, 180)}`
            : "Invalid record. No data was changed.",
      );
      return false;
    }
  };
  const nav = (v: string, stage?: Stage, board = false) => {
    if (v === "Leads") setLeadRoute({ stage: stage || "All", board });
    setView(v);
    setGlobal("");
    setMobile(false);
  };
  const openLead = (id: string) => {
    setSelected(id);
    setModal(null);
    setGlobal("");
  };
  const chat = (id: string) => {
    setSelected(null);
    setThread(id);
    nav("Conversations");
    change((s) => {
      s.unreadThreads = s.unreadThreads.filter((x) => x !== id);
    });
  };
  const ask = (title: string, text: string, run: () => void) =>
    setQuestion({ title, text, run });
  if (loadError)
    return (
      <div className="crm-loading">
        <Building2 />
        <h1>Abundance Group</h1>
        <p>
          The saved workspace could not be read. Your existing backup has been
          preserved.
        </p>
        <Action
          onClick={() => {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw)
              download("abundance-recovery.json", raw, "application/json");
          }}
        >
          Download saved data
        </Action>
        <Action
          onClick={() => {
            const s = seedState();
            ref.current = s;
            setState(s);
            setLoadError(false);
            setStorageProblem(
              "Recovery session: export your existing backup before saving changes.",
            );
          }}
        >
          Open recovery session
        </Action>
      </div>
    );
  if (!state)
    return (
      <div className="crm-loading">
        <Building2 />
        <h1>Abundance Group</h1>
        <p>Opening your workspace…</p>
      </div>
    );
  const api: API = {
    s: state,
    change,
    nav,
    openLead,
    modal: setModal,
    ask,
    chat,
  };
  const activeLeads = state.leads.filter((l) => !l.archived),
    lead = state.leads.find((l) => l.id === selected);
  const search = global.trim().toLowerCase();
  const results = search
    ? [
        ...activeLeads
          .filter((l) =>
            `${l.name} ${l.company} ${l.phone}`.toLowerCase().includes(search),
          )
          .map((l) => ({
            id: l.id,
            label: `${l.name} · ${l.company}`,
            kind: "Lead",
            run: () => openLead(l.id),
          })),
        ...state.documents
          .filter((d) =>
            `${d.id} ${d.customer.company}`.toLowerCase().includes(search),
          )
          .map((d) => ({
            id: d.id,
            label: `${d.id} · ${d.customer.company}`,
            kind: d.type,
            run: () => {
              setModal({ kind: "preview", id: d.id });
              setGlobal("");
            },
          })),
        ...state.campaigns
          .filter((c) => c.name.toLowerCase().includes(search))
          .map((c) => ({
            id: c.id,
            label: c.name,
            kind: "Campaign",
            run: () => {
              nav("Campaigns");
              setModal({ kind: "campaign", id: c.id });
            },
          })),
      ].slice(0, 8)
    : [];
  const create = () =>
    setModal(
      view === "Overview"
        ? { kind: "simulation" }
        : view === "Campaigns"
          ? { kind: "campaign" }
          : view === "Documents"
            ? { kind: "document" }
            : view === "Billing"
              ? { kind: "document", type: "Invoice" }
              : view === "Accounts"
                ? { kind: "expense" }
                : view === "Integrations"
                  ? { kind: "integration", id: "WhatsApp Business" }
                  : { kind: "lead" },
    );
  return (
    <Context.Provider value={api}>
      <main className="shell crm-shell">
        <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
          <div className="brand">
            <span>
              <Building2 />
            </span>
            <div>
              <b>ABUNDANCE</b>
              <small>GROUP · WORKSPACE CRM</small>
            </div>
          </div>
          <button
            className="workspace"
            onClick={() => {
              nav("Settings");
            }}
          >
            <i>A</i>
            <div>
              <b>{state.settings.brand}</b>
              <small>Managed workspaces</small>
            </div>
            <Settings size={15} />
          </button>
          <nav aria-label="Main navigation">
            {NAV.map(([n, I]) => (
              <button
                key={n}
                title={n}
                aria-label={n}
                className={view === n ? "active" : ""}
                onClick={() => nav(n)}
              >
                <I />
                <span>{n}</span>
                {n === "Leads" && <em>{activeLeads.length}</em>}
              </button>
            ))}
          </nav>
          <div className="sidebottom">
            <div className="capacity">
              <span>
                Seat capacity{" "}
                <b>
                  {Math.round(
                    (activeLeads
                      .filter((l) => l.stage === "Won")
                      .reduce((a, l) => a + l.seats, 0) /
                      state.settings.capacity) *
                      100,
                  )}
                  %
                </b>
              </span>
              <i>
                <em
                  style={{
                    width: `${Math.min(100, (activeLeads.filter((l) => l.stage === "Won").reduce((a, l) => a + l.seats, 0) / state.settings.capacity) * 100)}%`,
                  }}
                />
              </i>
              <small>
                {activeLeads
                  .filter((l) => l.stage === "Won")
                  .reduce((a, l) => a + l.seats, 0)}{" "}
                of {state.settings.capacity} seats allocated
              </small>
            </div>
            <button className="user" onClick={() => nav("Settings")}>
              <Avatar name={state.settings.team[0].name} />
              <div>
                <b>{state.settings.team[0].name}</b>
                <small>{state.settings.team[0].role}</small>
              </div>
              <Settings size={16} />
            </button>
          </div>
        </aside>
        <section className="main">
          <header>
            <div className="crm-header-title">
              <button
                className="crm-mobile-menu"
                aria-label="Toggle navigation"
                onClick={() => setMobile(!mobile)}
              >
                {mobile ? <X /> : <Menu />}
              </button>
              <div>
                <small>ABUNDANCE GROUP / {view.toUpperCase()}</small>
                <h1>{view}</h1>
              </div>
            </div>
            <div className="actions">
              <div className="crm-global">
                <label>
                  <Search />
                  <input
                    aria-label="Search workspace"
                    placeholder="Search leads, documents, campaigns…"
                    value={global}
                    onChange={(e) => setGlobal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setGlobal("");
                    }}
                  />
                </label>
                {search && (
                  <div className="crm-search-results">
                    {results.map((r) => (
                      <button key={r.id} onClick={r.run}>
                        <small>{r.kind}</small>
                        <b>{r.label}</b>
                      </button>
                    ))}
                    {!results.length && <p>No matching records</p>}
                    <button onClick={() => setGlobal("")}>Close search</button>
                  </div>
                )}
              </div>
              <button
                className="icon crm-notify"
                aria-label="Notifications"
                onClick={() => setModal({ kind: "notifications" })}
              >
                <Bell />
                {state.activities.some((a) => !a.read) && <i />}
              </button>
              {view !== "Settings" && (
                <Action primary onClick={create}>
                  <Plus />
                  {view === "Overview"
                    ? "Simulate lead"
                    : view === "Campaigns"
                      ? "New campaign"
                      : view === "Documents"
                        ? "New document"
                        : view === "Billing"
                          ? "New invoice"
                          : view === "Accounts"
                            ? "Add expense"
                            : view === "Integrations"
                              ? "Configure"
                              : "Add lead"}
                </Action>
              )}
            </div>
          </header>
          <div className="crm-mode">
            <span>
              <CircleMark /> Local demo workspace
            </span>
            <small>
              Changes saved on this browser · External delivery is simulated
            </small>
          </div>
          {storageProblem && (
            <div role="alert" className="crm-error">
              {storageProblem}
            </div>
          )}
          <div className="content">
            {view === "Overview" ? (
              <Overview />
            ) : view === "Leads" ? (
              <LeadsView
                key={`${leadRoute.stage}-${leadRoute.board}`}
                initialStage={leadRoute.stage}
                initialBoard={leadRoute.board}
              />
            ) : view === "Conversations" ? (
              <Conversations key={thread} initial={thread} />
            ) : view === "Campaigns" ? (
              <Campaigns />
            ) : view === "Documents" ? (
              <Documents />
            ) : view === "Billing" ? (
              <Billing />
            ) : view === "Accounts" ? (
              <Accounts />
            ) : view === "Integrations" ? (
              <Integrations />
            ) : (
              <SettingsView />
            )}
          </div>
        </section>
      </main>
      <Sheet
        open={!!lead}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      >
        <SheetContent className="crm-sheet">
          {lead && <LeadDetail lead={lead} />}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!modal}
        onOpenChange={(o) => {
          if (!o) setModal(null);
        }}
      >
        <DialogContent
          className={`crm-dialog ${modal?.kind === "simulation" || modal?.kind === "preview" ? "crm-dialog-wide" : ""}`}
        >
          <DialogHeader>
            <DialogTitle>
              {modal?.kind === "lead"
                ? modal.id
                  ? "Edit lead"
                  : "Add lead"
                : modal?.kind === "task"
                  ? "Schedule sales action"
                  : modal?.kind === "campaign"
                    ? modal.id
                      ? "Campaign details"
                      : "Create campaign"
                    : modal?.kind === "document"
                      ? modal.id
                        ? "Edit document"
                        : "Generate document"
                      : modal?.kind === "preview"
                        ? "Document preview"
                        : modal?.kind === "payment"
                          ? "Record payment"
                          : modal?.kind === "expense"
                            ? "Record expense"
                            : modal?.kind === "integration"
                              ? "Integration configuration"
                              : modal?.kind === "notifications"
                                ? "Notifications"
                                : modal?.kind === "simulation"
                                  ? "Customer journey simulation"
                                  : "Workspace action"}
            </DialogTitle>
            <DialogDescription>
              {modal?.kind === "simulation"
                ? "Create a new enquiry and follow it through the CRM."
                : modal?.kind === "preview"
                  ? "Download this document or record its commercial status."
                  : "Abundance Group · Saved locally in this demo workspace."}
            </DialogDescription>
          </DialogHeader>
          {modal && (
            <ModalBody key={`${modal.kind}-${modal.id || "new"}`} m={modal} />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!question}
        onOpenChange={(o) => {
          if (!o) setQuestion(null);
        }}
      >
        <AlertDialogContent className="crm-dialog">
          <AlertDialogTitle>{question?.title}</AlertDialogTitle>
          <AlertDialogDescription>{question?.text}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => question?.run()}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!exportFile}
        onOpenChange={(o) => {
          if (!o) setExportFile(null);
        }}
      >
        <DialogContent className="crm-dialog crm-dialog-wide">
          <DialogHeader>
            <DialogTitle>Export ready</DialogTitle>
            <DialogDescription>
              {exportFile?.filename} · Your export contains the currently saved
              records.
            </DialogDescription>
          </DialogHeader>
          {exportFile && (
            <div className="crm-form">
              <p className="crm-muted">
                If your browser did not save the file automatically, use Save
                file below. You can also select and copy the export text into a
                file with the displayed filename.
              </p>
              <textarea
                aria-label="Export contents"
                readOnly
                value={exportFile.content}
                className="crm-export-text"
              />
              <div className="crm-form-footer">
                <Action onClick={() => setExportFile(null)}>
                  Close export
                </Action>
                <a
                  className="primary"
                  href={exportFile.url}
                  download={exportFile.filename}
                >
                  <Download size={16} />
                  Save file
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Toaster position="bottom-right" richColors closeButton />
    </Context.Provider>
  );
}
function CircleMark() {
  return <span className="crm-dot" />;
}

function Overview() {
  const { s, nav, openLead, modal, change } = useCRM();
  const ls = s.leads.filter((l) => !l.archived);
  const priority = [...ls]
    .filter((l) => !["Won", "Lost"].includes(l.stage))
    .sort((a, b) => b.score - a.score);
  const top = priority[0];
  const tasks = s.tasks
    .filter((t) => !t.completed && ls.some((l) => l.id === t.leadId))
    .sort((a, b) => a.due.localeCompare(b.due));
  const pipeline = ls.filter(
    (l) => !["New", "Enquiry", "Won", "Lost"].includes(l.stage),
  );
  return (
    <>
      <section className="welcome">
        <div>
          <Badge tone="violet">
            <Sparkles /> Workspace intelligence
          </Badge>
          <h2>Welcome back, {s.settings.team[0].name.split(" ")[0]}.</h2>
          <p>
            <b>{priority.length} active opportunities</b> and{" "}
            <b>{tasks.length} sales actions</b> need your team’s attention.
          </p>
        </div>
        <button onClick={() => modal({ kind: "simulation" })}>
          <i>
            <Play size={18} />
          </i>
          <span>
            <b>Run customer journey</b>
            <small>Ad enquiry to sales conversion</small>
          </span>
        </button>
      </section>
      <div className="metrics">
        <Metric
          icon={Users}
          name="Active leads"
          value={String(ls.length)}
          note={`${ls.filter((l) => l.stage === "New").length} new enquiries`}
        />
        <Metric
          icon={Target}
          name="Qualified pipeline"
          value={compactMoney(pipeline.reduce((a, l) => a + l.budget, 0))}
          note={`${pipeline.length} opportunities`}
        />
        <Metric
          icon={TrendingUp}
          name="Conversion rate"
          value={`${ls.length ? ((ls.filter((l) => l.stage === "Won").length / ls.length) * 100).toFixed(1) : "0"}%`}
          note={`${ls.filter((l) => l.stage === "Won").length} won deals`}
        />
        <Metric
          icon={IndianRupee}
          name="Collections"
          value={compactMoney(s.payments.reduce((a, p) => a + p.amount, 0))}
          note={`${s.payments.length} recorded payments`}
        />
      </div>
      <div className="grid">
        <section className="panel pipeline">
          <CardHead
            title="Deal pipeline"
            sub="Actual records by sales stage"
            action="View pipeline"
            onClick={() => nav("Leads", undefined, true)}
          />
          <div className="crm-stage-grid">
            {STAGES.map((st, i) => {
              const rows = ls.filter((l) => l.stage === st);
              return (
                <button key={st} onClick={() => nav("Leads", st, true)}>
                  <span style={{ color: colors[i] }}>
                    {st}
                    <b>{rows.length}</b>
                  </span>
                  <strong>
                    {compactMoney(rows.reduce((a, l) => a + l.budget, 0))}
                  </strong>
                  <i>
                    <em
                      style={{
                        background: colors[i],
                        width: `${(rows.length / Math.max(1, ls.length)) * 100}%`,
                      }}
                    />
                  </i>
                </button>
              );
            })}
          </div>
          <div className="crm-source-chart">
            <h4>Lead acquisition</h4>
            {SOURCES.filter((src) => ls.some((l) => l.source === src)).map(
              (src) => {
                const count = ls.filter((l) => l.source === src).length;
                return (
                  <div key={src}>
                    <span>{src}</span>
                    <i>
                      <em
                        style={{
                          width: `${(count / Math.max(1, ls.length)) * 100}%`,
                        }}
                      />
                    </i>
                    <b>{count}</b>
                  </div>
                );
              },
            )}
          </div>
        </section>
        <section className="panel intelligence">
          <CardHead
            title="Lead intelligence"
            sub="Local rule-based intent scoring"
          />
          {top ? (
            <>
              <div className="score">
                <i>
                  <b>{top.score}</b>
                  <small>/100</small>
                </i>
                <div>
                  <Badge tone={top.score >= 80 ? "green" : "blue"}>
                    {top.score >= 80 ? "High intent" : "Needs review"}
                  </Badge>
                  <h3>{top.name}</h3>
                  <p>
                    {top.company} · {top.seats} seats
                  </p>
                </div>
              </div>
              <div className="insight">
                <CalendarDays />
                <span>
                  <b>
                    {top.moveIn
                      ? displayDate(top.moveIn)
                      : "Timeline not confirmed"}
                  </b>
                  <small>Requested move-in</small>
                </span>
              </div>
              <div className="insight">
                <IndianRupee />
                <span>
                  <b>{money(top.budget)} / month</b>
                  <small>Customer budget</small>
                </span>
              </div>
              <div className="insight">
                <Building2 />
                <span>
                  <b>{top.location}</b>
                  <small>{top.industry}</small>
                </span>
              </div>
              <button onClick={() => openLead(top.id)}>
                Open lead intelligence
              </button>
            </>
          ) : (
            <Empty text="Add a lead to see opportunity intelligence." />
          )}
        </section>
        <section className="panel leadspanel">
          <CardHead
            title="Priority leads"
            sub="Ranked by saved intent score"
            action="View all leads"
            onClick={() => nav("Leads")}
          />
          <LeadTable leads={priority.slice(0, 5)} />
        </section>
        <section className="panel activity">
          <CardHead
            title="Sales actions"
            sub="Follow-ups, visits and calls"
            action="Add action"
            onClick={() => modal({ kind: "task" })}
          />
          {tasks.slice(0, 5).map((t) => (
            <div className="crm-task" key={t.id}>
              <CalendarDays />
              <button onClick={() => openLead(t.leadId)}>
                <b>
                  {t.type} · {s.leads.find((l) => l.id === t.leadId)?.name}
                </b>
                <small>
                  {displayDate(t.due)} · {t.owner}
                </small>
              </button>
              <button
                aria-label={`Complete ${t.type} ${t.id}`}
                className="crm-icon"
                onClick={() =>
                  change((x) => {
                    x.tasks.find((a) => a.id === t.id)!.completed = true;
                    activity(x, `${t.type} completed`, t.leadId);
                  }, "Sales action completed")
                }
              >
                <Check />
              </button>
            </div>
          ))}
          {!tasks.length && <Empty text="All sales actions are complete." />}
          <CardHead
            title="Recent activity"
            sub="Updates across your workspace"
          />
          {s.activities.slice(0, 4).map((a) => (
            <div className="event" key={a.id}>
              <i>
                <CheckCircle2 />
              </i>
              <span>
                <b>{a.text}</b>
                <small>{displayDate(a.at)}</small>
              </span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
function LeadTable({ leads }: { leads: Lead[] }) {
  const { openLead, chat, modal } = useCRM();
  return leads.length ? (
    <Table className="crm-table">
      <TableHeader>
        <TableRow>
          {[
            "Lead & company",
            "Requirement",
            "Source",
            "Intent",
            "Stage",
            "Actions",
          ].map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((l) => (
          <TableRow key={l.id}>
            <TableCell>
              <button
                className="person crm-link"
                onClick={() => openLead(l.id)}
              >
                <Avatar name={l.name} />
                <i>
                  <b>{l.name}</b>
                  <small>{l.company}</small>
                </i>
              </button>
            </TableCell>
            <TableCell>
              <b>{l.seats} seats</b>
              <small>{compactMoney(l.budget)} / month</small>
            </TableCell>
            <TableCell>
              <Badge tone="blue">{l.source}</Badge>
              <small>{l.industry}</small>
            </TableCell>
            <TableCell>
              <span className="aiscore">
                <b>{l.score}</b>
              </span>
            </TableCell>
            <TableCell>
              <Badge tone={l.stage === "Won" ? "green" : "violet"}>
                {l.stage}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="crm-row-actions">
                <button
                  aria-label={`Message ${l.name}`}
                  onClick={() => chat(l.id)}
                >
                  <MessageCircle />
                </button>
                <button
                  aria-label={`Edit ${l.name}`}
                  onClick={() => modal({ kind: "lead", id: l.id })}
                >
                  <Pencil />
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <Empty text="No leads match these filters." />
  );
}
function LeadsView({
  initialStage = "All",
  initialBoard = false,
}: {
  initialStage?: string;
  initialBoard?: boolean;
}) {
  const { s, change, modal, openLead } = useCRM();
  const [search, setSearch] = useState(""),
    [stage, setStage] = useState(initialStage),
    [source, setSource] = useState("All"),
    [industry, setIndustry] = useState("All"),
    [min, setMin] = useState(0),
    [archived, setArchived] = useState(false),
    [board, setBoard] = useState(initialBoard);
  const ls = s.leads.filter(
    (l) =>
      l.archived === archived &&
      `${l.name} ${l.company} ${l.phone} ${l.id}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (stage === "All" || l.stage === stage) &&
      (source === "All" || l.source === source) &&
      (industry === "All" || l.industry === industry) &&
      l.seats >= min,
  );
  return (
    <>
      <Heading
        title="Lead command center"
        sub={`${ls.length} matching leads · Capture, qualify and manage opportunities.`}
      >
        <Action onClick={() => leadCSV(ls)}>
          <Download />
          Export CSV
        </Action>
        <Action primary onClick={() => modal({ kind: "lead" })}>
          <Plus />
          Add lead
        </Action>
      </Heading>
      <div className="crm-toolbar panel">
        <input
          aria-label="Search leads"
          placeholder="Name, company, phone or lead ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Pick
          label="Lead stage filter"
          value={stage}
          onChange={setStage}
          options={["All", ...STAGES]}
        />
        <Pick
          label="Lead source filter"
          value={source}
          onChange={setSource}
          options={["All", ...SOURCES]}
        />
        <Pick
          label="Business type filter"
          value={industry}
          onChange={setIndustry}
          options={["All", ...INDUSTRIES]}
        />
        <input
          type="number"
          min={0}
          aria-label="Minimum seats"
          title="Minimum seats"
          value={min || ""}
          placeholder="Min seats"
          onChange={(e) => setMin(Number(e.target.value))}
        />
        <Action
          onClick={() => {
            setSearch("");
            setStage("All");
            setSource("All");
            setIndustry("All");
            setMin(0);
          }}
        >
          Clear
        </Action>
      </div>
      <div className="crm-list-toolbar">
        <div className="crm-buttons">
          <Action onClick={() => setBoard(!board)}>
            {board ? <List /> : <Columns3 />}
            {board ? "Table view" : "Pipeline view"}
          </Action>
          <Action onClick={() => setArchived(!archived)}>
            {archived ? <RotateCcw /> : <Archive />}
            {archived ? "Active leads" : "Archived leads"}
          </Action>
        </div>
        <Action
          disabled={!ls.length}
          onClick={() =>
            change((x) => {
              ls.filter((l) => !["Won", "Lost"].includes(l.stage)).forEach(
                (l) => {
                  const row = x.leads.find((a) => a.id === l.id)!;
                  rescoreLead(row);
                },
              );
              activity(
                x,
                `Scored ${ls.filter((l) => !["Won", "Lost"].includes(l.stage)).length} leads with local qualification rules`,
              );
            }, "Lead scores updated")
          }
        >
          <Sparkles />
          Qualify filtered leads
        </Action>
      </div>
      {board ? (
        <div className="crm-kanban">
          {STAGES.map((st, i) => (
            <section key={st}>
              <h3 style={{ borderColor: colors[i] }}>
                {st}
                <span>{ls.filter((l) => l.stage === st).length}</span>
              </h3>
              {ls
                .filter((l) => l.stage === st)
                .map((l) => (
                  <article key={l.id}>
                    <button className="crm-link" onClick={() => openLead(l.id)}>
                      <b>{l.name}</b>
                      <small>{l.company}</small>
                    </button>
                    <p>
                      {l.seats} seats · {compactMoney(l.budget)}
                    </p>
                    <Pick
                      label={`Stage for ${l.name}`}
                      value={l.stage}
                      options={STAGES}
                      onChange={(v) =>
                        change((x) => {
                          x.leads.find((a) => a.id === l.id)!.stage =
                            v as Stage;
                          activity(x, `${l.name} moved to ${v}`, l.id);
                        })
                      }
                    />
                  </article>
                ))}
            </section>
          ))}
        </div>
      ) : (
        <section className="panel">
          <LeadTable leads={ls} />
        </section>
      )}
    </>
  );
}

function LeadDetail({ lead: l }: { lead: Lead }) {
  const { s, change, modal, chat, ask } = useCRM();
  const [note, setNote] = useState("");
  const tasks = s.tasks.filter((t) => t.leadId === l.id);
  const docs = s.documents.filter((d) => d.leadId === l.id);
  return (
    <>
      <SheetHeader>
        <SheetTitle>{l.name}</SheetTitle>
        <SheetDescription>
          {l.company} · {l.id}
        </SheetDescription>
      </SheetHeader>
      <div className="crm-sheet-body">
        <div className="crm-profile">
          <Avatar name={l.name} />
          <div>
            <Badge tone="violet">{l.industry}</Badge>
            <p>
              {l.email || "Email not supplied"}
              <br />
              {l.phone || "Phone not supplied"}
            </p>
          </div>
          <div className="crm-score">
            <b>{l.score}</b>
            <small>Intent score</small>
          </div>
        </div>
        <div className="crm-buttons">
          <Action onClick={() => modal({ kind: "lead", id: l.id })}>
            <Pencil />
            Edit
          </Action>
          <Action onClick={() => chat(l.id)}>
            <MessageCircle />
            Conversation
          </Action>
          <Action
            onClick={() => modal({ kind: "task", leadId: l.id, type: "Call" })}
          >
            <Phone />
            Log / plan call
          </Action>
        </div>
        <div className="crm-summary-ai">
          <b>
            <Sparkles /> Opportunity summary
          </b>
          <p>
            {l.company} needs {l.seats} seats in {l.location}. Monthly budget:{" "}
            {money(l.budget)}.{" "}
            {l.moveIn
              ? `Move-in preference: ${displayDate(l.moveIn)}.`
              : "Move-in date has not been confirmed."}{" "}
            {l.score >= 80
              ? "Suitable for a sales review and workspace visit."
              : "Collect missing requirements before preparing a proposal."}
          </p>
          <small>Computed from CRM fields · GPT is not connected</small>
        </div>
        <div className="crm-fields-two">
          <Field label="Pipeline stage">
            <Pick
              label="Pipeline stage"
              value={l.stage}
              options={STAGES}
              onChange={(v) =>
                change((x) => {
                  x.leads.find((a) => a.id === l.id)!.stage = v as Stage;
                  activity(x, `${l.name} moved to ${v}`, l.id);
                }, "Stage updated")
              }
            />
          </Field>
          <Field label="Sales owner">
            <Pick
              label="Sales owner"
              value={l.owner || "Unassigned"}
              options={[
                "Unassigned",
                ...s.settings.team
                  .filter(
                    (t) => t.role === "Sales" || t.role === "Administrator",
                  )
                  .map((t) => t.name),
              ]}
              onChange={(v) =>
                change((x) => {
                  x.leads.find((a) => a.id === l.id)!.owner = v;
                  activity(x, `${l.name} assigned to ${v}`, l.id);
                }, "Sales owner updated")
              }
            />
          </Field>
        </div>
        <div className="crm-detail-grid">
          {[
            ["Seats", String(l.seats)],
            ["Monthly budget", money(l.budget)],
            ["Location", l.location],
            ["Source", l.source],
            ["Move-in", l.moveIn ? displayDate(l.moveIn) : "Not confirmed"],
            ["Messaging opt-in", l.consent ? "Recorded" : "Not recorded"],
          ].map(([a, b]) => (
            <div key={a}>
              <small>{a}</small>
              <b>{b}</b>
            </div>
          ))}
        </div>
        <div className="crm-section-head">
          <h3>Sales actions</h3>
          <Action onClick={() => modal({ kind: "task", leadId: l.id })}>
            <Plus />
            Schedule
          </Action>
        </div>
        {tasks.map((t) => (
          <div className="crm-task" key={t.id}>
            <CalendarDays />
            <span>
              <b>
                {t.type} · {t.completed ? "Completed" : "Open"}
              </b>
              <small>
                {displayDate(t.due)} · {t.owner}
              </small>
              <small>{t.note}</small>
            </span>
            <button
              className="crm-icon"
              aria-label={`Edit task ${t.id}`}
              onClick={() => modal({ kind: "task", id: t.id })}
            >
              <Pencil />
            </button>
            <button
              className="crm-icon"
              aria-label={`Toggle task ${t.id}`}
              onClick={() =>
                change((x) => {
                  x.tasks.find((a) => a.id === t.id)!.completed = !t.completed;
                  activity(
                    x,
                    `${t.type} ${t.completed ? "reopened" : "completed"}`,
                    l.id,
                  );
                })
              }
            >
              {t.completed ? <RotateCcw /> : <Check />}
            </button>
          </div>
        ))}
        {!tasks.length && (
          <p className="crm-muted">No sales actions scheduled.</p>
        )}
        <div className="crm-section-head">
          <h3>Commercial documents</h3>
          <Action onClick={() => modal({ kind: "document", leadId: l.id })}>
            <Plus />
            Generate
          </Action>
        </div>
        {docs.map((d) => (
          <button
            className="crm-document-link"
            key={d.id}
            onClick={() => modal({ kind: "preview", id: d.id })}
          >
            <FileText />
            <span>
              <b>
                {d.id} · {d.type}
              </b>
              <small>{money(documentTotal(d))}</small>
            </span>
            <Badge tone="blue">{d.status}</Badge>
          </button>
        ))}
        <h3>Notes</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            if (
              change((x) => {
                x.leads
                  .find((a) => a.id === l.id)!
                  .notes.unshift({
                    id: uid("NOTE"),
                    text: note.trim(),
                    at: now(),
                  });
                activity(x, `Note added to ${l.name}`, l.id);
              }, "Note saved")
            )
              setNote("");
          }}
        >
          <textarea
            aria-label="Lead note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add requirements, call notes or objections…"
            maxLength={10000}
          />
          <Action primary type="submit" disabled={!note.trim()}>
            Save note
          </Action>
        </form>
        {l.notes.map((n) => (
          <div className="crm-note" key={n.id}>
            <p>{n.text}</p>
            <small>{displayDate(n.at)}</small>
          </div>
        ))}
        <h3>Activity timeline</h3>
        {s.activities
          .filter((a) => a.leadId === l.id)
          .map((a) => (
            <div className="crm-note" key={a.id}>
              <b>{a.text}</b>
              <small>{displayDate(a.at)}</small>
            </div>
          ))}
        <div className="crm-buttons crm-bottom-actions">
          <Action
            onClick={() =>
              change((x) => {
                const r = x.leads.find((a) => a.id === l.id)!;
                rescoreLead(r);
                activity(x, `${l.name} qualified with local rules`, l.id);
              }, "Intent score updated")
            }
          >
            <Sparkles />
            Recalculate score
          </Action>
          <Action
            onClick={() =>
              ask(
                l.archived ? "Restore lead?" : "Archive lead?",
                "Records, messages and commercial history will remain available.",
                () =>
                  change((x) => {
                    x.leads.find((a) => a.id === l.id)!.archived = !l.archived;
                    activity(
                      x,
                      `${l.name} ${l.archived ? "restored" : "archived"}`,
                      l.id,
                    );
                  }, "Lead updated"),
              )
            }
          >
            {l.archived ? <RotateCcw /> : <Archive />}
            {l.archived ? "Restore" : "Archive"}
          </Action>
        </div>
      </div>
    </>
  );
}

function ModalBody({ m }: { m: NonNullable<Modal> }) {
  return m.kind === "lead" ? (
    <LeadForm id={m.id} />
  ) : m.kind === "task" ? (
    <TaskForm m={m} />
  ) : m.kind === "campaign" ? (
    <CampaignForm id={m.id} />
  ) : m.kind === "document" ? (
    <DocumentForm m={m} />
  ) : m.kind === "preview" ? (
    <DocumentPreview id={m.id!} />
  ) : m.kind === "payment" ? (
    <PaymentForm id={m.id!} />
  ) : m.kind === "expense" ? (
    <ExpenseForm id={m.id} />
  ) : m.kind === "integration" ? (
    <IntegrationForm provider={m.id || "WhatsApp Business"} />
  ) : m.kind === "notifications" ? (
    <Notifications />
  ) : (
    <Simulation />
  );
}
function LeadForm({ id }: { id?: string }) {
  const { s, change, modal } = useCRM();
  const existing = s.leads.find((l) => l.id === id);
  const sales = s.settings.team.filter(
    (t) => t.role === "Sales" || t.role === "Administrator",
  );
  const [f, setF] = useState(
    existing ||
      ({
        id: "",
        name: "",
        company: "",
        phone: "",
        email: "",
        industry: "IT / SaaS",
        source: "Manual",
        seats: 1,
        budget: 0,
        location: "OMR, Chennai",
        moveIn: "",
        stage: "New",
        owner: "Unassigned",
        consent: false,
        archived: false,
        score: 0,
        createdAt: "",
        notes: [],
      } as Lead),
  );
  const [error, setError] = useState("");
  const field = <K extends keyof Lead>(key: K, v: Lead[K]) =>
    setF({ ...f, [key]: v });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (
      !/^\+?[\d\s()-]{10,20}$/.test(f.phone) ||
      normalizePhone(f.phone).length !== 10
    ) {
      setError(
        "Enter a valid 10-digit phone number, optionally with country code.",
      );
      return;
    }
    if (
      s.leads.some(
        (l) =>
          l.id !== id && normalizePhone(l.phone) === normalizePhone(f.phone),
      )
    ) {
      setError(
        "A lead already exists with this phone number. Open and update that lead.",
      );
      return;
    }
    const success = change(
      (x) => {
        if (existing) {
          Object.assign(x.leads.find((l) => l.id === id)!, f);
          activity(x, `${f.name} details updated`, id);
        } else {
          const l = { ...f, id: uid("LD"), createdAt: now() };
          if (x.settings.autoAssign && l.owner === "Unassigned")
            l.owner =
              sales[x.leads.length % sales.length]?.name || "Unassigned";
          if (x.settings.autoQualify) l.score = qualify(l);
          x.leads.unshift(l);
          welcome(x, l);
          activity(x, `${l.name} captured from ${l.source}`, l.id);
        }
      },
      existing ? "Lead updated" : "Lead created",
    );
    if (success) modal(null);
  };
  return (
    <form className="crm-form" onSubmit={submit}>
      <div className="crm-fields-two">
        <Field label="Contact name">
          <input
            required
            maxLength={120}
            value={f.name}
            onChange={(e) => field("name", e.target.value)}
          />
        </Field>
        <Field label="Company">
          <input
            required
            maxLength={160}
            value={f.company}
            onChange={(e) => field("company", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            required
            inputMode="tel"
            value={f.phone}
            onChange={(e) => field("phone", e.target.value)}
            placeholder="10-digit phone"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={f.email}
            onChange={(e) => field("email", e.target.value)}
          />
        </Field>
        <Field label="Business type">
          <Pick
            label="Business type"
            value={f.industry}
            onChange={(v) => field("industry", v as Lead["industry"])}
            options={INDUSTRIES}
          />
        </Field>
        <Field label="Lead source">
          <Pick
            label="Lead source"
            value={f.source}
            onChange={(v) => field("source", v as Lead["source"])}
            options={SOURCES}
          />
        </Field>
        <Field label="Seats required">
          <input
            type="number"
            required
            min={1}
            max={10000}
            value={f.seats}
            onChange={(e) => field("seats", Number(e.target.value))}
          />
        </Field>
        <Field label="Monthly budget (₹)">
          <input
            type="number"
            min={0}
            max={100000000}
            required
            value={f.budget}
            onChange={(e) => field("budget", Number(e.target.value))}
          />
        </Field>
        <Field label="Location">
          <input
            required
            maxLength={160}
            value={f.location}
            onChange={(e) => field("location", e.target.value)}
          />
        </Field>
        <Field label="Move-in preference">
          <input
            type="date"
            value={f.moveIn}
            onChange={(e) => field("moveIn", e.target.value)}
          />
        </Field>
        <Field label="Sales stage">
          <Pick
            label="Sales stage"
            value={f.stage}
            onChange={(v) => field("stage", v as Stage)}
            options={STAGES}
          />
        </Field>
        <Field label="Assigned owner">
          <Pick
            label="Assigned owner"
            value={f.owner}
            onChange={(v) => field("owner", v)}
            options={["Unassigned", ...sales.map((t) => t.name)]}
          />
        </Field>
      </div>
      <div className="crm-toggle-row">
        <span>WhatsApp / campaign opt-in recorded</span>
        <Switch
          aria-label="Messaging opt-in"
          checked={f.consent}
          onCheckedChange={(v) => field("consent", v)}
        />
      </div>
      {error && (
        <p role="alert" className="crm-error">
          {error}
        </p>
      )}
      <div className="crm-form-footer">
        <Action onClick={() => modal(null)}>Cancel</Action>
        <Action primary type="submit">
          {existing ? "Save lead" : "Create lead"}
        </Action>
      </div>
    </form>
  );
}
function TaskForm({ m }: { m: NonNullable<Modal> }) {
  const { s, change, modal } = useCRM();
  const old = s.tasks.find((t) => t.id === m.id);
  const active = s.leads.filter((l) => !l.archived);
  const [leadId, setLeadId] = useState(
    old?.leadId || m.leadId || active[0]?.id || "",
  );
  const [type, setType] = useState(old?.type || m.type || "Site visit"),
    [due, setDue] = useState(old?.due || today() + "T16:30"),
    [owner, setOwner] = useState(
      old?.owner ||
        s.leads.find((l) => l.id === leadId)?.owner ||
        s.settings.team[0].name,
    ),
    [note, setNote] = useState(old?.note || "");
  if (!active.length && !old)
    return <Empty text="Add a lead before scheduling a sales action." />;
  return (
    <form
      className="crm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          change((x) => {
            const task = {
              id: old?.id || uid("TSK"),
              leadId,
              type: type as CRMState["tasks"][number]["type"],
              due,
              owner,
              note,
              completed: old?.completed || false,
            };
            if (old) Object.assign(x.tasks.find((t) => t.id === old.id)!, task);
            else x.tasks.push(task);
            const lead = x.leads.find((l) => l.id === leadId)!;
            if (
              type === "Site visit" &&
              ["New", "Enquiry", "Qualified"].includes(lead.stage)
            )
              lead.stage = "Site Visit";
            activity(
              x,
              `${type} ${old ? "updated" : "scheduled"} for ${x.leads.find((l) => l.id === leadId)!.name}`,
              leadId,
            );
          }, "Sales action saved")
        )
          modal(null);
      }}
    >
      <Field label="Lead">
        <LeadPick
          value={leadId}
          onChange={(v) => {
            setLeadId(v);
            setOwner(s.leads.find((l) => l.id === v)?.owner || owner);
          }}
        />
      </Field>
      <div className="crm-fields-two">
        <Field label="Action">
          <Pick
            label="Action type"
            value={type}
            onChange={setType}
            options={["Site visit", "Follow-up", "Call"]}
          />
        </Field>
        <Field label="Due date & time (India)">
          <input
            type="datetime-local"
            required
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Assigned owner">
        <Pick
          label="Task owner"
          value={owner}
          onChange={setOwner}
          options={["Unassigned", ...s.settings.team.map((t) => t.name)]}
        />
      </Field>
      <Field label="Notes / call details">
        <textarea
          maxLength={10000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      <div className="crm-form-footer">
        <Action onClick={() => modal(null)}>Cancel</Action>
        <Action primary type="submit">
          Save action
        </Action>
      </div>
    </form>
  );
}
function LeadPick({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { s } = useCRM();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="Select lead" className="crm-pick">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="crm-select">
        {s.leads
          .filter((l) => !l.archived || l.id === value)
          .map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name} · {l.company}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

function Conversations({ initial }: { initial: string }) {
  const { s, change, openLead, modal } = useCRM();
  const active = s.leads.filter((l) => !l.archived);
  const [id, setId] = useState(initial || active[0]?.id || "");
  const [filter, setFilter] = useState("Open"),
    [query, setQuery] = useState(""),
    [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Message["attachment"]>();
  const fileRef = useRef<HTMLInputElement>(null),
    bottom = useRef<HTMLDivElement>(null);
  const l = active.find((a) => a.id === id),
    messages = s.messages.filter((m) => m.leadId === id);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [id, messages.length]);
  const rows = active.filter(
    (l) =>
      `${l.name} ${l.company}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Unread" && s.unreadThreads.includes(l.id)) ||
        (filter === "Closed" && s.closedThreads.includes(l.id)) ||
        (filter === "Open" && !s.closedThreads.includes(l.id))),
  );
  const select = (leadId: string) => {
    setId(leadId);
    setText("");
    setAttachment(undefined);
    change((x) => {
      x.unreadThreads = x.unreadThreads.filter((a) => a !== leadId);
    });
  };
  const send = () => {
    if (!l || (!text.trim() && !attachment)) return;
    if (!l.consent) {
      toast.error("Record messaging opt-in in the lead profile first.");
      return;
    }
    if (
      change((x) => {
        x.messages.push({
          id: uid("MSG"),
          leadId: id,
          text: text.trim(),
          direction: "out",
          attachment,
          at: now(),
        });
        x.closedThreads = x.closedThreads.filter((a) => a !== id);
        activity(x, `Demo message saved for ${l.name}`, id);
      }, "Message saved in demo conversation")
    ) {
      setText("");
      setAttachment(undefined);
    }
  };
  return (
    <>
      <Heading
        title="Conversation inbox"
        sub="Shared WhatsApp demo inbox · Messages are stored locally."
      />
      <section className="crm-inbox panel">
        <aside className="crm-thread-list">
          <input
            aria-label="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
          />
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              {["Open", "Unread", "Closed", "All"].map((t) => (
                <TabsTrigger value={t} key={t}>
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {rows.map((row) => {
            const latest = s.messages.filter((m) => m.leadId === row.id).at(-1);
            return (
              <button
                key={row.id}
                className={row.id === id ? "selected" : ""}
                onClick={() => select(row.id)}
              >
                <Avatar name={row.name} />
                <span>
                  <b>
                    {row.name}
                    {s.unreadThreads.includes(row.id) && (
                      <i className="crm-unread" />
                    )}
                  </b>
                  <small>{row.company}</small>
                  <p>{latest?.text || "Start a new conversation"}</p>
                </span>
              </button>
            );
          })}
          {!rows.length && <Empty text="No conversations in this view." />}
        </aside>
        {l ? (
          <>
            <section className="crm-thread-main">
              <div className="crm-chat-head">
                <button
                  className="person crm-link"
                  onClick={() => openLead(l.id)}
                >
                  <Avatar name={l.name} />
                  <i>
                    <b>{l.name}</b>
                    <small>{l.company} · Demo WhatsApp</small>
                  </i>
                </button>
                <div className="crm-buttons">
                  <button
                    className="crm-icon"
                    title="Schedule call"
                    aria-label="Schedule call"
                    onClick={() =>
                      modal({ kind: "task", leadId: l.id, type: "Call" })
                    }
                  >
                    <Phone />
                  </button>
                  <Action
                    onClick={() =>
                      change((x) => {
                        if (x.closedThreads.includes(id))
                          x.closedThreads = x.closedThreads.filter(
                            (a) => a !== id,
                          );
                        else x.closedThreads.push(id);
                        activity(
                          x,
                          `Conversation ${s.closedThreads.includes(id) ? "reopened" : "closed"}`,
                          id,
                        );
                      }, "Conversation updated")
                    }
                  >
                    {s.closedThreads.includes(id) ? "Reopen" : "Close"}
                  </Action>
                </div>
              </div>
              <div className="crm-messages">
                {messages.map((m) => (
                  <div key={m.id} className={`crm-bubble ${m.direction}`}>
                    <p>{m.text}</p>
                    {m.attachment && (
                      <a href={m.attachment.data} download={m.attachment.name}>
                        <Paperclip />
                        {m.attachment.name}
                      </a>
                    )}
                    <small>
                      {m.direction === "in"
                        ? "Customer (demo)"
                        : m.direction === "system"
                          ? "CRM"
                          : "Sales (demo)"}{" "}
                      · {displayDate(m.at)}
                      {m.direction === "out" && <CheckCheck />}
                    </small>
                  </div>
                ))}
                {!messages.length && (
                  <Empty text="Choose a template or write the first message." />
                )}
                <div ref={bottom} />
              </div>
              <div className="crm-compose-tools">
                <Action
                  onClick={() =>
                    setText(
                      fillTemplate(s.settings.welcome, l, s.settings.brand),
                    )
                  }
                >
                  Welcome template
                </Action>
                <Action
                  onClick={() =>
                    setText(
                      fillTemplate(s.settings.followup, l, s.settings.brand),
                    )
                  }
                >
                  Follow-up template
                </Action>
                <Action
                  onClick={() =>
                    setText(
                      `Hi ${l.name}, we can discuss a ${l.seats}-seat workspace in ${l.location}, within your ${money(l.budget)} monthly budget. Would you prefer a site visit or a call?`,
                    )
                  }
                >
                  <Sparkles />
                  Suggest reply
                </Action>
                <Action
                  onClick={() =>
                    change((x) => {
                      appendMessage(
                        x,
                        id,
                        `Thank you. We need ${l.seats} seats in ${l.location}, with a monthly budget of ${money(l.budget)}. Please arrange a visit.`,
                        "in",
                      );
                      activity(
                        x,
                        `Simulated customer reply received from ${l.name}`,
                        id,
                      );
                    })
                  }
                >
                  Simulate customer reply
                </Action>
              </div>
              {attachment && (
                <div className="crm-attachment">
                  <Paperclip />
                  {attachment.name}
                  <button
                    aria-label="Remove attachment"
                    onClick={() => setAttachment(undefined)}
                  >
                    <X />
                  </button>
                </div>
              )}
              <form
                className="crm-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <input
                  hidden
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,text/plain"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 200000) {
                      toast.error(
                        "Choose an image or text file below 200 KB for local storage.",
                      );
                      return;
                    }
                    if (
                      !["image/png", "image/jpeg", "text/plain"].includes(
                        file.type,
                      )
                    ) {
                      toast.error("Choose PNG, JPEG or plain text.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () =>
                      setAttachment({
                        name: file.name,
                        data: String(reader.result),
                        mime: file.type as NonNullable<
                          Message["attachment"]
                        >["mime"],
                      });
                    reader.onerror = () =>
                      toast.error("Could not read attachment");
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="crm-icon"
                  aria-label="Attach file"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip />
                </button>
                <input
                  aria-label="Message text"
                  value={text}
                  maxLength={10000}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message…"
                />
                <Action
                  primary
                  type="submit"
                  disabled={!text.trim() && !attachment}
                >
                  <Send />
                  Send demo
                </Action>
              </form>
            </section>
            <aside className="crm-contact">
              <Avatar name={l.name} />
              <h3>{l.name}</h3>
              <p>{l.company}</p>
              <Badge>{l.score} / 100 intent</Badge>
              {[
                ["Seats", l.seats],
                ["Monthly budget", money(l.budget)],
                ["Location", l.location],
                ["Sales owner", l.owner],
                ["Stage", l.stage],
              ].map(([a, b]) => (
                <div key={a}>
                  <small>{a}</small>
                  <b>{b}</b>
                </div>
              ))}
              <Action onClick={() => openLead(l.id)}>Open lead</Action>
              <Action onClick={() => modal({ kind: "task", leadId: l.id })}>
                <CalendarDays />
                Schedule action
              </Action>
            </aside>
          </>
        ) : (
          <Empty text="Add or select a lead to start a conversation." />
        )}
      </section>
    </>
  );
}

function Campaigns() {
  const { s, modal, change, ask } = useCRM();
  const [filter, setFilter] = useState("All");
  const rows = s.campaigns.filter(
    (c) => filter === "All" || c.status === filter,
  );
  return (
    <>
      <Heading
        title="Campaigns & bulk messaging"
        sub="Segment your audience and test personalised messaging locally."
      >
        <Action
          onClick={() =>
            exportCSV("abundance-campaigns.csv", [
              [
                "ID",
                "Name",
                "Channel",
                "Status",
                "Recipients",
                "Scheduled",
                "Sent",
              ],
              ...rows.map((c) => [
                c.id,
                c.name,
                c.channel,
                c.status,
                c.recipientIds.length,
                c.scheduledAt,
                c.sentAt || "",
              ]),
            ])
          }
        >
          <Download />
          Export
        </Action>
        <Action primary onClick={() => modal({ kind: "campaign" })}>
          <Plus />
          New campaign
        </Action>
      </Heading>
      <div className="metrics three">
        <Metric
          icon={Megaphone}
          name="Campaigns"
          value={String(s.campaigns.length)}
          note={`${s.campaigns.filter((c) => c.status === "Draft").length} drafts`}
        />
        <Metric
          icon={Send}
          name="Demo dispatches"
          value={String(
            s.campaigns.filter((c) => c.status === "Completed").length,
          )}
          note="No external channel delivery"
        />
        <Metric
          icon={Users}
          name="Recipient deliveries"
          value={String(
            s.campaigns
              .filter((c) => c.status === "Completed")
              .reduce((a, c) => a + c.recipientIds.length, 0),
          )}
          note="Recorded in campaign history"
        />
      </div>
      <div className="crm-list-toolbar">
        <Pick
          label="Campaign status filter"
          value={filter}
          onChange={setFilter}
          options={["All", "Draft", "Scheduled", "Completed", "Cancelled"]}
        />
        <span className="crm-muted">
          Scheduled campaigns run when you select “Run due campaigns”.
        </span>
        <Action
          onClick={() => {
            const due = s.campaigns.filter(
              (c) =>
                c.status === "Scheduled" &&
                c.scheduledAt &&
                new Date(c.scheduledAt + "+05:30").getTime() <= Date.now(),
            );
            if (!due.length) {
              toast.info("No campaigns are due yet.");
              return;
            }
            ask(
              "Run due campaigns?",
              `${due.length} due campaigns will record simulated deliveries.`,
              () =>
                change((x) => {
                  due.forEach((c) => {
                    const row = x.campaigns.find((a) => a.id === c.id)!;
                    if (campaignRecipients(x, row).length)
                      dispatchCampaign(x, row);
                    else
                      activity(
                        x,
                        `${row.name} skipped: no eligible recipients`,
                      );
                  });
                }, "Due campaign processing complete"),
            );
          }}
        >
          Run due campaigns
        </Action>
      </div>
      <section className="panel">
        <Table className="crm-table">
          <TableHeader>
            <TableRow>
              {["Campaign", "Audience", "Recipients", "Status", "Actions"].map(
                (h) => (
                  <TableHead key={h}>{h}</TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <button
                    className="crm-link"
                    onClick={() => modal({ kind: "campaign", id: c.id })}
                  >
                    <b>{c.name}</b>
                    <small>
                      {c.channel} · {c.id}
                    </small>
                  </button>
                </TableCell>
                <TableCell>
                  {c.industry} · {c.stage}
                  <small>
                    {c.scheduledAt ? displayDate(c.scheduledAt) : "No schedule"}
                  </small>
                </TableCell>
                <TableCell>
                  {c.status === "Completed"
                    ? c.recipientIds.length
                    : campaignRecipients(s, c).length}
                </TableCell>
                <TableCell>
                  <Badge tone={c.status === "Completed" ? "green" : "violet"}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Action onClick={() => modal({ kind: "campaign", id: c.id })}>
                    {c.status === "Completed" ? "View report" : "Manage"}
                  </Action>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty text="No campaigns in this view." />}
      </section>
    </>
  );
}
function Documents() {
  const { s, modal } = useCRM();
  const [type, setType] = useState("All"),
    [query, setQuery] = useState("");
  const rows = s.documents.filter(
    (d) =>
      (type === "All" || d.type === type) &&
      `${d.id} ${d.customer.company} ${d.customer.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="Commercial documents"
        sub="Generate and download proposals, quotations, invoices and sample agreements."
      >
        <Action primary onClick={() => modal({ kind: "document" })}>
          <Plus />
          Generate document
        </Action>
      </Heading>
      <div className="docgrid">
        {DOC_TYPES.map((t) => (
          <div className="panel" key={t}>
            <FileText />
            <small>{t}</small>
            <b>
              {
                s.documents.filter(
                  (d) => d.type === t && d.status !== "Cancelled",
                ).length
              }{" "}
              documents
            </b>
            <Action onClick={() => setType(t)}>View {t.toLowerCase()}s</Action>
          </div>
        ))}
      </div>
      <div className="crm-toolbar panel">
        <input
          aria-label="Search documents"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Document ID or company"
        />
        <Pick
          label="Document type filter"
          value={type}
          onChange={setType}
          options={["All", ...DOC_TYPES]}
        />
        <Action
          onClick={() => {
            setType("All");
            setQuery("");
          }}
        >
          Clear
        </Action>
      </div>
      <DocumentTable rows={rows} />
    </>
  );
}
function DocumentTable({ rows }: { rows: CRMDocument[] }) {
  const { s, modal } = useCRM();
  return (
    <section className="panel">
      <Table className="crm-table">
        <TableHeader>
          <TableRow>
            {["Document", "Customer", "Monthly total", "Status", "Actions"].map(
              (h) => (
                <TableHead key={h}>{h}</TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <button
                  className="crm-link"
                  onClick={() => modal({ kind: "preview", id: d.id })}
                >
                  <b>{d.id}</b>
                  <small>
                    {d.type} · {displayDate(d.date)}
                  </small>
                </button>
              </TableCell>
              <TableCell>
                {d.customer.company}
                <small>{d.customer.name}</small>
              </TableCell>
              <TableCell>
                {money(documentTotal(d))}
                <small>Deposit: {money(d.deposit)} separate</small>
              </TableCell>
              <TableCell>
                <Badge tone="blue">
                  {d.type === "Invoice" ? invoiceStatus(s, d) : d.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="crm-buttons">
                  <Action onClick={() => modal({ kind: "preview", id: d.id })}>
                    Preview
                  </Action>
                  <button
                    className="crm-icon"
                    aria-label={`Download ${d.id}`}
                    onClick={() =>
                      download(
                        `${d.id}.html`,
                        documentHTML(d, s),
                        "text/html;charset=utf-8",
                      )
                    }
                  >
                    <Download />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!rows.length && (
        <Empty text="No matching documents. Generate a document from a lead." />
      )}
    </section>
  );
}
function newDocument(
  s: CRMState,
  l: Lead,
  type: CRMDocument["type"],
): CRMDocument {
  const fee = Math.round(l.budget / l.seats);
  return {
    id: uid(
      type === "Invoice" ? "INV" : type === "Rental Agreement" ? "AGR" : "QTN",
    ),
    leadId: l.id,
    type,
    status: "Draft",
    seats: l.seats,
    fee,
    tax: s.settings.tax,
    deposit: type === "Invoice" ? 0 : fee * l.seats * s.settings.depositMonths,
    terms: s.settings.terms,
    date: today(),
    dueDate: today(),
    createdAt: now(),
    issuer: {
      brand: s.settings.brand,
      address: s.settings.address,
      email: s.settings.email,
    },
    customer: {
      name: l.name,
      company: l.company,
      location: l.location,
      email: l.email,
    },
  };
}
function DocumentForm({ m }: { m: NonNullable<Modal> }) {
  const { s, change, modal } = useCRM();
  const old = s.documents.find((d) => d.id === m.id);
  const first =
    s.leads.find((l) => l.id === (m.leadId || old?.leadId)) ||
    s.leads.find((l) => !l.archived);
  const [f, setF] = useState<CRMDocument | null>(
    first
      ? old ||
          newDocument(s, first, (m.type || "Proposal") as CRMDocument["type"])
      : null,
  );
  const [error, setError] = useState("");
  if (!f)
    return <Empty text="Add a lead before generating a commercial document." />;
  const paid = old ? paidAmount(s, old) : 0;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (f.dueDate < f.date) {
      setError("Due / valid-until date cannot be before issue date.");
      return;
    }
    if (documentTotal(f) < paid) {
      setError("Invoice total cannot be reduced below its recorded payments.");
      return;
    }
    if (old && old.status !== "Draft") {
      setError(
        "Only draft documents can be edited. Duplicate an issued document to revise it.",
      );
      return;
    }
    if (
      change((x) => {
        if (old) Object.assign(x.documents.find((d) => d.id === f.id)!, f);
        else {
          x.documents.unshift(f);
          const l = x.leads.find((l) => l.id === f.leadId)!;
          if (
            ["Proposal", "Quotation"].includes(f.type) &&
            ["New", "Enquiry", "Qualified", "Site Visit"].includes(l.stage)
          )
            l.stage = "Proposal";
        }
        activity(
          x,
          `${f.type} ${f.id} ${old ? "updated" : "generated"}`,
          f.leadId,
        );
      }, "Document saved")
    )
      modal({ kind: "preview", id: f.id });
  };
  return (
    <form className="crm-form" onSubmit={submit}>
      <Field label="Customer lead">
        <LeadPick
          value={f.leadId}
          onChange={(v) => {
            const l = s.leads.find((l) => l.id === v)!;
            setF({
              ...newDocument(s, l, f.type),
              id: f.id,
              createdAt: f.createdAt,
            });
          }}
        />
      </Field>
      <div className="crm-fields-two">
        <Field label="Document type">
          <Pick
            label="Document type"
            value={f.type}
            options={DOC_TYPES}
            onChange={(v) =>
              setF({
                ...f,
                type: v as CRMDocument["type"],
                deposit: v === "Invoice" ? 0 : f.deposit,
              })
            }
          />
        </Field>
        <Field label="Seats">
          <input
            required
            type="number"
            min={1}
            max={10000}
            value={f.seats}
            onChange={(e) => setF({ ...f, seats: Number(e.target.value) })}
          />
        </Field>
        <Field label="Service fee per seat / month (₹)">
          <input
            required
            type="number"
            min={0}
            max={100000000}
            step="0.01"
            value={f.fee}
            onChange={(e) => setF({ ...f, fee: Number(e.target.value) })}
          />
        </Field>
        <Field label="Tax rate (%) · demo configuration">
          <input
            required
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={f.tax}
            onChange={(e) => setF({ ...f, tax: Number(e.target.value) })}
          />
        </Field>
        <Field label="Refundable deposit (separate ₹)">
          <input
            required
            type="number"
            min={0}
            max={100000000}
            step="0.01"
            value={f.deposit}
            onChange={(e) => setF({ ...f, deposit: Number(e.target.value) })}
          />
        </Field>
        <Field label="Issue date">
          <input
            required
            type="date"
            value={f.date}
            onChange={(e) => setF({ ...f, date: e.target.value })}
          />
        </Field>
        <Field label="Due / valid until">
          <input
            required
            type="date"
            value={f.dueDate}
            onChange={(e) => setF({ ...f, dueDate: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Terms & conditions">
        <textarea
          required
          maxLength={10000}
          value={f.terms}
          onChange={(e) => setF({ ...f, terms: e.target.value })}
        />
      </Field>
      <div className="crm-price-summary">
        <span>
          Base rent<b>₹0</b>
        </span>
        <span>
          Service fee<b>{money(documentSubtotal(f))}</b>
        </span>
        <span>
          Tax<b>{money(documentTotal(f) - documentSubtotal(f))}</b>
        </span>
        <span>
          Monthly total<b>{money(documentTotal(f))}</b>
        </span>
      </div>
      {error && (
        <p role="alert" className="crm-error">
          {error}
        </p>
      )}
      <div className="crm-form-footer">
        <Action onClick={() => modal(null)}>Cancel</Action>
        <Action primary type="submit">
          Save & preview
        </Action>
      </div>
    </form>
  );
}
function DocumentPreview({ id }: { id: string }) {
  const { s, change, modal, ask } = useCRM();
  const d = s.documents.find((d) => d.id === id);
  const frame = useRef<HTMLIFrameElement>(null);
  if (!d) return <Empty text="Document not found." />;
  const setStatus = (status: CRMDocument["status"]) => {
    if (status === "Cancelled" && paidAmount(s, d) > 0) {
      toast.error("An invoice with recorded payments cannot be cancelled.");
      return;
    }
    change((x) => {
      x.documents.find((a) => a.id === id)!.status = status;
      const l = x.leads.find((l) => l.id === d.leadId)!;
      if (status === "Signed" && d.type === "Rental Agreement") l.stage = "Won";
      if (
        status === "Accepted" &&
        ["Proposal", "Quotation"].includes(d.type) &&
        !["Won", "Lost"].includes(l.stage)
      )
        l.stage = "Negotiation";
      if (status === "Sent" && l.consent)
        appendMessage(
          x,
          d.leadId,
          `${d.issuer.brand}: ${d.type} ${d.id} is ready for review. Monthly total ${money(documentTotal(d))}. (Local demo delivery)`,
        );
      activity(x, `${d.type} ${d.id}: ${status}`, d.leadId);
    }, "Document status updated");
  };
  return (
    <div className="crm-form">
      <div className="crm-buttons">
        <Badge tone="blue">
          {d.type === "Invoice" ? invoiceStatus(s, d) : d.status}
        </Badge>
        <Action
          onClick={() =>
            download(
              `${d.id}.html`,
              documentHTML(d, s),
              "text/html;charset=utf-8",
            )
          }
        >
          <Download />
          Download HTML
        </Action>
        <Action
          onClick={() => {
            frame.current?.contentWindow?.focus();
            frame.current?.contentWindow?.print();
          }}
        >
          Print / save PDF
        </Action>
        {d.status === "Draft" && (
          <Action onClick={() => modal({ kind: "document", id: d.id })}>
            <Pencil />
            Edit
          </Action>
        )}
      </div>
      <iframe
        ref={frame}
        className="crm-document-frame"
        title={`${d.id} printable document`}
        sandbox="allow-same-origin allow-modals"
        srcDoc={documentHTML(d, s)}
      />
      <div className="crm-form-footer">
        {d.status !== "Cancelled" && (
          <>
            <Action
              onClick={() =>
                change((x) => {
                  x.documents.unshift({
                    ...d,
                    id: uid(d.type === "Invoice" ? "INV" : "DOC"),
                    status: "Draft",
                    createdAt: now(),
                    date: today(),
                    dueDate: d.dueDate < today() ? today() : d.dueDate,
                  });
                  activity(x, `${d.id} duplicated`, d.leadId);
                }, "Draft copy created")
              }
            >
              Duplicate draft
            </Action>
            {d.status === "Draft" && (
              <Action onClick={() => setStatus("Sent")}>
                Simulate sending
              </Action>
            )}
            {["Proposal", "Quotation"].includes(d.type) &&
              d.status === "Sent" && (
                <Action primary onClick={() => setStatus("Accepted")}>
                  Record acceptance
                </Action>
              )}
            {d.type === "Rental Agreement" && d.status !== "Signed" && (
              <Action
                primary
                onClick={() =>
                  ask(
                    "Record demo signature?",
                    "This records a local signature status and moves the lead to Won; it does not verify an external e-signature.",
                    () => setStatus("Signed"),
                  )
                }
              >
                Record demo signature
              </Action>
            )}
            {d.type === "Invoice" && balance(s, d) > 0 && (
              <Action
                primary
                onClick={() => modal({ kind: "payment", id: d.id })}
              >
                Record payment
              </Action>
            )}
            {d.status !== "Signed" && (
              <Action
                onClick={() =>
                  ask(
                    "Cancel document?",
                    "The document stays in history as Cancelled.",
                    () => setStatus("Cancelled"),
                  )
                }
              >
                Cancel document
              </Action>
            )}
          </>
        )}
      </div>
    </div>
  );
}
function Billing() {
  const { s, modal } = useCRM();
  const [status, setStatus] = useState("All"),
    [query, setQuery] = useState("");
  const invoices = s.documents.filter((d) => d.type === "Invoice"),
    active = invoices.filter((d) => d.status !== "Cancelled");
  const rows = invoices.filter(
    (d) =>
      (status === "All" || invoiceStatus(s, d) === status) &&
      `${d.id} ${d.customer.company}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="Billing & collections"
        sub="Invoice totals and balances update when payments are recorded."
      >
        <Action
          onClick={() =>
            exportCSV("abundance-invoices.csv", [
              [
                "Invoice",
                "Company",
                "Total",
                "Paid",
                "Balance",
                "Status",
                "Due",
              ],
              ...rows.map((d) => [
                d.id,
                d.customer.company,
                documentTotal(d),
                paidAmount(s, d),
                balance(s, d),
                invoiceStatus(s, d),
                d.dueDate,
              ]),
            ])
          }
        >
          <Download />
          Export invoices
        </Action>
        <Action
          primary
          onClick={() => modal({ kind: "document", type: "Invoice" })}
        >
          <Plus />
          New invoice
        </Action>
      </Heading>
      <div className="metrics three">
        <Metric
          icon={Receipt}
          name="Total billed"
          value={compactMoney(active.reduce((a, d) => a + documentTotal(d), 0))}
          note={`${active.length} active invoices`}
        />
        <Metric
          icon={IndianRupee}
          name="Collected"
          value={compactMoney(active.reduce((a, d) => a + paidAmount(s, d), 0))}
          note="Recorded receipts"
        />
        <Metric
          icon={Target}
          name="Outstanding"
          value={compactMoney(active.reduce((a, d) => a + balance(s, d), 0))}
          note={`${active.filter((d) => invoiceStatus(s, d) === "Overdue").length} overdue invoices`}
        />
      </div>
      <div className="crm-toolbar panel">
        <input
          aria-label="Search invoices"
          placeholder="Invoice ID or company"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Pick
          label="Invoice status filter"
          value={status}
          onChange={setStatus}
          options={["All", "Due", "Overdue", "Part paid", "Paid", "Cancelled"]}
        />
      </div>
      <section className="panel">
        <Table className="crm-table">
          <TableHeader>
            <TableRow>
              {[
                "Invoice",
                "Customer",
                "Total",
                "Received",
                "Balance",
                "Status",
                "Actions",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <button
                    className="crm-link"
                    onClick={() => modal({ kind: "preview", id: d.id })}
                  >
                    <b>{d.id}</b>
                    <small>Due {displayDate(d.dueDate)}</small>
                  </button>
                </TableCell>
                <TableCell>{d.customer.company}</TableCell>
                <TableCell>{money(documentTotal(d))}</TableCell>
                <TableCell>{money(paidAmount(s, d))}</TableCell>
                <TableCell>{money(balance(s, d))}</TableCell>
                <TableCell>
                  <Badge tone="blue">{invoiceStatus(s, d)}</Badge>
                </TableCell>
                <TableCell>
                  <Action
                    disabled={balance(s, d) === 0 || d.status === "Cancelled"}
                    onClick={() => modal({ kind: "payment", id: d.id })}
                  >
                    Record payment
                  </Action>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty text="No matching invoices." />}
      </section>
    </>
  );
}
function PaymentForm({ id }: { id: string }) {
  const { s, change, modal } = useCRM();
  const d = s.documents.find((d) => d.id === id);
  const [amount, setAmount] = useState(d ? balance(s, d) : 0),
    [date, setDate] = useState(today()),
    [method, setMethod] = useState("Bank transfer"),
    [reference, setReference] = useState(""),
    [error, setError] = useState("");
  if (!d || d.type !== "Invoice") return <Empty text="Invoice not found." />;
  return (
    <form
      className="crm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (d.status === "Cancelled" || amount <= 0 || amount > balance(s, d)) {
          setError(
            "Amount must be positive and cannot exceed the remaining invoice balance.",
          );
          return;
        }
        if (
          change((x) => {
            x.payments.push({
              id: uid("PAY"),
              documentId: id,
              amount,
              date,
              method: method as CRMState["payments"][number]["method"],
              reference,
            });
            if (x.documents.find((a) => a.id === id)!.status === "Draft")
              x.documents.find((a) => a.id === id)!.status = "Sent";
            activity(x, `${money(amount)} received against ${id}`, d.leadId);
          }, "Payment recorded; invoice balance updated")
        )
          modal(null);
      }}
    >
      <div className="crm-summary-ai">
        <b>
          {d.id} · {d.customer.company}
        </b>
        <p>Remaining balance: {money(balance(s, d))}</p>
      </div>
      <Field label="Payment amount (₹)">
        <input
          type="number"
          required
          min={0.01}
          max={balance(s, d)}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </Field>
      <div className="crm-fields-two">
        <Field label="Payment date">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Payment method">
          <Pick
            label="Payment method"
            value={method}
            onChange={setMethod}
            options={["Bank transfer", "UPI", "Cash", "Card"]}
          />
        </Field>
      </div>
      <Field label="Reference / receipt details">
        <input
          required
          maxLength={300}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </Field>
      {error && (
        <p className="crm-error" role="alert">
          {error}
        </p>
      )}
      <div className="crm-form-footer">
        <Action onClick={() => modal(null)}>Cancel</Action>
        <Action primary type="submit">
          Record payment
        </Action>
      </div>
    </form>
  );
}
function Accounts() {
  const { s, modal } = useCRM();
  const [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const inRange = (date: string) =>
    (!from || date >= from) && (!to || date <= to);
  const payments = s.payments.filter((p) => inRange(p.date)),
    expenses = s.expenses.filter((e) => inRange(e.date));
  const collected = payments.reduce((a, p) => a + p.amount, 0),
    spent = expenses.reduce((a, e) => a + e.amount, 0);
  const rows = [
    ...payments.map((p) => ({
      id: p.id,
      date: p.date,
      kind: "Receipt",
      name:
        s.documents.find((d) => d.id === p.documentId)?.customer.company ||
        p.documentId,
      amount: p.amount,
      reference: p.reference,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      date: e.date,
      kind: "Expense",
      name: e.category,
      amount: -e.amount,
      reference: e.description,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <Heading
        title="Accounts ledger"
        sub="Collections and operating expenses from your recorded transactions."
      >
        <Action
          onClick={() =>
            exportCSV("abundance-ledger.csv", [
              ["ID", "Date", "Type", "Account", "Amount", "Reference"],
              ...rows.map((r) => [
                r.id,
                r.date,
                r.kind,
                r.name,
                r.amount,
                r.reference,
              ]),
            ])
          }
        >
          <Download />
          Export ledger
        </Action>
        <Action primary onClick={() => modal({ kind: "expense" })}>
          <Plus />
          Add expense
        </Action>
      </Heading>
      <div className="metrics three">
        <Metric
          icon={IndianRupee}
          name="Collections"
          value={compactMoney(collected)}
          note={`${payments.length} receipts in this range`}
        />
        <Metric
          icon={Landmark}
          name="Operating expenses"
          value={compactMoney(spent)}
          note={`${expenses.length} expense entries`}
        />
        <Metric
          icon={TrendingUp}
          name="Net cash flow"
          value={compactMoney(collected - spent)}
          note="Collections less expenses"
        />
      </div>
      <div className="crm-toolbar panel">
        <Field label="From date">
          <input
            aria-label="Ledger from date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="To date">
          <input
            aria-label="Ledger to date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Field>
        <Action
          onClick={() => {
            setFrom("");
            setTo("");
          }}
        >
          All dates
        </Action>
      </div>
      {from && to && from > to && (
        <p className="crm-error">From date must be on or before to date.</p>
      )}
      <section className="panel">
        <Table className="crm-table">
          <TableHeader>
            <TableRow>
              {[
                "Date",
                "Transaction",
                "Account",
                "Reference",
                "Amount",
                "Action",
              ].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{displayDate(r.date)}</TableCell>
                <TableCell>
                  <Badge tone={r.kind === "Receipt" ? "green" : "violet"}>
                    {r.kind}
                  </Badge>
                  <small>{r.id}</small>
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell className="crm-wrap-cell">{r.reference}</TableCell>
                <TableCell>{money(r.amount)}</TableCell>
                <TableCell>
                  {r.kind === "Expense" ? (
                    <Action
                      onClick={() => modal({ kind: "expense", id: r.id })}
                    >
                      Edit
                    </Action>
                  ) : (
                    <Action
                      onClick={() => {
                        const p = s.payments.find((a) => a.id === r.id)!;
                        exportCSV(`${p.id}-receipt.csv`, [
                          [
                            "Brand",
                            "Receipt",
                            "Invoice",
                            "Amount",
                            "Date",
                            "Method",
                            "Reference",
                          ],
                          [
                            s.settings.brand,
                            p.id,
                            p.documentId,
                            p.amount,
                            p.date,
                            p.method,
                            p.reference,
                          ],
                        ]);
                      }}
                    >
                      Download receipt
                    </Action>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && <Empty text="No transactions in this date range." />}
      </section>
    </>
  );
}
function ExpenseForm({ id }: { id?: string }) {
  const { s, change, modal } = useCRM();
  const old = s.expenses.find((e) => e.id === id);
  const [f, setF] = useState(
    old || {
      id: "",
      category: "Utilities",
      description: "",
      amount: 0,
      date: today(),
    },
  );
  return (
    <form
      className="crm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          change((x) => {
            if (old) Object.assign(x.expenses.find((a) => a.id === id)!, f);
            else x.expenses.push({ ...f, id: uid("EXP") });
            activity(x, `${money(f.amount)} expense recorded: ${f.category}`);
          }, "Expense saved")
        )
          modal(null);
      }}
    >
      <Field label="Expense category">
        <Pick
          label="Expense category"
          value={f.category}
          onChange={(v) => setF({ ...f, category: v })}
          options={[
            "Utilities",
            "Maintenance",
            "Marketing",
            "Payroll",
            "Supplies",
            "Other",
          ]}
        />
      </Field>
      <Field label="Description">
        <input
          required
          maxLength={500}
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
        />
      </Field>
      <div className="crm-fields-two">
        <Field label="Amount (₹)">
          <input
            required
            type="number"
            min={0.01}
            max={100000000}
            step="0.01"
            value={f.amount}
            onChange={(e) => setF({ ...f, amount: Number(e.target.value) })}
          />
        </Field>
        <Field label="Date">
          <input
            required
            type="date"
            value={f.date}
            onChange={(e) => setF({ ...f, date: e.target.value })}
          />
        </Field>
      </div>
      <div className="crm-form-footer">
        <Action onClick={() => modal(null)}>Cancel</Action>
        <Action primary type="submit">
          Save expense
        </Action>
      </div>
    </form>
  );
}

function Integrations() {
  const { s, modal } = useCRM();
  return (
    <>
      <Heading
        title="Integrations & lead sources"
        sub="Configure demo routing and test the flow before adding live provider services."
      />
      <div className="integrations">
        {s.integrations.map((p, i) => {
          const I = [
            MessageCircle,
            Megaphone,
            Globe2,
            Globe2,
            Phone,
            Mail,
            Bot,
          ][i];
          return (
            <section className="panel crm-integration-card" key={p.provider}>
              <i>
                <I />
              </i>
              <Badge tone={p.enabled ? "green" : "blue"}>
                {p.enabled ? "Demo enabled" : "Not configured"}
              </Badge>
              <h3>{p.provider}</h3>
              <p>
                {p.provider === "GPT qualification"
                  ? "Local scoring is available. Live GPT needs a backend API key."
                  : p.provider === "WhatsApp Business"
                    ? "Test welcome messages and shared conversations locally."
                    : "Configure source attribution and capture a test enquiry."}
              </p>
              <small>
                {p.lastTest
                  ? `Last test: ${displayDate(p.lastTest)}`
                  : "No tests recorded"}
              </small>
              <Action
                onClick={() => modal({ kind: "integration", id: p.provider })}
              >
                Configure & test
              </Action>
            </section>
          );
        })}
      </div>
      <section className="panel crm-integration-note">
        <h3>Live connection requirements</h3>
        <p>
          These settings control the local demo. Live WhatsApp delivery,
          provider webhooks, OAuth and GPT calls require server-side credentials
          and a deployed backend. No API secrets are stored in this browser.
        </p>
        <div className="crm-flow">
          {[
            "Ad enquiry",
            "Capture & deduplicate",
            "Collect requirements",
            "Score & assign",
            "Sales & commercial documents",
          ].map((t, i) => (
            <span key={t}>
              <b>{i + 1}</b>
              {t}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
function IntegrationForm({ provider }: { provider: string }) {
  const { s, change, modal } = useCRM();
  const old = s.integrations.find((p) => p.provider === provider)!;
  const [f, setF] = useState(old);
  const test = () => {
    if (!f.enabled) {
      toast.error("Enable demo routing and save configuration first.");
      return;
    }
    if (
      (provider === "WhatsApp Business" || provider === "Email / SMTP") &&
      !s.leads.some((l) => !l.archived && l.consent)
    ) {
      toast.error("Add an opted-in lead before testing messaging.");
      return;
    }
    if (
      change((x) => {
        Object.assign(x.integrations.find((p) => p.provider === provider)!, f, {
          lastTest: now(),
        });
        if (provider === "WhatsApp Business" || provider === "Email / SMTP") {
          const l = x.leads.find((l) => !l.archived && l.consent);
          if (!l) throw new Error("No opted-in lead");
          appendMessage(
            x,
            l.id,
            `${provider} connection test for ${x.settings.brand}. (Local demo only)`,
          );
          activity(x, `${provider} test message recorded`, l.id);
        } else if (provider === "GPT qualification") {
          x.leads
            .filter((l) => !l.archived)
            .forEach((l) => {
              l.score = qualify(l);
            });
          activity(
            x,
            "Local qualification test completed; GPT API is not connected",
          );
        } else {
          const source = provider as Lead["source"];
          const phone =
            "9" +
            String(Math.floor(Math.random() * 1000000000)).padStart(9, "0");
          if (x.leads.some((l) => normalizePhone(l.phone) === phone))
            throw new Error("Duplicate test contact");
          const sales = x.settings.team.filter((t) => t.role === "Sales");
          const l: Lead = {
            id: uid("LD"),
            name: `${provider} test contact`,
            company: "Demo Workspace Enquiry",
            phone,
            email: "test@demo.example",
            industry: "Other",
            source,
            seats: 10,
            budget: 90000,
            location: "OMR, Chennai",
            moveIn: today(),
            stage: "New",
            score: 0,
            owner: x.settings.autoAssign
              ? sales[x.leads.length % Math.max(1, sales.length)]?.name ||
                "Unassigned"
              : "Unassigned",
            consent: true,
            archived: false,
            createdAt: now(),
            notes: [],
          };
          if (x.settings.autoQualify) l.score = qualify(l);
          x.leads.unshift(l);
          welcome(x, l);
          activity(
            x,
            `Test enquiry captured from ${provider} · ${f.campaign || "Demo campaign"}`,
            l.id,
          );
        }
      }, "Integration test recorded in the CRM")
    )
      modal(null);
  };
  return (
    <form
      className="crm-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          change((x) => {
            Object.assign(
              x.integrations.find((p) => p.provider === provider)!,
              f,
            );
            activity(
              x,
              `${provider} demo routing ${f.enabled ? "enabled" : "disabled"}`,
            );
          }, "Integration configuration saved")
        )
          modal(null);
      }}
    >
      <h3>{provider}</h3>
      <div className="crm-toggle-row">
        <span>Enable local demo routing</span>
        <Switch
          aria-label="Enable demo integration"
          checked={f.enabled}
          onCheckedChange={(v) => setF({ ...f, enabled: v })}
        />
      </div>
      <Field label="Account / business label">
        <input
          required
          maxLength={200}
          value={f.account}
          onChange={(e) => setF({ ...f, account: e.target.value })}
          placeholder="Abundance Group demo account"
        />
      </Field>
      <Field label="Campaign / form label">
        <input
          maxLength={200}
          value={f.campaign}
          onChange={(e) => setF({ ...f, campaign: e.target.value })}
          placeholder="OMR zero rental campaign"
        />
      </Field>
      <p className="crm-muted">
        Demo configuration only. Live credentials must be kept on a server. Test
        capture creates a fictional enquiry and updates your workspace.
      </p>
      <div className="crm-form-footer">
        <Action onClick={test} disabled={!f.enabled || !f.account.trim()}>
          Run local test
        </Action>
        <Action primary type="submit">
          Save configuration
        </Action>
      </div>
    </form>
  );
}

function SettingsView() {
  const { s, change, ask } = useCRM();
  const [f, setF] = useState(s.settings),
    [tab, setTab] = useState("Business"),
    [teamName, setTeamName] = useState(""),
    [teamEmail, setTeamEmail] = useState(""),
    [role, setRole] = useState("Sales");
  const backupRef = useRef<HTMLInputElement>(null);
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!f.team.some((t) => t.role === "Administrator")) {
      toast.error("Keep at least one administrator.");
      return;
    }
    if (!f.team.some((t) => t.role === "Sales")) {
      toast.error("Add at least one sales owner for routing.");
      return;
    }
    if (
      change((x) => {
        const names = new Set(f.team.map((t) => t.name));
        x.leads.forEach((l) => {
          if (l.owner !== "Unassigned" && !names.has(l.owner))
            l.owner = "Unassigned";
        });
        x.tasks.forEach((t) => {
          if (!names.has(t.owner)) t.owner = "Unassigned";
        });
        x.settings = f;
        activity(x, "Workspace settings updated");
      }, "All workspace settings saved")
    )
      setF(f);
  };
  return (
    <>
      <Heading
        title="Workspace settings"
        sub="Business profile, routing, templates, team and backup controls."
      />
      <form className="crm-form" onSubmit={save}>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {["Business", "Automation", "Templates", "Team", "Backup"].map(
              (t) => (
                <TabsTrigger key={t} value={t}>
                  {t}
                </TabsTrigger>
              ),
            )}
          </TabsList>
          <TabsContent value="Business">
            <section className="panel crm-settings-section">
              <h3>Business profile</h3>
              <div className="crm-fields-two">
                <Field label="Brand name">
                  <input
                    required
                    maxLength={120}
                    value={f.brand}
                    onChange={(e) => setF({ ...f, brand: e.target.value })}
                  />
                </Field>
                <Field label="Business email">
                  <input
                    required
                    type="email"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                  />
                </Field>
                <Field label="Address">
                  <input
                    required
                    maxLength={500}
                    value={f.address}
                    onChange={(e) => setF({ ...f, address: e.target.value })}
                  />
                </Field>
                <Field label="Workspace capacity (seats)">
                  <input
                    required
                    type="number"
                    min={1}
                    max={10000}
                    value={f.capacity}
                    onChange={(e) =>
                      setF({ ...f, capacity: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Default tax rate (%) · demo value">
                  <input
                    required
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={f.tax}
                    onChange={(e) =>
                      setF({ ...f, tax: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Default deposit (service fee months)">
                  <input
                    required
                    type="number"
                    min={0}
                    max={24}
                    step="0.5"
                    value={f.depositMonths}
                    onChange={(e) =>
                      setF({ ...f, depositMonths: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              <Field label="Default commercial terms">
                <textarea
                  required
                  maxLength={10000}
                  value={f.terms}
                  onChange={(e) => setF({ ...f, terms: e.target.value })}
                />
              </Field>
              <p className="crm-muted">
                Changes apply to new documents; issued document snapshots keep
                their original details.
              </p>
            </section>
          </TabsContent>
          <TabsContent value="Automation">
            <section className="panel crm-settings-section">
              <h3>Lead automation</h3>
              {[
                [
                  "autoWelcome",
                  "Welcome messages",
                  "Add a personalised welcome to opted-in new lead conversations.",
                ],
                [
                  "autoQualify",
                  "Requirement scoring",
                  "Calculate an intent score from saved requirement fields.",
                ],
                [
                  "autoAssign",
                  "Sales routing",
                  "Assign new enquiries across available sales owners.",
                ],
              ].map(([key, a, b]) => (
                <div className="crm-toggle-row" key={key}>
                  <span>
                    <b>{a}</b>
                    <small>{b}</small>
                  </span>
                  <Switch
                    aria-label={a}
                    checked={
                      f[key as "autoWelcome" | "autoQualify" | "autoAssign"]
                    }
                    onCheckedChange={(v) => setF({ ...f, [key]: v })}
                  />
                </div>
              ))}
              <h4>Pipeline stages</h4>
              <div className="crm-stage-labels">
                {STAGES.map((st) => (
                  <Badge tone="blue" key={st}>
                    {st}
                  </Badge>
                ))}
              </div>
              <p className="crm-muted">
                Lead forms, pipeline cards and lead details all use these
                stages. External automation is simulated locally.
              </p>
            </section>
          </TabsContent>
          <TabsContent value="Templates">
            <section className="panel crm-settings-section">
              <h3>Conversation templates</h3>
              <Field label="Welcome message">
                <textarea
                  required
                  maxLength={10000}
                  value={f.welcome}
                  onChange={(e) => setF({ ...f, welcome: e.target.value })}
                />
              </Field>
              <Field label="Follow-up message">
                <textarea
                  required
                  maxLength={10000}
                  value={f.followup}
                  onChange={(e) => setF({ ...f, followup: e.target.value })}
                />
              </Field>
              <p className="crm-muted">
                Available variables: {"{name}, {company}, {seats}, {brand}"}
              </p>
              <div className="crm-summary-ai">
                <b>Welcome preview</b>
                <p>
                  {s.leads[0]
                    ? fillTemplate(f.welcome, s.leads[0], f.brand)
                    : f.welcome}
                </p>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="Team">
            <section className="panel crm-settings-section">
              <h3>Team & routing roles</h3>
              <p className="crm-muted">
                Roles control sales assignment choices in this local workspace.
                Sign-in and server-enforced permissions require a backend.
              </p>
              {f.team.map((t, i) => (
                <div className="crm-team-row" key={t.name}>
                  <Avatar name={t.name} />
                  <span>
                    <b>{t.name}</b>
                    <small>{t.email}</small>
                  </span>
                  <Pick
                    label={`Role for ${t.name}`}
                    value={t.role}
                    options={["Administrator", "Sales", "Accounts"]}
                    onChange={(v) =>
                      setF({
                        ...f,
                        team: f.team.map((r, j) =>
                          j === i ? { ...r, role: v as typeof r.role } : r,
                        ),
                      })
                    }
                  />
                  <Action
                    onClick={() => {
                      if (f.team.length === 1) {
                        toast.error("Keep at least one team member.");
                        return;
                      }
                      setF({ ...f, team: f.team.filter((_, j) => j !== i) });
                    }}
                  >
                    Remove
                  </Action>
                </div>
              ))}
              <div className="crm-fields-two">
                <Field label="New team member name">
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    maxLength={120}
                  />
                </Field>
                <Field label="New team member email">
                  <input
                    type="email"
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                  />
                </Field>
              </div>
              <div className="crm-buttons">
                <Pick
                  label="New team member role"
                  value={role}
                  options={["Administrator", "Sales", "Accounts"]}
                  onChange={setRole}
                />
                <Action
                  onClick={() => {
                    if (!teamName.trim() || !/^\S+@\S+\.\S+$/.test(teamEmail)) {
                      toast.error("Enter a name and valid email.");
                      return;
                    }
                    if (
                      f.team.some(
                        (t) =>
                          t.name.toLowerCase() ===
                            teamName.trim().toLowerCase() ||
                          t.email.toLowerCase() === teamEmail.toLowerCase(),
                      )
                    ) {
                      toast.error("This team member already exists.");
                      return;
                    }
                    setF({
                      ...f,
                      team: [
                        ...f.team,
                        {
                          name: teamName.trim(),
                          email: teamEmail,
                          role: role as CRMState["settings"]["team"][number]["role"],
                        },
                      ],
                    });
                    setTeamName("");
                    setTeamEmail("");
                  }}
                >
                  Add member
                </Action>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="Backup">
            <section className="panel crm-settings-section">
              <h3>Workspace backup</h3>
              <p>
                Records are saved in this browser. Export a backup to move data
                to another browser or preserve it.
              </p>
              <div className="crm-buttons">
                <Action
                  onClick={() =>
                    download(
                      `abundance-backup-${today()}.json`,
                      JSON.stringify(s, null, 2),
                      "application/json",
                    )
                  }
                >
                  <Download />
                  Export backup
                </Action>
                <Action onClick={() => backupRef.current?.click()}>
                  Import backup
                </Action>
              </div>
              <input
                hidden
                ref={backupRef}
                type="file"
                accept="application/json,.json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (file.size > 4000000) {
                    toast.error("Backup must be below 4 MB.");
                    return;
                  }
                  try {
                    const imported = stateSchema.parse(
                      JSON.parse(await file.text()),
                    );
                    ask(
                      "Replace local workspace with this backup?",
                      `${imported.leads.length} leads, ${imported.documents.length} documents and ${imported.campaigns.length} campaigns. Export your current data before replacing it.`,
                      () => {
                        if (
                          change((x) => {
                            Object.assign(x, imported);
                            activity(x, "Workspace backup imported");
                          }, "Backup imported")
                        )
                          setF(imported.settings);
                      },
                    );
                  } catch {
                    toast.error(
                      "Invalid or incompatible backup. No data was changed.",
                    );
                  }
                }}
              />
              <div className="crm-summary-ai">
                <b>Current workspace</b>
                <p>
                  {s.leads.length} leads · {s.messages.length} messages ·{" "}
                  {s.documents.length} documents · {s.payments.length} payments
                </p>
              </div>
            </section>
          </TabsContent>
        </Tabs>
        {tab !== "Backup" && (
          <div className="crm-form-footer">
            <Action onClick={() => setF(s.settings)}>Discard changes</Action>
            <Action primary type="submit">
              Save settings
            </Action>
          </div>
        )}
      </form>
    </>
  );
}
function Notifications() {
  const { s, change, openLead } = useCRM();
  return (
    <div className="crm-form">
      <div className="crm-buttons">
        <Badge>{s.activities.filter((a) => !a.read).length} unread</Badge>
        <Action
          onClick={() =>
            change((x) => {
              x.activities.forEach((a) => (a.read = true));
            }, "Notifications marked as read")
          }
        >
          Mark all read
        </Action>
      </div>
      {s.activities.map((a) => (
        <button
          className={`crm-notification ${a.read ? "read" : ""}`}
          key={a.id}
          onClick={() => {
            change((x) => {
              x.activities.find((r) => r.id === a.id)!.read = true;
            });
            if (a.leadId) openLead(a.leadId);
          }}
        >
          <CheckCircle2 />
          <span>
            <b>{a.text}</b>
            <small>{displayDate(a.at)}</small>
          </span>
          {!a.read && <i className="crm-unread" />}
        </button>
      ))}
      {!s.activities.length && <Empty text="No notifications yet." />}
    </div>
  );
}

function Simulation() {
  const { s, change, modal, openLead } = useCRM();
  const [step, setStep] = useState(0),
    [leadId, setLeadId] = useState(""),
    [quoteId, setQuoteId] = useState("");
  const [name, setName] = useState("Demo Customer"),
    [company, setCompany] = useState("Nova Digital"),
    [source, setSource] = useState("Google Ads");
  const [seats, setSeats] = useState(24),
    [budget, setBudget] = useState(180000),
    [location, setLocation] = useState("OMR, Chennai"),
    [moveIn, setMoveIn] = useState(today()),
    [industry, setIndustry] = useState("IT / SaaS");
  const l = s.leads.find((l) => l.id === leadId);
  const steps = [
    "Capture",
    "Welcome",
    "Requirements",
    "Sales action",
    "Quotation",
    "Conversion",
  ];
  const capture = () => {
    if (!name.trim() || !company.trim()) {
      toast.error("Enter a customer and company name.");
      return;
    }
    const id = uid("LD");
    if (
      change((x) => {
        const phone =
          "9" + String(Math.floor(Math.random() * 1000000000)).padStart(9, "0");
        if (x.leads.some((a) => normalizePhone(a.phone) === phone))
          throw new Error("Duplicate");
        const lead: Lead = {
          id,
          name: name.trim(),
          company: company.trim(),
          phone,
          email: "customer@demo.example",
          industry: "Other",
          source: source as Lead["source"],
          seats: 1,
          budget: 0,
          location: "To confirm",
          moveIn: "",
          stage: "New",
          score: 0,
          owner: "Unassigned",
          consent: true,
          archived: false,
          createdAt: now(),
          notes: [],
        };
        x.leads.unshift(lead);
        activity(
          x,
          `${lead.name} captured from ${source} (journey simulation)`,
          id,
        );
      }, "Demo lead captured")
    ) {
      setLeadId(id);
      setStep(1);
    }
  };
  const next = () => {
    if (!l) return;
    const sales = s.settings.team.filter((t) => t.role === "Sales");
    let generatedQuote = "";
    if (
      change((x) => {
        const row = x.leads.find((a) => a.id === l.id)!;
        if (step === 1) {
          welcome(x, row);
          row.stage = "Enquiry";
          activity(
            x,
            x.settings.autoWelcome
              ? "Welcome automation evaluated"
              : "Welcome automation disabled in settings",
            row.id,
          );
        }
        if (step === 2) {
          Object.assign(row, { seats, budget, location, moveIn, industry });
          appendMessage(
            x,
            row.id,
            `We need ${seats} seats in ${location}. Our budget is ${money(budget)}, move-in ${moveIn}. Business: ${industry}.`,
            "in",
          );
          if (x.settings.autoQualify) {
            row.score = qualify(row);
            row.stage = row.score >= 80 ? "Qualified" : "Enquiry";
          }
          if (x.settings.autoAssign)
            row.owner =
              sales[x.leads.length % Math.max(1, sales.length)]?.name ||
              "Unassigned";
          activity(
            x,
            `Requirements collected; score ${row.score}; owner ${row.owner}`,
            row.id,
          );
        }
        if (step === 3) {
          x.tasks.push({
            id: uid("TSK"),
            leadId: row.id,
            type: "Site visit",
            due: moveIn + "T16:30",
            owner: row.owner,
            note: "Customer journey demo site visit",
            completed: false,
          });
          row.stage = "Site Visit";
          activity(x, `Site visit created for ${row.name}`, row.id);
        }
        if (step === 4) {
          const d = newDocument(x, row, "Quotation");
          d.status = "Sent";
          x.documents.unshift(d);
          row.stage = "Proposal";
          appendMessage(
            x,
            row.id,
            `Quotation ${d.id} ready: ${money(documentTotal(d))} monthly total including configured demo tax. Base rent ₹0.`,
          );
          generatedQuote = d.id;
          activity(x, `Quotation ${d.id} generated in journey`, row.id);
        }
        if (step === 5) {
          if (quoteId)
            x.documents.find((d) => d.id === quoteId)!.status = "Accepted";
          const agreement = newDocument(x, row, "Rental Agreement");
          agreement.status = "Signed";
          const invoice = newDocument(x, row, "Invoice");
          invoice.status = "Sent";
          x.documents.unshift(agreement, invoice);
          row.stage = "Won";
          activity(
            x,
            `Demo agreement signed, deal won and invoice ${invoice.id} generated`,
            row.id,
          );
        }
      }, "Customer journey updated")
    ) {
      if (generatedQuote) setQuoteId(generatedQuote);
      setStep(step + 1);
    }
  };
  return (
    <div className="crm-simulation">
      <div className="crm-demo-steps">
        {steps.map((t, i) => (
          <span className={step >= i ? "active" : ""} key={t}>
            <i>{step > i ? <Check size={13} /> : i + 1}</i>
            {t}
          </span>
        ))}
      </div>
      {step === 0 ? (
        <form
          className="crm-form"
          onSubmit={(e) => {
            e.preventDefault();
            capture();
          }}
        >
          <div className="crm-demo-ad">
            <Building2 />
            <h2>{s.settings.brand}</h2>
            <p>Premium managed workspace · Zero base rental concept</p>
          </div>
          <div className="crm-fields-two">
            <Field label="Demo customer name">
              <input
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Demo company">
              <input
                required
                maxLength={160}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Enquiry source">
            <Pick
              label="Demo lead source"
              value={source}
              onChange={setSource}
              options={SOURCES}
            />
          </Field>
          <p className="crm-muted">
            This creates a fictional, opted-in contact and stores a real lead
            record in the demo CRM.
          </p>
          <Action primary type="submit">
            Capture demo enquiry
          </Action>
        </form>
      ) : step === 1 ? (
        <div className="crm-demo-panel">
          <MessageCircle />
          <h2>Welcome {l?.name}</h2>
          <div className="crm-demo-message">
            {l ? fillTemplate(s.settings.welcome, l, s.settings.brand) : ""}
          </div>
          <p>
            Welcome automation is{" "}
            {s.settings.autoWelcome ? "enabled" : "disabled"}.{" "}
            {s.settings.autoWelcome
              ? "Continue to save this message to the conversation."
              : "Continue to proceed without an automatic greeting."}
          </p>
          <Action primary onClick={next}>
            Process welcome automation
          </Action>
        </div>
      ) : step === 2 ? (
        <form
          className="crm-form"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          <h3>Collect customer requirements</h3>
          <div className="crm-fields-two">
            <Field label="Required seats">
              <input
                required
                type="number"
                min={1}
                max={10000}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </Field>
            <Field label="Monthly budget (₹)">
              <input
                required
                type="number"
                min={1}
                max={100000000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </Field>
            <Field label="Preferred location">
              <input
                required
                maxLength={160}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>
            <Field label="Move-in date">
              <input
                required
                type="date"
                value={moveIn}
                onChange={(e) => setMoveIn(e.target.value)}
              />
            </Field>
            <Field label="Business category">
              <Pick
                label="Demo industry"
                value={industry}
                onChange={setIndustry}
                options={INDUSTRIES}
              />
            </Field>
          </div>
          <p className="crm-muted">
            The demo scores structured requirements with local rules. Live GPT
            is not connected.
          </p>
          <Action primary type="submit">
            Collect & qualify
          </Action>
        </form>
      ) : step === 3 ? (
        <div className="crm-demo-panel">
          <Sparkles />
          <h2>{l?.score} / 100 intent score</h2>
          <p>
            {l?.name} · {l?.seats} seats · {l?.location}
          </p>
          <div className="crm-detail-grid">
            <div>
              <small>Assigned owner</small>
              <b>{l?.owner}</b>
            </div>
            <div>
              <small>Stage</small>
              <b>{l?.stage}</b>
            </div>
          </div>
          <Action primary onClick={next}>
            Schedule site visit
          </Action>
        </div>
      ) : step === 4 ? (
        <div className="crm-demo-panel">
          <FileText />
          <h2>Ready for a commercial offer</h2>
          <p>
            Base rent ₹0 · Monthly service budget {money(l?.budget || 0)} · Tax
            and deposit use workspace settings.
          </p>
          <Action primary onClick={next}>
            Generate & send demo quotation
          </Action>
        </div>
      ) : step === 5 ? (
        <div className="crm-demo-panel">
          <CheckCircle2 />
          <h2>Quotation {quoteId} is ready</h2>
          <p>
            Record demo acceptance and agreement signature to move this lead to
            Won and create an invoice.
          </p>
          <p className="crm-muted">
            Signature and delivery are simulated, with all records stored in the
            CRM.
          </p>
          <Action primary onClick={next}>
            Record demo conversion
          </Action>
        </div>
      ) : (
        <div className="crm-demo-panel">
          <CheckCheck />
          <h2>Complete journey saved</h2>
          <p>
            {l?.name} is now {l?.stage}. A quotation, agreement and invoice are
            available in Documents. Follow-up tasks and messages remain in the
            lead history.
          </p>
          <div className="crm-buttons">
            <Action
              primary
              onClick={() => {
                modal(null);
                openLead(leadId);
              }}
            >
              Open new lead
            </Action>
            <Action onClick={() => modal(null)}>Return to CRM</Action>
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignForm({ id }: { id?: string }) {
  const { s, change, modal, ask } = useCRM();
  const old = s.campaigns.find((c) => c.id === id);
  const [f, setF] = useState<Campaign>(
    old || {
      id: "",
      name: "",
      channel: "WhatsApp",
      industry: "All",
      stage: "All",
      template: s.settings.followup,
      status: "Draft",
      scheduledAt: "",
      recipientIds: [],
      createdAt: "",
    },
  );
  const recipients = campaignRecipients(s, f);
  const completed = f.status === "Completed" || f.status === "Cancelled";
  const [error, setError] = useState("");
  const save = (dispatch = false) => {
    setError("");
    if (!f.name.trim() || !f.template.trim()) {
      setError("Enter a campaign name and message.");
      return;
    }
    if (
      f.status === "Scheduled" &&
      (!f.scheduledAt ||
        new Date(f.scheduledAt + "+05:30").getTime() <= Date.now())
    ) {
      setError("Choose a future schedule time.");
      return;
    }
    if (dispatch && !recipients.length) {
      setError("This segment has no opted-in recipients.");
      return;
    }
    const run = () => {
      if (
        change(
          (x) => {
            const c = {
              ...f,
              id: old?.id || uid("CMP"),
              createdAt: old?.createdAt || now(),
            };
            if (dispatch) dispatchCampaign(x, c);
            if (old) Object.assign(x.campaigns.find((a) => a.id === id)!, c);
            else x.campaigns.unshift(c);
            if (!dispatch)
              activity(x, `${c.name} saved as ${c.status.toLowerCase()}`);
          },
          dispatch ? "Campaign dispatch simulated" : "Campaign saved",
        )
      )
        modal(null);
    };
    if (dispatch)
      ask(
        "Simulate bulk delivery?",
        `${f.channel}: ${recipients.length} eligible contacts. Messages will be recorded locally.`,
        run,
      );
    else run();
  };
  if (completed)
    return (
      <div className="crm-form">
        <Badge>{f.status}</Badge>
        <h3>{f.name}</h3>
        <p>{f.template}</p>
        <div className="crm-detail-grid">
          <div>
            <small>Channel</small>
            <b>{f.channel}</b>
          </div>
          <div>
            <small>Recorded recipients</small>
            <b>{f.recipientIds.length}</b>
          </div>
          <div>
            <small>Dispatch time</small>
            <b>{f.sentAt ? displayDate(f.sentAt) : "Not dispatched"}</b>
          </div>
          <div>
            <small>Delivery mode</small>
            <b>Local simulation</b>
          </div>
        </div>
        {f.recipientIds.map((r) => (
          <p className="crm-recipient" key={r}>
            {s.leads.find((l) => l.id === r)?.name} · Recorded demo delivery
          </p>
        ))}
        <Action
          onClick={() => {
            if (
              change((x) => {
                x.campaigns.unshift({
                  ...f,
                  id: uid("CMP"),
                  name: f.name + " (copy)",
                  status: "Draft",
                  recipientIds: [],
                  sentAt: undefined,
                  scheduledAt: "",
                  createdAt: now(),
                });
              }, "Campaign duplicated")
            )
              modal(null);
          }}
        >
          Duplicate as draft
        </Action>
      </div>
    );
  return (
    <form
      className="crm-form"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <Field label="Campaign name">
        <input
          required
          maxLength={160}
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
        />
      </Field>
      <div className="crm-fields-two">
        <Field label="Channel">
          <Pick
            label="Campaign channel"
            value={f.channel}
            options={["WhatsApp", "Email", "SMS"]}
            onChange={(v) => setF({ ...f, channel: v as Campaign["channel"] })}
          />
        </Field>
        <Field label="Business segment">
          <Pick
            label="Campaign business segment"
            value={f.industry}
            options={["All", ...INDUSTRIES]}
            onChange={(v) =>
              setF({ ...f, industry: v as Campaign["industry"] })
            }
          />
        </Field>
        <Field label="Stage segment">
          <Pick
            label="Campaign stage segment"
            value={f.stage}
            options={["All", ...STAGES]}
            onChange={(v) => setF({ ...f, stage: v as Campaign["stage"] })}
          />
        </Field>
        <Field label="Save as">
          <Pick
            label="Campaign save status"
            value={f.status}
            options={["Draft", "Scheduled"]}
            onChange={(v) => setF({ ...f, status: v as Campaign["status"] })}
          />
        </Field>
      </div>
      {f.status === "Scheduled" && (
        <Field label="Scheduled time (India)">
          <input
            type="datetime-local"
            required
            value={f.scheduledAt}
            onChange={(e) => setF({ ...f, scheduledAt: e.target.value })}
          />
        </Field>
      )}
      <Field label="Message template">
        <textarea
          required
          maxLength={10000}
          value={f.template}
          onChange={(e) => setF({ ...f, template: e.target.value })}
        />
      </Field>
      <small className="crm-muted">
        Variables: {"{name}, {company}, {seats}, {brand}"}. Only opted-in,
        active leads are included.
      </small>
      <div className="crm-summary-ai">
        <b>{recipients.length} recipients</b>
        <p>
          {recipients[0]
            ? fillTemplate(f.template, recipients[0], s.settings.brand)
            : "No leads match this segment."}
        </p>
      </div>
      {error && (
        <p role="alert" className="crm-error">
          {error}
        </p>
      )}
      <div className="crm-form-footer">
        {old && (
          <Action
            onClick={() =>
              ask(
                "Cancel campaign?",
                "The campaign will remain in history with a cancelled status.",
                () => {
                  if (
                    change((x) => {
                      x.campaigns.find((c) => c.id === id)!.status =
                        "Cancelled";
                      activity(x, `${f.name} cancelled`);
                    }, "Campaign cancelled")
                  )
                    modal(null);
                },
              )
            }
          >
            Cancel campaign
          </Action>
        )}
        <Action type="submit">Save campaign</Action>
        <Action
          primary
          disabled={!recipients.length}
          onClick={() => save(true)}
        >
          Simulate dispatch
        </Action>
      </div>
    </form>
  );
}
