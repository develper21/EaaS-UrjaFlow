import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - comment out if you want to preserve data)
  await prisma.deviceReading.deleteMany();
  await prisma.device.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@urjaflow.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'CUSTOMER',
      emailVerified: new Date(),
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@urjaflow.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created users');

  // Create subscription plans
  const basicPlan = await prisma.plan.create({
    data: {
      name: 'Basic',
      description: 'Perfect for small homes and apartments',
      price: 29.99,
      features: JSON.stringify([
        'Up to 5 devices',
        'Real-time monitoring',
        'Monthly reports',
        'Email support',
        '100GB data storage',
      ]),
      maxDevices: 5,
      maxStorage: 100,
      priority: 1,
      active: true,
    },
  });

  const proPlan = await prisma.plan.create({
    data: {
      name: 'Professional',
      description: 'Ideal for medium-sized installations',
      price: 79.99,
      features: JSON.stringify([
        'Up to 20 devices',
        'Real-time monitoring',
        'Advanced analytics',
        'Priority support',
        '500GB data storage',
        'API access',
        'Custom alerts',
      ]),
      maxDevices: 20,
      maxStorage: 500,
      priority: 2,
      active: true,
    },
  });

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: 'Enterprise',
      description: 'For large-scale commercial operations',
      price: 199.99,
      features: JSON.stringify([
        'Unlimited devices',
        'Real-time monitoring',
        'Advanced analytics',
        '24/7 phone support',
        'Unlimited data storage',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
      ]),
      maxDevices: 999,
      maxStorage: 999999,
      priority: 3,
      active: true,
    },
  });

  console.log('✅ Created subscription plans');

  // Create subscription for demo user
  const subscription = await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log('✅ Created subscription');

  // Create devices for demo user
  const solarPanel = await prisma.device.create({
    data: {
      userId: demoUser.id,
      name: 'Rooftop Solar Array',
      type: 'SOLAR_PANEL',
      model: 'SunPower X22-370',
      serialNumber: 'SP-2024-001',
      capacity: 5.5,
      status: 'ACTIVE',
      location: JSON.stringify({ lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' }),
      installedAt: new Date('2024-01-15'),
    },
  });

  const battery = await prisma.device.create({
    data: {
      userId: demoUser.id,
      name: 'Home Battery Storage',
      type: 'BATTERY',
      model: 'Tesla Powerwall 2',
      serialNumber: 'BAT-2024-001',
      capacity: 13.5,
      status: 'ACTIVE',
      location: JSON.stringify({ lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' }),
      installedAt: new Date('2024-01-15'),
    },
  });

  const inverter = await prisma.device.create({
    data: {
      userId: demoUser.id,
      name: 'Solar Inverter',
      type: 'INVERTER',
      model: 'SolarEdge SE7600H',
      serialNumber: 'INV-2024-001',
      capacity: 7.6,
      status: 'ACTIVE',
      location: JSON.stringify({ lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' }),
      installedAt: new Date('2024-01-15'),
    },
  });

  const meter = await prisma.device.create({
    data: {
      userId: demoUser.id,
      name: 'Smart Energy Meter',
      type: 'METER',
      model: 'Sense Energy Monitor',
      serialNumber: 'MTR-2024-001',
      status: 'ACTIVE',
      location: JSON.stringify({ lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' }),
      installedAt: new Date('2024-01-15'),
    },
  });

  console.log('✅ Created devices');

  // Create sample device readings (last 24 hours)
  const now = new Date();
  const readings = [];

  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Solar generation varies by time of day (peak at noon)
    const solarMultiplier = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    const generation = 3.5 * solarMultiplier + Math.random() * 0.5;
    
    // Consumption varies (higher in morning and evening)
    const consumptionBase = hour < 6 || hour > 22 ? 0.5 : hour > 8 && hour < 18 ? 2.0 : 3.5;
    const consumption = consumptionBase + Math.random() * 0.5;
    
    // Battery level
    const batteryLevel = 60 + Math.random() * 30;

    readings.push({
      deviceId: solarPanel.id,
      timestamp,
      generationKW: generation,
      consumptionKW: 0,
      voltage: 240 + Math.random() * 10,
      current: generation * 4.17,
      temperature: 25 + Math.random() * 10,
      efficiency: 85 + Math.random() * 10,
    });

    readings.push({
      deviceId: battery.id,
      timestamp,
      generationKW: 0,
      consumptionKW: 0,
      batteryPercent: batteryLevel,
      voltage: 400 + Math.random() * 20,
      temperature: 20 + Math.random() * 5,
    });

    readings.push({
      deviceId: meter.id,
      timestamp,
      generationKW: generation,
      consumptionKW: consumption,
      voltage: 240 + Math.random() * 5,
      current: consumption * 4.17,
    });
  }

  await prisma.deviceReading.createMany({ data: readings });

  console.log('✅ Created device readings');

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      subscriptionId: subscription.id,
      invoiceNumber: 'INV-2024-001',
      amount: 79.99,
      status: 'PAID',
      dueDate: new Date('2024-01-01'),
      paidAt: new Date('2024-01-01'),
      description: 'Professional Plan - January 2024',
      metadata: JSON.stringify({
        items: [
          { description: 'Professional Plan', amount: 79.99 },
        ],
      }),
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      subscriptionId: subscription.id,
      invoiceNumber: 'INV-2024-002',
      amount: 79.99,
      status: 'PAID',
      dueDate: new Date('2024-02-01'),
      paidAt: new Date('2024-02-01'),
      description: 'Professional Plan - February 2024',
      metadata: JSON.stringify({
        items: [
          { description: 'Professional Plan', amount: 79.99 },
        ],
      }),
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      userId: demoUser.id,
      subscriptionId: subscription.id,
      invoiceNumber: 'INV-2024-003',
      amount: 79.99,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      description: 'Professional Plan - Current Month',
      metadata: JSON.stringify({
        items: [
          { description: 'Professional Plan', amount: 79.99 },
        ],
      }),
    },
  });

  console.log('✅ Created invoices');

  // Create support tickets
  await prisma.supportTicket.create({
    data: {
      userId: demoUser.id,
      subject: 'Solar panel efficiency question',
      description: 'I noticed my solar panel efficiency dropped to 82% yesterday. Is this normal?',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      category: 'Technical',
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.supportTicket.create({
    data: {
      userId: demoUser.id,
      subject: 'Billing inquiry',
      description: 'Can I upgrade my plan mid-cycle?',
      status: 'OPEN',
      priority: 'LOW',
      category: 'Billing',
    },
  });

  console.log('✅ Created support tickets');

  // Create FAQs
  const faqs = [
    {
      question: 'How do I monitor my energy production in real-time?',
      answer: 'Navigate to your Dashboard to see live energy production, consumption, and battery status. The data updates every few seconds.',
      category: 'Monitoring',
      order: 1,
    },
    {
      question: 'What happens if my internet connection goes down?',
      answer: 'Your devices will continue to operate normally. Data will be cached locally and synced once the connection is restored.',
      category: 'Technical',
      order: 2,
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! You can change your plan at any time from the Plans page. Changes take effect at the start of your next billing cycle.',
      category: 'Billing',
      order: 3,
    },
    {
      question: 'How accurate are the energy savings calculations?',
      answer: 'Our calculations are based on your actual energy production and local utility rates. Accuracy is typically within 2-3%.',
      category: 'Monitoring',
      order: 4,
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and ACH bank transfers through our secure payment processor Stripe.',
      category: 'Billing',
      order: 5,
    },
  ];

  await prisma.fAQ.createMany({ data: faqs });

  console.log('✅ Created FAQs');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Welcome to UrjaFlow!',
        message: 'Your account has been successfully set up. Start monitoring your energy production now.',
        type: 'SUCCESS',
        read: false,
      },
      {
        userId: demoUser.id,
        title: 'High Energy Production',
        message: 'Your solar panels are producing 120% of expected output today!',
        type: 'INFO',
        read: false,
      },
      {
        userId: demoUser.id,
        title: 'Invoice Due Soon',
        message: 'Your invoice of $79.99 is due in 7 days.',
        type: 'WARNING',
        read: false,
      },
    ],
  });

  console.log('✅ Created notifications');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: 2 (demo@urjaflow.com / admin@urjaflow.com)`);
  console.log(`   - Password: demo123`);
  console.log(`   - Plans: 3 (Basic, Professional, Enterprise)`);
  console.log(`   - Devices: 4 (Solar Panel, Battery, Inverter, Meter)`);
  console.log(`   - Readings: ${readings.length} (last 24 hours)`);
  console.log(`   - Invoices: 3`);
  console.log(`   - Support Tickets: 2`);
  console.log(`   - FAQs: ${faqs.length}`);
  console.log(`   - Notifications: 3\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
