import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { api, login, logout, user } from "./services/api";
import { syncPending } from "./services/offline";

const labels: any = {
  en: {
    home: "Home",
    consult: "Doctor Consultation",
    appointments: "Appointments",
    nearby: "Find Nearby",
    card: "Digital Health Card",
    medicine: "Medicine Stock",
    voice: "Voice Assistant",
    symptoms: "Symptom Checker",
    schemes: "Government Schemes",
    sos: "SOS Emergency",
    referrals: "Referrals",
    asha: "ASHA Dashboard",
    admin: "Admin Dashboard",
  },
  mr: {
    home: "मुख्यपृष्ठ",
    consult: "डॉक्टर सल्ला",
    appointments: "अपॉइंटमेंट",
    nearby: "जवळची सेवा",
    card: "आरोग्य कार्ड",
    medicine: "औषध उपलब्धता",
    voice: "व्हॉइस सहाय्यक",
    symptoms: "लक्षण तपासणी",
    schemes: "सरकारी योजना",
    sos: "आपत्कालीन SOS",
    referrals: "रेफरल",
    asha: "आशा डॅशबोर्ड",
    admin: "अॅडमिन",
  },
  hi: {
    home: "होम",
    consult: "डॉक्टर परामर्श",
    appointments: "अपॉइंटमेंट",
    nearby: "पास की सेवा",
    card: "हेल्थ कार्ड",
    medicine: "दवा उपलब्धता",
    voice: "वॉइस असिस्टेंट",
    symptoms: "लक्षण जांच",
    schemes: "सरकारी योजनाएं",
    sos: "आपातकालीन SOS",
    referrals: "रेफरल",
    asha: "आशा डैशबोर्ड",
    admin: "एडमिन",
  },
};

function Shell({ children }: { children: any }) {
  const u = user();
  const [online, setOnline] = useState(navigator.onLine);
  const [lang, setLang] = useState(
    localStorage.getItem("rhc_lang") || "en"
  );
  const nav = useNavigate();

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    syncPending();

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <>
      <header>
        <div>
          <b>Rural Health Connect</b>
          <small>Connect. Consult. Care.</small>
        </div>

        <div className="top">
          <span className={online ? "status ok" : "status bad"}>
            {online ? "● Online" : "● Offline"}
          </span>

          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              localStorage.setItem("rhc_lang", e.target.value);
            }}
          >
            <option value="mr">मराठी</option>
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>

          {u && (
            <button
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <main>{children}</main>

      <nav className="bottom">
        <Link to="/">⌂ Home</Link>
        <Link to="/appointments">📅 Appointments</Link>
        <Link to="/nearby">🗺️ Find Nearby</Link>
        <Link to="/sos" className="sos">
          SOS
        </Link>
      </nav>
    </>
  );
}

/* ---------------- HOME ---------------- */

