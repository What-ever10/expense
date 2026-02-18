import { useEffect, useState } from "react";
//import { createExpense, getExpenses } from "./api";
import { createExpense, getExpenses, getCategorySummary } from "./api";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortNewest, setSortNewest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);


  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  async function loadExpenses() {
    const data = await getExpenses(
      categoryFilter,
      sortNewest ? "date_desc" : ""
    );
    setExpenses(data);
  }

  useEffect(() => {
    loadExpenses();
  }, [categoryFilter, sortNewest]);
  
  
  async function handleShowSummary() {
  try {
    const data = await getCategorySummary();
    setSummary(data);
    setShowSummary(true);
  } catch (err) {
    alert("Failed to load summary");
  }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await createExpense(form);
      setForm({ amount: "", category: "", description: "", date: "" });
      await loadExpenses();
    } catch (err) {
      alert("Error creating expense");
    } finally {
      setLoading(false);
    }
  }

  const total = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  ) / 100;

  return (
  <div className="container">
    <h1>💰 Expense Tracker</h1>

    <div className="card">
      <h3>Add Expense</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <button disabled={loading}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>

    <div className="card">
      <div className="controls">
        <div>
          <input
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <label style={{ marginLeft: 10 }}>
            <input
              type="checkbox"
              checked={sortNewest}
              onChange={() => setSortNewest(!sortNewest)}
            />
            Sort by newest
          </label>
        </div>

        <button className="secondary" onClick={handleShowSummary}>
          Show Category Summary
        </button>
      </div>

      <div className="total">
        Total: ₹{total.toFixed(2)}
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.category}</td>
              <td>{e.description}</td>
              <td>{(e.amount / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {showSummary && (
      <div className="card">
        <h3>Category Summary</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total (₹)</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.category}>
                <td>{item.category}</td>
                <td>{(item.total_amount / 100).toFixed(2)}</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

}

export default App;
