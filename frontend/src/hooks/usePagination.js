import { useState, useMemo, useEffect } from 'react';

export function usePagination(items, parPage = 5) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / parPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const itemsPage = useMemo(() => {
    const debut = (page - 1) * parPage;
    return items.slice(debut, debut + parPage);
  }, [items, page, parPage]);

  const resetPage = () => setPage(1);

  return { page, setPage, totalPages, itemsPage, resetPage };
}