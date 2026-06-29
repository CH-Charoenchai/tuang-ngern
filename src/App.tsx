import { useState } from 'react'
import BottomNav from './components/BottomNav'
import HomePage from './components/HomePage'
import DebtPage from './components/DebtPage'
import ReceivablePage from './components/ReceivablePage'
import SettingsPage from './components/SettingsPage'
import './App.css'

type Page = 'home' | 'debt' | 'receivable' | 'settings'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [showAdd, setShowAdd] = useState(false)
  const [addType, setAddType] = useState<'debt' | 'receivable' | null>(null)

  function handleNav(p: Page | 'add') {
    if (p === 'add') {
      setShowAdd(true)
      return
    }
    setShowAdd(false)
    setPage(p)
  }

  return (
    <div className="app">
      {page === 'home' && <HomePage />}
      {page === 'debt' && <DebtPage openAdd={() => { setAddType('debt'); setShowAdd(true) }} />}
      {page === 'receivable' && <ReceivablePage openAdd={() => { setAddType('receivable'); setShowAdd(true) }} />}
      {page === 'settings' && <SettingsPage />}

      {/* Modal เลือกประเภท */}
      {showAdd && !addType && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">เพิ่มรายการ</div>
            <button className="btn-save" onClick={() => setAddType('debt')}>💸 หนี้ที่ต้องจ่าย</button>
            <button className="btn-save" style={{background: '#2e7d32', marginTop: 8}} onClick={() => setAddType('receivable')}>💰 ตามหนี้</button>
            <button className="btn-cancel" onClick={() => setShowAdd(false)}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Modal form หนี้ */}
      {showAdd && addType === 'debt' && (
        <DebtFormModal onClose={() => { setShowAdd(false); setAddType(null) }} />
      )}

      {/* Modal form ตามหนี้ */}
      {showAdd && addType === 'receivable' && (
        <ReceivableFormModal onClose={() => { setShowAdd(false); setAddType(null) }} />
      )}

      <BottomNav current={page} onChange={handleNav} />
    </div>
  )
}

// --- Debt Form Modal ---
import { useEffect, useState as useS } from 'react'
import { supabase } from './lib/supabase'

function DebtFormModal({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useS<{id:string,name:string}[]>([])
  const [form, setForm] = useS({
    type: '', description: '', total_amount: '',
    installment_amount: '', total_installments: '',
    remaining_installments: '', due_day: '', status: 'active'
  })

  useEffect(() => {
    supabase.from('categories').select('*').eq('type','debt').order('name').then(({data}) => setCategories(data||[]))
  }, [])

  async function save() {
    if (!form.description || !form.installment_amount) return
    await supabase.from('debts').insert([{
      ...form,
      total_amount: Number(form.total_amount),
      installment_amount: Number(form.installment_amount),
      total_installments: Number(form.total_installments),
      remaining_installments: Number(form.remaining_installments),
      due_day: Number(form.due_day),
    }])
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">เพิ่มหนี้ที่ต้องจ่าย</div>
        <div className="form-group">
          <div className="form-field">
            <div className="form-label">ประเภท</div>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="">เลือกประเภท</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <div className="form-label">รายละเอียด</div>
            <input placeholder="เช่น SCB Visa" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-field">
            <div className="form-label">ยอดรวม</div>
            <input type="number" placeholder="0" value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value})} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">ยอดต่องวด</div>
              <input type="number" placeholder="0" value={form.installment_amount} onChange={e => setForm({...form, installment_amount: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">วันจ่าย (1-31)</div>
              <input type="number" placeholder="25" value={form.due_day} onChange={e => setForm({...form, due_day: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">จำนวนงวด</div>
              <input type="number" placeholder="0" value={form.total_installments} onChange={e => setForm({...form, total_installments: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">งวดที่เหลือ</div>
              <input type="number" placeholder="0" value={form.remaining_installments} onChange={e => setForm({...form, remaining_installments: e.target.value})} />
            </div>
          </div>
        </div>
        <button className="btn-save" onClick={save}>บันทึก</button>
        <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}

// --- Receivable Form Modal ---
function ReceivableFormModal({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useS<{id:string,name:string}[]>([])
  const [contacts, setContacts] = useS<{id:string,name:string}[]>([])
  const [form, setForm] = useS({
    name: '', type: '', description: '', total_amount: '',
    installment_amount: '', total_installments: '',
    remaining_installments: '', due_day: '', status: 'active'
  })

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').eq('type','receivable').order('name'),
      supabase.from('contacts').select('*').order('name')
    ]).then(([{data:c},{data:ct}]) => {
      setCategories(c||[])
      setContacts(ct||[])
    })
  }, [])

  async function save() {
    if (!form.name || !form.installment_amount) return
    await supabase.from('receivables').insert([{
      ...form,
      total_amount: Number(form.total_amount),
      installment_amount: Number(form.installment_amount),
      total_installments: Number(form.total_installments),
      remaining_installments: Number(form.remaining_installments),
      due_day: Number(form.due_day),
    }])
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">เพิ่มตามหนี้</div>
        <div className="form-group">
          <div className="form-field">
            <div className="form-label">ชื่อ</div>
            <select value={form.name} onChange={e => setForm({...form, name: e.target.value})}>
              <option value="">เลือกชื่อ</option>
              {contacts.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <div className="form-label">ประเภท</div>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="">เลือกประเภท</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <div className="form-label">รายละเอียด</div>
            <input placeholder="รายละเอียด" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-field">
            <div className="form-label">ยอดรวม</div>
            <input type="number" placeholder="0" value={form.total_amount} onChange={e => setForm({...form, total_amount: e.target.value})} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">ยอดต่องวด</div>
              <input type="number" placeholder="0" value={form.installment_amount} onChange={e => setForm({...form, installment_amount: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">วันจ่าย (1-31)</div>
              <input type="number" placeholder="25" value={form.due_day} onChange={e => setForm({...form, due_day: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">จำนวนงวด</div>
              <input type="number" placeholder="0" value={form.total_installments} onChange={e => setForm({...form, total_installments: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-field">
              <div className="form-label">งวดที่เหลือ</div>
              <input type="number" placeholder="0" value={form.remaining_installments} onChange={e => setForm({...form, remaining_installments: e.target.value})} />
            </div>
          </div>
        </div>
        <button className="btn-save" onClick={save}>บันทึก</button>
        <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
      </div>
    </div>
  )
}