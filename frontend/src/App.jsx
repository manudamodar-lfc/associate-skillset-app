function AdminGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [checking, setChecking] = useState(false);

  const attempt = async () => {
    setChecking(true);
    setErr(false);
    try {
      const res = await fetch("/api/submissions", {
        headers: { "x-admin-password": pw },
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