import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/raw-sahara-voice');
  const org = await mongoose.connection.collection('organizations').findOne({});
  console.log('Current org voiceProvider:', org?.voiceProvider);

  await mongoose.connection.collection('organizations').updateOne(
    { _id: org._id },
    { $set: { voiceProvider: 'exotel' } }
  );

  const updated = await mongoose.connection.collection('organizations').findOne({ _id: org._id });
  console.log('Updated org voiceProvider:', updated?.voiceProvider);
  process.exit(0);
}

run().catch(console.error);
