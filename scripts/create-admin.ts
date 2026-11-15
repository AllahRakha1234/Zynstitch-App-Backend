import { existsSync } from 'node:fs';
import { hash } from 'bcryptjs';
import mongoose from 'mongoose';
import { validateEnv } from '../src/config/env.validation.js';

if (!process.env.MONGO_URI && existsSync('.env')) {
  process.loadEnvFile('.env');
}

const env = validateEnv(process.env);
const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? '123456';

async function createAdmin() {
  await mongoose.connect(env.MONGO_URI, { dbName: env.DEFAULT_DB });
  const users = mongoose.connection.collection('users');
  const existing = await users.findOne({ email });

  if (existing) {
    console.log(`User already exists with email: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const result = await users.insertOne({
    name: process.env.ADMIN_NAME ?? 'Admin',
    email,
    password: await hash(password, 10),
    role: 'ADMIN',
    status: 'ACTIVE',
    companyName: process.env.ADMIN_COMPANY_NAME ?? 'Zynstitch',
    profilePhoto: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Admin created:', { id: result.insertedId.toString(), email });
  await mongoose.disconnect();
}

try {
  await createAdmin();
} catch (error) {
  console.error('Failed to create admin user:', error);
  await mongoose.disconnect();
  process.exit(1);
}