function Home() {
  const u = user();
  const lang = localStorage.getItem("rhc_lang") || "en";
  const L = labels[lang];

  const services = [
    {
      icon: "🩺",
      title: L.consult,
      desc: "Connect with a doctor",
      path: "/consultation",
    },
    {
      icon: "📅",
      title: L.appointments,
      desc: "Book and manage visits",
      path: "/appointments",
    },
    {
      icon: "💳",
      title: L.card,
      desc: "Your digital health card",
      path: "/health-card",
    },
    {
      icon: "📍",
      title: L.nearby,
      desc: "Find nearby healthcare",
      path: "/nearby",
    },
    {
      icon: "💊",
      title: L.medicine,
      desc: "Check medicine availability",
      path: "/medicine-stock",
    },
    {
      icon: "🔄",
      title: L.referrals,
      desc: "Track your referrals",
      path: "/referrals",
    },
  ];

  const quickActions = [
    {
      icon: "🎙️",
      title: L.voice,
      path: "/voice",
    },
    {
      icon: "🩹",
      title: L.symptoms,
      path: "/symptom-checker",
    },
    {
      icon: "🏛️",
      title: L.schemes,
      path: "/schemes",
    },
  ];

  return (
    <Shell>
      <div className="dashboard">

        {/* Welcome */}
        <section className="welcome">
          <p className="eyebrow">RURAL HEALTH CONNECT</p>

          <h2>
            Hello, {u?.name?.split(" ")[0] || "there"} 👋
          </h2>

          <p>
            How can we help you today?
          </p>
        </section>

        {/* Main healthcare banner */}
        <section className="hero">
          <div>
            <p className="eyebrow">
              MAHARASHTRA RURAL HEALTH
            </p>

            <h1>
              Healthcare that reaches every village.
            </h1>

            <p>
              Consult doctors, manage appointments and access
              health services even with low internet connectivity.
            </p>
          </div>
        </section>

        {/* Services */}
        <section>
          <h2>Quick Services</h2>

          <p className="muted">
            Essential healthcare services in one place
          </p>

          <div className="grid">
            {services.map((item) => (
              <Link
                className="card"
                to={item.path}
                key={item.path}
              >
                <div style={{ fontSize: "30px", marginBottom: "14px" }}>
                  {item.icon}
                </div>

                <strong>{item.title}</strong>

                <span>{item.desc}</span>

                <span style={{ marginTop: "12px" }}>
                  Open →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Emergency */}
        <section>
          <Link className="sos-big" to="/sos">
            🚨 Emergency SOS
          </Link>
        </section>

        {/* Quick actions */}
        <section>
          <h2>More Services</h2>

          <div className="grid">
            {quickActions.map((item) => (
              <Link
                className="card"
                to={item.path}
                key={item.path}
              >
                <div style={{ fontSize: "28px", marginBottom: "14px" }}>
                  {item.icon}
                </div>

                <strong>{item.title}</strong>

                <span>Open →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Role dashboards */}
        {u?.role === "ASHA" && (
          <Link className="wide" to="/asha/dashboard">
            👩‍⚕️ Open ASHA Dashboard
          </Link>
        )}

        {u?.role === "ADMIN" && (
          <Link className="wide" to="/admin/dashboard">
            🛠️ Open Admin Dashboard
          </Link>
        )}

      </div>
    </Shell>
  );
}

/* ---------------- LOGIN ---------------- */

function Login() {
  const [email, setEmail] = useState("patient@demo.local");
  const [password, setPassword] = useState("Patient@123");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  return (
    <Shell>
      <div className="page">
        <div className="formbox">
          <h2>Sign in</h2>

          <p className="muted">
            Access your Rural Health Connect account.
          </p>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />

          {err && <div className="error">{err}</div>}

          <button
            onClick={async () => {
              try {
                await login(email, password);
                nav("/");
              } catch (e: any) {
                setErr(
                  e.response?.data?.message ||
                    "Login failed"
                );
              }
            }}
          >
            Login
          </button>

          <p className="muted">
            Demo account: patient@demo.local
          </p>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- APPOINTMENTS ---------------- */

function Appointments() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    reason: "",
  });

  useEffect(() => {
    api
      .get("/appointments")
      .then((r) => setRows(r.data))
      .catch(() => {});
  }, []);

  return (
    <Shell>
      <Page title="Appointments">
        <div className="formbox">
          <select
            value={form.doctorId}
            onChange={(e) =>
              setForm({
                ...form,
                doctorId: e.target.value,
              })
            }
          >
            <option value="">Select doctor</option>
            <option value="1">Demo Doctor</option>
          </select>

          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
          />

          <input
            placeholder="Reason for visit"
            value={form.reason}
            onChange={(e) =>
              setForm({
                ...form,
                reason: e.target.value,
              })
            }
          />

          <button
            onClick={async () => {
              try {
                const r = await api.post(
                  "/appointments",
                  form
                );

                setRows([r.data, ...rows]);
              } catch (e: any) {
                alert(
                  e.response?.data?.message ||
                    "Could not book appointment"
                );
              }
            }}
          >
            Confirm Appointment
          </button>
        </div>

        {rows.map((x) => (
          <div className="list" key={x.id}>
            <div>
              <b>
                {x.doctor?.user?.name || "Doctor"}
              </b>

              <small>
                {new Date(x.date).toLocaleString()}
              </small>
            </div>

            <em>{x.status}</em>
          </div>
        ))}
      </Page>
    </Shell>
  );
}

/* ---------------- REFERRALS ---------------- */

function Referrals() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/referrals")
      .then((r) => setRows(r.data))
      .catch(() => {});
  }, []);

  return (
    <Shell>
      <Page title="Referral Tracking">
        <div className="notice">
          Track healthcare referrals from creation
          through completion.
        </div>

        {rows.map((r) => (
          <div className="list" key={r.id}>
            <div>
              <b>Referral #{r.id}</b>
              <small>{r.reason}</small>
            </div>

            <em>{r.status}</em>
          </div>
        ))}
      </Page>
    </Shell>
  );
}

