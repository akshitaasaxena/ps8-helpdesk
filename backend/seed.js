require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Department = require('./models/department');
const Ticket = require('./models/ticket');
const Comment = require('./models/comment');
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');
    await Comment.deleteMany({});
    await Ticket.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCustomerPassword = await bcrypt.hash('customer123', 10);
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'admin'
    });
    const customer1 = await User.create({
      name: 'Alice Johnson',
      email: 'customer1@example.com',
      password: hashedCustomerPassword,
      role: 'customer'
    });
    const customer2 = await User.create({
      name: 'Bob Smith',
      email: 'customer2@example.com',
      password: hashedCustomerPassword,
      role: 'customer'
    });
    const deptTech = await Department.create({
      name: 'Technical Support',
      description: 'Hardware, software, and system troubleshooting'
    });
    const deptBilling = await Department.create({
      name: 'Billing & Accounts',
      description: 'Invoicing, payments, and subscription queries'
    });
    const deptCS = await Department.create({
      name: 'Customer Service',
      description: 'General inquiries, onboarding, and customer feedback'
    });
    const deptIT = await Department.create({
      name: 'IT Infrastructure',
      description: 'Network, server access, and credential management'
    });
    const sampleTickets = [
      {
        ticketId: 'TKT-1001',
        title: 'Unable to access VPN gateway',
        category: 'Network',
        priority: 'High',
        description: 'Connection drops immediately after 2FA challenge on office VPN.',
        screenshotUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
        status: 'Open',
        customer: customer1._id,
        department: deptTech._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1002',
        title: 'Incorrect charge on monthly invoice',
        category: 'Billing',
        priority: 'High',
        description: 'October statement includes an unauthorized recurring add-on charge.',
        screenshotUrl: '',
        status: 'In Progress',
        customer: customer1._id,
        department: deptBilling._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1003',
        title: 'Software license upgrade request',
        category: 'Software',
        priority: 'Medium',
        description: 'Need access to developer tools tier for Q4 deliverable.',
        screenshotUrl: '',
        status: 'Open',
        customer: customer2._id,
        department: deptIT._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1004',
        title: 'Application crash on PDF export',
        category: 'Bug',
        priority: 'High',
        description: 'Exporting tabular reports larger than 10MB results in memory timeout.',
        screenshotUrl: '',
        status: 'Resolved',
        customer: customer1._id,
        department: deptTech._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1005',
        title: 'Email notifications delivery delay',
        category: 'System',
        priority: 'Medium',
        description: 'Password reset and invoice alerts arrive up to 45 minutes late.',
        screenshotUrl: '',
        status: 'Closed',
        customer: customer2._id,
        department: deptTech._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1006',
        title: 'Update business billing address',
        category: 'Billing',
        priority: 'Low',
        description: 'Company headquarters moved to new suite address.',
        screenshotUrl: '',
        status: 'Resolved',
        customer: customer2._id,
        department: deptBilling._id,
        reopenCount: 1
      },
      {
        ticketId: 'TKT-1007',
        title: 'Session timeout during form submission',
        category: 'Usability',
        priority: 'Medium',
        description: 'Submitting intake form after 5 minutes gives unhandled session error.',
        screenshotUrl: '',
        status: 'Open',
        customer: customer1._id,
        department: deptCS._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1008',
        title: 'Slow page load on analytics tab',
        category: 'Performance',
        priority: 'Low',
        description: 'Chart rendering pauses page interactivity for several seconds.',
        screenshotUrl: '',
        status: 'In Progress',
        customer: customer2._id,
        department: deptTech._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1009',
        title: 'Inquiry regarding API rate limits',
        category: 'General',
        priority: 'Low',
        description: 'Looking for documentation on hourly request caps for integrations.',
        screenshotUrl: '',
        status: 'Open',
        customer: customer1._id,
        department: deptCS._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1010',
        title: 'Office printer configuration assistance',
        category: 'Hardware',
        priority: 'Low',
        description: 'Need driver installation instructions for network printer.',
        screenshotUrl: '',
        status: 'Closed',
        customer: customer2._id,
        department: deptIT._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1011',
        title: 'Two-factor authenticator reset request',
        category: 'Security',
        priority: 'High',
        description: 'Device replaced, need QR code regenerated for authenticator app.',
        screenshotUrl: '',
        status: 'In Progress',
        customer: customer1._id,
        department: deptIT._id,
        reopenCount: 0
      },
      {
        ticketId: 'TKT-1012',
        title: 'Duplicate subscription payment refund',
        category: 'Billing',
        priority: 'High',
        description: 'Two transactions posted for annual renewal subscription.',
        screenshotUrl: '',
        status: 'Open',
        customer: customer2._id,
        department: null,
        reopenCount: 0
      }
    ];
    const createdTickets = await Ticket.insertMany(sampleTickets);
    await Comment.create({
      ticket: createdTickets[0]._id,
      user: customer1._id,
      message: 'I tested on both mobile hotspot and home Wi-Fi with same timeout.'
    });
    await Comment.create({
      ticket: createdTickets[0]._id,
      user: adminUser._id,
      message: 'We are investigating the VPN gateway IP routing tables.'
    });
    await Comment.create({
      ticket: createdTickets[3]._id,
      user: adminUser._id,
      message: 'Memory buffer threshold increased in v2.4 patch.'
    });
    await Comment.create({
      ticket: createdTickets[3]._id,
      user: customer1._id,
      message: 'Verified successful PDF generation. Thank you!'
    });
    console.log('Database seeded successfully with 3 users, 4 departments, 12 tickets, and 4 comments.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  }
};
seed();
