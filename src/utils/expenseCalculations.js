export function calculateTripExpenses(events, members) {
  // Exclude cancelled & pending events from financial splitting
  const validEvents = events.filter(e => e.cost > 0 && e.status !== 'Hủy' && e.status !== 'Chờ duyệt');

  // Total Trip Cost
  const totalTripCost = validEvents.reduce((sum, e) => sum + (Number(e.cost) || 0), 0);

  // Per Member Stats (Paid vs Share)
  const memberStats = members.map(m => {
    const totalPaid = validEvents
      .filter(e => e.payerId === m.id)
      .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);

    const totalShare = validEvents.reduce((sum, e) => {
      const assigned = e.assignedMembers || [];
      if (assigned.includes(m.id) && assigned.length > 0) {
        return sum + (e.cost / assigned.length);
      }
      return sum;
    }, 0);

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
    memberStats,
    settlements
  };
}
