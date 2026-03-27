const FEATHERLESS_BASE = 'https://api.featherless.ai/v1'
const TEXT_MODEL  = 'Qwen/Qwen2.5-72B-Instruct'
const VISION_MODEL = 'Qwen/Qwen3-VL-30B-A3B-Instruct'

function getKey() {
  return import.meta.env.VITE_FEATHERLESS_API_KEY || ''
}

/**
 * Universal Featherless chat call.
 */
export async function featherlessChat(messages, opts = {}) {
  const key = getKey()
  if (!key) throw new Error('Featherless API key missing. Set VITE_FEATHERLESS_API_KEY in .env')

  const res = await fetch(`${FEATHERLESS_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model || TEXT_MODEL,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.max_tokens ?? 512,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err.error?.message || 'Featherless API error')
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

/**
 * Convert a File/Blob to a base64 data URL.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result) // data:image/jpeg;base64,...
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Analyse medicine label directly from image using a vision model.
 * Skips Tesseract — the vision model reads text AND understands it in one shot.
 * Returns { expiry, purpose, price, explanation }
 */
export async function analyseMedicineLabelFromImage(imageFile) {
  const base64 = await fileToBase64(imageFile)
  const lang = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'

  const explanationInstruction = isHindi
    ? '3-4 sentences in simple Hindi (हिंदी में): यह दवाई क्या है, किस बीमारी में काम आती है, सही खुराक, और 1-2 जरूरी चेतावनी। बिल्कुल सरल भाषा में लिखें।'
    : '3-4 sentences in simple English: what this medicine is, what it treats, correct dosage, and 1-2 important warnings or side effects.'

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `You are a pharmacist helping rural Indian patients understand their medicines.

Look at this medicine label image carefully and extract:
1. Read ALL text visible on the label — medicine name, expiry date, MRP/price, manufacturer, composition
2. Use your own knowledge about this medicine to fill in what the label doesn't clearly show

Return ONLY valid JSON, no markdown, no extra text:
{
  "expiry": "exact expiry date as printed on label, or Not found",
  "purpose": "specific condition this medicine treats in plain English",
  "price": "exact MRP/price as printed on label, or Not found",
  "explanation": "${explanationInstruction}"
}`,
        },
        {
          type: 'image_url',
          image_url: { url: base64 },
        },
      ],
    },
  ]

  const key = getKey()
  if (!key) throw new Error('Featherless API key missing.')

  const res = await fetch(`${FEATHERLESS_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 500,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err.error?.message || 'Vision API error')
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content?.trim() || ''
  const clean = reply.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    return { expiry: '—', purpose: '—', price: '—', explanation: reply }
  }
}

/**
 * Analyse symptoms and give doctor/home advice.
 * @param {object} opts
 *   bodyPart   - which body part was selected
 *   type       - 'physical' | 'internal'
 *   description - user's description
 *   imageFile  - File (optional, only for physical)
 * Returns { conditions, verdict, doctor_reason, home_care, warning_signs }
 */
export async function analyseSymptoms({ bodyPart, type, description, imageFile }) {
  const lang    = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'

  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें). Keep language very simple for a rural patient.'
    : 'Respond in simple English.'

  const systemPrompt = `You are a doctor helping rural Indian patients. ${langLine}

Analyse the symptoms and return ONLY valid JSON — no markdown, no text outside JSON:
{
  "conditions": ["most likely condition", "second possibility", "third possibility"],
  "verdict": "URGENT" | "SEE_DOCTOR" | "HOME_CARE",
  "doctor_reason": "one sentence why they should / do not need to see a doctor",
  "home_care": ["step 1", "step 2", "step 3", "step 4"],
  "warning_signs": ["sign that means go to doctor immediately 1", "sign 2"]
}

verdict rules:
- URGENT = needs doctor today / go to ER
- SEE_DOCTOR = see a doctor within a day or two
- HOME_CARE = safe to manage at home with remedies`

  const userText = `Body part: ${bodyPart}\nSymptom type: ${type === 'physical' ? 'Physical / visible' : 'Internal pain or feeling'}\nPatient says: ${description}`

  let reply
  if (type === 'physical' && imageFile) {
    const base64 = await fileToBase64(imageFile)
    const messages = [{
      role: 'user',
      content: [
        { type: 'text', text: `${systemPrompt}\n\n${userText}` },
        { type: 'image_url', image_url: { url: base64 } },
      ],
    }]
    const key = getKey()
    if (!key) throw new Error('API key missing')
    const res = await fetch(`${FEATHERLESS_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: VISION_MODEL, messages, temperature: 0.2, max_tokens: 600 }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
      throw new Error(err.error?.message || 'API error')
    }
    const data = await res.json()
    reply = data.choices?.[0]?.message?.content?.trim() || ''
  } else {
    reply = await featherlessChat(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userText }],
      { max_tokens: 600 }
    )
  }

  const clean = reply.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return {
      conditions: ['Could not determine'],
      verdict: 'SEE_DOCTOR',
      doctor_reason: reply,
      home_care: [],
      warning_signs: [],
    }
  }
}

/**
 * Explain what a doctor likely said based on patient's hazy memory.
 * Returns { summary, key_points, what_it_means, follow_up, urgent }
 */
export async function explainDoctorVisit(memory) {
  const lang    = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'

  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें). बहुत सरल भाषा में जवाब दें।'
    : 'Respond in simple English.'

  const messages = [
    {
      role: 'system',
      content: `You are a patient-friendly doctor helping rural Indian patients understand what their doctor told them. ${langLine}

The patient will share what they vaguely remember from their doctor visit. Interpret it and return ONLY valid JSON — no markdown, no extra text:
{
  "summary": "1-2 sentence plain-language summary of what the doctor likely said",
  "key_points": ["point 1", "point 2", "point 3"],
  "what_it_means": "explanation of the likely diagnosis or condition in very simple words",
  "follow_up": "what the patient should do next — take medicines, rest, come back after X days etc.",
  "urgent": true or false (true if anything in their memory sounds like an emergency or serious warning)
}`,
    },
    {
      role: 'user',
      content: `What the patient remembers from their doctor visit:\n\n"${memory}"`,
    },
  ]

  const reply = await featherlessChat(messages, { max_tokens: 600 })
  const clean = reply.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { summary: reply, key_points: [], what_it_means: '', follow_up: '', urgent: false }
  }
}