/* ---------------- HEALTH CARD ---------------- */

function Card() {
  const u = user();

  return (
    <Shell>
      <Page title="Digital Health Card">
        <div className="healthcard">
          <p className="eyebrow">
            RURAL HEALTH CONNECT
          </p>

          <h2>
            {u?.name || "Demo Patient"}
          </h2>

          <p>
            Patient ID: {u?.id || "DEMO-001"}
          </p>

          <p>
            Your digital health information is protected
            through authenticated access.
          </p>
        </div>
      </Page>
    </Shell>
  );
}

/* ---------------- MEDICINE ---------------- */

function Medicine() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  return (
    <Shell>
      <Page title="Medicine Stock">
        <div className="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicine"
          />

          <button
            onClick={async () => {
              const r = await api.get(
                "/medicines/search",
                {
                  params: { q },
                }
              );

              setRows(r.data);
            }}
          >
            Search
          </button>
        </div>

        {rows.map((x) => (
          <div className="list" key={x.id}>
            <div>
              <b>{x.name}</b>
              <small>Medicine availability</small>
            </div>

            <em>
              {x.stock?.[0]?.status || "UNKNOWN"}
            </em>
          </div>
        ))}
      </Page>
    </Shell>
  );
}

/* ---------------- NEARBY ---------------- */

function Nearby() {
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    api.get("/nearby")
      .then((res) => {
       setFacilities([
  ...(res.data?.phcs || []),
  ...(res.data?.hospitals || []),
  ...(res.data?.pharmacies || []),
  ...(res.data?.ambulances || []),
]);
      })
      .catch(() => {
        setFacilities([]);
      });
  }, []);

  return (
    <Shell>
      <Page title="Find Nearby">

        <div className="map">
          <div>
            <div style={{ fontSize: "42px" }}>📍</div>
            <b>Nearby Healthcare Facilities</b>
            <small>
              OpenStreetMap / Leaflet map area
            </small>
          </div>
        </div>

        <div className="list">
          <div>
            <b>Nearby Facilities</b>
            <small>
              Healthcare centres available in your area
            </small>
          </div>
        </div>

        {facilities.length > 0 ? (
          facilities.map((facility, index) => (
            <div className="list" key={facility.id || index}>
              <div>
                <b>{facility.name}</b>
                <small>
                  {facility.type || "Healthcare Facility"}
                </small>
                {facility.address && (
                  <small>{facility.address}</small>
                )}
              </div>

              <em>AVAILABLE</em>
            </div>
          ))
        ) : (
          <div className="notice">
            No nearby facilities found.
          </div>
        )}

      </Page>
    </Shell>
  );
}

/* ---------------- VOICE ---------------- */

function Voice() {
  const [text, setText] = useState("");

  return (
    <Shell>
      <Page title="Voice Assistant">
        <button
          className="mic"
          onClick={() =>
            setText(
              "Demo voice mode: please type your request below."
            )
          }
        >
          🎙️
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your healthcare request"
        />

        <div className="notice">
          Voice support uses a demo/text fallback when
          Bhashini credentials are not configured.
        </div>
      </Page>
    </Shell>
  );
}

