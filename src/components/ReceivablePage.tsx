import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Receivable {
  id: string
  name: string
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

interface Contact {
  id: string
  name: string
}

interface Props {
  openAdd: () => void
}

export default function ReceivablePage({ openAdd }: Props) {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Receivable | null>(null)
  const [editing, setEditing] = useState<Receivable | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: r }, { data: c }, { data: ct }] = await Promise.all([
      supabase.from('receivables').select('*').order('due_day'),
      supabase.from('categories').select('*').eq('type', 'receivable').order('name'),
      supabase.from('contacts').select('*').order('name')
    ])
    setReceivables(r || [])
    setCategories(c || [])
    setContacts(ct || [])
    setLoading(false)
  }

  async function saveEdit() {
    if (!editing) return
    await supabase.from('receivables').update({
      name: editing.name,
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

  async function deleteReceivable(id: string) {
    await supabase.from('receivables').delete().eq('id', id)
    setSelected(null)
    fetchAll()
  }

  async function toggleStatus(r: Receivable) {
    await supabase.from('receivables').update({ status: r.status === 'active' ? 'done' : 'active' }).eq('id', r.id)
    setSelected(null)
    fetchAll()
  }

  const totalPending = receivables.filter(r => r.status === 'active').reduce((sum, r) => sum + r.installment_amount, 0)
  const activeCount = receivables.filter(r => r.status === 'active').length

  if (loading) return <div className="empty">กำลังโหลด...</div>

  return (
    <>
      <div className="top-bar">
        <h1>ตามหนี้</h1>
        <button className="btn-action" onClick={openAdd}>+ เพิ่ม</button>
      </div>

      <div className="page-content">
        <div className="summary-card">
          <div className="summary-left">
            <div className="s-label">รอรับเดือนนี้</div>
            <div className="s-amount">{totalPending.toLocaleString()} ฿</div>
          </div>
          <div className="summary-right">
            <div className="s-count">รายการ active</div>
            <div className="s-sub">{activeCount} รายการ</div>
          </div>
        </div>

        <div className="section-label">รายการทั้งหมด</div>

        {receivables.length === 0 ? (
          <div className="empty">ยังไม่มีรายการ<br/><span style={{fontSize:13}}>กด + เพื่อเพิ่มรายการแรก</span></div>
        ) : (
          <div className="card-list">
            {receivables.map(r => (
              <div className="card-row" key={r.id} onClick={() => setSelected(r)}>
                <div className="row-left">
                  <div className="row-title">{r.name}</div>
                  <div className="row-sub">{r.type} · {r.description} · วันที่ {r.due_day}</div>
                  <span className={`badge ${r.status === 'active' ? 'badge-pending' : 'badge-done'}`}>
                    {r.status === 'active' ? 'รอรับ' : 'รับแล้ว'}
                  </span>
                </div>
                <div className="row-right">
                  <div className="row-amount">{r.installment_amount.toLocaleString()} ฿</div>
                  <div className="row-meta">{r.remaining_installments}/{r.total_installments} งวด</div>
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
            <div className="modal-title">{selected.name} — {selected.description}</div>
            <button className="btn-save" onClick={() => { setEditing(selected); setSelected(null) }}>✏️ แก้ไข</button>
            <button className="btn-save" style={{background: selected.status === 'active' ? '#2e7d32' : '#555', marginTop: 8}}
              onClick={() => toggleStatus(selected)}>
              {selected.status === 'active' ? '✅ รับแล้ว' : '↩️ ยังไม่ได้รับ'}
            </button>
            <button className="btn-danger" onClick={() => deleteReceivable(selected.id)}>🗑️ ลบรายการ</button>
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
                <div className="form-label">ชื่อ</div>
                <select value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})}>
                  <option value="">เลือกชื่อ</option>
                  {contacts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
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