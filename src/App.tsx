import { useState } from 'react'
import BottomNav from './components/BottomNav'
import HomePage from './components/HomePage'
import DebtPage from './components/DebtPage'
import ReceivablePage from './components/ReceivablePage'
import SettingsPage from './components/SettingsPage'
import './App.css'

type Page = 'home' | 'debt' | 'add' | 'receivable' | 'settings'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [showAdd, setShowAdd] = useState(false)

  function handleNav(p: Page) {
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
      {page === 'debt' && <DebtPage />}
      {page === 'receivable' && <ReceivablePage />}
      {page === 'settings' && <SettingsPage />}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">เพิ่มรายการ</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <button className="btn-save" onClick={() => { setShowAdd(false); setPage('debt') }}>
                💸 หนี้ที่ต้องจ่าย
              </button>
              <button className="btn-save" style={{background: '#2e7d32'}} onClick={() => { setShowAdd(false); setPage('receivable') }}>
                💰 ตามหนี้
              </button>
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav current={page} onChange={handleNav} />
    </div>
  )
}