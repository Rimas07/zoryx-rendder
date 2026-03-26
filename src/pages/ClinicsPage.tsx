import { useClinics } from '../hooks/useClinics';
import { ClinicCard } from '../components/ClinicCard';

export function ClinicsPage() {
  const {
    clinics, loading, error,
    search, setSearch,
    langFilter, setLangFilter,
    specFilter, setSpecFilter,
    allLanguages, allSpecializations,
  } = useClinics();

  return (
    <div className="page-clinics">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search clinics by name, address or specialization..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">Language:</span>
          <div className="filter-pills">
            <button
              className={`filter-pill ${langFilter === 'all' ? 'active' : ''}`}
              onClick={() => setLangFilter('all')}
            >
              All
            </button>
            {allLanguages.map(l => (
              <button
                key={l}
                className={`filter-pill ${langFilter === l ? 'active' : ''}`}
                onClick={() => setLangFilter(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {allSpecializations.length > 0 && (
          <div className="filter-group">
            <span className="filter-label">Specialization:</span>
            <div className="filter-pills">
              <button
                className={`filter-pill ${specFilter === 'all' ? 'active' : ''}`}
                onClick={() => setSpecFilter('all')}
              >
                All
              </button>
              {allSpecializations.map(s => (
                <button
                  key={s}
                  className={`filter-pill ${specFilter === s ? 'active' : ''}`}
                  onClick={() => setSpecFilter(s)}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="state-center">
          <div className="spinner" />
          <p>Loading clinics...</p>
        </div>
      )}

      {error && (
        <div className="state-center error">
          <p>Failed to load clinics: {error}</p>
        </div>
      )}

      {!loading && !error && clinics.length === 0 && (
        <div className="state-center">
          <p>No clinics found. Try different filters.</p>
        </div>
      )}

      {!loading && (
        <div className="clinics-grid">
          {clinics.map(clinic => (
            <ClinicCard key={clinic.id} clinic={clinic} isActive={false} activeSpecs={[]} onClick={function (): void {
              throw new Error('Function not implemented.');
            } } />
          ))}
        </div>
      )}
    </div>
  );
}
