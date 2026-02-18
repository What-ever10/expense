export async function createExpense(expense) {
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch("https://expense-iqfh.onrender.com/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(expense),
  });

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || "Failed to create expense");
}


  return response.json();
}

export async function getCategorySummary() {
  const response = await fetch("https://expense-iqfh.onrender.com/expenses/summary");
  if (!response.ok) throw new Error("Failed to fetch summary");
  return response.json();
}

export async function deleteExpense(id) {
  const response = await fetch(
    `https://expense-iqfh.onrender.com/expenses/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete expense");
  }

  return response.json();
}


export async function getExpenses(category, sort) {
  let url = "https://expense-iqfh.onrender.com/expenses?";
  if (category) url += `category=${category}&`;
  if (sort) url += `sort=${sort}`;

  const response = await fetch(url);
  return response.json();
}
