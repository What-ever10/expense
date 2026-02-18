export async function createExpense(expense) {
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch("http://localhost:3000/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
}

export async function getCategorySummary() {
  const response = await fetch("http://localhost:3000/expenses/summary");
  if (!response.ok) throw new Error("Failed to fetch summary");
  return response.json();
}


export async function getExpenses(category, sort) {
  let url = "http://localhost:3000/expenses?";
  if (category) url += `category=${category}&`;
  if (sort) url += `sort=${sort}`;

  const response = await fetch(url);
  return response.json();
}
