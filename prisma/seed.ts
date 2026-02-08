import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { logger, dbLogger } from '../lib/logger';

const prisma = new PrismaClient();

async function main() {
  logger.section('🌱 UrjaFlow Database Seeding');
  
  logger.info('Starting database seeding process...');

  // Clean existing data (optional - comment out if you want to preserve data)
  logger.subsection('Cleaning existing data');
  
  const cleanupTasks = [
    'device readings',
    'devices', 
    'invoices',
    'support tickets',
    'subscriptions',
    'organization subscriptions',
    'plans',
    'FAQs',
    'notifications',
    'sessions',
    'accounts',
    'users',
    'organizations'
  ];

  cleanupTasks.forEach((task, index) => {
    logger.progress(index + 1, cleanupTasks.length, `Cleaning ${task}`);
  });

  await prisma.deviceReading.deleteMany();
  await prisma.device.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.organizationSubscription.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  logger.success('Database cleaned successfully');

  logger.subsection('Creating organizations');

  const demoOrg = await prisma.organization.create({
    data: {
      name: 'Demo Energy Corp',
      slug: 'demo-energy-corp',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      plan: 'ENTERPRISE',
      maxUsers: 50,
      maxDevices: 100,
      settings: JSON.stringify({
        timezone: 'UTC',
        currency: 'USD',
        notifications: true,
      }),
    },
  });
  dbLogger.success('Created Demo Energy Corp');

  const techOrg = await prisma.organization.create({
    data: {
      name: 'Tech Solutions Ltd',
      slug: 'tech-solutions',
      primaryColor: '#10b981',
      secondaryColor: '#6b7280',
      plan: 'PROFESSIONAL',
      maxUsers: 20,
      maxDevices: 50,
      settings: JSON.stringify({
        timezone: 'America/New_York',
        currency: 'USD',
        notifications: true,
      }),
    },
  });
  dbLogger.success('Created Tech Solutions Ltd');

  logger.success('Organizations created successfully');

  logger.subsection('Creating users');
  
  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@urjaflow.com',
      name: 'Demo User',
      password: hashedPassword,
      role: 'VIEWER',
      emailVerified: new Date(),
      organizationId: demoOrg.id,
    },
  });
  dbLogger.success('Created Demo User (VIEWER)');

  await prisma.user.create({
    data: {
      email: 'admin@urjaflow.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });
  dbLogger.success('Created Admin User (SUPER_ADMIN)');

  await prisma.user.create({
    data: {
      email: 'org.admin@techsolutions.com',
      name: 'Org Admin',
      password: hashedPassword,
      role: 'ORG_ADMIN',
      emailVerified: new Date(),
      organizationId: techOrg.id,
    },
  });
  dbLogger.success('Created Org Admin (ORG_ADMIN)');

  await prisma.user.create({
    data: {
      email: 'manager@techsolutions.com',
      name: 'Manager User',
      password: hashedPassword,
      role: 'MANAGER',
      emailVerified: new Date(),
      organizationId: techOrg.id,
    },
  });
  dbLogger.success('Created Manager User (MANAGER)');

  logger.success('All users created successfully');

  // Create subscription plans
  await prisma.plan.create({
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

  // Create organization subscriptions
  await prisma.organizationSubscription.create({
    data: {
      organizationId: demoOrg.id,
      planId: enterprisePlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.organizationSubscription.create({
    data: {
      organizationId: techOrg.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created organization subscriptions');

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

  // Create devices for organizations
  const solarPanel = await prisma.device.create({
    data: {
      organizationId: demoOrg.id,
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

  await prisma.device.create({
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
  await prisma.invoice.create({
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

  await prisma.invoice.create({
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

  await prisma.invoice.create({
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

  // Create payment methods
  await prisma.paymentMethod.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'CARD',
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2026,
        isDefault: true,
      },
      {
        userId: demoUser.id,
        type: 'CARD',
        brand: 'Mastercard',
        last4: '5555',
        expMonth: 8,
        expYear: 2027,
        isDefault: false,
      },
    ],
  });

  console.log('✅ Created payment methods');

  logger.section('🎉 Database Seeding Complete!');
  
  logger.successBlock('Seeding Summary', [
    `Users: 4 (demo@urjaflow.com, admin@urjaflow.com, org.admin@techsolutions.com, manager@techsolutions.com)`,
    `Password: password123`,
    `Organizations: 2 (Demo Energy Corp, Tech Solutions Ltd)`,
    `Plans: 3 (Basic, Professional, Enterprise)`,
    `Devices: 4+ (Solar Panel, Battery, Inverter, Meter)`,
    `Readings: ${readings.length} (last 24 hours)`,
    `Invoices: 3`,
    `Support Tickets: 2`,
    `FAQs: ${faqs.length}`,
    `Notifications: 3`
  ]);

  logger.subsection('🔐 Role Access Information');
  
  const roleInfo = [
    ['Role', 'Email', 'Access Level'],
    ['SUPER_ADMIN', 'admin@urjaflow.com', 'Full system access'],
    ['ORG_ADMIN', 'org.admin@techsolutions.com', 'Organization management'],
    ['MANAGER', 'manager@techsolutions.com', 'Analytics & Reports'],
    ['VIEWER', 'demo@urjaflow.com', 'Read-only access']
  ];
  
  logger.table(['Role', 'Email', 'Access Level'], roleInfo);
  
  logger.success('Project ready for testing! 🚀');
}

main()
  .catch((e) => {
    logger.errorBlock('Database seeding failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
