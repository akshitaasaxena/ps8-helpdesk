require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/user');
const Ticket = require('./models/ticket');
const Department = require('./models/department');
const Comment = require('./models/comment');
let server;
let baseUrl;
const request = async (method, path, body = null, token = null) => {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};
const runTests = async () => {
  try {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
    console.log('Testing backend at', baseUrl);
    const health = await request('GET', '/api/health');
    if (health.status !== 200 || health.data.message !== 'Helpdesk API is running') {
      throw new Error('Health check failed');
    }
    console.log('PASS: Health check');
    const testEmail = `test_${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Customer',
      email: testEmail,
      password: 'password123',
      role: 'admin'
    });
    if (regRes.status !== 201 || regRes.data.user.role !== 'customer') {
      throw new Error('Registration failed or customer escalated role');
    }
    console.log('PASS: Registration & role escalation prevention');
    const dupReg = await request('POST', '/api/auth/register', {
      name: 'Duplicate User',
      email: testEmail,
      password: 'password123'
    });
    if (dupReg.status !== 400) {
      throw new Error('Duplicate email registration should return 400');
    }
    console.log('PASS: Duplicate email handling');
    const badLogin = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'wrongpassword'
    });
    if (badLogin.status !== 401) {
      throw new Error('Invalid login should return 401');
    }
    console.log('PASS: Invalid credentials rejected');
    const custLogin = await request('POST', '/api/auth/login', {
      email: 'customer1@example.com',
      password: 'customer123'
    });
    if (custLogin.status !== 200 || !custLogin.data.token) {
      throw new Error('Customer login failed');
    }
    const customerToken = custLogin.data.token;
    console.log('PASS: Customer login');
    const cust2Login = await request('POST', '/api/auth/login', {
      email: 'customer2@example.com',
      password: 'customer123'
    });
    const customer2Token = cust2Login.data.token;
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    if (adminLogin.status !== 200 || !adminLogin.data.token || adminLogin.data.user.role !== 'admin') {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLogin.data.token;
    console.log('PASS: Admin login');
    const unauth = await request('GET', '/api/tickets');
    if (unauth.status !== 401) {
      throw new Error('Unauthenticated request should return 401');
    }
    console.log('PASS: Protected routes reject missing token');
    const custTickets = await request('GET', '/api/tickets', null, customerToken);
    if (custTickets.status !== 200 || !Array.isArray(custTickets.data)) {
      throw new Error('Customer tickets fetch failed');
    }
    const otherCustTicket = custTickets.data.find(t => t.customer && t.customer.email === 'customer2@example.com');
    if (otherCustTicket) {
      throw new Error('Customer saw another customer tickets');
    }
    console.log('PASS: Customer only sees own tickets');
    const badTicket = await request('POST', '/api/tickets', {
      title: 'Incomplete Ticket'
    }, customerToken);
    if (badTicket.status !== 400) {
      throw new Error('Incomplete ticket creation should return 400');
    }
    console.log('PASS: Ticket creation validation');
    const createdTicketRes = await request('POST', '/api/tickets', {
      title: 'New Wireless Network Glitch',
      category: 'Network',
      priority: 'Medium',
      description: 'WiFi cuts off randomly every 20 minutes.',
      screenshotUrl: ''
    }, customerToken);
    if (createdTicketRes.status !== 201 || !createdTicketRes.data.ticketId || createdTicketRes.data.status !== 'Open') {
      throw new Error('Valid ticket creation failed');
    }
    const newTicket = createdTicketRes.data;
    console.log('PASS: Ticket created with Open status, unique ID, optional screenshot');
    const forbiddenView = await request('GET', `/api/tickets/${newTicket._id}`, null, customer2Token);
    if (forbiddenView.status !== 403) {
      throw new Error('Unauthorized customer was able to view ticket');
    }
    console.log('PASS: Cross-customer ticket view forbidden');
    const editTicketRes = await request('PUT', `/api/tickets/${newTicket._id}`, {
      title: 'New Wireless Network Glitch - Updated',
      priority: 'High',
      status: 'Closed',
      reopenCount: 5
    }, customerToken);
    if (editTicketRes.status !== 200 || editTicketRes.data.title !== 'New Wireless Network Glitch - Updated' || editTicketRes.data.status === 'Closed' || editTicketRes.data.reopenCount === 5) {
      throw new Error('Customer ticket edit validation or protection failed');
    }
    console.log('PASS: Customer ticket edit works and protects status/counts');
    const emptyCommentRes = await request('POST', `/api/tickets/${newTicket._id}/comments`, {
      message: '   '
    }, customerToken);
    if (emptyCommentRes.status !== 400) {
      throw new Error('Empty comment should return 400');
    }
    console.log('PASS: Empty comment rejected');
    const unauthCommentRes = await request('POST', `/api/tickets/${newTicket._id}/comments`, {
      message: 'Sneaky comment'
    }, customer2Token);
    if (unauthCommentRes.status !== 403) {
      throw new Error('Unauthorized user comment should return 403');
    }
    console.log('PASS: Unauthorized comment rejected');
    const commentRes = await request('POST', `/api/tickets/${newTicket._id}/comments`, {
      message: 'Checking signal strength now.'
    }, customerToken);
    if (commentRes.status !== 201 || !commentRes.data.user || !commentRes.data.message) {
      throw new Error('Valid comment creation failed');
    }
    console.log('PASS: Valid comment created and associated');
    const getCommentsRes = await request('GET', `/api/tickets/${newTicket._id}/comments`, null, customerToken);
    if (getCommentsRes.status !== 200 || getCommentsRes.data.length === 0) {
      throw new Error('Failed to fetch comments');
    }
    console.log('PASS: Comments retrieved successfully');
    const adminTicketsRes = await request('GET', '/api/tickets', null, adminToken);
    if (adminTicketsRes.status !== 200 || adminTicketsRes.data.length < 10) {
      throw new Error('Admin did not see all tickets');
    }
    console.log('PASS: Admin sees all tickets');
    const filteredStatus = await request('GET', '/api/tickets?status=Open', null, adminToken);
    if (filteredStatus.status !== 200 || filteredStatus.data.some(t => t.status !== 'Open')) {
      throw new Error('Status filter failed');
    }
    const filteredPriority = await request('GET', '/api/tickets?priority=High', null, adminToken);
    if (filteredPriority.status !== 200 || filteredPriority.data.some(t => t.priority !== 'High')) {
      throw new Error('Priority filter failed');
    }
    console.log('PASS: Admin filters by status and priority');
    const deptsRes = await request('GET', '/api/departments', null, adminToken);
    const techDept = deptsRes.data.find(d => d.name === 'Technical Support');
    const assignRes = await request('PATCH', `/api/tickets/${newTicket._id}/assign`, {
      department: techDept ? techDept._id : null
    }, adminToken);
    if (assignRes.status !== 200 || !assignRes.data.department) {
      throw new Error('Admin department assignment failed');
    }
    console.log('PASS: Admin department assignment');
    const statusRes = await request('PATCH', `/api/tickets/${newTicket._id}/status`, {
      status: 'Resolved'
    }, adminToken);
    if (statusRes.status !== 200 || statusRes.data.status !== 'Resolved') {
      throw new Error('Admin status update failed');
    }
    console.log('PASS: Admin status update to Resolved');
    const reopenRes1 = await request('POST', `/api/tickets/${newTicket._id}/reopen`, {}, customerToken);
    if (reopenRes1.status !== 200 || reopenRes1.data.status !== 'Open' || reopenRes1.data.reopenCount !== 1) {
      throw new Error('First reopen failed');
    }
    console.log('PASS: Resolved ticket reopened successfully');
    await request('PATCH', `/api/tickets/${newTicket._id}/status`, { status: 'Resolved' }, adminToken);
    const reopenRes2 = await request('POST', `/api/tickets/${newTicket._id}/reopen`, {}, customerToken);
    if (reopenRes2.status !== 400) {
      throw new Error('Second reopen should be rejected with 400');
    }
    console.log('PASS: Reopening resolved ticket more than once rejected');
    const newDeptRes = await request('POST', '/api/departments', {
      name: 'Temporary Dept',
      description: 'To be deleted'
    }, adminToken);
    if (newDeptRes.status !== 201) {
      throw new Error('Department creation failed');
    }
    const tempDept = newDeptRes.data;
    await request('PATCH', `/api/tickets/${newTicket._id}/assign`, {
      department: tempDept._id
    }, adminToken);
    const updateDeptRes = await request('PUT', `/api/departments/${tempDept._id}`, {
      name: 'Temporary Dept Updated',
      description: 'About to delete'
    }, adminToken);
    if (updateDeptRes.status !== 200 || updateDeptRes.data.name !== 'Temporary Dept Updated') {
      throw new Error('Department update failed');
    }
    console.log('PASS: Department create and edit');
    const deleteDeptRes = await request('DELETE', `/api/departments/${tempDept._id}`, null, adminToken);
    if (deleteDeptRes.status !== 200) {
      throw new Error('Department delete failed');
    }
    const checkTicketDept = await request('GET', `/api/tickets/${newTicket._id}`, null, adminToken);
    if (checkTicketDept.data.department !== null) {
      throw new Error('Ticket still references deleted department');
    }
    console.log('PASS: Department deleted safely without dangling ticket reference');
    const dashRes = await request('GET', '/api/dashboard', null, adminToken);
    if (dashRes.status !== 200 || typeof dashRes.data.totalTickets !== 'number' || !dashRes.data.byStatus || !dashRes.data.byPriority) {
      throw new Error('Admin dashboard failed');
    }
    console.log('PASS: Admin dashboard analytics calculated from MongoDB');
    console.log('ALL BACKEND TESTS PASSED SUCCESSFULLY');
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('TEST FAILED:', err.message);
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};
runTests();
