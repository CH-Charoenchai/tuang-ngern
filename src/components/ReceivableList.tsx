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

export default function ReceivableList() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    fetchReceivables();
  }, []);

  async function fetchReceivables() {
    const { data } = await supabase
      .from('receivables')
      .select('*')
      .order('due_day');
    setReceivables(data || []);
    setLoading(false);
  }

  async function addReceivable() {
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
    fetchReceivables();
  }

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>+ เพิ่มรายการ</button>

      {showForm && (
        <div className="form">
          <input
            placeholder="ชื่อ"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
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
          <button onClick={addReceivable}>บันทึก</button>
        </div>
      )}

      {receivables.map((r) => (
        <div className="card" key={r.id}>
          <div className="card-title">
            {r.name} — {r.type}
          </div>
          <div>{r.description}</div>
          <div>ยอดต่องวด: {r.installment_amount.toLocaleString()} บาท</div>
          <div>
            งวดที่เหลือ: {r.remaining_installments}/{r.total_installments}
          </div>
          <div>วันจ่าย: {r.due_day} ของทุกเดือน</div>
          <div>สถานะ: {r.status}</div>
        </div>
      ))}
    </div>
  );
}
