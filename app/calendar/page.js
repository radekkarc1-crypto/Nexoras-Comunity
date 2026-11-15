"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nexoras-calendar-reminders-v1";
const pad = (n) => String(n).padStart(2, "0");
const dateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
const parseDate = (value) => { const [y,m,d] = value.split("-").map(Number); return new Date(y,m-1,d); };

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [details, setDetails] = useState("");
  const [notice, setNotice] = useState("");
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    try { setReminders(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setReminders([]); }
    setNotify("Notification" in window && Notification.permission === "granted");
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const minute = `${dateKey(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setReminders(current => {
        let changed = false;
        const next = current.map(item => {
          if (!item.notified && item.at === minute) {
            changed = true;
            if ("Notification" in window && Notification.permission === "granted") new Notification("Nexoras • przypomnienie", { body: item.title });
            return { ...item, notified: true };
          }
          return item;
        });
        return changed ? next : current;
      });
    };
    const id = window.setInterval(check, 15000);
    check();
    return () => window.clearInterval(id);
  }, []);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first); start.setDate(first.getDate() - mondayOffset);
    return Array.from({length:42}, (_,i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });
  }, [month]);
  const selectedItems = reminders.filter(item => item.at.slice(0,10) === selected).sort((a,b)=>a.at.localeCompare(b.at));

  function addReminder(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const at = `${selected}T${time}`;
    if (new Date(at) < new Date()) { setNotice("Wybierz przyszłą datę i godzinę."); return; }
    setReminders(current => [...current, { id: crypto.randomUUID(), title: title.trim(), details: details.trim(), at, notified: false }]);
    setTitle(""); setDetails(""); setNotice("Przypomnienie dodane do kalendarza.");
  }
  function removeReminder(id) { setReminders(current => current.filter(item => item.id !== id)); }
  async function enableNotifications() {
    if (!("Notification" in window)) { setNotice("Ta przeglądarka nie obsługuje powiadomień."); return; }
    const permission = await Notification.requestPermission();
    setNotify(permission === "granted");
    setNotice(permission === "granted" ? "Powiadomienia włączone. Działają, gdy Nexoras jest otwarty." : "Nie przyznano zgody na powiadomienia.");
  }

  return <main className="shell"><section className="calendarPage">
    <a className="calendarBack" href="/">← Wróć do Nexoras Community</a>
    <div className="calendarHead"><div><div className="kicker">NEXORAS • ORGANIZER</div><h1>Twój kalendarz.</h1><p>Wydarzenia, plany i przypomnienia w jednym miejscu.</p></div>
      <div className="calendarActions"><button className="calendarBtn" onClick={enableNotifications}>{notify ? "🔔 Powiadomienia włączone" : "🔔 Włącz powiadomienia"}</button><button className="calendarBtn primary" onClick={()=>{setSelected(dateKey(new Date()));setMonth(new Date(new Date().getFullYear(),new Date().getMonth(),1));}}>Dzisiaj</button></div>
    </div>
    <div className="calendarLayout"><section className="calendarBox"><div className="monthBar"><button aria-label="Poprzedni miesiąc" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>←</button><h2>{month.toLocaleDateString("pl-PL",{month:"long",year:"numeric"})}</h2><button aria-label="Następny miesiąc" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>→</button></div>
      <div className="weekdays">{["Pon","Wt","Śr","Czw","Pt","Sob","Niedz"].map(d=><span key={d}>{d}</span>)}</div>
      <div className="daysGrid">{days.map(day=>{const key=dateKey(day),items=reminders.filter(r=>r.at.slice(0,10)===key);return <button key={key} className={`dayCell ${day.getMonth()!==month.getMonth()?"muted":""} ${key===dateKey(new Date())?"today":""} ${key===selected?"selected":""}`} onClick={()=>setSelected(key)}><span className="dayNum">{day.getDate()}</span>{items.slice(0,2).map(item=><span className="dayDot" key={item.id}>• {item.title}</span>)}{items.length>2&&<span className="dayDot">+{items.length-2} więcej</span>}</button>})}</div>
    </section><aside className="reminderBox"><div className="kicker">📌 PLAN DNIA</div><h2>{parseDate(selected).toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}</h2><p>Dodaj przypomnienie na wybrany dzień.</p>
      <form className="reminderForm" onSubmit={addReminder}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Co mam Ci przypomnieć?" maxLength={90} required/><input type="time" value={time} onChange={e=>setTime(e.target.value)} required/><textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Szczegóły (opcjonalnie)"/><button className="calendarBtn primary" type="submit">＋ Dodaj przypomnienie</button></form>
      <h2>Przypomnienia</h2><div className="reminderList">{selectedItems.length ? selectedItems.map(item=><article className="reminderItem" key={item.id}><small>🕒 {item.at.slice(11)} {item.notified?"• przypomniano":""}</small><strong>{item.title}</strong>{item.details&&<p>{item.details}</p>}<button onClick={()=>removeReminder(item.id)}>Usuń</button></article>) : <p className="emptyReminders">Brak przypomnień na ten dzień.</p>}</div>
      <p className="calendarNotice">Dane zapisują się w tej przeglądarce. Powiadomienia działają, gdy strona Nexoras jest otwarta.</p>{notice&&<p className="calendarNotice">{notice}</p>}
    </aside></div>
  </section></main>;
}
