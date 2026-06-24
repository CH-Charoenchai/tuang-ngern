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

export default function DebtList() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    fetchDebts();
  }, []);

  async function fetchDebts() {
    const { data } = await supabase.from('debts').select('*').order('due_day');
    setDebts(data || []);
    setLoading(false);
  }

  async function addDebt() {
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
    fetchDebts();
  }

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>+ เพิ่มรายการ</button>

      {showForm && (
        <div className="form">
          <input
            placeholder="ประเภท"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <input
            placeholder="รายละเอียด"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            placeholder="ยอดรวม"
            type="number"
            value={form.total_amount}
            onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
          />
          <input
            placeholder="ยอดต่องวด"
            type="number"
            value={form.installment_amount}
            onChange={(e) =>
              setForm({ ...form, installment_amount: e.target.value })
            }
          />
          <input
            placeholder="จำนวนงวด"
            type="number"
            value={form.total_installments}
            onChange={(e) =>
              setForm({ ...form, total_installments: e.target.value })
            }
          />
          <input
            placeholder="งวดที่เหลือ"
            type="number"
            value={form.remaining_installments}
            onChange={(e) =>
              setForm({ ...form, remaining_installments: e.target.value })
            }
          />
          <input
            placeholder="วันจ่าย (1-31)"
            type="number"
            value={form.due_day}
            onChange={(e) => setForm({ ...form, due_day: e.target.value })}
          />
          <button onClick={addDebt}>บันทึก</button>
        </div>
      )}

      {debts.map((debt) => (
        <div className="card" key={debt.id}>
          <div className="card-title">
            {debt.type} — {debt.description}
          </div>
          <div>ยอดต่องวด: {debt.installment_amount.toLocaleString()} บาท</div>
          <div>
            งวดที่เหลือ: {debt.remaining_installments}/{debt.total_installments}
          </div>
          <div>วันจ่าย: {debt.due_day} ของทุกเดือน</div>
          <div>สถานะ: {debt.status}</div>
        </div>
      ))}
    </div>
  );
}
