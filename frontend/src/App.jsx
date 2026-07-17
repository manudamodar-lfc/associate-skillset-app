import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Lock,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Mail,
  Briefcase,
  MapPin,
  LogOut,
  RefreshCw,
  Users,
  AlertCircle,
  FolderOpen,
  Hash,
} from "lucide-react";
import * as XLSX from "xlsx";

const TOKENS = `
  --bg: #F6F3EC;
  --panel: #FFFEFC;
  --ink: #211D18;
  --ink-soft: #736A5C;
  --navy: #1E2A38;
  --navy-soft: #34495E;
  --gold: #A8763E;
  --gold-soft: #EADFC8;
  --border: #DED4C1;
  --success: #3F7A5C;
  --success-soft: #E1EEE5;
  --error: #B3432B;
  --error-soft: #F5E2DB;
`;

const SKILL_CATEGORIES = [
  "Technical",
  "Functional / Domain",
  "Tools & Software",
  "Language",
  "Soft Skill",
];

const PROFICIENCY_LABELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const AVAILABILITY_OPTIONS = ["Yes, fully available", "Partially available", "Not available"];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function emptySkill() {
  return { id: uid(), name: "", category: SKILL_CATEGORIES[0], proficiency: 2, years: "" };
}

function emptyForm() {
  return {
    fullName: "",
    employeeId: "",
    email: "",
    department: "",
    jobTitle: "",
    location: "",
    availability: AVAILABILITY_OPTIONS[0],
    certifications: "",
    notes: "",
    skills: [emptySkill()],
  };
}

function FieldLabel({ icon: Icon, children, required }) {
  return (
    <label className="field-label">
      {Icon ? <Icon size={14} strokeWidth={2} /> : null}
      <span>{children}</span>
      {required ? <span className="req-dot">•</span> : null}
    </label>
  );
}

function FolderTab({ number, title, subtitle }) {
  return (
    <div className="folder-tab">
      <div className="folder-tab-notch">
        <span className="folder-tab-num">{number}</span>
      </div>
      <div>
        <div className="folder-tab-title">{title}</div>
        {subtitle ? <div className="folder-tab-sub">{subtitle}</div> : null}
      </div>
    </div>
  );
}

function ProficiencyDots({ value, onChange }) {
  return (
    <div className="dots-wrap">
      <div className="dots">
        {[1, 2, 3, 4].map((n) => (
          <button
            type="button"
            key={n}
            className={`dot ${n <= value ? "dot-filled" : ""}`}
            onClick={() => onChange(n)}
            aria-label={PROFICIENCY_LABELS[n - 1]}
            title={PROFICIENCY_LABELS[n - 1]}
          />
        ))}
      </div>
      <span className="dots-caption">{PROFICIENCY_LABELS[value - 1]}</span>
    </div>
  );
}

