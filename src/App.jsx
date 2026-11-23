import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Check, CheckCircle2, CircleHelp, Clock3,
  Crown, Gift, Brush, Languages, LockKeyhole, Scissors, ShieldCheck, Sparkles, Timer,
  UserRound, Users, UserPlus, X,
} from 'lucide-react';
import { translations } from './data/seed';
import {
  callNextForBarber, canMarkNoShow, createSpot, getActiveSpots,
  getBarberCurrentSpot, getEstimatedWait, getNextForBarber, getServiceTotals,
  getSpotPosition, getTodayStats, isOnlineJoinOpen, minutesSince, startSpot, completeSpot, markSpotNoShow, cancelWaitingSpot,
} from './lib/queue';
import { getState, initializeStore, isStoreReady, subscribe, updateState, supabaseEnabled } from './lib/store';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const fmtTime = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
const sortOldest = (a, b) => a.createdAt - b.createdAt;

function useSalon() {
  const state = useSyncExternalStore(subscribe, getState, getState);
  const [ready, setReady] = useState(isStoreReady());
  useEffect(() => {
    initializeStore().then(() => setReady(true));
  }, []);
  return { state, ready };
}

function App() {
  const { state, ready } = useSalon();
  const [lang, setLang] = useState(() => localStorage.getItem('aura-language') || 'en');
  const [now, setNow] = useState(Date.now());
  const t = translations[lang];
  useEffect(() => {
    localStorage.setItem('aura-language', lang);
  }, [lang]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  if (!ready) return <div className="boot-screen"><div className="brand-mark"><Sparkles size={22} /></div><p>Preparing your seat at Aura…</p></div>;

  return (
    <div className="app-shell" lang={lang === 'gu' ? 'gu' : 'en'}>
      <Routes>
        <Route path="/display" element={<TvDisplay state={state} t={t} now={now} />} />
        <Route path="*" element={<>
          <Header t={t} lang={lang} setLang={setLang} state={state} />
          <main className="page-wrap">
            <Routes>
              <Route path="/" element={<Home state={state} t={t} now={now} lang={lang} />} />
              <Route path="/join" element={<JoinQueue state={state} t={t} lang={lang} now={now} />} />
              <Route path="/status/:id" element={<MyStatus state={state} t={t} now={now} />} />
              <Route path="/reception" element={<Reception state={state} t={t} now={now} />} />
              <Route path="/barber" element={<BarberView state={state} t={t} now={now} />} />
              <Route path="/barber/:name" element={<BarberView state={state} t={t} now={now} />} />
              <Route path="/admin" element={<Admin state={state} t={t} now={now} />} />
              <Route path="*" element={<NotFound t={t} />} />
            </Routes>
          </main>
          <Footer t={t} />
        </>} />
      </Routes>
      <div className={`connection-pill ${supabaseEnabled ? 'is-live' : ''}`} title={supabaseEnabled ? 'Shared Supabase state' : 'Local browser demo only'}>
        <span className="connection-dot" />{supabaseEnabled ? 'Live sync enabled' : 'Local demo mode'}
      </div>
    </div>
  );
}

function Header({ t, lang, setLang, state }) {
  const onlineOpen = isOnlineJoinOpen(state);
  return <header className="site-header">
    <div className="header-inner">
      <Link to="/" className="brand-lockup" aria-label="Aura Salon home">
        <span className="brand-mark"><Sparkles size={21} strokeWidth={1.8} /></span>
        <span><strong>AURA</strong><small>S A L O N</small></span>
      </Link>
      <nav className="main-nav">
        <NavLink to="/" end>{t.home}</NavLink>
        <a href="/#services">{t.ourServices}</a>
        <NavLink to="/reception">{t.reception}</NavLink>
      </nav>
      <div className="header-actions">
        <div className="open-indicator"><span className={onlineOpen ? 'status-dot' : 'status-dot is-muted'} />{onlineOpen ? t.open : t.closed}</div>
        <button className="lang-toggle" onClick={() => setLang(lang === 'en' ? 'gu' : 'en')} aria-label="Change language"><Languages size={16} />{lang === 'en' ? 'EN' : 'ગુ'}</button>
        <Link className="button button-gold button-small" to="/join">{t.joinNow}<ArrowRight size={16} /></Link>
      </div>
    </div>
  </header>;
}

function Footer({ t }) {
  return <footer className="site-footer">
    <div className="footer-brand"><span className="brand-mark small"><Sparkles size={16} /></span><span><strong>AURA SALON</strong><small>Make room for yourself.</small></span></div>
    <div className="footer-links"><Link to="/reception">{t.reception}</Link><Link to="/barber">{t.barber}</Link><Link to="/display">{t.display}</Link><Link to="/admin">{t.admin}</Link></div>
    <span className="footer-copy">© 2026 Aura Salon · Made with care</span>
  </footer>;
}

function Home({ state, t, now, lang }) {
  const navigate = useNavigate();
  const [trackPhone, setTrackPhone] = useState('');
  const [trackError, setTrackError] = useState('');
  const active = getActiveSpots(state);
  const waiting = active.filter((spot) => spot.status === 'Waiting');
  const totalWait = waiting.length ? Math.ceil(waiting.reduce((sum, spot) => sum + getServiceTotals(state, spot.serviceIds).minutes, 0) / Math.max(1, state.barbers.filter((b) => b.onDuty && !b.onBreak).length)) : 0;
  const onlineOpen = isOnlineJoinOpen(state, new Date(now));
  const services = state.services.filter((service) => service.active);
  function trackSpot(event) {
    event.preventDefault();
    setTrackError('');
    if (!/^\d{10}$/.test(trackPhone)) return setTrackError(t.phoneInvalid);
    const found = getActiveSpots(state).find((spot) => spot.phone === trackPhone);
    if (!found) return setTrackError(t.noActiveSpot);
    navigate(`/status/${found.id}`);
  }
  return <>
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" />{t.heroEyebrow}</div>
        <h1>{t.heroTitle}</h1>
        <p className="hero-intro">{t.heroText}</p>
        <div className="hero-buttons"><Link to="/join" className="button button-gold">{t.joinNow}<ArrowRight size={17} /></Link><a className="text-link" href="#live-queue">{t.viewLive}<ArrowDownRight size={16} /></a></div>
        <form className="hero-track" onSubmit={trackSpot}>
          <label htmlFor="track-phone">{t.trackPrompt}</label>
          <div><input id="track-phone" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={t.phonePlaceholder} inputMode="numeric"/><button type="submit">{t.trackAction}<ArrowRight size={14}/></button></div>
          {trackError && <small role="alert">{trackError}</small>}
        </form>
        <div className="hero-trust"><div className="avatar-stack"><span>R</span><span>A</span><span>I</span></div><span><strong>{t.trustTitle}</strong><small>{t.trustText}</small></span></div>
      </div>
      <div className="hero-art">
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="art-sun"><Sparkles size={28} /></div>
        <div className="art-quote"><span className="quote-mark">“</span><p>Take a breath.<br/>You’re right on time.</p><small>THE AURA PROMISE</small></div>
        <div className="art-plant plant-one">✳</div><div className="art-plant plant-two">✽</div>
        <div className="art-caption"><span>01 / 03</span><span>THE EVERYDAY RITUAL</span></div>
      </div>
    </section>

    <section id="live-queue" className="live-strip">
      <div className="live-heading"><span className="live-pulse" /><span>{t.liveAt}</span></div>
      <div className="live-metric"><strong>{waiting.length}</strong><span>{t.waitingNow}</span></div>
      <div className="live-divider" />
      <div className="live-metric"><strong>{totalWait} <small>{t.minutes}</small></strong><span>{t.approxWait}</span></div>
      <div className="live-spacer" />
      <div className="live-team">{state.barbers.map((barber) => <div className="team-chip" key={barber.id}><span className={`mini-avatar avatar-${barber.id}`}>{barber.name[0]}</span><span>{barber.name}<small>{barber.onBreak ? t.onBreak : !barber.onDuty ? t.offDuty : getBarberCurrentSpot(state, barber.id) ? t.busy : t.available}</small></span></div>)}</div>
    </section>

    <section id="services" className="services-section">
      <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" />{t.curated}</div><h2>{t.ourServices}</h2><p>{t.serviceNote}</p></div><Link to="/join" className="text-link">{t.exploreAll}<ArrowRight size={16} /></Link></div>
      <div className="service-preview-grid">{services.slice(0, 4).map((service, index) => <ServicePreview key={service.id} service={service} index={index} t={t} lang={lang} />)}</div>
    </section>

    <section className="promise-banner"><div className="promise-icon"><Gift size={23} /></div><div><span className="eyebrow">{t.smallPromise}</span><h3>{t.promiseTitle}</h3><p>{t.promiseText}</p></div><Link to="/join" className="button button-dark">{t.savePlace}<ArrowUpRight size={16} /></Link></section>
  </>;
}

function ServicePreview({ service, index, t, lang }) {
  const icons = [Scissors, Sparkles, Brush, Crown];
  const Icon = icons[index % icons.length];
  return <article className={`service-preview service-tone-${index + 1}`}><div className="service-topline"><span className="service-icon"><Icon size={19} /></span><span className="service-number">0{index + 1}</span></div><div><h3>{lang === 'gu' ? service.nameGu : service.nameEn}</h3><div className="service-meta"><span><Clock3 size={13} />{service.minutes} {t.minutes}</span><strong>{money(service.price)}</strong></div></div></article>;
}

function JoinQueue({ state, t, lang, now }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selected, setSelected] = useState([]);
  const [barber, setBarber] = useState('any');
  const [error, setError] = useState('');
  const onlineOpen = isOnlineJoinOpen(state, new Date(now));
  const activeServices = state.services.filter((service) => service.active);
  const totals = getServiceTotals(state, selected);
  const roughWait = Math.ceil(getActiveSpots(state).reduce((sum, spot) => sum + getServiceTotals(state, spot.serviceIds).minutes, 0) / Math.max(1, state.barbers.filter((item) => item.onDuty && !item.onBreak).length));
  function toggleService(id) {
    setError('');
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
    if (!selected.includes(id) && selected.length >= 3) setError(t.maxServices);
  }
  function submit(event) {
    event.preventDefault();
    setError('');
    if (!name.trim()) return setError(t.nameRequired);
    if (!/^\d{10}$/.test(phone)) return setError(t.phoneInvalid);
    if (!selected.length) return setError(t.chooseAtLeastOne);
    if (!onlineOpen) return setError(t.closedMessage);
    let created;
    let duplicate;
    updateState((draft) => {
      const result = createSpot(draft, { name, phone, serviceIds: selected, barberPreference: barber }, 'online');
      created = result.spot;
      duplicate = result.duplicate;
    });
    if (duplicate) navigate(`/status/${duplicate.id}`);
    else if (created) navigate(`/status/${created.id}`);
  }
  return <div className="form-page">
    <div className="page-intro"><div className="eyebrow"><span className="eyebrow-line" />{t.formEyebrow}</div><h1>{t.formTitle}</h1><p>{t.formIntro}</p></div>
    <form className="booking-layout" onSubmit={submit}>
      <div className="booking-main">
        <section className="form-card"><div className="form-step"><span>01</span><div><h2>{t.yourDetails}</h2><p>A name and number to keep your place connected to you.</p></div></div>
          <div className="field-grid"><label className="field"><span>{t.fullName}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} autoComplete="name" /></label><label className="field"><span>{t.phone}</span><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={t.phonePlaceholder} inputMode="numeric" autoComplete="tel-national"/><small>{t.phoneHelp}</small></label></div>
        </section>
        <section className="form-card"><div className="form-step"><span>02</span><div><h2>{t.chooseService}</h2><p>{t.upToThree}</p></div></div>
          <div className="booking-service-grid">{activeServices.map((service) => <button type="button" key={service.id} onClick={() => toggleService(service.id)} className={`booking-service ${selected.includes(service.id) ? 'selected' : ''}`}><span className="service-check">{selected.includes(service.id) ? <Check size={15} /> : <span />}</span><span className="booking-service-copy"><strong>{lang === 'gu' ? service.nameGu : service.nameEn}</strong><small>{service.minutes} {t.minutes}</small></span><b>{money(service.price)}</b></button>)}</div>
        </section>
        <section className="form-card"><div className="form-step"><span>03</span><div><h2>{t.chooseBarber}</h2><p>{t.barberIntro}</p></div></div>
          <div className="barber-choice-grid"><button type="button" onClick={() => setBarber('any')} className={`barber-choice any-choice ${barber === 'any' ? 'selected' : ''}`}><span className="any-avatar"><Sparkles size={18} /></span><span><strong>{t.anyBarber}</strong><small>We’ll find the earliest available chair</small></span>{barber === 'any' && <CheckCircle2 size={18} />}</button>{state.barbers.filter((item) => item.onDuty).map((item) => <button type="button" key={item.id} onClick={() => setBarber(item.id)} className={`barber-choice ${barber === item.id ? 'selected' : ''}`}><span className={`barber-avatar avatar-${item.id}`}>{item.name[0]}</span><span><strong>{item.name}</strong><small>{item.onBreak ? t.onBreak : getBarberCurrentSpot(state, item.id) ? t.busy : t.available}</small></span>{barber === item.id && <CheckCircle2 size={18} />}</button>)}</div>
          {barber !== 'any' && state.barbers.find((item) => item.id === barber)?.onBreak && <div className="barber-break-note"><Bell size={15}/>{state.barbers.find((item) => item.id === barber)?.name} {t.barberBreakNotice}</div>}
        </section>
        {error && <div className="form-error"><CircleHelp size={16} />{error}</div>}
      </div>
      <aside className="booking-summary"><span className="summary-kicker">{t.summaryKicker}</span><h2>{t.summary}</h2><p className="summary-caption">{t.summaryCaption}</p><div className="summary-services">{selected.length ? selected.map((id) => { const service = state.services.find((s) => s.id === id); return <div key={id}><span>{lang === 'gu' ? service?.nameGu : service?.nameEn}</span><strong>{money(service?.price)}</strong></div>; }) : <p className="summary-placeholder">{t.summaryPlaceholder}</p>}</div><div className="summary-divider"/><div className="summary-line"><span>{t.totalTime}</span><strong>{totals.minutes} {t.minutes}</strong></div><div className="summary-line"><span>{t.totalPrice}</span><strong>{money(totals.price)}</strong></div><div className="summary-wait"><span><Timer size={16} />{t.estimatedWait}</span><strong>~{roughWait} {t.minutes}</strong></div><button type="submit" className="button button-gold button-full" disabled={!onlineOpen}>{onlineOpen ? t.confirmSpot : t.onlineClosedShort}<ArrowRight size={17}/></button><small className="summary-footnote"><ShieldCheck size={14}/> {t.heldText}</small></aside>
    </form>
  </div>;
}

