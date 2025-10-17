import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MedicineInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', quantity: '', expiryDate: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/medicines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(res.data);
    } catch (err) {
      setError('Error fetching medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
    setFormSuccess('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.name || !form.quantity || !form.expiryDate) {
      setFormError('All fields are required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/medicines',
        {
          name: form.name,
          quantity: Number(form.quantity),
          expiryDate: form.expiryDate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setFormSuccess('Medicine added successfully!');
      setForm({ name: '', quantity: '', expiryDate: '' });
      fetchMedicines();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Error adding medicine'
      );
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Medicine Inventory</h2>
      {/* Add Medicine Form */}
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500 }}>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            required
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500 }}>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleFormChange}
            required
            min="1"
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500 }}>Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleFormChange}
            required
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 18px', borderRadius: '4px', background: '#4a90e2', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Add Medicine
        </button>
      </form>
      {formError && <div style={{ color: 'red', marginBottom: '1rem' }}>{formError}</div>}
      {formSuccess && <div style={{ color: 'green', marginBottom: '1rem' }}>{formSuccess}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ background: '#f4f8fb' }}>
              <th style={{ padding: '8px', border: '1px solid #e9ecef' }}>Name</th>
              <th style={{ padding: '8px', border: '1px solid #e9ecef' }}>Quantity</th>
              <th style={{ padding: '8px', border: '1px solid #e9ecef' }}>Expiry Date</th>
              <th style={{ padding: '8px', border: '1px solid #e9ecef' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(med => {
              const isExpired = new Date(med.expiryDate) < new Date();
              const isLow = med.quantity < 10;
              return (
                <tr key={med._id} style={{ background: isExpired ? '#ffcccc' : isLow ? '#fff3cd' : 'white' }}>
                  <td style={{ padding: '8px', border: '1px solid #e9ecef' }}>{med.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #e9ecef' }}>{med.quantity}</td>
                  <td style={{ padding: '8px', border: '1px solid #e9ecef' }}>{new Date(med.expiryDate).toLocaleDateString()}</td>
                  <td style={{ padding: '8px', border: '1px solid #e9ecef' }}>
                    {isExpired ? 'Expired' : isLow ? 'Low Stock' : 'OK'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MedicineInventory; 