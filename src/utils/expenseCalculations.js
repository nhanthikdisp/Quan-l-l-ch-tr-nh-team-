export function calculateTripExpenses(events = [], members = []) {
  // Exclude cancelled & pending events from financial splitting
  const validEvents = events.filter(e => e.status !== 'Hủy' && e.status !== 'Chờ duyệt');

  // Helper: Get unique participants (members + email-only) for an event
  const getEventParticipants = (evt) => {
    const participantMap = new Map();

    // Add members from assignedMembers IDs
    if (Array.isArray(evt.assignedMembers)) {
      evt.assignedMembers.forEach(mId => {
        const found = members.find(m => m.id === mId);
        if (found) {
          participantMap.set(found.id, found);
        }
      });
    }

    // Add members from participantEmails
    if (Array.isArray(evt.participantEmails)) {
      evt.participantEmails.forEach(email => {
        if (!email) return;
        const normalizedEmail = email.toLowerCase().trim();
        const found = members.find(m => m.email && m.email.toLowerCase().trim() === normalizedEmail);
        if (found) {
          participantMap.set(found.id, found);
        } else {
          // Virtual member for unregistered email
          const virtualId = `email_${normalizedEmail}`;
          if (!participantMap.has(virtualId)) {
            participantMap.set(virtualId, {
              id: virtualId,
              email: normalizedEmail,
              name: normalizedEmail.split('@')[0],
              role: 'Member',
              skillRole: 'Thành viên tham gia',
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`
            });
          }
        }
      });
    }

    return Array.from(participantMap.values());
  };

  // Detailed Event Stats
  const eventStats = validEvents.map(evt => {
    const payments = Array.isArray(evt.payments) && evt.payments.length > 0 ? evt.payments : null;
    
    // Total cost: Sum of payments if exists, or manual cost
    let cost = 0;
    if (payments) {
      cost = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    } else {
      cost = Number(evt.cost) || 0;
    }

    const participants = getEventParticipants(evt);
    const count = participants.length || 1;
    const perPersonShare = Math.round(cost / count);

    // Calculate total paid by each participant in this specific event
    const participantBreakdown = participants.map(p => {
      let paidInEvent = 0;

      if (payments) {
        // Sum all payments made by this member (matched by email or id)
        payments.forEach(pay => {
          const isPayer = (p.id && pay.payerId === p.id) ||
            (p.email && pay.payerEmail && p.email.toLowerCase().trim() === pay.payerEmail.toLowerCase().trim());
          if (isPayer) {
            paidInEvent += Number(pay.amount) || 0;
          }
        });
      } else {
        // Fallback for single payer
        const isSinglePayer = (p.id && evt.payerId === p.id) ||
          (p.email && evt.payerEmail && p.email.toLowerCase().trim() === evt.payerEmail.toLowerCase().trim());
        if (isSinglePayer) {
          paidInEvent = cost;
        }
      }

      const share = perPersonShare;
      const net = paidInEvent - share;

      return {
        member: p,
        paid: Math.round(paidInEvent),
        share,
        net: Math.round(net)
      };
    });

    return {
      event: { ...evt, cost },
      cost,
      payments: payments || [],
      participants,
      count,
      perPersonShare,
      participantBreakdown
    };
  }).filter(es => es.cost > 0);

  // Total Trip Cost
  const totalTripCost = eventStats.reduce((sum, es) => sum + es.cost, 0);

  // Combine members + any external emails found across all valid events
  const allParticipantMap = new Map();
  members.forEach(m => allParticipantMap.set(m.id, m));
  eventStats.forEach(es => {
    es.participants.forEach(p => {
      if (!allParticipantMap.has(p.id)) {
        allParticipantMap.set(p.id, p);
      }
    });
  });
  const allMembers = Array.from(allParticipantMap.values());

  // Per Member Overall Stats (Total Paid vs Total Share)
  const memberStats = allMembers.map(m => {
    let totalPaid = 0;
    let totalShare = 0;

    eventStats.forEach(es => {
      const pb = es.participantBreakdown.find(p =>
        p.member.id === m.id || (m.email && p.member.email && m.email.toLowerCase() === p.member.email.toLowerCase())
      );
      if (pb) {
        totalPaid += pb.paid;
        totalShare += pb.share;
      }
    });

    const netBalance = totalPaid - totalShare;

    return {
      member: m,
      totalPaid: Math.round(totalPaid),
      totalShare: Math.round(totalShare),
      netBalance: Math.round(netBalance)
    };
  });

  // Optimal Settlement Algorithm ("Ai nợ ai bao nhiêu")
  let debtors = memberStats
    .filter(s => s.netBalance < -10)
    .map(s => ({ ...s, amountOwed: Math.abs(s.netBalance) }));

  let creditors = memberStats
    .filter(s => s.netBalance > 10)
    .map(s => ({ ...s, amountReceivable: s.netBalance }));

  const settlements = [];

  debtors.forEach(d => {
    creditors.forEach(c => {
      if (d.amountOwed > 0 && c.amountReceivable > 0) {
        const payment = Math.min(d.amountOwed, c.amountReceivable);
        settlements.push({
          fromMember: d.member,
          toMember: c.member,
          amount: Math.round(payment)
        });
        d.amountOwed -= payment;
        c.amountReceivable -= payment;
      }
    });
  });

  return {
    totalTripCost,
    eventStats,
    memberStats,
    settlements
  };
}