function MyStatus({ state, t, now }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const spot = state.spots.find((item) => item.id === id);
  if (!spot) return <div className="empty-page"><CircleHelp size={35}/><h1>{t.tokenNotFound}</h1><p>{t.noActiveSpot}</p><Link to="/" className="button button-dark">{t.backHome}</Link></div>;
  const position = getSpotPosition(state, spot.id);
  const estimate = getEstimatedWait(state, spot.id);
  const ahead = Math.max(0, (position || 1) - 1);
  const barber = state.barbers.find((item) => item.id === spot.assignedBarberId || item.id === spot.barberPreference);
  const canCancel = spot.status === 'Waiting';
  const activeTimeline = ['Waiting', 'Called', 'In chair', 'Done'];
  const currentIndex = activeTimeline.indexOf(spot.status);
  function cancel() {
    if (!window.confirm(t.confirmCancel)) return;
    updateState((draft) => cancelWaitingSpot(draft, id));
  }
  return <div className="status-page">
    <div className="status-topline"><Link to="/" className="back-link">← {t.home}</Link><span className="status-live"><span className="live-pulse"/>{t.liveQueueUpdate}</span></div>
    <div className={`status-hero ${spot.status === 'Called' ? 'is-called' : ''}`}>
      <div className="status-orbit"/><div className="status-overline">{spot.status === 'Called' ? t.itsYourTurn : t.yourToken}</div><div className="token-number">{spot.token}</div>
      <div className="status-person">{spot.name} · {spot.serviceIds.map((id) => state.services.find((service) => service.id === id)?.nameEn).filter(Boolean).join(' + ')}</div>
      {spot.status === 'Waiting' && <div className="status-wait-grid"><div><strong>{position ?? '—'}<small> / {t.position}</small></strong><span>{ahead} {t.peopleAhead}</span></div><div><strong>{estimate}<small> {t.minutes}</small></strong><span>{t.estimatedWait}</span></div></div>}
      {spot.status === 'Waiting' && position === 2 && <div className="coming-banner"><Bell size={18}/>{t.startComing}</div>}
      {spot.status === 'Called' && <div className="called-message">{t.goTo} <strong>{barber?.name || 'your stylist'}</strong></div>}
      {spot.status === 'In chair' && <div className="called-message">{t.serviceInProgress}</div>}
      {spot.status === 'Done' && <div className="called-message">{t.visitComplete}</div>}
      {['Cancelled', 'No-show'].includes(spot.status) && <div className="called-message">{spot.status === 'Cancelled' ? t.spotCancelled : t.spotNoShow}</div>}
    </div>
    <section className="timeline-card"><div className="timeline-heading"><div><span className="eyebrow">{t.visitProgress}</span><h2>{t.visitProgressTitle}</h2></div><StatusBadge status={spot.status} t={t}/></div><div className="status-timeline">{activeTimeline.map((step, index) => <div className={`timeline-step ${index <= currentIndex ? 'complete' : ''} ${index === currentIndex ? 'current' : ''}`} key={step}><span className="timeline-marker">{index < currentIndex ? <Check size={14}/> : index + 1}</span><span>{({ Waiting: t.waiting, Called: t.called, 'In chair': t.inChair, Done: t.done })[step] || step}</span></div>)}</div>{canCancel && <button className="button button-quiet" onClick={cancel}>{t.cancelSpot}</button>}</section>
    <div className="status-help"><CircleHelp size={16}/><span>{t.needHelp}</span><Link to="/reception">{t.receptionDesk} <ArrowRight size={14}/></Link></div>
  </div>;
}

