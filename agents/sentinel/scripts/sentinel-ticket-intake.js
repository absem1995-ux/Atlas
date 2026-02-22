#!/usr/bin/env node

/**
 * Sentinel Ticket Intake
 * Receives and parses support tickets from multiple channels
 */

async function intakeTicket(ticketData) {
  const ticketId = `ticket-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  console.log(`\n[${timestamp}] 🎟️ Ticket received`);
  console.log(`   ID: ${ticketId}`);
  console.log(`   From: ${ticketData.customerEmail}`);
  console.log(`   Issue: ${ticketData.subject}`);
  
  // Parse and validate
  const ticket = {
    id: ticketId,
    channel: ticketData.channel || 'email',
    customer: ticketData.customerEmail,
    subject: ticketData.subject,
    description: ticketData.description,
    attachments: ticketData.attachments || [],
    created: timestamp,
    status: 'intake',
    priority: 'pending'
  };
  
  console.log(`   Status: Queued for triage`);
  
  return ticket;
}

// Mock tickets for testing
const mockTickets = [
  {
    customerEmail: 'user@example.com',
    channel: 'email',
    subject: 'Cannot login to account',
    description: 'I keep getting an error when trying to log in. Password is correct.'
  },
  {
    customerEmail: 'company@business.com',
    channel: 'chat',
    subject: 'Feature request: bulk export',
    description: 'We need ability to export all records at once'
  }
];

if (require.main === module) {
  console.log('🚀 Sentinel Ticket Intake System\n');
  
  Promise.all(mockTickets.map(intakeTicket))
    .then(tickets => {
      console.log(`\n📊 Intake complete: ${tickets.length} tickets`);
      process.exit(0);
    })
    .catch(e => {
      console.error('Error:', e.message);
      process.exit(1);
    });
}

module.exports = { intakeTicket };
