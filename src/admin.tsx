import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  categories as seedCategories,
  events as seedEvents,
  initialWins,
  privileges as seedPrivileges,
  residents as seedResidents,
  scoreRules,
  type ClubEvent,
  type Resident,
  type WinPost,
} from "./burnData";
import { auth } from "./firebase";
import { useCollectionSync, useDocSync } from "./adminSync";
import "./admin.css";
import "./admin-v2.css";

type Section = "Обзор" | "Резиденты" | "Мероприятия" | "Рейтинг" | "Контент" | "Привилегии" | "Справочники";
type ManagedResident = Resident & { blocked?: boolean; membershipEnd?: string };
type PaymentStatus = "free" | "pending" | "paid";
type EventOperations = Record<string, { payment: PaymentStatus; visited: string[] }>;

const sections: Section[] = ["Обзор", "Резиденты", "Мероприятия", "Рейтинг", "Контент", "Привилегии", "Справочники"];

const initialResidents: ManagedResident[] = seedResidents.map(item => ({ ...item, membershipEnd: "2027-08-15" }));
const initialOperations: EventOperations = Object.fromEntries(seedEvents.map(item => [item.id, { payment: item.price ? "pending" : "free", visited: item.attendees.slice(0, 1) }]));

function LoginGate({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? "Неверный email или пароль" : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  };

  return <div className="admin-login">
    <form className="admin-login-card" onSubmit={submit}>
      <div className="admin-brand"><span>B</span><div><b>BURN</b><small>ADMIN SYSTEM</small></div></div>
      <label>Email<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required/></label>
      <label>Пароль<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required/></label>
      {error && <p className="admin-login-error">{error}</p>}
      <button className="primary" type="submit" disabled={busy}>{busy ? "Входим…" : "Войти"}</button>
    </form>
  </div>;
}