function StatusBadge({ status, t }) {
  const cls = status.toLowerCase().replace(' ', '-');
  const label = ({ Waiting: t.waiting, Called: t.called, 'In chair': t.inChair, Done: t.done, Cancelled: t.cancelled, 'No-show': t.noShow })[status] || status;
  return <span className={`status-badge ${cls}`}>{label}</span>;
}

function StaffGate({ children, title, t }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('aura-staff-unlocked') === 'yes');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  if (unlocked) return children;
  function submit(e) { e.preventDefault(); if (pin === '2468') { sessionStorage.setItem('aura-staff-unlocked', 'yes'); setUnlocked(true); } else setError(true); }
  return <div className="gate-wrap"><form className="gate-card" onSubmit={submit}><div className="gate-icon"><LockKeyhole size={23}/></div><div className="eyebrow">AURA / TEAM ACCESS</div><h1>{title || t.enterPin}</h1><p>{t.teamAccessCopy}</p><label className="field"><span>{t.pinLabel}</span><input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" inputMode="numeric" type="password" maxLength={4}/></label>{error && <div className="form-error">{t.invalidPin}</div>}<button className="button button-gold button-full" type="submit">{t.unlock}<ArrowRight size={16}/></button><small>{t.demoPin} <strong>2468</strong></small></form></div>;
}

