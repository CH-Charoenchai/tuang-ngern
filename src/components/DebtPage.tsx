import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Debt {
  id: string;
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

export default function DebtPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Debt | null>(null);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [form, setForm] = useState({
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
    const [{ data: d }, { data: c }] = await Promise.all([
      supabase.from('debts').select('*').order('due_day'),
      supabase.from('categories').select('*').eq('type', 'debt').order('name'),
    ]);
    setDebts(d || []);
    setCategories(c || []);
    setLoading(false);
  }

  async function addDebt() {
    if (!form.description || !form.installment_amount) return;
    await supabase.from('debts').insert([
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
      .from('debts')
      .update({
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

  async function deleteDebt(id: string) {
    await supabase.from('debts').delete().eq('id', id);
    setSelected(null);
    fetchAll();
  }

  const totalMonthly = debts
    .filter((d) => d.status === 'active')
    .reduce((sum, d) => sum + d.installment_amount, 0);

  if (loading) return <div className="empty">กำลังโหลด...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>หนี้</h1>
      </div>

      <div className="summary-card">
        <div className="summary-label">ต้องจ่ายเดือนนี้</div>
        <div className="summary-amount">{totalMonthly.toLocaleString()} ฿</div>
        <div className="summary-sub">
          {debts.filter((d) => d.status === 'active').length} รายการ active
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
                placeholder="เช่น SCB Visa"
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
              <button className="btn-save" onClick={addDebt}>
                บันทึก
              </button>
            </div>
          </div>
        )}

        {debts.length === 0 ? (
          <div className="empty">ยังไม่มีรายการ</div>
        ) : (
          <div className="table-container">
            {debts.map((debt) => (
              <div
                className="table-row"
                key={debt.id}
                onClick={() => setSelected(debt)}
                style={{ cursor: 'pointer' }}
              >
                <div className="row-left">
                  <div className="row-main">{debt.description}</div>
                  <div className="row-sub">
                    {debt.type} · วันที่ {debt.due_day}
                  </div>
                </div>
                <div className="row-right">
                  <div className="row-amount">
                    {debt.installment_amount.toLocaleString()} ฿
                  </div>
                  <div className="row-due">
                    {debt.remaining_installments}/{debt.total_installments} งวด
                  </div>
                  <span
                    className={`badge ${
                      debt.status === 'active' ? 'badge-active' : 'badge-done'
                    }`}
                  >
                    {debt.status === 'active' ? 'ค้างจ่าย' : 'จ่ายแล้ว'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet เลือก action */}
      {selected && !editing && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{selected.description}</div>
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
                    .from('debts')
                    .update({
                      status: selected.status === 'active' ? 'done' : 'active',
                    })
                    .eq('id', selected.id);
                  setSelected(null);
                  fetchAll();
                }}
              >
                {selected.status === 'active' ? '✅ จ่ายแล้ว' : '↩️ ยังไม่จ่าย'}
              </button>
              <button
                className="btn-save"
                style={{ background: '#ff3b30' }}
                onClick={() => deleteDebt(selected.id)}
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

      {/* Bottom Sheet แก้ไข */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">แก้ไขรายการ</div>
            <div className="form-group">
              <div className="form-label">ประเภท</div>
              <select
                value={editing.type}
                onChange={(e) =>
                  setEditing({ ...editing, type: e.target.value })
                }
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
