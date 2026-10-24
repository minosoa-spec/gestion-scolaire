import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ page, totalPages, onChange, total, parPage }) {
  if (totalPages <= 1) return null;

  const debut = (page - 1) * parPage + 1;
  const fin = Math.min(page * parPage, total);

  const pagesAffichees = () => {
    const delta = 1;
    const range = [];
    const rangeAvecPoints = [];
    let dernier;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (dernier) {
        if (i - dernier === 2) rangeAvecPoints.push(dernier + 1);
        else if (i - dernier > 2) rangeAvecPoints.push('...');
      }
      rangeAvecPoints.push(i);
      dernier = i;
    });

    return rangeAvecPoints;
  };

  const btnBase = {
    minWidth: 30,
    height: 30,
    padding: '0 6px',
    border: 'none',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px solid #f1f5f9',
      }}
    >
      <div style={{ fontSize: 13, color: '#64748b' }}>
        {debut}–{fin} sur {total}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{ ...btnBase, background: '#f1f5f9', color: page === 1 ? '#cbd5e1' : '#475569', cursor: page === 1 ? 'default' : 'pointer' }}
        >
          <ChevronLeft size={15} />
        </button>

        {pagesAffichees().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              style={{ ...btnBase, background: p === page ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f5f9', color: p === page ? '#fff' : '#475569' }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{ ...btnBase, background: '#f1f5f9', color: page === totalPages ? '#cbd5e1' : '#475569', cursor: page === totalPages ? 'default' : 'pointer' }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;