export default function AdminLoading() {
  return <div className="admin-loading" role="status" aria-label="Chargement de l’administration">
    <aside className="admin-loading__sidebar">
      <div className="admin-loading__brand"><span /><div><i /><i /></div></div>
      <div className="admin-loading__rule" />
      <div className="admin-loading__label" />
      <div className="admin-loading__nav">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
    </aside>
    <section className="admin-loading__workspace">
      <div className="admin-loading__topbar"><i /><i /></div>
      <div className="admin-loading__content">
        <div className="admin-loading__title"><i /><b /></div>
        <div className="admin-loading__stats">{Array.from({ length: 3 }, (_, index) => <i key={index} />)}</div>
        <div className="admin-loading__columns"><i /><i /></div>
      </div>
    </section>
  </div>;
}