function Admin({ user }: { user: User }) {
  const [section, setSection] = useState<Section>("Обзор");
  const [residents, setResidents] = useCollectionSync<ManagedResident>("admin_residents", initialResidents);
  const [events, setEvents] = useCollectionSync<ClubEvent>("admin_events", seedEvents);
  const [wins, setWins] = useCollectionSync<WinPost>("admin_wins", initialWins);
  const [privileges, setPrivileges] = useCollectionSync("admin_privileges", seedPrivileges);
  const [rules, setRules] = useDocSync("admin_config", "scoreRules", scoreRules);
  const [cities, setCities] = useDocSync<string[]>("admin_config", "cities", ["Алматы", "Астана", "Шымкент"]);
  const [businessCategories, setBusinessCategories] = useDocSync<string[]>("admin_config", "categories", seedCategories);
  const [operations, setOperations] = useDocSync<EventOperations>("admin_config", "eventOperations", initialOperations);
  const [query, setQuery] = useState("");
  const [residentDraft, setResidentDraft] = useState<ManagedResident | null>(null);
  const [activityResident, setActivityResident] = useState<ManagedResident | null>(null);
  const [eventDraft, setEventDraft] = useState<ClubEvent | null>(null);

  const active = residents.filter(item => !item.blocked && item.attended >= 18).length;
  const inactive = residents.length - active;
  const registrations = events.reduce((sum, item) => sum + item.attendees.length, 0);
  const visits = Object.values(operations).reduce((sum, item) => sum + item.visited.length, 0);
  const attendance = registrations ? Math.round(visits / registrations * 100) : 0;
  const avg = residents.length ? Math.round(residents.reduce((sum, item) => sum + item.attended, 0) / residents.length) : 0;
  const filteredResidents = residents.filter(item => `${item.name} ${item.company} ${item.city} ${item.categories.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const sortedResidents = useMemo(() => [...residents].sort((a, b) => b.score - a.score), [residents]);

  const saveResident = () => {
    if (!residentDraft) return;
    const exists = residents.some(item => item.id === residentDraft.id);
    setResidents(exists ? residents.map(item => item.id === residentDraft.id ? residentDraft : item) : [...residents, residentDraft]);
    setResidentDraft(null);
  };
  const saveEvent = () => {
    if (!eventDraft) return;
    const exists = events.some(item => item.id === eventDraft.id);
    setEvents(exists ? events.map(item => item.id === eventDraft.id ? eventDraft : item) : [...events, eventDraft]);
    if (!operations[eventDraft.id]) setOperations({ ...operations, [eventDraft.id]: { payment: eventDraft.price ? "pending" : "free", visited: [] } });
    setEventDraft(null);
  };
  const openNewResident = () => setResidentDraft({ ...seedResidents[0], id: `resident-${Date.now()}`, name: "", company: "", score: 0, attended: 0, registered: 0, cancelled: 0, posts: 0, comments: 0, membershipEnd: "2027-08-15" });
  const openNewEvent = () => setEventDraft({ ...seedEvents[0], id: `event-${Date.now()}`, title: "", attendees: [], price: 0 });

  return <div className="admin-shell">
    <aside>
      <div className="admin-brand"><span>B</span><div><b>BURN</b><small>ADMIN SYSTEM</small></div></div>
      <nav>{sections.map(item => <button key={item} className={section === item ? "active" : ""} onClick={() => setSection(item)}>{item}</button>)}</nav>
      <footer><span>Синхронизировано с Firestore</span><a href="/">Открыть приложение</a></footer>
    </aside>
    <main>
      <header><div><small>BURN KAZAKHSTAN</small><h1>{section}</h1></div><div className="admin-user"><span>{(user.email || "AD").slice(0, 2).toUpperCase()}</span><p><b>{user.email}</b><small>Полный доступ</small></p><button className="admin-logout" onClick={() => signOut(auth)}>Выйти</button></div></header>

      {section === "Обзор" && <>
        <section className="admin-metrics">
          <article><small>Всего резидентов</small><b>{residents.length}</b><em>+2 за месяц</em></article>
          <article><small>Активные</small><b>{active}</b><em>{inactive} неактивных</em></article>
          <article><small>Регистрации</small><b>{registrations}</b><em>{attendance}% посетили</em></article>
          <article><small>Среднее посещений</small><b>{avg}</b><em>на резидента</em></article>
        </section>
        <section className="admin-grid">
          <article className="admin-panel"><header><h2>Активность по городам</h2></header>{cities.map(city => { const count = residents.filter(item => item.city === city).length; return <div className="city-bar" key={city}><span>{city}</span><i><b style={{ width: `${residents.length ? count / residents.length * 100 : 0}%` }} /></i><strong>{count}</strong></div>; })}</article>
          <article className="admin-panel"><header><h2>TOP-20 активности</h2></header>{sortedResidents.slice(0, 20).map((item, index) => <button className="admin-person admin-person-button" key={item.id} onClick={() => setActivityResident(item)}><strong>{index + 1}</strong><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.company}</small></span><em>{item.score}</em></button>)}</article>
          <article className="admin-panel admin-wide"><header><h2>20 требуют внимания</h2><span>Минимальная активность</span></header><div className="inactive-grid">{[...sortedResidents].reverse().slice(0, 20).map(item => <button key={item.id} onClick={() => setActivityResident(item)}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.attended} посещений · {item.score} баллов</small></span></button>)}</div></article>
        </section>
      </>}

      {section === "Резиденты" && <section className="admin-panel">
        <header><h2>Управление резидентами</h2><div><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Имя, компания, категория"/><button onClick={openNewResident}>+ Добавить</button></div></header>
        <table><thead><tr><th>Резидент</th><th>Город</th><th>Категории</th><th>Членство</th><th>Баллы</th><th>Статус</th><th/></tr></thead><tbody>{filteredResidents.map(item => <tr key={item.id}>
          <td><button className="table-person table-person-button" onClick={() => setActivityResident(item)}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.company}</small></span></button></td>
          <td>{item.city}</td><td>{item.categories.join(", ")}</td><td>{item.membershipEnd}</td><td>{item.score}</td><td><span className={`admin-status ${item.blocked ? "blocked" : "active"}`}>{item.blocked ? "Заблокирован" : "Активен"}</span></td>
          <td><div className="row-actions"><button onClick={() => setResidentDraft(item)}>Изменить</button><button onClick={() => setResidents(residents.map(person => person.id === item.id ? { ...person, blocked: !person.blocked } : person))}>{item.blocked ? "Разблокировать" : "Блокировать"}</button><button className="danger" onClick={() => setResidents(residents.filter(person => person.id !== item.id))}>Удалить</button></div></td>
        </tr>)}</tbody></table>
      </section>}

      {section === "Мероприятия" && <section className="admin-panel">
        <header><h2>Мероприятия, оплаты и посещаемость</h2><button onClick={openNewEvent}>+ Создать</button></header>
        <div className="admin-event-list">{events.map(item => { const op = operations[item.id] || { payment: item.price ? "pending" : "free", visited: [] }; return <article key={item.id}>
          <img src={item.image} alt=""/><span><b>{item.title}</b><small>{item.date} · {item.city}</small></span>
          <p><strong>{item.attendees.length}/{item.capacity}</strong><small>регистраций</small></p>
          <p><strong>{item.price ? `${item.price.toLocaleString()} ₸` : "Бесплатно"}</strong><small>{op.payment === "paid" ? "Оплачено" : op.payment === "pending" ? "Ожидает оплаты" : "Без оплаты"}</small></p>
          <p><strong>{op.visited.length}</strong><small>фактически посетили</small></p>
          <div className="event-actions"><button onClick={() => setEventDraft(item)}>Изменить</button>{item.price > 0 && op.payment !== "paid" && <button onClick={() => setOperations({ ...operations, [item.id]: { ...op, payment: "paid" } })}>Подтвердить оплату</button>}<button onClick={() => { const next = item.attendees.find(id => !op.visited.includes(id)); if (next) setOperations({ ...operations, [item.id]: { ...op, visited: [...op.visited, next] } }); }}>+ Посетил</button><button className="danger" onClick={() => setEvents(events.filter(event => event.id !== item.id))}>Удалить</button></div>
        </article>; })}</div>
      </section>}

      {section === "Рейтинг" && <section className="admin-grid">
        <article className="admin-panel"><header><h2>Правила начисления</h2><span>Применяются к новым действиям</span></header>{Object.entries(rules).map(([key, value]) => <label className="rule-row" key={key}><span>{({ visit: "Посещение", organize: "Организация", publish: "Публикация", comment: "Комментарий", receivedLike: "Полученный лайк", board: "Совет директоров" } as Record<string, string>)[key]}</span><input type="number" value={value} onChange={event => setRules({ ...rules, [key]: Number(event.target.value) })}/><small>баллов</small></label>)}</article>
        <article className="admin-panel"><header><h2>Ручная корректировка</h2></header>{residents.map(item => <div className="admin-person" key={item.id}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.score} баллов</small></span><button onClick={() => setResidents(residents.map(person => person.id === item.id ? { ...person, score: person.score + 100 } : person))}>+100</button><button onClick={() => setResidents(residents.map(person => person.id === item.id ? { ...person, score: Math.max(0, person.score - 100) } : person))}>−100</button></div>)}</article>
      </section>}

      {section === "Контент" && <section className="admin-panel"><header><h2>Модерация Побед</h2><span>{wins.filter(item => item.status === "moderation").length} ожидают проверки</span></header><div className="moderation-list">{wins.map(item => { const author = residents.find(person => person.id === item.authorId); return <article key={item.id}><img src={item.images[0] || author?.image} alt=""/><span><b>{author?.name}</b><p>{item.text}</p><small>{item.status} · {item.comments.length} комментариев</small><div className="admin-comments">{item.comments.map(comment => <span key={comment.id}>{comment.text}<button onClick={() => setWins(wins.map(post => post.id === item.id ? { ...post, comments: post.comments.filter(value => value.id !== comment.id) } : post))}>Удалить</button></span>)}</div></span><button onClick={() => setWins(wins.map(post => post.id === item.id ? { ...post, status: "published" } : post))}>Одобрить</button><button className="danger" onClick={() => setWins(wins.map(post => post.id === item.id ? { ...post, status: "removed" } : post))}>Удалить пост</button></article>; })}</div></section>}

      {section === "Привилегии" && <section className="admin-panel"><header><h2>Предложения резидентов</h2><button onClick={() => setPrivileges([...privileges, { ...seedPrivileges[0], id: `priv-${Date.now()}`, company: "Новое предложение" }])}>+ Добавить</button></header><div className="admin-privileges">{privileges.map(item => <article key={item.id}><span>{item.logo}</span><div><b>{item.company}</b><small>{item.category} · {item.city}</small><p>{item.benefit} · {item.description}</p></div><button className="danger" onClick={() => setPrivileges(privileges.filter(value => value.id !== item.id))}>Удалить</button></article>)}</div></section>}

      {section === "Справочники" && <section className="admin-grid"><Dictionary title="Города BURN" values={cities} onChange={setCities}/><Dictionary title="Категории бизнеса" values={businessCategories} onChange={setBusinessCategories}/></section>}
    </main>

    {residentDraft && <ResidentEditor resident={residentDraft} cities={cities} categories={businessCategories} onChange={setResidentDraft} onClose={() => setResidentDraft(null)} onSave={saveResident}/>} 
    {eventDraft && <EventEditor event={eventDraft} cities={cities} residents={residents} onChange={setEventDraft} onClose={() => setEventDraft(null)} onSave={saveEvent}/>} 
    {activityResident && <ActivityDrawer resident={activityResident} position={sortedResidents.findIndex(item => item.id === activityResident.id) + 1} onClose={() => setActivityResident(null)} onRenew={() => { const end = new Date(activityResident.membershipEnd || "2027-08-15"); end.setFullYear(end.getFullYear() + 1); const membershipEnd = end.toISOString().slice(0, 10); const next = { ...activityResident, membershipEnd }; setResidents(residents.map(item => item.id === next.id ? next : item)); setActivityResident(next); }}/>} 
  </div>;
}

function Dictionary({ title, values, onChange }: { title: string; values: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");
  return <article className="admin-panel"><header><h2>{title}</h2></header><form className="dictionary-add" onSubmit={event => { event.preventDefault(); const value = draft.trim(); if (value && !values.includes(value)) onChange([...values, value]); setDraft(""); }}><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Новое значение"/><button>Добавить</button></form>{values.map((item, index) => <div className="dictionary-row" key={`${item}-${index}`}><input value={item} onChange={event => onChange(values.map((value, valueIndex) => valueIndex === index ? event.target.value : value))}/><button className="danger" onClick={() => onChange(values.filter((_, valueIndex) => valueIndex !== index))}>Удалить</button></div>)}</article>;
}

function ResidentEditor({ resident, cities, categories, onChange, onClose, onSave }: { resident: ManagedResident; cities: string[]; categories: string[]; onChange: (value: ManagedResident) => void; onClose: () => void; onSave: () => void }) {
  return <div className="admin-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="admin-editor"><header><div><small>КАРТОЧКА РЕЗИДЕНТА</small><h2>{resident.name || "Новый резидент"}</h2></div><button onClick={onClose}>×</button></header><div className="editor-grid"><label>Имя<input value={resident.name} onChange={event => onChange({ ...resident, name: event.target.value })}/></label><label>Компания<input value={resident.company} onChange={event => onChange({ ...resident, company: event.target.value })}/></label><label>Должность<input value={resident.role} onChange={event => onChange({ ...resident, role: event.target.value })}/></label><label>Город<select value={resident.city} onChange={event => onChange({ ...resident, city: event.target.value as Resident["city"] })}>{cities.map(item => <option key={item}>{item}</option>)}</select></label><label className="editor-wide">Категории<select multiple value={resident.categories} onChange={event => onChange({ ...resident, categories: [...event.target.selectedOptions].map(option => option.value) })}>{categories.map(item => <option key={item}>{item}</option>)}</select></label><label>Дата вступления<input type="date" value={resident.joinedAt} onChange={event => onChange({ ...resident, joinedAt: event.target.value })}/></label><label>Членство до<input type="date" value={resident.membershipEnd} onChange={event => onChange({ ...resident, membershipEnd: event.target.value })}/></label><label className="editor-wide">Описание<textarea value={resident.bio} onChange={event => onChange({ ...resident, bio: event.target.value })}/></label><label>Чем полезен<textarea value={resident.useful} onChange={event => onChange({ ...resident, useful: event.target.value })}/></label><label>Запрос<textarea value={resident.request} onChange={event => onChange({ ...resident, request: event.target.value })}/></label></div><footer><button onClick={onClose}>Отмена</button><button className="primary" onClick={onSave} disabled={!resident.name.trim() || !resident.company.trim()}>Сохранить</button></footer></section></div>;
}

function EventEditor({ event, cities, residents, onChange, onClose, onSave }: { event: ClubEvent; cities: string[]; residents: ManagedResident[]; onChange: (value: ClubEvent) => void; onClose: () => void; onSave: () => void }) {
  return <div className="admin-overlay" onMouseDown={value => value.target === value.currentTarget && onClose()}><section className="admin-editor"><header><div><small>МЕРОПРИЯТИЕ</small><h2>{event.title || "Новое мероприятие"}</h2></div><button onClick={onClose}>×</button></header><div className="editor-grid"><label className="editor-wide">Название<input value={event.title} onChange={value => onChange({ ...event, title: value.target.value })}/></label><label>Дата<input value={event.date} onChange={value => onChange({ ...event, date: value.target.value })}/></label><label>Время<input type="time" value={event.time} onChange={value => onChange({ ...event, time: value.target.value })}/></label><label>Город<select value={event.city} onChange={value => onChange({ ...event, city: value.target.value as ClubEvent["city"] })}>{cities.map(item => <option key={item}>{item}</option>)}</select></label><label>Место<input value={event.place} onChange={value => onChange({ ...event, place: value.target.value })}/></label><label>Организатор<select value={event.organizerId} onChange={value => onChange({ ...event, organizerId: value.target.value })}>{residents.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Лимит мест<input type="number" value={event.capacity} onChange={value => onChange({ ...event, capacity: Number(value.target.value) })}/></label><label>Стоимость<input type="number" value={event.price} onChange={value => onChange({ ...event, price: Number(value.target.value) })}/></label><label className="editor-wide">Описание<textarea value={event.description} onChange={value => onChange({ ...event, description: value.target.value })}/></label></div><footer><button onClick={onClose}>Отмена</button><button className="primary" onClick={onSave} disabled={!event.title.trim()}>Сохранить</button></footer></section></div>;
}

function ActivityDrawer({ resident, position, onClose, onRenew }: { resident: ManagedResident; position: number; onClose: () => void; onRenew: () => void }) {
  return <div className="admin-overlay drawer-overlay" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="activity-drawer"><header><div><small>АКТИВНОСТЬ РЕЗИДЕНТА</small><h2>{resident.name}</h2><p>{resident.company} · {resident.city}</p></div><button onClick={onClose}>×</button></header><div className="activity-score"><span><small>Баллы</small><b>{resident.score.toLocaleString()}</b></span><span><small>Место</small><b>№{position}</b></span></div><div className="activity-list"><span><small>Мероприятий за год</small><b>{resident.registered}</b></span><span><small>Зарегистрировался</small><b>{resident.registered}</b></span><span><small>Посетил</small><b>{resident.attended}</b></span><span><small>Отменил</small><b>{resident.cancelled}</b></span><span><small>Публикаций</small><b>{resident.posts}</b></span><span><small>Комментариев</small><b>{resident.comments}</b></span></div><article><small>ЧЛЕНСТВО ДО</small><h3>{resident.membershipEnd}</h3><button onClick={onRenew}>Продлить на 1 год</button></article></section></div>;
}

function AdminRoot() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, next => setUser(next)), []);

  if (user === undefined) return <div className="admin-login"><p className="admin-login-loading">Загрузка…</p></div>;
  if (!user) return <LoginGate onSignedIn={() => {}}/>;
  return <Admin user={user}/>;
}

ReactDOM.createRoot(document.getElementById("admin-root")!).render(<AdminRoot/>);
