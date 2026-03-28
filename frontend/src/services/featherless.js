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
 * Analyse a loan/legal document text and flag hidden traps.
 * Returns { summary, key_terms, traps, verdict }
 */
export async function analyseLoanDocument(text) {
  const lang = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'
  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें). बहुत सरल भाषा में।'
    : 'Respond in simple English.'

  const messages = [
    {
      role: 'system',
      content: `You are a legal and financial expert helping rural Indian farmers understand documents. ${langLine}

Read the document text carefully and return ONLY valid JSON, no markdown:
{
  "summary": "2-3 sentence plain-language summary of what this document is and what it means for the person signing it",
  "key_terms": [
    { "term": "important term or clause", "meaning": "what it means in simple words" }
  ],
  "traps": [
    { "clause": "the suspicious or tricky text/phrase from the document", "warning": "why this is dangerous or unfair for the borrower" }
  ],
  "verdict": "SAFE" | "RISKY" | "DANGEROUS"
}

For traps: look for hidden fees, variable interest rates, automatic renewal clauses, penalty clauses, collateral seizure terms, unusually high interest, compound interest tricks, fine print that removes rights, vague terms that benefit the lender. Be specific — quote the exact clause if possible.
For verdict: SAFE = standard fair document, RISKY = some unfair terms but manageable, DANGEROUS = do not sign without legal help.
Return at least 2 key_terms and flag ALL traps found (0 is fine if truly none exist).`,
    },
    {
      role: 'user',
      content: `Document text:\n\n"${text}"`,
    },
  ]

  const reply = await featherlessChat(messages, { max_tokens: 800, temperature: 0.2 })
  const clean = reply.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { summary: reply, key_terms: [], traps: [], verdict: 'RISKY' }
  }
}

/**
 * Detect crop disease from a photo.
 * @param {File} imageFile
 * @param {string} cropName  - optional
 * @param {string} soilType  - optional
 * Returns { disease, severity, cause, treatment, prevention, urgent }
 */
export async function detectCropDisease(imageFile, cropName = '', soilType = '') {
  const base64 = await fileToBase64(imageFile)
  const lang = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'
  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें). बहुत सरल भाषा में।'
    : 'Respond in simple English.'

  const context = [
    cropName ? `Crop: ${cropName}` : null,
    soilType ? `Soil type: ${soilType}` : null,
  ].filter(Boolean).join(', ')

  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `You are an expert agricultural scientist helping Indian farmers. ${langLine}
${context ? `Context provided by farmer: ${context}` : ''}

Look at this crop photo carefully and return ONLY valid JSON, no markdown:
{
  "disease": "Name of the disease, deficiency, or condition (or 'Healthy' if no issue found)",
  "severity": "Mild" | "Moderate" | "Severe" | "Healthy",
  "cause": "What is causing this — fungus, bacteria, pest, nutrient deficiency, weather etc. in 1-2 sentences",
  "treatment": ["Step 1 — specific actionable treatment", "Step 2", "Step 3"],
  "prevention": ["Prevention tip 1", "Prevention tip 2", "Prevention tip 3"],
  "urgent": true or false
}

If the crop looks healthy, set disease to "Healthy", severity to "Healthy", and give general care tips in treatment and prevention.`,
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
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: VISION_MODEL, messages, temperature: 0.2, max_tokens: 600 }),
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
    return { disease: 'Unknown', severity: 'Moderate', cause: reply, treatment: [], prevention: [], urgent: false }
  }
}

/**
 * Find current Indian government schemes relevant to a career/field.
 * Returns array of { name, benefit, how_to_apply, link_hint }
 */
export async function findGovernmentSchemes(career) {
  const lang = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'
  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें).'
    : 'Respond in simple English.'

  const messages = [
    {
      role: 'system',
      content: `You are an expert on Indian government schemes and job markets helping rural citizens. ${langLine}

For the given career/field, return ONLY valid JSON (no markdown) with two sections:

{
  "schemes": [
    {
      "name": "Scheme/program name",
      "ministry": "Ministry or department",
      "benefit": "What the person gets in 1-2 sentences",
      "who_can_apply": "Eligibility in one line",
      "how_to_apply": "Website name or office to visit"
    }
  ],
  "jobs": [
    {
      "platform": "Job portal or platform name",
      "type": "Government" or "Private",
      "what_to_find": "What kind of jobs are listed here for this field",
      "url_hint": "Website or app name to visit"
    }
  ]
}

For schemes: 4 to 6 real, currently active Indian government schemes. If none are specific to the field, use general ones like PM Kaushal Vikas Yojana, PMEGP, Startup India.
For jobs: 4 to 5 platforms — mix of government portals (NCS, SSC, UPSC, state PSC) and private platforms (Naukri, LinkedIn, WorkIndia, Apna) relevant to this specific career.`,
    },
    {
      role: 'user',
      content: `Career / field: ${career}`,
    },
  ]

  const reply = await featherlessChat(messages, { max_tokens: 1000, temperature: 0.2 })
  const clean = reply.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return {
      schemes: [{ name: 'PM Kaushal Vikas Yojana', ministry: 'MSDE', benefit: reply, who_can_apply: 'Any Indian citizen', how_to_apply: 'pmkvyofficial.org' }],
      jobs: [],
    }
  }
}

