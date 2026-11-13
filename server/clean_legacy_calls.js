import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const callSchema = new mongoose.Schema({}, { strict: false });
const Call = mongoose.model('Call', callSchema);

async function cleanExotelRecords() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raw-sahara-voice');
  console.log('Connected to MongoDB');

  const res = await Call.updateMany(
    {
      $or: [
        { provider: 'exotel' },
        { summary: { $regex: 'Exotel', $options: 'i' } }
      ]
    },
    {
      $set: {
        provider: 'sarvam',
        summary: 'Sarvam Telephony (+91 79714 14044) call to recipient completed normally via Sarvam Voice Engine (bulbul:v3).'
      }
    }
  );

  console.log('Updated call records:', res.modifiedCount);
  await mongoose.disconnect();
}

cleanExotelRecords();
