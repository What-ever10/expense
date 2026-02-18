const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/*
POST /expenses
Idempotency handled via header: Idempotency-Key
*/

app.post("/expenses", (req, res) => {
  const { amount, category, description, date } = req.body;
  const idempotencyKey = req.header("Idempotency-Key");

  // ----- Amount validation -----
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  // ----- Category validation -----
  if (!category || category.trim() === "") {
    return res.status(400).json({ error: "Category required" });
  }

  // ----- Description length validation -----
  const MAX_DESCRIPTION_LENGTH = 255;

  if (description && description.length > MAX_DESCRIPTION_LENGTH) {
    return res.status(400).json({
      error: `Description must be under ${MAX_DESCRIPTION_LENGTH} characters`,
    });
  }

  // ----- Date validation -----
  if (!date) {
    return res.status(400).json({ error: "Date required" });
  }

  const expenseDate = new Date(date);
  if (isNaN(expenseDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (expenseDate > today) {
    return res.status(400).json({ error: "Date cannot be in the future" });
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  try {
    // Idempotency check
    if (idempotencyKey) {
      const existing = db
        .prepare("SELECT * FROM expenses WHERE idempotency_key = ?")
        .get(idempotencyKey);

      if (existing) {
        return res.json(existing);
      }
    }

    const id = require("uuid").v4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO expenses 
      (id, amount, category, description, date, created_at, idempotency_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      amountInPaise,
      category.trim(),
      description ? description.trim() : "",
      date,
      createdAt,
      idempotencyKey || null
    );

    const newExpense = db
      .prepare("SELECT * FROM expenses WHERE id = ?")
      .get(id);

    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});


/*
GET /expenses
Supports:
?category=
?sort=date_desc
*/

app.get("/expenses", (req, res) => {
  const { category, sort } = req.query;

  let query = "SELECT * FROM expenses";
  const params = [];

  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }

  if (sort === "date_desc") {
    query += " ORDER BY date DESC";
  }

  const expenses = db.prepare(query).all(...params);

  res.json(expenses);
});

/*
GET /expenses/summary
*/

app.get("/expenses/summary", (req, res) => {
  try {
    const totalRow = db.prepare(
      "SELECT SUM(amount) as total FROM expenses"
    ).get();

    const grandTotal = totalRow.total || 0;

    if (grandTotal === 0) {
      return res.json([]);
    }

    const summary = db.prepare(`
      SELECT 
        category,
        SUM(amount) as total_amount
      FROM expenses
      GROUP BY category
      ORDER BY total_amount DESC
    `).all();

    const result = summary.map(item => ({
      category: item.category,
      total_amount: item.total_amount,
      percentage: Number(
        ((item.total_amount * 100) / grandTotal).toFixed(2)
      )
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});




//error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error" });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
