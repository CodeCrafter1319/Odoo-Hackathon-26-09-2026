import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import StockBalance from '../models/StockBalance.js';
import StockLedger from '../models/StockLedger.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockAdjustment from '../models/StockAdjustment.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Warehouse.deleteMany();
    await Location.deleteMany();
    await StockBalance.deleteMany();
    await StockLedger.deleteMany();
    await Receipt.deleteMany();
    await DeliveryOrder.deleteMany();
    await InternalTransfer.deleteMany();
    await StockAdjustment.deleteMany();

    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Demo@12345', salt);

    const users = await User.insertMany([
      { name: 'Demo Inventory Manager', email: 'manager@stocksense.demo', password: passwordHash, role: 'inventory_manager' },
      { name: 'Demo Warehouse Staff', email: 'staff@stocksense.demo', password: passwordHash, role: 'warehouse_staff' }
    ]);
    const manager = users[0];

    console.log('Seeding Categories...');
    const categories = await Category.insertMany([
      { name: 'Raw Materials' },
      { name: 'Finished Goods' },
      { name: 'Office Supplies' },
      { name: 'Hardware' }
    ]);
    const catMap = categories.reduce((map, cat) => { map[cat.name] = cat._id; return map; }, {});

    console.log('Seeding Warehouses...');
    const warehouses = await Warehouse.insertMany([
      { name: 'Main Warehouse', code: 'WH-MAIN', address: 'StockSense Main Warehouse' },
      { name: 'Production Warehouse', code: 'WH-PROD', address: 'StockSense Production Warehouse' }
    ]);
    const whMain = warehouses[0];
    const whProd = warehouses[1];

    console.log('Seeding Locations...');
    const locMainStorage = await Location.create({ name: 'Main Storage', code: 'MAIN-STORAGE', warehouse: whMain._id, type: 'storage' });
    const locRackA = await Location.create({ name: 'Rack A', code: 'RACK-A', warehouse: whMain._id, type: 'storage', parentLocation: locMainStorage._id });
    const locRackB = await Location.create({ name: 'Rack B', code: 'RACK-B', warehouse: whMain._id, type: 'storage', parentLocation: locMainStorage._id });
    const locProdFloor = await Location.create({ name: 'Production Floor', code: 'PROD-FLOOR', warehouse: whMain._id, type: 'production' });

    const locProdStorage = await Location.create({ name: 'Production Storage', code: 'PROD-STORAGE', warehouse: whProd._id, type: 'storage' });
    const locFGArea = await Location.create({ name: 'Finished Goods Area', code: 'FG-AREA', warehouse: whProd._id, type: 'storage' });

    console.log('Seeding Products...');
    const products = await Product.insertMany([
      { name: 'Steel Rods', sku: 'MAT-STEEL-001', category: catMap['Raw Materials'], uom: 'kg', reorderLevel: 30 },
      { name: 'Steel Sheets', sku: 'MAT-STEEL-002', category: catMap['Raw Materials'], uom: 'sheets', reorderLevel: 20 },
      { name: 'Aluminum Rods', sku: 'MAT-AL-001', category: catMap['Raw Materials'], uom: 'kg', reorderLevel: 25 },
      { name: 'Office Chairs', sku: 'FG-CHAIR-001', category: catMap['Finished Goods'], uom: 'units', reorderLevel: 10 },
      { name: 'Work Tables', sku: 'FG-TABLE-001', category: catMap['Finished Goods'], uom: 'units', reorderLevel: 5 },
      { name: 'Bolts', sku: 'HW-BOLT-001', category: catMap['Hardware'], uom: 'units', reorderLevel: 50 },
      { name: 'Nuts', sku: 'HW-NUT-001', category: catMap['Hardware'], uom: 'units', reorderLevel: 50 },
      { name: 'Printer Paper', sku: 'OFF-PAPER-001', category: catMap['Office Supplies'], uom: 'packs', reorderLevel: 10 }
    ]);
    const prodMap = products.reduce((map, p) => { map[p.name] = p; return map; }, {});

    console.log('Seeding Stock Balances and Ledger...');
    const initialStocks = [
      { product: prodMap['Steel Rods'], warehouse: whMain, location: locRackA, quantity: 100 },
      { product: prodMap['Steel Sheets'], warehouse: whMain, location: locRackB, quantity: 60 },
      { product: prodMap['Aluminum Rods'], warehouse: whMain, location: locRackA, quantity: 15 },
      { product: prodMap['Office Chairs'], warehouse: whMain, location: locRackB, quantity: 25 },
      { product: prodMap['Work Tables'], warehouse: whProd, location: locFGArea, quantity: 3 },
      { product: prodMap['Bolts'], warehouse: whMain, location: locRackA, quantity: 120 },
      { product: prodMap['Nuts'], warehouse: whMain, location: locRackA, quantity: 0 },
      { product: prodMap['Printer Paper'], warehouse: whMain, location: locMainStorage, quantity: 25 }
    ];

    const stockBalances = [];
    const ledgers = [];

    for (let i = 0; i < initialStocks.length; i++) {
      const stock = initialStocks[i];
      // Create StockBalance
      stockBalances.push({
        product: stock.product._id,
        warehouse: stock.warehouse._id,
        location: stock.location._id,
        quantity: stock.quantity,
        reservedQuantity: 0,
        availableQuantity: stock.quantity
      });
      // Create StockLedger
      ledgers.push({
        transactionNumber: `TXN-INIT-${1000 + i}`,
        product: stock.product._id,
        operationType: 'INITIAL_STOCK',
        warehouse: stock.warehouse._id,
        destinationLocation: stock.location._id,
        quantity: stock.quantity,
        previousQuantity: 0,
        newQuantity: stock.quantity,
        performedBy: manager._id,
        notes: 'Initial seed stock'
      });
    }

    await StockBalance.insertMany(stockBalances);
    await StockLedger.insertMany(ledgers);

    console.log('\nStockSense database seeded successfully.\n');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Warehouses: ${await Warehouse.countDocuments()}`);
    console.log(`Locations: ${await Location.countDocuments()}`);
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Stock balances: ${await StockBalance.countDocuments()}`);
    console.log(`Ledger entries: ${await StockLedger.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
