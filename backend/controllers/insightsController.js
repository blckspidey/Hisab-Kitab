const axios = require('axios');
const IncomeExpense = require('../models/IncomeExpense');

function getMonthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function toCurrency(num) {
  return Math.round((num || 0) * 100) / 100;
}

function buildLocalHeuristicInsight(stats) {
  const { monthTotal, byCategory, weekendSharePct, monthOverMonthPct } = stats;
  const topCat = byCategory.sort((a, b) => b.total - a.total)[0];
  const lines = [];
  if (topCat) {
    lines.push(`Your top spend category is ${topCat.category} (₹${toCurrency(topCat.total)}).`);
  }
  if (typeof weekendSharePct === 'number') {
    lines.push(`About ${Math.round(weekendSharePct)}% of your spending happened on weekends.`);
  }
  if (typeof monthOverMonthPct === 'number') {
    const dir = monthOverMonthPct >= 0 ? 'more' : 'less';
    lines.push(`You spent ${Math.abs(Math.round(monthOverMonthPct))}% ${dir} than last month overall.`);
  }
  lines.push('Tip: Plan a low-spend weekend and batch cook once this week 😋');
  return lines.join(' ');
}

async function computeStats(userId) {
  const now = new Date();
  const { start: curStart, end: curEnd } = getMonthRange(now);
  const prevRef = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const { start: prevStart, end: prevEnd } = getMonthRange(prevRef);

  const baseMatch = { user: userId, isDeleted: false, isIncome: false };

  const [curAgg, prevAgg] = await Promise.all([
    IncomeExpense.aggregate([
      { $match: { ...baseMatch, addedOn: { $gte: curStart, $lt: curEnd } } },
      { $project: { category: 1, cost: 1, addedOn: 1, dow: { $dayOfWeek: '$addedOn' } } },
      { $facet: {
        byCategory: [ { $group: { _id: '$category', total: { $sum: '$cost' } } } ],
        byDow: [ { $group: { _id: '$dow', total: { $sum: '$cost' } } } ],
        total: [ { $group: { _id: null, total: { $sum: '$cost' } } } ]
      }}
    ]),
    IncomeExpense.aggregate([
      { $match: { ...baseMatch, addedOn: { $gte: prevStart, $lt: prevEnd } } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ])
  ]);

  const cat = (curAgg[0]?.byCategory || []).map(c => ({ category: c._id || 'Uncategorized', total: c.total || 0 }));
  const totalCur = curAgg[0]?.total?.[0]?.total || 0;
  const prevTotal = prevAgg?.[0]?.total || 0;
  const weekendTotal = (curAgg[0]?.byDow || []).filter(d => d._id === 1 || d._id === 7).reduce((s, d) => s + (d.total || 0), 0);
  const weekendSharePct = totalCur > 0 ? (weekendTotal / totalCur) * 100 : 0;
  const monthOverMonthPct = prevTotal > 0 ? ((totalCur - prevTotal) / prevTotal) * 100 : (totalCur > 0 ? 100 : 0);

  return {
    month: now.toISOString().slice(0, 7),
    monthTotal: totalCur,
    previousMonthTotal: prevTotal,
    monthOverMonthPct,
    weekendSharePct,
    byCategory: cat,
    range: { start: curStart, end: curEnd },
  };
}

async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  };
  const res = await axios.post(url, body, { timeout: 12000 });
  const text = res?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || '';
}

const getMonthlyInsight = async (req, res) => {
  try {
    const stats = await computeStats(req.user._id);
    const key = process.env.GEMINI_API_KEY;

    const basePrompt = [
      'You are a friendly personal finance coach. Given this monthly expense summary JSON, write a concise, motivational insight (2-4 sentences).',
      'Keep it positive, specific, and actionable. If weekends are higher, suggest one small habit change.',
      'Use Indian currency style hints and casual tone with an emoji or two.',
      'JSON:',
      JSON.stringify(stats)
    ].join('\n');

    let message = '';
    if (key && key !== 'your_gemini_api_key_here') {
      try {
        message = await callGemini(basePrompt, key);
      } catch (e) {
        message = '';
      }
    }
    if (!message) {
      // Fallback local heuristic
      message = buildLocalHeuristicInsight(stats);
    }

    res.json({ stats, message });
  } catch (error) {
    // Graceful fallback if anything goes wrong
    try {
      const stats = await computeStats(req.user._id);
      const message = buildLocalHeuristicInsight(stats);
      return res.json({ stats, message, note: 'AI service unreachable, using local summary.' });
    } catch (e) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
};

module.exports = { getMonthlyInsight };