function Reception({ state, t, now }) {
  const [showAdd, setShowAdd] = useState(false);
  const active = getActiveSpots(state);
  const waiting = active.filter((spot) => spot.status === 'Waiting');
  const called = active.filter((spot) => spot.status === 'Called');
  const chair = active.filter((spot) => spot.status === 'In chair');
  const stats = getTodayStats(state);
  function markNoShow(id) { updateState((draft) => markSpotNoShow(draft, id, now)); }
  function cancelSpot(id) { updateState((draft) => cancelWaitingSpot(draft, id)); }
  function callNext(barberId) {
    const result = updateState((draft) => callNextForBarber(draft, barberId));
    if (!result) window.alert('No eligible customer is waiting for this barber, or the barber is unavailable.');
  }
  return <StaffGate title={t.reception} t={t}><div className="staff-page">
    <div className="staff-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{t.frontDeskEyebrow}</div><h1>{t.greeting}</h1><p>{t.floorIntro}</p></div><div className="staff-heading-actions"><span className="last-updated"><span className="live-pulse"/>{t.liveUpdates}</span><button className="button button-gold" onClick={() => setShowAdd(true)}><UserPlus size={17}/>{t.addWalkIn}</button></div></div>
    <div className="stats-grid"><StatCard icon={<Users size={18}/>} label={t.waitingNow} value={waiting.length} note={`${called.length} ${t.calledCount} · ${chair.length} ${t.inChairCount}`}/><StatCard icon={<CheckCircle2 size={18}/>} label={t.servedToday} value={stats.served} note={t.completedVisitsToday}/><StatCard icon={<Clock3 size={18}/>} label={t.averageWait} value={`${stats.averageWait} min`} note={t.fromArrival}/><StatCard icon={<Bell size={18}/>} label={t.noShows} value={stats.noShows} note={t.markedToday}/></div>
    <section className="staff-section"><div className="staff-section-heading"><div><span className="eyebrow">{t.floor}</span><h2>{t.stylistStations}</h2></div><span className="subtle-count">{state.barbers.filter((barber) => barber.onDuty).length} on duty</span></div><div className="barber-station-grid">{state.barbers.map((barber) => { const current = getBarberCurrentSpot(state, barber.id); const next = getNextForBarber(state, barber.id); return <article className="station-card" key={barber.id}><div className="station-top"><div className={`barber-avatar large avatar-${barber.id}`}>{barber.name[0]}</div><div><h3>{barber.name}</h3><small>{barber.role}</small></div><span className={`station-status ${!barber.onDuty ? 'muted' : barber.onBreak ? 'warning' : current ? 'busy' : 'ready'}`}>{!barber.onDuty ? t.offDuty : barber.onBreak ? t.onBreak : current ? t.busy : t.available}</span></div><div className="station-current">{current ? <><span className="mini-label">{t.currentGuest}</span><div className="station-guest"><strong>{current.token} · {current.name}</strong><small>{current.serviceIds.map((id) => state.services.find((s) => s.id === id)?.nameEn).filter(Boolean).join(' + ')}</small></div><div className="progress-track"><span style={{ width: current.status === 'In chair' ? '62%' : '22%' }}/></div></> : <div className="station-free"><span className="mini-label">{t.currentChair}</span><strong>{t.readyGuest}</strong></div>}</div><div className="station-bottom"><span>{next ? `${t.nextLabel}: ${next.token} · ${next.name}` : t.noEligibleGuest}</span><button className="button button-dark button-small" onClick={() => callNext(barber.id)} disabled={!barber.onDuty || barber.onBreak || Boolean(current) || !next}>{t.callNext}<ArrowRight size={14}/></button></div></article>; })}</div></section>
    <section className="staff-section"><div className="staff-section-heading"><div><span className="eyebrow">FIRST COME, FIRST SERVED</span><h2>{t.waitingList}</h2></div><span className="subtle-count">{active.length} active spots</span></div><div className="queue-table-wrap"><table className="queue-table"><thead><tr><th>Token</th><th>{t.customer}</th><th>{t.service}</th><th>{t.barberPref}</th><th>{t.wait}</th><th>Status</th><th>{t.actions}</th></tr></thead><tbody>{active.slice().sort(sortOldest).map((spot) => { const pref = spot.barberPreference === 'any' ? 'Any barber' : state.barbers.find((b) => b.id === spot.barberPreference)?.name || '—'; const serviceNames = spot.serviceIds.map((id) => state.services.find((s) => s.id === id)?.nameEn).filter(Boolean).join(', '); const waitingMinutes = minutesSince(spot.createdAt, now); return <tr key={spot.id} className={waitingMinutes > 60 && spot.status === 'Waiting' ? 'overdue-row' : ''}><td><strong className="table-token">{spot.token}</strong></td><td><strong>{spot.name}</strong><small>{spot.phone}</small></td><td>{serviceNames}</td><td>{pref}</td><td><span className={waitingMinutes > 60 ? 'overdue-time' : ''}>{waitingMinutes} min</span></td><td><StatusBadge status={spot.status} t={t}/></td><td><div className="table-actions">{spot.status === 'Called' && <button className="text-action danger" onClick={() => markNoShow(spot.id)} disabled={!canMarkNoShow(spot, now)} title={canMarkNoShow(spot, now) ? 'Mark no-show' : `${t.noShowAfter} ${fmtTime(spot.calledAt + 10 * 60000)}`}>{t.markNoShow}</button>}{spot.status === 'Waiting' && <button className="text-action muted-action" onClick={() => cancelSpot(spot.id)}>{t.cancel}</button>}</div></td></tr>; })}</tbody></table>{active.length === 0 && <div className="table-empty"><Sparkles size={23}/><strong>{t.noCustomers}</strong></div>}</div></section>
    {showAdd && <WalkInModal state={state} t={t} onClose={() => setShowAdd(false)}/>}
  </div></StaffGate>;
}

