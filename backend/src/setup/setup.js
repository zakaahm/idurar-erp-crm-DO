require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const newAdminPassword = new AdminPassword();

    const salt = uniqueId();

    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'admin@admin.com',
      name: 'IDURAR',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const result = await new Admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    await new AdminPassword(AdminPasswordData).save();

    console.log('👍 Admin created : Done!');

    const Setting = require('../models/coreModels/Setting');

    const settingFiles = [];

    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    await Setting.insertMany(settingFiles);

    console.log('👍 Settings created : Done!');

    const PaymentMode = require('../models/appModels/PaymentMode');
    const Taxes = require('../models/appModels/Taxes');
    const Lead = require('../models/appModels/Lead');

    await Taxes.insertMany([{ taxName: 'Tax 0%', taxValue: '0', isDefault: true }]);
    console.log('👍 Taxes created : Done!');

    await PaymentMode.insertMany([
      {
        name: 'Default Payment',
        description: 'Default Payment Mode (Cash , Wire Transfer)',
        isDefault: true,
      },
    ]);
    console.log('👍 PaymentMode created : Done!');

    await Lead.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Example Corp',
        source: 'website',
        status: 'contacted',
        nextActionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dagen later
        followUps: [
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dagen geleden
            type: 'call',
            notes: 'Initial cold call made',
            outcome: 'No answer, voicemail left',
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dag geleden
            type: 'call',
            notes: 'Follow-up call',
            outcome: 'Spoke briefly, interested but busy',
          },
        ],
        notes: 'Interested in our services, follow up in 2 days',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
        company: 'Another Company',
        source: 'referral',
        status: 'qualified',
        nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
        followUps: [
          {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dagen geleden
            type: 'email',
            notes: 'Introductory email sent',
            outcome: 'Opened and replied positively',
          },
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dagen geleden
            type: 'meeting',
            notes: 'Discovery call scheduled',
            outcome: 'Qualified as potential client, appointment booked for next week',
          },
        ],
        notes: 'Referred by existing client, high potential',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1122334455',
        company: 'Startup Inc',
        source: 'social_media',
        status: 'proposal',
        nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dagen later
        followUps: [
          {
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week geleden
            type: 'call',
            notes: 'Cold call from LinkedIn lead',
            outcome: 'Interested, requested more info',
          },
          {
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dagen geleden
            type: 'email',
            notes: 'Sent proposal document',
            outcome: 'Received, asked for clarification on pricing',
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dag geleden
            type: 'call',
            notes: 'Follow-up on proposal',
            outcome: 'Pricing clarified, considering decision',
          },
        ],
        notes: 'Moving to proposal stage, close potential',
      },
    ]);
    console.log('👍 Leads created : Done!');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
