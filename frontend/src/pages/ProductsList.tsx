import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export const ProductsList = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>
      <div className="grid-cols-3">
        {products.map(p => (
          <div key={p._id} className="card">
            <h3>{p.title}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{p.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ fontWeight: 'bold' }}>$${p.price}</span>
              <span style={{ fontSize: '0.875rem', background: 'var(--border)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{p.category}</span>
            </div>
          </div>
        ))}
        {products.length === 0 && <p>No products found.</p>}
      </div>
    </div>
  );
};
