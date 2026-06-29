import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Receivable {
  id: string;
  name: string;
  type: string;
  description: string;
  total_amount: number;
  installment_amount: number;
  total_installments: number;
  remaining_installments: number;
  due_day: number;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

interface Contact {
  id: string;
  name: string;
}

export default function ReceivablePage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Receivable | null>(null);
  const [editing, setEditing] = useState<Receivable | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    total_amount: '',
    installment_amount: '',
    total_installments: '',
    remaining_installments: '',
    due_day: '',
    status: 'active',
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [{ data: r }, { data: c }, { data: ct }] = await Promise.all([
      supabase.from('receivables').select('*').order('due_day'),
      supabase
        .from('categories')
        .select('*')
        .eq('type', 'receivable')
        .order('name'),
      supabase.from('contacts').select('*').order('name'),
    ]);
    setReceivables(r || []);
    setCategories(c || []);
    setContacts(ct || []);
    setLoading(false);
  }

  async function addReceivable() {
    if (!form.name || !form.installment_amount) return;
    await supabase.from('receivables').insert([
      {
        ...form,
        total_amount: Number(form.total_amount),
        installment_amount: Number(form.installment_amount),
        total_installments: Number(form.total_installments),
        remaining_installments: Number(form.remaining_installments),
        due_day: Number(form.due_day),
      },
    ]);
    setShowForm(false);
    setForm({
      name: '',
      type: '',
      description: '',
      total_amount: '',
      installment_amount: '',
      total_installments: '',
      remaining_installments: '',
      due_day: '',
      status: 'active',
    });
    fetchAll();
  }

  async function saveEdit() {
    if (!editing) return;
    await supabase
      .from('receivables')
      .update({
        name: editing.name,
        type: editing.type,
        description: editing.description,
        total_amount: editing.total_amount,
        installment_amount: editing.installment_amount,
        total_installments: editing.total_installments,
        remaining_installments: editing.remaining_installments,
        due_day: editing.due_day,
        status: editing.status,
      })
      .eq('id', editing.id);
    setEditing(null);
    fetchAll();
  }

  async function deleteReceivable(id: string) {
    await supabase.from('receivables').delete().eq('id', id);
    setSelected(null);
    fetchAll();
  }

  const totalPending = receivables
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + r.installment_amount, 0);

  if (loading) return <div className="empty">กำลังโหลด...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>ตามหนี้</h1>
      </div>

      <div className="summary-card">
        <div className="summary-label">รอรับเดือนนี้</div>
        <div className="summary-amount">{totalPending.toLocaleString()} ฿</div>
        <div className="summary-sub">
          {receivables.filter((r) => r.status === 'active').length} รายการ
          active
        </div>
      </div>

      <div className="content">
        <div className="section-header">
          <span className="section-title">รายการทั้งหมด</span>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            + เพิ่ม
          </button>
        </div>

        {showForm && (
          <div className="form-sheet">
            <div className="form-group">
              <div className="form-label">ชื่อ</div>
              <select
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              >
                <option value="">เลือกชื่อ</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">ประเภท</div>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">เลือกประเภท</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">รายละเอียด</div>
              <input
                placeholder="รายละเอียด"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">ยอดรวม</div>
              <input
                type="number"
                placeholder="0"
                value={form.total_amount}
                onChange={(e) =>
                  setForm({ ...form, total_amount: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">ยอดต่องวด</div>
              <input
                type="number"
                placeholder="0"
                value={form.installment_amount}
                onChange={(e) =>
                  setForm({ ...form, installment_amount: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">จำนวนงวดทั้งหมด</div>
              <input
                type="number"
                placeholder="0"
                value={form.total_installments}
                onChange={(e) =>
                  setForm({ ...form, total_installments: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">งวดที่เหลือ</div>
              <input
                type="number"
                placeholder="0"
                value={form.remaining_installments}
                onChange={(e) =>
                  setForm({ ...form, remaining_installments: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">วันจ่ายของเดือน</div>
              <input
                type="number"
                placeholder="1-31"
                value={form.due_day}
                onChange={(e) => setForm({ ...form, due_day: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>
                ยกเลิก
              </button>
              <button className="btn-save" onClick={addReceivable}>
                บันทึก
              </button>
            </div>
          </div>
        )}

        {receivables.length === 0 ? (
          <div className="empty">ยังไม่มีรายการ</div>
        ) : (
          <div className="table-container">
            {receivables.map((r) => (
              <div
                className="table-row"
                key={r.id}
                onClick={() => setSelected(r)}
                style={{ cursor: 'pointer' }}
              >
                <div className="row-left">
                  <div className="row-main">{r.name}</div>
                  <div className="row-sub">
                    {r.type} · {r.description} · วันที่ {r.due_day}
                  </div>
                </div>
                <div className="row-right">
                  <div className="row-amount">
                    {r.installment_amount.toLocaleString()} ฿
                  </div>
                  <div className="row-due">
                    {r.remaining_installments}/{r.total_installments} งวด
                  </div>
                  <span
                    className={`badge ${
                      r.status === 'active' ? 'badge-pending' : 'badge-done'
                    }`}
                  >
                    {r.status === 'active' ? 'รอรับ' : 'รับแล้ว'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && !editing && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">
              {selected.name} — {selected.description}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn-save"
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                }}
              >
                ✏️ แก้ไข
              </button>
              <button
                className="btn-save"
                style={{
                  background:
                    selected.status === 'active' ? '#2e7d32' : '#1c1c1e',
                }}
                onClick={async () => {
                  await supabase
                    .from('receivables')
                    .update({
                      status: selected.status === 'active' ? 'done' : 'active',
                    })
                    .eq('id', selected.id);
                  setSelected(null);
                  fetchAll();
                }}
              >
                {selected.status === 'active'
                  ? '✅ รับแล้ว'
                  : '↩️ ยังไม่ได้รับ'}
              </button>
              <button
                className="btn-save"
                style={{ background: '#ff3b30' }}
                onClick={() => deleteReceivable(selected.id)}
              >
                🗑️ ลบ
              </button>
              <button className="btn-cancel" onClick={() => setSelected(null)}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">แก้ไขรายการ</div>
            <div className="form-group">
              <div className="form-label">ชื่อ</div>
              <select
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">ประเภท</div>
              <select
                value={editing.type}
                onChange={(e) =>
                  setEditing({ ...editing, type: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <div className="form-label">รายละเอียด</div>
              <input
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">ยอดรวม</div>
              <input
                type="number"
                value={editing.total_amount}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    total_amount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">ยอดต่องวด</div>
              <input
                type="number"
                value={editing.installment_amount}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    installment_amount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">จำนวนงวดทั้งหมด</div>
              <input
                type="number"
                value={editing.total_installments}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    total_installments: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">งวดที่เหลือ</div>
              <input
                type="number"
                value={editing.remaining_installments}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    remaining_installments: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-group">
              <div className="form-label">วันจ่ายของเดือน</div>
              <input
                type="number"
                value={editing.due_day}
                onChange={(e) =>
                  setEditing({ ...editing, due_day: Number(e.target.value) })
                }
              />
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setEditing(null)}>
                ยกเลิก
              </button>
              <button className="btn-save" onClick={saveEdit}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
