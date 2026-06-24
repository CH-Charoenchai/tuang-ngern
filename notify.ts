
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const LINE_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!
const LINE_USER_ID = process.env.LINE_USER_ID!

async function sendLine(message: string) {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LINE_TOKEN}`
    },
    body: JSON.stringify({
      to: LINE_USER_ID,
      messages: [{ type: 'text', text: message }]
    })
  })
}

export default async function handler(req: any, res: any) {
  const today = new Date().getDate()

  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .eq('due_day', today)
    .eq('status', 'active')

  const { data: receivables } = await supabase
    .from('receivables')
    .select('*')
    .eq('due_day', today)
    .eq('status', 'active')

  let message = `🔔 ทวงเงิน — วันนี้ ${new Date().toLocaleDateString('th-TH')}\n\n`

  if (debts && debts.length > 0) {
    message += `💸 หนี้ที่ต้องจ่ายวันนี้:\n`
    debts.forEach(d => {
      message += `• ${d.type} ${d.description} — ${d.installment_amount.toLocaleString()} บาท\n`
    })
    message += '\n'
  }

  if (receivables && receivables.length > 0) {
    message += `💰 คนที่ต้องจ่ายเราวันนี้:\n`
    receivables.forEach(r => {
      message += `• ${r.name} (${r.description}) — ${r.installment_amount.toLocaleString()} บาท\n`
    })
  }

  if ((!debts || debts.length === 0) && (!receivables || receivables.length === 0)) {
    message += `✅ ไม่มีรายการวันนี้`
  }

  await sendLine(message)
  res.status(200).json({ ok: true })
}
