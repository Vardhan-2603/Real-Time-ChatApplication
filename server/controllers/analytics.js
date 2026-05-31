import { MessageModel } from '../Models/MessageModel.js';
import { ChannelModel } from '../Models/ChannelModel.js';
import { UserModel } from '../Models/UserModel.js';
import mongoose from 'mongoose';

const STOP_WORDS = new Set([
  'the','is','at','which','on','a','an','and','or','to','for','of','in','with','that','this','it','as','are'
]);

function topWords(text, limit = 8) {
  const words = (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => !STOP_WORDS.has(w));

  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0, limit).map(e=>e[0]);
}

export async function getSummary(req, res, next) {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const user = await UserModel.findById(userId);
    const lastSeen = user?.lastSeen || new Date(0);

    // Direct messages to user since lastSeen
    const directMissed = await MessageModel.countDocuments({ receiver: userId, createdAt: { $gt: lastSeen }, sender: { $ne: userId } });

    // Channels the user belongs to
    const userChannels = await ChannelModel.find({ members: userId }).select('_id');
    const channelIds = userChannels.map(c => c._id);

    const channelMissed = await MessageModel.countDocuments({ channel: { $in: channelIds }, createdAt: { $gt: lastSeen }, sender: { $ne: userId } });

    const missed = directMissed + channelMissed;

    // Gather recent messages for summarization (last 7 days)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMessages = await MessageModel.find({
      $or: [ { receiver: userId }, { channel: { $in: channelIds } } ] ,
      createdAt: { $gt: since }
    }).sort({ createdAt: -1 }).limit(500).lean();

    const combinedText = recentMessages.map(m => m.content || '').join('\n');
    const keywords = topWords(combinedText, 8);

    // Extract action items heuristically
    const actionPatterns = /\b(TODO|Action|Please|Assign|Follow up|Follow-up|Followup)\b[:\s-]?(.+)?/i;
    const actionItems = [];
    const keyPoints = [];

    for (const msg of recentMessages) {
      if (!msg.content) continue;
      const lines = msg.content.split(/[\.\n]/).map(s=>s.trim()).filter(Boolean);
      for (const line of lines) {
        if (actionPatterns.test(line) || /\bplease\b|\bassign\b|\bdeadline\b|\burgent\b/i.test(line)) {
          if (actionItems.length < 10) actionItems.push(line);
        }
        // pick sentences that look like summary points (short and containing keywords)
        const kwMatch = keywords.some(k => line.toLowerCase().includes(k));
        if (kwMatch && keyPoints.length < 8) keyPoints.push(line);
      }
    }

    // fallback if none found
    if (keyPoints.length === 0 && recentMessages.length) {
      keyPoints.push(...recentMessages.slice(0,5).map(m=> (m.content || '').slice(0,140)));
    }

    res.json({
      missed,
      directMissed,
      channelMissed,
      keyPoints: keyPoints.slice(0,8),
      actionItems: actionItems.slice(0,10),
      keywords,
    });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const io = req.app.get('socketio');

    // Active users (approx): number of connected sockets
    const activeUsersOnline = io?.sockets?.sockets?.size || 0;

    // Messages sent today
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const messagesSentToday = await MessageModel.countDocuments({ createdAt: { $gte: startOfDay } });

    // Most active channels
    const channelsAgg = await MessageModel.aggregate([
      { $match: { channel: { $ne: null } } },
      { $group: { _id: '$channel', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'channels', localField: '_id', foreignField: '_id', as: 'channel' } },
      { $unwind: { path: '$channel', preserveNullAndEmptyArrays: true } },
      { $project: { channelId: '$_id', name: '$channel.name', count: 1 } }
    ]);

    // Team activity graph: messages per day for last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = await MessageModel.countDocuments({ createdAt: { $gte: d, $lt: next } });
      days.push({ date: d.toISOString().slice(0,10), count });
    }

    // Call statistics placeholder (no call model available)
    const callStats = { totalCalls: 0, avgDuration: 0 };

    res.json({ activeUsersOnline, messagesSentToday, mostActiveChannels: channelsAgg, teamActivity: days, callStats });
  } catch (err) {
    next(err);
  }
}

export default { getSummary, getStats };
