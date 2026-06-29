import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Contact {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newDebtCat, setNewDebtCat] = useState('');
  const [newRecCat, setNewRecCat] = useState('');
  const [newContact, setNewContact] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [{ data: c }, { data: ct }] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('contacts').select('*').order('name'),
    ]);
    setCategories(c || []);
    setContacts(ct || []);
  }

  async function addCategory(type: 'debt' | 'receivable', name: string) {
    if (!name.trim()) return;
    await supabase.from('categories').insert([{ name: name.trim(), type }]);
    if (type === 'debt') setNewDebtCat('');
    else setNewRecCat('');
    fetchAll();
  }

  async function deleteCategory(id: string) {
    await supabase.from('categories').delete().eq('id', id);
    fetchAll();
  }

  async function addContact(name: string) {
    if (!name.trim()) return;
    await supabase.from('contacts').insert([{ name: name.trim() }]);
    setNewContact('');
    fetchAll();
  }

  async function deleteContact(id: string) {
    await supabase.from('contacts').delete().eq('id', id);
    fetchAll();
  }

  const debtCats = categories.filter((c) => c.type === 'debt');
  const recCats = categories.filter((c) => c.type === 'receivable');

  return (
    <div>
      <div className="page-header">
        <h1>ตั้งค่า</h1>
      </div>

      <div className="content">
        {/* ประเภทหนี้ */}
        <div className="section-header">
          <span className="section-title">ประเภทหนี้</span>
        </div>
        <div className="input-row">
          <input
            placeholder="เพิ่มประเภท เช่น บัตรเครดิต"
            value={newDebtCat}
            onChange={(e) => setNewDebtCat(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && addCategory('debt', newDebtCat)
            }
          />
          <button
            className="btn-sm"
            onClick={() => addCategory('debt', newDebtCat)}
          >
            เพิ่ม
          </button>
        </div>
        <div className="settings-section">
          {debtCats.length === 0 ? (
            <div className="settings-row">
              <span style={{ color: '#8e8e93', fontSize: 14 }}>
                ยังไม่มีประเภท
              </span>
            </div>
          ) : (
            debtCats.map((c) => (
              <div className="settings-row" key={c.id}>
                <span>{c.name}</span>
                <button
                  className="btn-delete"
                  onClick={() => deleteCategory(c.id)}
                >
                  ลบ
                </button>
              </div>
            ))
          )}
        </div>

        {/* ประเภทตามหนี้ */}
        <div className="section-header">
          <span className="section-title">ประเภทตามหนี้</span>
        </div>
        <div className="input-row">
          <input
            placeholder="เพิ่มประเภท เช่น ยืมเงิน"
            value={newRecCat}
            onChange={(e) => setNewRecCat(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && addCategory('receivable', newRecCat)
            }
          />
          <button
            className="btn-sm"
            onClick={() => addCategory('receivable', newRecCat)}
          >
            เพิ่ม
          </button>
        </div>
        <div className="settings-section">
          {recCats.length === 0 ? (
            <div className="settings-row">
              <span style={{ color: '#8e8e93', fontSize: 14 }}>
                ยังไม่มีประเภท
              </span>
            </div>
          ) : (
            recCats.map((c) => (
              <div className="settings-row" key={c.id}>
                <span>{c.name}</span>
                <button
                  className="btn-delete"
                  onClick={() => deleteCategory(c.id)}
                >
                  ลบ
                </button>
              </div>
            ))
          )}
        </div>

        {/* รายชื่อ */}
        <div className="section-header">
          <span className="section-title">รายชื่อ</span>
        </div>
        <div className="input-row">
          <input
            placeholder="เพิ่มชื่อ เช่น สมชาย"
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addContact(newContact)}
          />
          <button className="btn-sm" onClick={() => addContact(newContact)}>
            เพิ่ม
          </button>
        </div>
        <div className="settings-section">
          {contacts.length === 0 ? (
            <div className="settings-row">
              <span style={{ color: '#8e8e93', fontSize: 14 }}>
                ยังไม่มีรายชื่อ
              </span>
            </div>
          ) : (
            contacts.map((c) => (
              <div className="settings-row" key={c.id}>
                <span>{c.name}</span>
                <button
                  className="btn-delete"
                  onClick={() => deleteContact(c.id)}
                >
                  ลบ
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
