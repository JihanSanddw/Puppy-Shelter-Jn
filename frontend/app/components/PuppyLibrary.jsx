'use client';

import { useEffect, useMemo, useState } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2662/api')
  .replace(/\/$/, '');  

const emptyForm = {
  nama_puppy: '',
  jenis: '',
  umur: 0,
  gender: 'M',
  id_shelter: '',
};

export default function PuppyLibrary() {
  const [shelters, setShelters] = useState([]);
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('puppies');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  async function request(url, options = {}) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Permintaan gagal.');
    }

    return result;
  }

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [shelterResult, puppyResult] = await Promise.all([
        request(`${API}/shelter`),
        request(`${API}/puppy`),
      ]);

      setShelters(shelterResult.data || []);
      setPuppies(puppyResult.data || []);
    } catch (err) {
      setError(
        'Data gagal dimuat. Pastikan backend Express dan koneksi database berjalan.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');

        const [shelterResponse, puppyResponse] = await Promise.all([
          fetch(`${API}/shelter`),
          fetch(`${API}/puppy`),
        ]);

        if (!shelterResponse.ok || !puppyResponse.ok) {
          throw new Error('Gagal mengambil data.');
        }

        const [shelterResult, puppyResult] = await Promise.all([
          shelterResponse.json(),
          puppyResponse.json(),
        ]);

        setShelters(shelterResult.data || []);
        setPuppies(puppyResult.data || []);
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Data gagal dimuat. Periksa koneksi backend.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredPuppies = useMemo(() => {
    const keyword = search.toLowerCase();

    return puppies.filter((puppy) =>
      [
        puppy.nama_puppy,
        puppy.jenis,
        puppy.nama_shelter,
        puppy.gender,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [puppies, search]);

  function openAdd() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      id_shelter: shelters[0]?.id_shelter ?? '',
    });
    setModal(true);
  }

  function openEdit(puppy) {
    setEditingId(puppy.id_puppy);
    setForm({
      nama_puppy: puppy.nama_puppy || '',
      jenis: puppy.jenis || '',
      umur: puppy.umur ?? 0,
      gender: puppy.gender || 'M',
      id_shelter: puppy.id_shelter ?? '',
    });
    setModal(true);
  }

  function changeForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === 'umur' || name === 'id_shelter'
          ? value === '' ? '' : Number(value)
          : value,
    }));
  }

  async function savePuppy(event) {
    event.preventDefault();

    if (!form.nama_puppy.trim() || !form.jenis.trim()) {
      setNotice('Nama puppy dan jenis wajib diisi.');
      return;
    }

    if (!form.id_shelter) {
      setNotice('Pilih shelter terlebih dahulu.');
      return;
    }

    setSaving(true);
    setNotice('');

    try {
      const isEditing = editingId !== null;

      await request(
        isEditing
          ? `${API}/puppy/${editingId}`
          : `${API}/puppy`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            umur: Number(form.umur),
            id_shelter: Number(form.id_shelter),
          }),
        }
      );

      setModal(false);
      setNotice(
        isEditing
          ? 'Data puppy berhasil diperbarui.'
          : 'Puppy berhasil ditambahkan.'
      );

      await loadData();
    } catch (err) {
      setNotice(err.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  }

  async function deletePuppy(puppy) {
    const confirmed = window.confirm(
      `Hapus data ${puppy.nama_puppy}? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      await request(`${API}/puppy/${puppy.id_puppy}`, {
        method: 'DELETE',
      });

      setPuppies((current) =>
        current.filter((item) => item.id_puppy !== puppy.id_puppy)
      );

      setNotice(`${puppy.nama_puppy} berhasil dihapus.`);
    } catch (err) {
      setNotice(err.message || 'Gagal menghapus data puppy.');
    }
  }

  return (
    <div
        className="min-h-screen bg-cover bg-center bg-fixed text-[#00182C] md:flex"
        style={{
            backgroundImage: `
            linear-gradient(
                rgba(255, 255, 255, 0.75),
                rgba(255, 255, 255, 0.75)
            ),
            url('/image.png')
            `,
        }}
    >
      <aside className="flex w-full flex-col border-b border-[#E6EAE3] bg-white md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-6 py-7">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PuppyHere</h1>
          </div>
        </div>

        <div className="px-4 pt-2">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('puppies')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                activeTab === 'puppies'
                  ? 'bg-[#EAF1EB] text-[#00182C]'
                  : 'text-gray-500 hover:bg-gray-50 font-bold'
              }`}
            >
                Puppy directory
            </button>

            <button
              onClick={() => setActiveTab('shelters')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                activeTab === 'shelters'
                  ? 'bg-[#EAF1EB] text-[#00182C]'
                  : 'text-gray-500 hover:bg-gray-50 font-bold'
              }`}
            >
                Shelters
            </button>
          </nav>
        </div>

        <div className="mt-auto hidden p-5 md:block">
          <p className="mt-5 text-center text-[11px] text-gray-400">
            PuppyHere 
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 md:ml-64 md:px-10 md:py-9">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {activeTab === 'puppies'
                ? 'Puppy directory'
                : 'Shelter directory'}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Manage your records and keep everything organized.
            </p>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#DCE8DD] bg-[#EEF5EE] px-4 py-3 text-sm text-[#315D4B]"
          >
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="Tutup notifikasi">
              ×
            </button>
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <StatCard
            label="Total puppies"
            value={puppies.length}
            detail="Registered puppy records"
            symbol="♡"
          />
          <StatCard
            label="Total shelters"
            value={shelters.length}
            detail="Shelters in the directory"
            symbol="⌂"
          />
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-800">
              Unable to connect to the server
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#E7EAE4] bg-white shadow-sm shadow-gray-200/30">
          <div className="flex flex-col gap-4 border-b border-[#EDF0EB] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="font-bold">
                {activeTab === 'puppies' ? 'All puppies' : 'All shelters'}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E5E9E2] px-3 sm:w-56">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    activeTab === 'puppies'
                      ? 'Search puppy...'
                      : 'Search shelter...'
                  }
                  className="w-full min-w-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-400"
                />
              </div>

              {activeTab === 'puppies' && (
                <button
                  onClick={openAdd}
                  className="rounded-xl bg-[#00182C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#254938]"
                >
                  + Add puppy
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Loading records...
            </div>
          ) : activeTab === 'puppies' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#FAFBF9] text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Puppy</th>
                    <th className="px-4 py-4 font-semibold">Breed</th>
                    <th className="px-4 py-4 font-semibold">Age</th>
                    <th className="px-4 py-4 font-semibold">Gender</th>
                    <th className="px-4 py-4 font-semibold">Shelter</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2EE]">
                  {filteredPuppies.map((puppy) => (
                    <tr
                      key={puppy.id_puppy}
                      className="transition hover:bg-[#FAFBF9]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1EB] text-sm font-bold text-[#315D4B]">
                            {puppy.nama_puppy?.charAt(0)?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="font-semibold">
                              {puppy.nama_puppy}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              ID #{puppy.id_puppy}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600">{puppy.jenis}</td>
                      <td className="px-4 py-4 text-gray-600">
                        {puppy.umur} {puppy.umur === 1 ? 'year' : 'years'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[#F1F3EF] px-2.5 py-1 text-xs font-medium text-gray-600">
                          {puppy.gender === 'F' ? 'Female' : 'Male'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-600">
                        {puppy.nama_shelter || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(puppy)}
                            className="rounded-lg border border-[#E3E8E0] px-3 py-2 text-xs font-semibold hover:bg-[#EDF3EC]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePuppy(puppy)}
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPuppies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-14 text-center">
                        <p className="font-semibold text-gray-600">
                          No puppies found
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          Try another search or add a new puppy.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-[#FAFBF9] text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Shelter</th>
                    <th className="px-4 py-4 font-semibold">Address</th>
                    <th className="px-4 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold">Puppies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2EE]">
                  {shelters
                    .filter((shelter) =>
                      [
                        shelter.nama_shelter,
                        shelter.alamat,
                        shelter.no_telepon,
                      ]
                        .join(' ')
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    )
                    .map((shelter) => (
                      <tr
                        key={shelter.id_shelter}
                        className="hover:bg-[#FAFBF9]"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold">{shelter.nama_shelter}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            ID #{shelter.id_shelter}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {shelter.alamat}
                        </td>
                        <td className="px-4 py-4 text-gray-600">
                          {shelter.no_telepon}
                        </td>
                        <td className="px-6 py-4">
                          {
                            puppies.filter(
                              (puppy) =>
                                Number(puppy.id_shelter) ===
                                Number(shelter.id_shelter)
                            ).length
                          }
                        </td>
                      </tr>
                    ))}
                  {shelters.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                        No shelter records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-[#EDF0EB] px-6 py-4 text-xs text-gray-400">
            PuppyHere
          </div>
        </section>
      </main>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#15251D]/45 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setModal(false);
          }}
        >
          <form
            onSubmit={savePuppy}
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#64836D]">
                  Puppy Here
                </p>
                <h3 className="text-xl font-bold">
                  {editingId !== null ? 'Edit puppy' : 'Add new puppy'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the puppy information below.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setModal(false)}
                className="rounded-lg px-2 py-1 text-xl text-gray-400 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Puppy name">
                <input
                  required
                  name="nama_puppy"
                  value={form.nama_puppy}
                  onChange={changeForm}
                  placeholder="Enter puppy name"
                  className={inputClass}
                />
              </Field>

              <Field label="Breed">
                <input
                  required
                  name="jenis"
                  value={form.jenis}
                  onChange={changeForm}
                  placeholder="e.g. Golden Retriever"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Age (years)">
                  <input
                    required
                    type="number"
                    min="0"
                    name="umur"
                    value={form.umur}
                    onChange={changeForm}
                    className={inputClass}
                  />
                </Field>

                <Field label="Gender">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={changeForm}
                    className={inputClass}
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </Field>
              </div>

              <Field label="Shelter">
                <select
                  required
                  name="id_shelter"
                  value={form.id_shelter}
                  onChange={changeForm}
                  className={inputClass}
                >
                  <option value="">Select a shelter</option>
                  {shelters.map((shelter) => (
                    <option
                      key={shelter.id_shelter}
                      value={shelter.id_shelter}
                    >
                      {shelter.nama_shelter}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                disabled={saving}
                onClick={() => setModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || shelters.length === 0}
                className="rounded-xl bg-[#00182C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#254938] disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId !== null ? 'Save changes' : 'Add puppy'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-[#E1E6DE] bg-white px-3.5 py-3 text-sm text-[#26372F] outline-none transition placeholder:text-gray-400 focus:border-[#64836D] focus:ring-2 focus:ring-[#64836D]/10';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatCard({ label, value, detail, symbol }) {
  return (
    <div className="rounded-2xl border border-[#E7EAE4] bg-white p-5 shadow-sm shadow-gray-200/20 sm:p-6">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1EB] text-lg text-[#315D4B]">
          {symbol}
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-gray-400">{detail}</p>
    </div>
  );
}