/* ---------------- SYMPTOMS ---------------- */

function Symptoms() {
  const [s, setS] = useState("");

  return (
    <Shell>
      <Page title="Symptom Checker">
        <textarea
          value={s}
          onChange={(e) => setS(e.target.value)}
          placeholder="Describe your symptoms"
        />

        <div className="notice">
          This tool provides general health information.
          It does not provide a diagnosis or prescription.
        </div>

        <button
          className="sos-big"
          onClick={() =>
            alert(
              "If symptoms are severe or worsening, seek qualified medical care immediately."
            )
          }
        >
          Get Guidance
        </button>
      </Page>
    </Shell>
  );
}

/* ---------------- SCHEMES ---------------- */

function Schemes() {
  return (
    <Shell>
      <Page title="Government Schemes">
        <div className="list">
          <div>
            <b>Ayushman Bharat / PM-JAY</b>
            <small>
              Government health coverage information
            </small>
          </div>

          <em>INFO</em>
        </div>

        <div className="list">
          <div>
            <b>MJPJAY</b>
            <small>
              Maharashtra health scheme information
            </small>
          </div>

          <em>INFO</em>
        </div>
      </Page>
    </Shell>
  );
}

/* ---------------- SOS ---------------- */

function SOS() {
  const [sent, setSent] = useState(false);

  return (
    <Shell>
      <Page title="SOS Emergency">
        <div className="sos-panel">
          <h2>Emergency Support</h2>

          <p>
            Confirm only when you need emergency assistance.
          </p>

          <button
            className="sos-big"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  try {
                    await api.post("/emergency", {
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                    });
                  } finally {
                    setSent(true);
                  }
                },
                () => {
                  setSent(true);
                }
              );
            }}
          >
            🚨 CONFIRM SOS
          </button>

          {sent && (
            <div className="notice">
              Emergency request workflow started.
              For life-threatening emergencies, contact
              your local emergency service immediately.
            </div>
          )}
        </div>
      </Page>
    </Shell>
  );
}

/* ---------------- SIMPLE PAGES ---------------- */

function Simple({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <Shell>
      <Page title={title}>
        <div className="notice">{body}</div>
      </Page>
    </Shell>
  );
}

/* ---------------- PAGE WRAPPER ---------------- */

function Page({
  title,
  children,
}: {
  title: string;
  children: any;
}) {
  return (
    <div className="page">
      <div className="pagehead">
        <Link to="/">← Dashboard</Link>
        <h1>{title}</h1>
      </div>

      {children}
    </div>
  );
}

/* ---------------- ROUTES ---------------- */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/appointments"
        element={<Appointments />}
      />

      <Route
        path="/referrals"
        element={<Referrals />}
      />

      <Route
        path="/health-card"
        element={<Card />}
      />

      <Route
        path="/medicine-stock"
        element={<Medicine />}
      />

      <Route
        path="/nearby"
        element={<Nearby />}
      />

      <Route
        path="/voice"
        element={<Voice />}
      />

      <Route
        path="/symptom-checker"
        element={<Symptoms />}
      />

      <Route
        path="/schemes"
        element={<Schemes />}
      />

      <Route
        path="/sos"
        element={<SOS />}
      />

      <Route
        path="/consultation"
        element={
          <Simple
            title="Doctor Consultation"
            body="WebRTC signaling is implemented on the backend. Consultation can be started through the full appointment flow."
          />
        }
      />

      <Route
        path="/asha/dashboard"
        element={
          <Simple
            title="ASHA Dashboard"
            body="Offline patient operations and synchronization are available through the offline queue service."
          />
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <Simple
            title="Admin Dashboard"
            body="Role-protected administrative APIs are available on the backend."
          />
        }
      />

      <Route
        path="*"
        element={
          <Simple
            title="Page Not Found"
            body="The requested page could not be found."
          />
        }
      />
    </Routes>
  );
}