import { useState } from 'react'
import DebtList from './components/DebtList'
import ReceivableList from './components/ReceivableList'
import './App.css'

function App() {
  const [tab, setTab] = useState<'debt' | 'receivable'>('debt')

  return (
    <div className="app">
      <h1>ทวงเงิน</h1>
      <div className="tabs">
        <button
          className={tab === 'debt' ? 'active' : ''}
          onClick={() => setTab('debt')}
        >
          หนี้ที่ต้องจ่าย
        </button>
        <button
          className={tab === 'receivable' ? 'active' : ''}
          onClick={() => setTab('receivable')}
        >
          ตามหนี้
        </button>
      </div>
      {tab === 'debt' ? <DebtList /> : <ReceivableList />}
    </div>
  )
}

export default App