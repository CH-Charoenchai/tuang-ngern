import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Category {
  id: string
  name: string
  type: string
}

interface Contact {
  id: string
  name: string
}

type ModalType = 'debt-cat' | 'rec-cat' | 'contacts' | null

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [modal, setModal] = useState<ModalType>(null)
  const [newValue, setNewValue] = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: c }, { data: ct }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('contacts').select('*').order('name')
    ])
    setCategories(c || [])
    setContacts(ct || [])
  }

  async function addCategory(type: 'debt' | 'receivable') {
    if (!newValue.trim()) return
    await supabase.from('categories').insert([{ name: newValue.trim(), type }])
    setNewValue('')
    fetchAll()
  }

  async function deleteCategory(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    fetchAll()
  }

  async function addContact() {
    if (!newValue.trim()) return
    await supabase.from('contacts').insert([{ name: newValue.trim() }])
    setNewValue('')
    fetchAll()
  }

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id)
    fetchAll()
  }

  const debtCats = categories.filter(c => c.type === 'debt')
  const recCats = categories.filter(c => c.type === 'receivable')

  return (
    <>
      <div className="top-bar">
        <h1>ตั้งค่า</h1>
      </div>

      <div className="page-content">
        <div className="section-label">จัดการข้อมูล</div>
        <div className="settings-section">
          <div className="settings-row" onClick={() => { setModal('debt-cat'); setNewValue('') }}>
            <div>
              <div className="settings-row-title">ประเภทหนี้</div>
              <div className="settings-row-meta">จัดการหมวดหมู่</div>
            </div>
            <div className="settings-row-right">
              <span className="settings-count">{debtCats.length} รายการ</span>
              <span className="chevron">›</span>
            </div>
          </div>
          <div className="settings-row" onClick={() => { setModal('rec-cat'); setNewValue('') }}>
            <div>
              <div className="settings-row-title">ประเภทตามหนี้</div>
              <div className="settings-row-meta">จัดการหมวดหมู่</div>
            </div>
            <div className="settings-row-right">
              <span className="settings-count">{recCats.length} รายการ</span>
              <span className="chevron">›</span>
            </div>
          </div>
          <div className="settings-row" onClick={() => { setModal('contacts'); setNewValue('') }}>
            <div>
              <div className="settings-row-title">รายชื่อ</div>
              <div className="settings-row-meta">จัดการผู้ติดต่อ</div>
            </div>
            <div className="settings-row-right">
              <span className="settings-count">{contacts.length} รายการ</span>
              <span className="chevron">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal ประเภทหนี้ */}
      {modal === 'debt-cat' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">ประเภทหนี้</div>
            <div className="input-row">
              <input
                placeholder="เพิ่มประเภท เช่น บัตรเครดิต"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory('debt')}
              />
              <button className="btn-sm" onClick={() => addCategory('debt')}>เพิ่ม</button>
            </div>
            <div className="settings-section">
              {debtCats.length === 0 ? (
                <div className="settings-item-row">
                  <span style={{color: '#8e8e93', fontSize: 14}}>ยังไม่มีประเภท</span>
                </div>
              ) : debtCats.map(c => (
                <div className="settings-item-row" key={c.id}>
                  <span style={{fontSize: 15}}>{c.name}</span>
                  <button className="btn-delete" onClick={() => deleteCategory(c.id)}>ลบ</button>
                </div>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setModal(null)}>ปิด</button>
          </div>
        </div>
      )}

      {/* Modal ประเภทตามหนี้ */}
      {modal === 'rec-cat' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">ประเภทตามหนี้</div>
            <div className="input-row">
              <input
                placeholder="เพิ่มประเภท เช่น ยืมเงิน"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory('receivable')}
              />
              <button className="btn-sm" onClick={() => addCategory('receivable')}>เพิ่ม</button>
            </div>
            <div className="settings-section">
              {recCats.length === 0 ? (
                <div className="settings-item-row">
                  <span style={{color: '#8e8e93', fontSize: 14}}>ยังไม่มีประเภท</span>
                </div>
              ) : recCats.map(c => (
                <div className="settings-item-row" key={c.id}>
                  <span style={{fontSize: 15}}>{c.name}</span>
                  <button className="btn-delete" onClick={() => deleteCategory(c.id)}>ลบ</button>
                </div>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setModal(null)}>ปิด</button>
          </div>
        </div>
      )}

      {/* Modal รายชื่อ */}
      {modal === 'contacts' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">รายชื่อ</div>
            <div className="input-row">
              <input
                placeholder="เพิ่มชื่อ เช่น สมชาย"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addContact()}
              />
              <button className="btn-sm" onClick={addContact}>เพิ่ม</button>
            </div>
            <div className="settings-section">
              {contacts.length === 0 ? (
                <div className="settings-item-row">
                  <span style={{color: '#8e8e93', fontSize: 14}}>ยังไม่มีรายชื่อ</span>
                </div>
              ) : contacts.map(c => (
                <div className="settings-item-row" key={c.id}>
                  <span style={{fontSize: 15}}>{c.name}</span>
                  <button className="btn-delete" onClick={() => deleteContact(c.id)}>ลบ</button>
                </div>
              ))}
            </div>
            <button className="btn-cancel" onClick={() => setModal(null)}>ปิด</button>
          </div>
        </div>
      )}
    </>
  )
}