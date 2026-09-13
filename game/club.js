function createClub(name, city, identity, president){
  const budgets = {
    academy: 3000000,
    power: 10000000,
    fighter: 2000000
  };

  return {
    name,
    city,
    identity,
    budget: budgets[identity] || 2000000,
    fans: 50,
    reputation: 1,
    president
  };
}