function StatCard({ icon, label, value, note }) { return <article className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></article>; }

function WalkInModal({ state, t, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceIds, setServiceIds] = useState([]);
  const [barberPreference, setBarberPreference] = useState('any');
  const [error, setError] = useState('');
  function submit(e) { e.preventDefault(); if (!name.trim()) return setError(t.nameRequired); if (!/^\d{10}$/.test(phone)) return setError(t.phoneInvalid); if (!serviceIds.length) return setError(t.chooseAtLeastOne); let result; updateState((draft) => { result = createSpot(draft, { name, phone, serviceIds, barberPreference }, 'walk-in'); }); if (result.duplicate) setError(t.alreadyActive); else onClose(); }
  return <div className="modal-backdrop" onClick={onClose}><form className="modal-card" onSubmit={submit} onClick={(e) => e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">AURA / WALK-IN</span><h2>{t.addGuest}</h2></div><button type="button" className="icon-button" onClick={onClose}><X size={18}/></button></div><label className="field"><span>{t.fullName}</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.guestName}/></label><label className="field"><span>{t.phone}</span><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric"/></label><div className="field"><span>{t.chooseService}</span><div className="modal-service-list">{state.services.filter((s) => s.active).map((service) => <label key={service.id} className="checkbox-line"><input type="checkbox" checked={serviceIds.includes(service.id)} onChange={(e) => setServiceIds((old) => e.target.checked ? old.length < 3 ? [...old, service.id] : old : old.filter((id) => id !== service.id))}/><span>{service.nameEn}</span><small>{money(service.price)}</small></label>)}</div></div><label className="field"><span>{t.chooseBarber}</span><select value={barberPreference} onChange={(e) => setBarberPreference(e.target.value)}><option value="any">{t.anyBarberShort}</option>{state.barbers.map((barber) => <option value={barber.id} key={barber.id}>{barber.name}</option>)}</select></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-gold">{t.addToQueue}<ArrowRight size={16}/></button></div></form></div>;
}

function BarberView({ state, t, now }) {
  const params = useParams();
  const navigate = useNavigate();
  const selected = params.name ? state.barbers.find((barber) => barber.id === params.name.toLowerCase() || barber.name.toLowerCase() === params.name.toLowerCase()) : null;
  const [chosen, setChosen] = useState(selected?.id || state.barbers[0]?.id || 'ravi');
  const barber = selected || state.barbers.find((item) => item.id === chosen);
  const current = barber ? getBarberCurrentSpot(state, barber.id) : null;
  const next = barber ? getNextForBarber(state, barber.id) : null;
  if (!barber) return <div className="empty-page"><h1>No barber configured</h1></div>;
  const serviceNames = current?.serviceIds.map((id) => state.services.find((s) => s.id === id)?.nameEn).filter(Boolean).join(' + ');
  function updateBarber(patch) { updateState((draft) => { const item = draft.barbers.find((b) => b.id === barber.id); Object.assign(item, patch); }); }
  function start() { updateState((draft) => startSpot(draft, current?.id)); }
  function done() { updateState((draft) => completeSpot(draft, current?.id)); }
  return <StaffGate title={t.barber} t={t}><div className="barber-page"><div className="barber-topline"><div><div className="eyebrow"><span className="eyebrow-line"/>AURA / STYLIST STATION</div><h1>{t.barberPageTitle}</h1><p>{t.barberPageIntro}</p></div><div className="barber-select-wrap"><label htmlFor="barber-select">{t.stylistStation}</label><select id="barber-select" value={barber.id} onChange={(e) => { setChosen(e.target.value); navigate(`/barber/${e.target.value}`); }}>{state.barbers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div>
    <div className="barber-workspace"><section className="current-client-card"><div className="current-client-top"><span className="eyebrow">{t.currentGuest}</span><span className={`station-status ${barber.onBreak ? 'warning' : barber.onDuty ? 'ready' : 'muted'}`}>{barber.onBreak ? t.onBreak : barber.onDuty ? t.available : t.offDuty}</span></div>{current ? <><div className="client-token">{current.token}</div><h2>{current.name}</h2><p>{serviceNames}</p><div className="client-detail-row"><span><Clock3 size={15}/> {t.addedAt} {fmtTime(current.createdAt)}</span><span><UserRound size={15}/> {current.phone}</span></div><div className="client-service-bar"><span>{t.serviceProgress}</span><strong>{current.status === 'In chair' ? `${minutesSince(current.startedAt, now)} ${t.minutes} ${t.elapsed}` : t.readyToBegin}</strong><div className="progress-track"><span style={{ width: current.status === 'In chair' ? `${Math.min(95, Math.max(12, minutesSince(current.startedAt, now) * 3))}%` : '4%' }}/></div></div><div className="client-actions">{current.status === 'Called' ? <button className="button button-gold button-full" onClick={start}><CheckCircle2 size={18}/>{t.startService}</button> : <button className="button button-gold button-full" onClick={done}><Check size={18}/>{t.finishService}</button>}</div></> : <div className="chair-empty"><div className="empty-chair-icon"><Scissors size={27}/></div><h2>{t.noCurrent}</h2><p>{t.nextGuest}</p><button className="button button-dark" disabled={!next || !barber.onDuty || barber.onBreak} onClick={() => updateState((draft) => callNextForBarber(draft, barber.id))}>{t.callNext}<ArrowRight size={16}/></button></div>}</section>
    <aside className="barber-side"><div className="barber-profile-card"><div className={`barber-avatar xlarge avatar-${barber.id}`}>{barber.name[0]}</div><div><span className="eyebrow">{t.currentStation}</span><h2>{barber.name}</h2><p>{barber.role}</p></div><button className="button button-quiet button-full" onClick={() => updateBarber({ onBreak: !barber.onBreak })}>{barber.onBreak ? <CheckCircle2 size={16}/> : <Timer size={16}/>} {barber.onBreak ? t.backToWork : t.goOnBreak}</button><label className="duty-toggle"><span>{t.onDutyToday}</span><input type="checkbox" checked={barber.onDuty} onChange={(e) => updateBarber({ onDuty: e.target.checked, onBreak: e.target.checked ? barber.onBreak : false })}/></label></div>
    <div className="next-client-card"><span className="eyebrow">{t.nextForYou}</span>{next ? <><div className="next-token">{next.token}</div><h3>{next.name}</h3><p>{next.serviceIds.map((id) => state.services.find((s) => s.id === id)?.nameEn).filter(Boolean).join(' + ')}</p><div className="next-preference">{next.barberPreference === 'any' ? 'Any barber' : t.stylistRequested} · {minutesSince(next.createdAt, now)} min waiting</div></> : <p className="muted-copy">{t.noEligibleForChair}</p>}</div></aside></div>
  </div></StaffGate>;
}

function TvDisplay({ state, t, now }) {
  const active = getActiveSpots(state);
  const current = state.barbers.map((barber) => ({ barber, spot: getBarberCurrentSpot(state, barber.id) }));
  const upNext = active.filter((spot) => spot.status === 'Waiting').slice(0, 5);
  const recentCalled = state.spots.filter((spot) => spot.status === 'Called').sort((a, b) => b.calledAt - a.calledAt)[0];
  return <div className="tv-screen"><header className="tv-header"><div className="tv-brand"><span className="brand-mark"><Sparkles size={22}/></span><span><strong>AURA SALON</strong><small>A LITTLE TIME FOR YOURSELF</small></span></div><div className="tv-live"><span className="live-pulse"/>{t.liveQueueUpdate}</div><div className="tv-clock">{new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}<small>{new Date(now).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</small></div></header>
    {recentCalled && now - recentCalled.calledAt < 90000 && <div className="tv-called-banner"><Bell size={25}/><span><small>{t.nowCalling}</small><strong>{recentCalled.token} · {recentCalled.name}</strong></span><span className="tv-called-barber">{t.pleaseGoTo} {state.barbers.find((b) => b.id === recentCalled.assignedBarberId)?.name}</span></div>}
    <main className="tv-main"><section className="tv-stations"><div className="tv-section-head"><span>{t.ourStylists}</span><span>{t.salonFloor}</span></div><div className="tv-station-grid">{current.map(({ barber, spot }) => <article className="tv-station" key={barber.id}><div className={`tv-avatar avatar-${barber.id}`}>{barber.name[0]}</div><div className="tv-station-info"><h2>{barber.name}</h2><span>{!barber.onDuty ? t.offDutyCaps : barber.onBreak ? t.onBreakCaps : spot ? t.withGuest : t.availableCaps}</span></div><div className="tv-now-token"><small>NOW</small><strong>{spot?.token || '—'}</strong></div></article>)}</div></section>
    <section className="tv-upnext"><div className="tv-upnext-title"><span className="eyebrow">{t.keepYourPlace}</span><h1>{t.nextUp}<em>.</em></h1><p>{t.callWhenTime}</p></div><div className="tv-next-list">{upNext.map((spot, index) => <div className="tv-next-item" key={spot.id}><span className="tv-next-index">0{index + 1}</span><strong>{spot.token}</strong><span>{spot.name}</span><small>{spot.barberPreference === 'any' ? 'Any stylist' : state.barbers.find((b) => b.id === spot.barberPreference)?.name}</small></div>)}{upNext.length === 0 && <div className="tv-empty"><Sparkles size={27}/><strong>{t.chairsReady}</strong><span>Our team is ready when you are.</span></div>}</div></section></main><footer className="tv-footer"><span>{t.takeBreath}</span><span>AURA SALON · AHMEDABAD</span></footer>
  </div>;
}

function Admin({ state, t, now }) {
  const [newService, setNewService] = useState({ nameEn: '', nameGu: '', minutes: 30, price: 250 });
  const [showAdd, setShowAdd] = useState(false);
  const stats = getTodayStats(state);
  function changeService(id, patch) { updateState((draft) => { const service = draft.services.find((item) => item.id === id); Object.assign(service, patch); }); }
  function changeBarber(id, patch) { updateState((draft) => { const barber = draft.barbers.find((item) => item.id === id); Object.assign(barber, patch); }); }
  function addService(e) { e.preventDefault(); if (!newService.nameEn.trim()) return; updateState((draft) => draft.services.push({ id: `service-${Date.now()}`, ...newService, minutes: Number(newService.minutes), price: Number(newService.price), active: true })); setNewService({ nameEn: '', nameGu: '', minutes: 30, price: 250 }); setShowAdd(false); }
  return <StaffGate title={t.admin} t={t}><div className="admin-page"><div className="staff-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{t.ownerEyebrow}</div><h1>{t.ownerHeading}</h1><p>{t.ownerIntro}</p></div><div className="admin-open-toggle"><span>{state.queueOpen ? t.open : t.onlineClosedShort}</span><button className={`switch ${state.queueOpen ? 'on' : ''}`} onClick={() => updateState((draft) => { draft.queueOpen = !draft.queueOpen; })} aria-label="Toggle online queue"><span/></button></div></div>
    <div className="stats-grid admin-stats"><StatCard icon={<CheckCircle2 size={18}/>} label={t.servedToday} value={stats.served} note={t.completedVisitsToday}/><StatCard icon={<Clock3 size={18}/>} label={t.averageWait} value={`${stats.averageWait} min`} note={t.fromArrival}/><StatCard icon={<Bell size={18}/>} label={t.noShows} value={stats.noShows} note={t.markedToday}/><StatCard icon={<Users size={18}/>} label={t.waitingNow} value={getActiveSpots(state).filter((s) => s.status === 'Waiting').length} note={t.currentlyInQueue}/></div>
    <div className="admin-grid"><section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">{t.menu}</span><h2>{t.servicesSettings}</h2></div><button className="button button-dark button-small" onClick={() => setShowAdd(!showAdd)}><UserPlus size={15}/>{t.addService}</button></div>{showAdd && <form className="new-service-form" onSubmit={addService}><input placeholder={t.serviceNameEn} value={newService.nameEn} onChange={(e) => setNewService({ ...newService, nameEn: e.target.value })}/><input placeholder={t.serviceNameGu} value={newService.nameGu} onChange={(e) => setNewService({ ...newService, nameGu: e.target.value })}/><div><input type="number" min="5" value={newService.minutes} onChange={(e) => setNewService({ ...newService, minutes: e.target.value })} aria-label="Minutes"/><input type="number" min="0" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} aria-label="Price"/></div><button className="button button-gold button-small" type="submit">{t.saveService}</button></form>}<div className="admin-service-list">{state.services.map((service) => <div className={`admin-service-row ${!service.active ? 'is-inactive' : ''}`} key={service.id}><div className="admin-service-symbol"><Scissors size={17}/></div><div className="admin-service-detail"><strong>{service.nameEn}</strong><small>{service.nameGu || t.noGujaratiLabel} · {service.minutes} min</small></div><strong className="admin-service-price">{money(service.price)}</strong><button className={`switch small-switch ${service.active ? 'on' : ''}`} onClick={() => changeService(service.id, { active: !service.active })} aria-label={`Toggle ${service.nameEn}`}><span/></button></div>)}</div></section>
    <section className="admin-card"><div className="admin-card-head"><div><span className="eyebrow">{t.people}</span><h2>{t.teamToday}</h2></div><span className="subtle-count">{state.barbers.filter((b) => b.onDuty).length} working</span></div><div className="admin-team-list">{state.barbers.map((barber) => <div className="admin-team-row" key={barber.id}><div className={`barber-avatar avatar-${barber.id}`}>{barber.name[0]}</div><div className="admin-service-detail"><strong>{barber.name}</strong><small>{barber.role}</small></div><div className="team-toggle-label">On duty</div><button className={`switch small-switch ${barber.onDuty ? 'on' : ''}`} onClick={() => changeBarber(barber.id, { onDuty: !barber.onDuty, onBreak: barber.onDuty ? false : barber.onBreak })} aria-label={`Toggle ${barber.name} duty`}><span/></button><button className={`break-chip ${barber.onBreak ? 'active' : ''}`} onClick={() => changeBarber(barber.id, { onBreak: !barber.onBreak })} disabled={!barber.onDuty}>{barber.onBreak ? 'On break' : 'Available'}</button></div>)}</div><div className="admin-settings-box"><div><span className="eyebrow">{t.onlineQueueSettings}</span><h3>{t.queueSettings}</h3><p>{t.closingText}</p></div><label className="field"><span>{t.closingTime}</span><input type="time" value={state.closingTime || '21:00'} onChange={(e) => updateState((draft) => { draft.closingTime = e.target.value; })}/></label><div className="queue-open-row"><span>{t.onlineJoining}</span><strong className={isOnlineJoinOpen(state, new Date(now)) ? 'text-success' : 'text-muted'}>{isOnlineJoinOpen(state, new Date(now)) ? t.acceptingCustomers : t.notAccepting}</strong></div></div></section></div>
  </div></StaffGate>;
}

function NotFound({ t }) { return <div className="empty-page"><CircleHelp size={35}/><h1>{t.notFoundTitle}</h1><p>{t.goHome}</p><Link to="/" className="button button-dark">{t.backHome}</Link></div>; }

export default App;
