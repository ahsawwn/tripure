import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Products CRUD
  const getProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      return productsData;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  };

  const addProduct = async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Orders CRUD
  const getOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      return ordersData;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Inventory CRUD
  const getInventory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryData);
      return inventoryData;
    } catch (error) {
      console.error('Error getting inventory:', error);
      throw error;
    }
  };

  const updateStock = async (id, quantity) => {
    try {
      const inventoryRef = doc(db, 'inventory', id);
      await updateDoc(inventoryRef, {
        quantity,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  };

  // Customers CRUD
  const getCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'customers'));
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersData);
      return customersData;
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  };

  const value = {
    loading,
    products,
    orders,
    customers,
    inventory,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getInventory,
    updateStock,
    getCustomers
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};