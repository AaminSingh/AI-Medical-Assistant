import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const s = new mongoose.Schema({ password: String });

s.pre('save', async function () {
  console.log('pre-save called, args:', arguments.length);
  this.password = await bcrypt.hash(this.password, 10);
});

const M = mongoose.model('Test', s);
const doc = new M({ password: 'hello' });

// We can't actually save without a DB, but let's test the hook via $__save
try {
  // Connect to the same DB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  const saved = await doc.save();
  console.log('OK! saved password hash:', saved.password);
} catch(e) {
  console.error('ERR:', e.message);
  console.error('Stack:', e.stack);
} finally {
  await mongoose.disconnect();
  process.exit(0);
}
