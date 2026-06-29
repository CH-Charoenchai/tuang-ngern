import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Debt {
  id: string
  type: string
  description: string
  total_amount: number
  installment_amount: number
  total_installments: number
  remaining_installments: number
  due_day: number
  status: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  openAdd: () => void
}

export default function DebtPage({ openAdd }: Props) {
  const [debts, setDebts] = useState<Debt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Debt | null>(null)
  const [editing, setEditing] = useState<Debt | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: d }, { data: c }] = await Promise.all([
      supabase.from('debts').select('*').order('due_day'),
      supabase.from('categories').select('*').eq('type', 'debt').order('name')
    ])
    setDebts(d || [])
    setCategories(c || [])
    setLoading(false)
  }

  async function saveEdit() {
    if (!editing) return
    await supabase.from('debts').update({
      type: editing.type,
      description: editing.description,
      total_amount: editing.total_amount,
      installment_amount: editing.installment_amount,
      total_installments: editing.total_installments,
      remaining_installments: editing.remaining_installments,
      due_day: editing.due_day,
      status: editing.status,
    }).eq('id', editing.id)
    setEditing(null)
    fetchAll()
  }

  async function deleteDebt(id: string) {
    await supabase.from('debts').delete().eq('id', id)
    setSelected(null)
    fetchAll()
  }

  async function toggleStatus(debt: Debt) {
    await supabase.from('debts').update({ status: debt.status === 'active' ? 'done' : 'active' }).eq('id', debt.id)
    setSelected(null)
    fetchAll()
  }

  const totalMonthly = debts.filter(d => d.status === 'active').reduce((sum, d) => sum + d.installment_amount, 0)
  const activeCount = debts.filter(d => d.status === 'active').length

  if (loading) return <div className="empty">กำลังโหลด...</div>

  return (
    <>
      <div className="top-bar">
        <h1>หนี้</h1>
        <button className="btn-action" onClick={openAdd}>+ เพิ่ม</button>
      </div>

      <div className="page-content">
        <div className="summary-card">
          <div className="summary-left">
            <div className="s-label">ต้องจ่ายเดือนนี้</div>
            <div className="s-amount">{totalMonthly.toLocaleString()} ฿</div>
          </div>
          <div className="summary-right">
            <div className="s-count">รายการ active</div>
            <div className="s-sub">{activeCount} รายการ</div>
          </div>
        </div>

        <div className="section-label">รายการทั้งหมด</div>

        {debts.length === 0 ? (
          <div className="empty">ยังไม่มีรายการ<br/><span style={{fontSize:13}}>กด + เพื่อเพิ่มรายการแรก</span></div>
        ) : (
          <div className="card-list">
            {debts.map(debt => (
              <div className="card-row" key={debt.id} onClick={() => setSelected(debt)}>
                <div className="row-left">
                  <div className="row-title">{debt.description}</div>
                  <div className="row-sub">{debt.type} · วันที่ {debt.due_day}</div>
                  <span className={`badge ${debt.status === 'active' ? 'badge-active' : 'badge-done'}`}>
                    {debt.status === 'active' ? 'ค้างจ่าย' : 'จ่ายแล้ว'}
                  </span>
                </div>
                <div className="row-right">
                  <div className="row-amount">{debt.installment_amount.toLocaleString()} ฿</div>
                  <div className="row-meta">{debt.remaining_installments}/{debt.total_installments} งวด</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Sheet */}
      {selected && !editing && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{selected.description}</div>
            <button className="btn-save" onClick={() => { setEditing(selected); setSelected(null) }}>✏️ แก้ไข</button>
            <button className="btn-save" style={{background: selected.status === 'active' ? '#2e7d32' : '#555', marginTop: 8}}
              onClick={() => toggleStatus(selected)}>
              {selected.status === 'active' ? '✅ จ่ายแล้ว' : '↩️ ยังไม่จ่าย'}
            </button>
            <button className="btn-danger" onClick={() => deleteDebt(selected.id)}>🗑️ ลบรายการ</button>
            <button className="btn-cancel" onClick={() => setSelected(null)}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Edit Sheet */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">แก้ไขรายการ</div>
            <div className="form-group">
              <div className="form-field">
                <div className="form-label">ประเภท</div>
                <select value={editing.type} onChange={e => setEditing({...editing, type: e.target.value})}>
                  <option value="">เลือกประเภท</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <div className="form-label">รายละเอียด</div>
                <input value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} />
              </div>
              <div className="form-field">
                <div className="form-label">ยอดรวม</div>
                <input type="number" value={editing.total_amount} onChange={e => setEditing({...editing, total_amount: Number(e.target.value)})} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <div className="form-field">
                  <div className="form-label">ยอดต่องวด</div>
                  <input type="number" value={editing.installment_amount} onChange={e => setEditing({...editing, installment_amount: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-field">
                  <div className="form-label">วันจ่าย</div>
                  <input type="number" value={editing.due_day} onChange={e => setEditing({...editing, due_day: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-field">
                  <div className="form-label">จำนวนงวด</div>
                  <input type="number" value={editing.total_installments} onChange={e => setEditing({...editing, total_installments: Number(e.target.value)})} />
                </div>
              </div>
              <div className="form-group">
                <div className="form-field">
                  <div className="form-label">งวดที่เหลือ</div>
                  <input type="number" value={editing.remaining_installments} onChange={e => setEditing({...editing, remaining_installments: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={saveEdit}>บันทึก</button>
            <button className="btn-cancel" onClick={() => setEditing(null)}>ยกเลิก</button>
          </div>
        </div>
      )}
    </>
  )
}