/**
 * Suggest top 3 career paths from user's interests and academic profile.
 * Returns array of { title, emoji, reason }
 */
export async function suggestCareerPaths({ grade, marks10, marks12, certificates, certificateDetails, interests }) {
  const lang = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'
  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें).'
    : 'Respond in simple English.'

  const profile = [
    `Grade: ${grade}`,
    marks10 ? `10th marks: ${marks10}` : null,
    marks12 ? `12th marks: ${marks12}` : null,
    `Certificates/courses completed: ${certificates || 0}`,
    certificateDetails ? `Certificate details: ${certificateDetails}` : null,
    `Interests: ${interests.join(', ')}`,
  ].filter(Boolean).join('\n')

  const messages = [
    {
      role: 'system',
      content: `You are a career counsellor helping Indian students choose a career. ${langLine}

Based on the student's profile and interests, select the TOP 3 most viable and useful careers (choose from their interests — pick the ones with best job prospects in India).

Return ONLY valid JSON array, no markdown:
[
  { "title": "Career name", "emoji": "relevant emoji", "reason": "1 sentence why this suits them based on their marks and interests" },
  { "title": "Career name", "emoji": "relevant emoji", "reason": "1 sentence why" },
  { "title": "Career name", "emoji": "relevant emoji", "reason": "1 sentence why" }
]

If fewer than 3 interests are viable careers, return fewer objects. Always rank by best job prospects and fit with their academic profile.`,
    },
    { role: 'user', content: `Student profile:\n${profile}` },
  ]

  const reply = await featherlessChat(messages, { max_tokens: 400, temperature: 0.3 })
  const clean = reply.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return [{ title: 'General Studies', emoji: '📚', reason: reply }]
  }
}

/**
 * Generate a detailed career roadmap for a chosen career.
 * Returns { overview, steps, courses, timeline, salary, good_fit, fit_note }
 */
export async function generateCareerRoadmap({ career, grade, marks10, marks12, certificates, certificateDetails }) {
  const lang = localStorage.getItem('earth_language') || 'en'
  const isHindi = lang === 'hi'
  const langLine = isHindi
    ? 'Respond ONLY in simple Hindi (हिंदी में जवाब दें). बहुत सरल भाषा में।'
    : 'Respond in simple English.'

  const profile = [
    `Grade: ${grade}`,
    marks10 ? `10th marks: ${marks10}` : null,
    marks12 ? `12th marks: ${marks12}` : null,
    `Certificates/courses: ${certificates || 0}`,
    certificateDetails ? `Certificate details: ${certificateDetails}` : null,
  ].filter(Boolean).join('\n')

  const messages = [
    {
      role: 'system',
      content: `You are a career counsellor for rural Indian students. ${langLine}

Create a personalised career roadmap for this student. Be realistic about their marks — if marks are low, suggest alternative paths. If marks are good, highlight the best options.

Return ONLY valid JSON, no markdown:
{
  "overview": "2-3 sentence summary of this career and why it suits this student",
  "steps": ["Step 1 (most immediate)", "Step 2", "Step 3", "Step 4", "Step 5"],
  "courses": ["Important exam or course 1", "exam 2", "exam 3"],
  "timeline": "How long to reach entry-level (e.g. 3-4 years)",
  "salary": "Entry-level salary range in India (e.g. ₹3-5 LPA)",
  "good_fit": true or false based on their marks,
  "fit_note": "1 sentence about how their marks position them for this career"
}`,
    },
    {
      role: 'user',
      content: `Student wants to become: ${career}\n\nStudent profile:\n${profile}`,
    },
  ]

  const reply = await featherlessChat(messages, { max_tokens: 700, temperature: 0.3 })
  const clean = reply.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return { overview: reply, steps: [], courses: [], timeline: '', salary: '', good_fit: true, fit_note: '' }
  }
}

/**
 * Simplify a textbook passage for a rural Indian student.
 * @param {string} text       - OCR-extracted text from the textbook page
 * @param {string} outputLang - 'hi' | 'en'
 * Returns a plain-text simplified explanation (no JSON).
 */
export async function explainTextbook(text, outputLang = 'en') {
  const isHindi = outputLang === 'hi'

  const langInstruction = isHindi
    ? 'बहुत सरल हिंदी में समझाओ जैसे एक 10-12 साल के बच्चे को समझा रहे हो। कठिन शब्दों को आसान भाषा में बताओ।'
    : 'Explain in very simple English as if teaching a 10-12 year old student. Break down any difficult words or concepts.'

  const messages = [
    {
      role: 'system',
      content: `You are a friendly teacher helping rural Indian students understand their textbooks. ${langInstruction}

Read the textbook text below and:
1. Give a clear, simple explanation of what it means
2. Highlight the most important points
3. Use examples from everyday rural life where possible
4. Keep the total explanation to 150-200 words maximum

Respond with ONLY the explanation — no headings, no bullet points, just flowing simple text.`,
    },
    {
      role: 'user',
      content: `Textbook text:\n\n"${text}"`,
    },
  ]

  return featherlessChat(messages, { max_tokens: 400, temperature: 0.4 })
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