function IntakeForm() {
  const [form, setForm] = useState(emptyForm());
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const updateSkill = (id, patch) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const addSkill = () => setForm((f) => ({ ...f, skills: [...f.skills, emptySkill()] }));

  const removeSkill = (id) =>
    setForm((f) => ({
      ...f,
      skills: f.skills.length > 1 ? f.skills.filter((s) => s.id !== id) : f.skills,
    }));

  const isValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.department.trim() &&
    form.skills.some((s) => s.name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setStatus("saving");
    setErrorMsg("");
    try {
      const payload = { ...form, skills: form.skills.filter((s) => s.name.trim()) };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Something went wrong saving your response. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="panel done-panel">
        <CheckCircle2 size={40} strokeWidth={1.5} color="var(--success)" />
        <h2>Response recorded</h2>
        <p>
          Thanks, {form.fullName.split(" ")[0] || "there"} — your skillset profile has been added
          to the records.
        </p>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setForm(emptyForm());
            setStatus("idle");
            setTouched(false);
          }}
        >
          <RefreshCw size={15} /> Submit another response
        </button>
      </div>
    );
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <FolderTab number="01" title="Associate details" subtitle="Who we're filing this under" />
      <div className="grid-2">
        <div className="field">
          <FieldLabel icon={Users} required>Full name</FieldLabel>
          <input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Jordan Alvarez"
          />
        </div>
        <div className="field">
          <FieldLabel icon={Hash}>Employee ID</FieldLabel>
          <input
            value={form.employeeId}
            onChange={(e) => update("employeeId", e.target.value)}
            placeholder="EMP-00123"
            className="mono"
          />
        </div>
        <div className="field">
          <FieldLabel icon={Mail} required>Email</FieldLabel>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jordan@company.com"
          />
        </div>
        <div className="field">
          <FieldLabel icon={Building2} required>Client/Project Name</FieldLabel>
          <input
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            placeholder="Acme Corp – Platform Migration"
          />
        </div>
        <div className="field">
          <FieldLabel icon={Briefcase}>Job title</FieldLabel>
          <input
            value={form.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            placeholder="Senior Associate"
          />
        </div>
        <div className="field">
          <FieldLabel icon={MapPin}>Location</FieldLabel>
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Charlotte, NC"
          />
        </div>
      </div>

      <FolderTab number="02" title="Skill inventory" subtitle="Add every skill worth logging" />
      <div className="skills-list">
        <div className="skills-head">
          <span>Skill</span>
          <span>Category</span>
          <span>Proficiency</span>
          <span>Years</span>
          <span></span>
        </div>
        {form.skills.map((s, idx) => (
          <div className="skill-row" key={s.id}>
            <input
              className="skill-name"
              value={s.name}
              onChange={(e) => updateSkill(s.id, { name: e.target.value })}
              placeholder={idx === 0 ? "e.g. React, SQL, Project Management" : "Another skill"}
            />
            <select
              value={s.category}
              onChange={(e) => updateSkill(s.id, { category: e.target.value })}
            >
              {SKILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ProficiencyDots
              value={s.proficiency}
              onChange={(v) => updateSkill(s.id, { proficiency: v })}
            />
            <input
              className="years-input"
              type="number"
              min="0"
              step="0.5"
              value={s.years}
              onChange={(e) => updateSkill(s.id, { years: e.target.value })}
              placeholder="0"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => removeSkill(s.id)}
              aria-label="Remove skill"
              disabled={form.skills.length === 1}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost add-skill-btn" onClick={addSkill}>
          <Plus size={15} /> Add another skill
        </button>
      </div>

      <FolderTab number="03" title="Availability & notes" subtitle="Anything else worth flagging" />
      <div className="grid-2">
        <div className="field">
          <FieldLabel>Availability for new initiatives</FieldLabel>
          <select
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
          >
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <FieldLabel>Certifications</FieldLabel>
          <input
            value={form.certifications}
            onChange={(e) => update("certifications", e.target.value)}
            placeholder="PMP, AWS SAA, CPA…"
          />
        </div>
      </div>
      <div className="field">
        <FieldLabel>Additional notes</FieldLabel>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Anything you'd like the team to know"
        />
      </div>

      {touched && !isValid ? (
        <div className="inline-alert">
          <AlertCircle size={15} />
          Fill in name, email, client/project name, and at least one skill before submitting.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="inline-alert">
          <AlertCircle size={15} /> {errorMsg}
        </div>
      ) : null}

      <button className="btn btn-primary submit-btn" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Submit skillset profile"}
      </button>
    </form>
  );
}

function AdminGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [checking, setChecking] = useState(false);

  const attempt = async () => {
    setChecking(true);
    setErr(false);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        onUnlock(pw);
      } else {
        setErr(true);
      }
    } catch {
      setErr(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="panel admin-gate">
      <Lock size={28} strokeWidth={1.5} color="var(--navy)" />
      <h2>Admin access</h2>
      <p className="muted">This area is for administrators only.</p>
      <input
        type="password"
        value={pw}
        placeholder="Password"
        onChange={(e) => {
          setPw(e.target.value);
          setErr(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && attempt()}
      />
      {err ? (
        <div className="inline-alert">
          <AlertCircle size={15} /> Incorrect password.
        </div>
      ) : null}
      <button className="btn btn-primary" onClick={attempt} disabled={checking}>
        {checking ? "Checking…" : "Unlock"}
      </button>
      <p className="fine-print">
        The password is checked on the server — it's never sent to the browser bundle, so this is
        safe to use for real internal access control.
      </p>
    </div>
  );
}

function AdminDashboard({ adminPassword, onLock }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/submissions", {
        headers: { "x-admin-password": adminPassword },
      });
      if (res.status === 401) {
        onLock();
        return;
      }
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setRows(data);
    } catch (err) {
      setErrorMsg("Couldn't load submissions. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [adminPassword, onLock]);

  useEffect(() => {
    load();
  }, [load]);

  const downloadExcel = () => {
    const summarySheet = rows.map((r) => ({
      "Full Name": r.fullName,
      "Employee ID": r.employeeId,
      Email: r.email,
      "Client/Project Name": r.department,
      "Job Title": r.jobTitle,
      Location: r.location,
      Availability: r.availability,
      Certifications: r.certifications,
      "Skill Count": r.skills?.length || 0,
      "Skills (summary)": (r.skills || [])
        .map((s) => `${s.name} (${PROFICIENCY_LABELS[s.proficiency - 1]})`)
        .join("; "),
      Notes: r.notes,
      "Submitted At": r.submittedAt,
    }));

    const detailSheet = [];
    rows.forEach((r) => {
      (r.skills || []).forEach((s) => {
        detailSheet.push({
          "Full Name": r.fullName,
          "Employee ID": r.employeeId,
          "Client/Project Name": r.department,
          Skill: s.name,
          Category: s.category,
          Proficiency: PROFICIENCY_LABELS[s.proficiency - 1],
          "Years Experience": s.years,
        });
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), "Associates");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailSheet), "Skills Detail");
    XLSX.writeFile(wb, `associate-skillsets-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="panel admin-panel">
      <div className="admin-header">
        <div>
          <h2>
            <FolderOpen size={20} /> Submissions
          </h2>
          <p className="muted">{rows.length} response{rows.length === 1 ? "" : "s"} on file</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-ghost" onClick={load} title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={downloadExcel} disabled={!rows.length}>
            <Download size={15} /> Download Excel
          </button>
          <button className="btn btn-secondary" onClick={onLock}>
            <LogOut size={15} /> Lock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="muted loading-row">Loading submissions…</div>
      ) : errorMsg ? (
        <div className="inline-alert">
          <AlertCircle size={15} /> {errorMsg}
        </div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <p>No responses yet. Once associates submit the form, they'll show up here.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Client/Project Name</th>
                <th>Job Title</th>
                <th>Top Skills</th>
                <th>Availability</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-name">{r.fullName}</div>
                    <div className="cell-sub mono">{r.employeeId || "—"}</div>
                  </td>
                  <td>{r.department}</td>
                  <td>{r.jobTitle || "—"}</td>
                  <td>
                    <div className="chip-wrap">
                      {(r.skills || []).slice(0, 4).map((s) => (
                        <span className="chip" key={s.id || s.name}>{s.name}</span>
                      ))}
                      {(r.skills || []).length > 4 ? (
                        <span className="chip chip-more">+{r.skills.length - 4}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.availability?.startsWith("Yes")
                          ? "badge-success"
                          : r.availability?.startsWith("Partially")
                          ? "badge-warn"
                          : "badge-muted"
                      }`}
                    >
                      {r.availability}
                    </span>
                  </td>
                  <td className="cell-sub">
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("form"); // form | adminGate | admin
  const [adminPassword, setAdminPassword] = useState("");

  return (
    <div className="app-root">
      <style>{`
        .app-root {
          ${TOKENS}
          min-height: 100vh;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', -apple-system, sans-serif;
          padding: 32px 20px 64px;
        }
        .app-root * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .shell { max-width: 760px; margin: 0 auto; }

        .top-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark {
          width: 36px; height: 36px; border-radius: 8px;
          background: var(--navy); color: var(--gold-soft);
          display: flex; align-items: center; justify-content: center;
        }
        .brand-text h1 {
          font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600;
          margin: 0; letter-spacing: -0.01em; color: var(--navy);
        }
        .brand-text p { margin: 0; font-size: 12.5px; color: var(--ink-soft); }

        .nav-toggle {
          font-size: 12.5px; color: var(--ink-soft); background: none; border: none;
          cursor: pointer; text-decoration: underline; text-underline-offset: 3px;
        }
        .nav-toggle:hover { color: var(--navy); }

        .panel {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 1px 2px rgba(30,42,56,0.04);
        }

        .folder-tab {
          display: flex; align-items: center; gap: 14px;
          margin: 30px 0 18px;
        }
        .folder-tab:first-child { margin-top: 0; }
        .folder-tab-notch {
          width: 40px; height: 40px; flex-shrink: 0;
          background: var(--gold-soft);
          border: 1px solid var(--gold);
          clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
          display: flex; align-items: center; justify-content: center;
        }
        .folder-tab-num {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 500;
          color: var(--navy);
        }
        .folder-tab-title {
          font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: var(--navy);
        }
        .folder-tab-sub { font-size: 12px; color: var(--ink-soft); margin-top: 1px; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 4px; }
        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .field-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: var(--navy-soft);
          text-transform: uppercase; letter-spacing: 0.03em;
        }
        .req-dot { color: var(--gold); font-size: 14px; line-height: 0; }

        input, select, textarea {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #FFFFFF;
          color: var(--ink);
          width: 100%;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-soft);
        }
        .mono { font-family: 'JetBrains Mono', monospace; }
        textarea { resize: vertical; }

        .skills-list { margin-bottom: 6px; }
        .skills-head {
          display: grid; grid-template-columns: 1.6fr 1.2fr 1.3fr 0.6fr 30px;
          gap: 10px; padding: 0 2px 6px;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
          color: var(--ink-soft); font-weight: 600;
        }
        .skill-row {
          display: grid; grid-template-columns: 1.6fr 1.2fr 1.3fr 0.6fr 30px;
          gap: 10px; align-items: center; margin-bottom: 10px;
        }
        .years-input { text-align: center; }

        .dots-wrap { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
        .dots { display: flex; gap: 5px; }
        .dot {
          width: 16px; height: 16px; border-radius: 50%;
          border: 1.5px solid var(--gold);
          background: transparent; cursor: pointer; padding: 0;
        }
        .dot-filled { background: var(--gold); }
        .dots-caption { font-size: 10.5px; color: var(--ink-soft); }

        .icon-btn {
          background: none; border: none; color: var(--ink-soft);
          cursor: pointer; padding: 6px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover:not(:disabled) { background: var(--error-soft); color: var(--error); }
        .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .add-skill-btn { margin-top: 4px; }

        .btn {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13.5px; font-weight: 600; font-family: 'Inter', sans-serif;
          padding: 10px 16px; border-radius: 8px; border: 1px solid transparent;
          cursor: pointer; transition: transform 0.1s ease, opacity 0.15s ease;
        }
        .btn:active { transform: translateY(1px); }
        .btn-primary { background: var(--navy); color: #FBF7EF; }
        .btn-primary:hover:not(:disabled) { background: var(--navy-soft); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { background: var(--gold-soft); color: var(--navy); }
        .btn-secondary:hover { opacity: 0.85; }
        .btn-ghost { background: none; border: 1px dashed var(--border); color: var(--navy-soft); }
        .btn-ghost:hover { border-color: var(--gold); color: var(--navy); }

        .submit-btn { width: 100%; justify-content: center; margin-top: 18px; padding: 13px; font-size: 14px; }

        .inline-alert {
          display: flex; align-items: center; gap: 7px;
          background: var(--error-soft); color: var(--error);
          border-radius: 8px; padding: 9px 12px; font-size: 13px; margin-top: 8px;
        }

        .done-panel {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          gap: 8px; padding: 52px 28px;
        }
        .done-panel h2 { font-family: 'Fraunces', serif; margin: 6px 0 0; color: var(--navy); }
        .done-panel p { color: var(--ink-soft); margin: 0 0 14px; font-size: 14px; }

        .admin-gate {
          max-width: 360px; margin: 60px auto; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .admin-gate h2 { font-family: 'Fraunces', serif; margin: 4px 0 0; color: var(--navy); }
        .admin-gate input { text-align: center; margin: 6px 0; }
        .fine-print { font-size: 11px; color: var(--ink-soft); margin-top: 10px; line-height: 1.5; }
        .muted { color: var(--ink-soft); font-size: 13px; margin: 0; }

        .admin-panel { max-width: 100%; }
        .admin-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
        }
        .admin-header h2 {
          font-family: 'Fraunces', serif; display: flex; align-items: center; gap: 8px;
          margin: 0; color: var(--navy); font-size: 19px;
        }
        .admin-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 640px; }
        thead th {
          text-align: left; background: var(--gold-soft); color: var(--navy);
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em;
          padding: 10px 12px; font-weight: 600;
        }
        tbody td { padding: 11px 12px; border-top: 1px solid var(--border); vertical-align: top; }
        .cell-name { font-weight: 600; color: var(--ink); }
        .cell-sub { color: var(--ink-soft); font-size: 12px; }

        .chip-wrap { display: flex; flex-wrap: wrap; gap: 5px; max-width: 260px; }
        .chip {
          background: var(--bg); border: 1px solid var(--border); color: var(--navy-soft);
          font-size: 11px; padding: 3px 8px; border-radius: 20px;
        }
        .chip-more { background: var(--gold-soft); border-color: var(--gold); color: var(--navy); }

        .badge { font-size: 11px; padding: 4px 9px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
        .badge-success { background: var(--success-soft); color: var(--success); }
        .badge-warn { background: var(--gold-soft); color: #8A5A17; }
        .badge-muted { background: var(--bg); color: var(--ink-soft); }

        .empty-state { padding: 40px 0; text-align: center; color: var(--ink-soft); font-size: 13.5px; }
        .loading-row { padding: 30px 0; text-align: center; }

        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr; }
          .skills-head { display: none; }
          .skill-row {
            grid-template-columns: 1fr; gap: 6px;
            border: 1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 12px;
          }
        }
      `}</style>

      <div className="shell">
        <div className="top-bar">
          <div className="brand">
            <div className="brand-mark"><ClipboardList size={18} /></div>
            <div className="brand-text">
              <h1>Associate Skillset Intake</h1>
              <p>Skills &amp; capability profile</p>
            </div>
          </div>
          {view === "form" ? (
            <button className="nav-toggle" onClick={() => setView("adminGate")}>
              Admin login
            </button>
          ) : (
            <button
              className="nav-toggle"
              onClick={() => {
                setAdminPassword("");
                setView("form");
              }}
            >
              Back to form
            </button>
          )}
        </div>

        {view === "form" && <IntakeForm />}
        {view === "adminGate" && (
          <AdminGate
            onUnlock={(pw) => {
              setAdminPassword(pw);
              setView("admin");
            }}
          />
        )}
        {view === "admin" && (
          <AdminDashboard
            adminPassword={adminPassword}
            onLock={() => {
              setAdminPassword("");
              setView("adminGate");
            }}
          />
        )}
      </div>
    </div>
  );
}
