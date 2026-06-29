import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Debt {
  id: string
  description: string
  installment_amount: number
  remaining_installments: number
  due_day: number
  created_at: string
  status: string
}

interface Receivable {
  id: string
  name: string
  description: string
  installment_amount: number
  remaining_installments: number
  due_day: number
  created_at: string
  status: string
}

const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function getPaymentMonths(item: Debt | Receivable, year: number): Set<number> {
  const created = new Date(item.created_at)
  const createdYear = created.getFullYear()
  const createdMonth = created.getMonth()
  const createdDay = created.getDate()

  let startMonth: number
  let startYear: number
  if (createdDay <= item.due_day) {
    startMonth = createdMonth
    startYear = createdYear
  } else {
    startMonth = createdMonth + 1
    startYear = createdYear
    if (startMonth > 11) { startMonth = 0; startYear++ }
  }

  const months = new Set<number>()
  let m = startMonth
  let y = startYear
  for (let i = 0; i < item.remaining_installments; i++) {
    if (y === year) months.add(m)
    m++
    if (m > 11) { m = 0; y++ }
  }
  return months
}

export default function HomePage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [filterName, setFilterName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const [{ data: d }, { data: r }] = await Promise.all([
        supabase.from('debts').select('*').eq('status', 'active'),
        supabase.from('receivables').select('*').eq('status', 'active')
      ])
      setDebts(d || [])
      setReceivables(r || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const names = [...new Set(receivables.map(r => r.name))]
  const filteredReceivables = filterName ? receivables.filter(r => r.name === filterName) : receivables

  function calcMonthTotal(items: (Debt | Receivable)[], month: number) {
    return items.reduce((sum, item) => {
      const months = getPaymentMonths(item, year)
      return months.has(month) ? sum + item.installment_amount : sum
    }, 0)
  }

  if (loading) return <div className="empty">กำลังโหลด...</div>

  return (
    <>
      <div className="top-bar">
        <h1>หน้าหลัก</h1>
        <div className="year-row">
          <button className="year-btn" onClick={() => setYear(y => y - 1)}>‹</button>
          <span className="year-label">{year + 543}</span>
          <button className="year-btn" onClick={() => setYear(y => y + 1)}>›</button>
        </div>
      </div>

      <div className="page-content">
        <div className="section-label">หนี้ที่ต้องจ่าย</div>
        <div className="home-table-wrap">
          <table className="home-table">
            <thead>
              <tr>
                <th>รายการ</th>
                {MONTHS.map(m => <th key={m}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {debts.length === 0 ? (
                <tr><td colSpan={13} style={{textAlign:'center', color:'#8e8e93', padding:'16px'}}>ไม่มีรายการ</td></tr>
              ) : debts.map(debt => {
                const months = getPaymentMonths(debt, year)
                return (
                  <tr key={debt.id}>
                    <td>{debt.description}</td>
                    {Array.from({length: 12}, (_, i) => (
                      <td key={i}>
                        {months.has(i)
                          ? <span className="cell-amount">{debt.installment_amount.toLocaleString()}</span>
                          : <span className="cell-empty">—</span>
                        }
                      </td>
                    ))}
                  </tr>
                )
              })}
              <tr className="total-row">
                <td>รวม</td>
                {Array.from({length: 12}, (_, i) => (
                  <td key={i}>
                    {calcMonthTotal(debts, i) > 0
                      ? <span>{calcMonthTotal(debts, i).toLocaleString()}</span>
                      : <span className="cell-empty">—</span>
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-label">ตามหนี้</div>
        {names.length > 0 && (
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterName === '' ? 'active' : ''}`}
              onClick={() => setFilterName('')}
            >ทุกคน</button>
            {names.map(n => (
              <button
                key={n}
                className={`filter-tab ${filterName === n ? 'active' : ''}`}
                onClick={() => setFilterName(n)}
              >{n}</button>
            ))}
          </div>
        )}
        <div className="home-table-wrap">
          <table className="home-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                {MONTHS.map(m => <th key={m}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredReceivables.length === 0 ? (
                <tr><td colSpan={13} style={{textAlign:'center', color:'#8e8e93', padding:'16px'}}>ไม่มีรายการ</td></tr>
              ) : filteredReceivables.map(r => {
                const months = getPaymentMonths(r, year)
                return (
                  <tr key={r.id}>
                    <td>{r.name} · {r.description}</td>
                    {Array.from({length: 12}, (_, i) => (
                      <td key={i}>
                        {months.has(i)
                          ? <span className="cell-amount">{r.installment_amount.toLocaleString()}</span>
                          : <span className="cell-empty">—</span>
                        }
                      </td>
                    ))}
                  </tr>
                )
              })}
              <tr className="total-row">
                <td>รวม</td>
                {Array.from({length: 12}, (_, i) => (
                  <td key={i}>
                    {calcMonthTotal(filteredReceivables, i) > 0
                      ? <span>{calcMonthTotal(filteredReceivables, i).toLocaleString()}</span>
                      : <span className="cell-empty">—</span>
                    }
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}