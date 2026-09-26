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
      { name: 'Hardware' },
      { name: 'Packaging' }
    ]);
    const catMap = categories.reduce((map, cat) => { map[cat.name] = cat._id; return map; }, {});

    console.log('Seeding Warehouses...');
    const warehouses = await Warehouse.insertMany([
      { name: 'Main Warehouse', code: 'WH-MAIN', address: 'StockSense Main Warehouse' },
      { name: 'Production Warehouse', code: 'WH-PROD', address: 'StockSense Production Warehouse' },
      { name: 'Distribution Center', code: 'WH-DIST', address: 'StockSense Distribution Center' }
    ]);
    const whMain = warehouses[0];
    const whProd = warehouses[1];
    const whDist = warehouses[2];

    console.log('Seeding Locations...');
    const locMainStorage = await Location.create({ name: 'Main Storage', code: 'MAIN-STORAGE', warehouse: whMain._id, type: 'storage' });
    const locRackA = await Location.create({ name: 'Rack A', code: 'RACK-A', warehouse: whMain._id, type: 'storage', parentLocation: locMainStorage._id });
    const locRackB = await Location.create({ name: 'Rack B', code: 'RACK-B', warehouse: whMain._id, type: 'storage', parentLocation: locMainStorage._id });
    const locProdFloor = await Location.create({ name: 'Production Floor', code: 'PROD-FLOOR', warehouse: whMain._id, type: 'production' });
    const locRecvDock = await Location.create({ name: 'Receiving Dock', code: 'RECV-DOCK', warehouse: whMain._id, type: 'internal' });

    const locProdStorage = await Location.create({ name: 'Production Storage', code: 'PROD-STORAGE', warehouse: whProd._id, type: 'storage' });
    const locFGArea = await Location.create({ name: 'Finished Goods Area', code: 'FG-AREA', warehouse: whProd._id, type: 'storage' });
    const locQC = await Location.create({ name: 'Quality Control', code: 'QC-AREA', warehouse: whProd._id, type: 'internal' });

    const locDistStorage = await Location.create({ name: 'Distribution Storage', code: 'DIST-STORAGE', warehouse: whDist._id, type: 'storage' });
    const locShipDock = await Location.create({ name: 'Shipping Dock', code: 'SHIP-DOCK', warehouse: whDist._id, type: 'internal' });

    console.log('Seeding Products...');
    const products = await Product.insertMany([
      { name: 'Steel Rods', sku: 'MAT-STEEL-001', category: catMap['Raw Materials'], uom: 'kg', reorderLevel: 30 },
      { name: 'Steel Sheets', sku: 'MAT-STEEL-002', category: catMap['Raw Materials'], uom: 'sheets', reorderLevel: 20 },
      { name: 'Aluminum Rods', sku: 'MAT-AL-001', category: catMap['Raw Materials'], uom: 'kg', reorderLevel: 25 },
      { name: 'Copper Wire', sku: 'MAT-CU-001', category: catMap['Raw Materials'], uom: 'meters', reorderLevel: 100 },
      { name: 'Plastic Pellets', sku: 'MAT-PLA-001', category: catMap['Raw Materials'], uom: 'kg', reorderLevel: 200 },
      { name: 'Office Chairs', sku: 'FG-CHAIR-001', category: catMap['Finished Goods'], uom: 'units', reorderLevel: 10 },
      { name: 'Work Tables', sku: 'FG-TABLE-001', category: catMap['Finished Goods'], uom: 'units', reorderLevel: 5 },
      { name: 'Filing Cabinets', sku: 'FG-CAB-001', category: catMap['Finished Goods'], uom: 'units', reorderLevel: 5 },
      { name: 'Lounge Sofas', sku: 'FG-SOFA-001', category: catMap['Finished Goods'], uom: 'units', reorderLevel: 2 },
      { name: 'Bolts', sku: 'HW-BOLT-001', category: catMap['Hardware'], uom: 'units', reorderLevel: 50 },
      { name: 'Nuts', sku: 'HW-NUT-001', category: catMap['Hardware'], uom: 'units', reorderLevel: 50 },
      { name: 'Screws', sku: 'HW-SCRW-001', category: catMap['Hardware'], uom: 'units', reorderLevel: 100 },
      { name: 'Washers', sku: 'HW-WASH-001', category: catMap['Hardware'], uom: 'units', reorderLevel: 100 },
      { name: 'Printer Paper', sku: 'OFF-PAPER-001', category: catMap['Office Supplies'], uom: 'packs', reorderLevel: 10 },
      { name: 'Cardboard Boxes', sku: 'PKG-BOX-001', category: catMap['Packaging'], uom: 'units', reorderLevel: 50 },
      { name: 'Packing Tape', sku: 'PKG-TAPE-001', category: catMap['Packaging'], uom: 'rolls', reorderLevel: 20 }
    ]);
    const prodMap = products.reduce((map, p) => { map[p.name] = p; return map; }, {});

    console.log('Seeding Stock Balances and Ledger...');
    const initialStocks = [
      { product: prodMap['Steel Rods'], warehouse: whMain, location: locRackA, quantity: 150 },
      { product: prodMap['Steel Sheets'], warehouse: whMain, location: locRackB, quantity: 80 },
      { product: prodMap['Aluminum Rods'], warehouse: whMain, location: locRackA, quantity: 45 },
      { product: prodMap['Copper Wire'], warehouse: whMain, location: locRackB, quantity: 50 }, // Low Stock (reorderLevel 100)
      { product: prodMap['Plastic Pellets'], warehouse: whMain, location: locRackA, quantity: 0 }, // Out of Stock (qty 0)
      { product: prodMap['Office Chairs'], warehouse: whDist, location: locDistStorage, quantity: 40 },
      { product: prodMap['Work Tables'], warehouse: whDist, location: locDistStorage, quantity: 12 },
      { product: prodMap['Filing Cabinets'], warehouse: whDist, location: locDistStorage, quantity: 4 }, // Low stock (reorderLevel 5)
      { product: prodMap['Lounge Sofas'], warehouse: whDist, location: locDistStorage, quantity: 0 }, // Out of stock
      { product: prodMap['Bolts'], warehouse: whProd, location: locProdStorage, quantity: 500 },
      { product: prodMap['Nuts'], warehouse: whProd, location: locProdStorage, quantity: 600 },
      { product: prodMap['Screws'], warehouse: whProd, location: locProdStorage, quantity: 1000 },
      { product: prodMap['Washers'], warehouse: whProd, location: locProdStorage, quantity: 1200 },
      { product: prodMap['Printer Paper'], warehouse: whMain, location: locMainStorage, quantity: 30 },
      { product: prodMap['Cardboard Boxes'], warehouse: whDist, location: locDistStorage, quantity: 200 },
      { product: prodMap['Packing Tape'], warehouse: whDist, location: locDistStorage, quantity: 15 } // Low stock (reorderLevel 20)
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

    console.log('Seeding Operations (Receipts, Deliveries, Transfers, Adjustments)...');

    // RECEIPTS
    await Receipt.insertMany([
      { receiptNumber: 'WH-IN-1001', supplier: 'SteelCo Inc.', warehouse: whMain._id, destinationLocation: locRecvDock._id, status: 'DRAFT', items: [{ product: prodMap['Steel Rods']._id, quantity: 50 }], createdBy: manager._id },
      { receiptNumber: 'WH-IN-1002', supplier: 'Plastics Corp', warehouse: whMain._id, destinationLocation: locRecvDock._id, status: 'WAITING', items: [{ product: prodMap['Plastic Pellets']._id, quantity: 300 }], createdBy: manager._id },
      { receiptNumber: 'WH-IN-1003', supplier: 'Office World', warehouse: whMain._id, destinationLocation: locRecvDock._id, status: 'READY', items: [{ product: prodMap['Printer Paper']._id, quantity: 100 }], createdBy: manager._id },
      { receiptNumber: 'WH-IN-1004', supplier: 'Hardware Pros', warehouse: whProd._id, destinationLocation: locProdStorage._id, status: 'DONE', items: [{ product: prodMap['Bolts']._id, quantity: 500 }], createdBy: manager._id, validatedBy: manager._id, validatedAt: new Date() }
    ]);

    // DELIVERIES
    await DeliveryOrder.insertMany([
      { deliveryNumber: 'WH-OUT-2001', customer: 'Acme Corp', warehouse: whDist._id, sourceLocation: locDistStorage._id, status: 'DRAFT', items: [{ product: prodMap['Office Chairs']._id, quantity: 5 }], createdBy: manager._id },
      { deliveryNumber: 'WH-OUT-2002', customer: 'Beta LLC', warehouse: whDist._id, sourceLocation: locDistStorage._id, status: 'READY', items: [{ product: prodMap['Work Tables']._id, quantity: 2 }], createdBy: manager._id },
      { deliveryNumber: 'WH-OUT-2003', customer: 'Gamma Inc', warehouse: whDist._id, sourceLocation: locDistStorage._id, status: 'PACKED', items: [{ product: prodMap['Cardboard Boxes']._id, quantity: 50 }], createdBy: manager._id },
      { deliveryNumber: 'WH-OUT-2004', customer: 'Delta Ltd', warehouse: whDist._id, sourceLocation: locDistStorage._id, status: 'DONE', items: [{ product: prodMap['Lounge Sofas']._id, quantity: 1 }], createdBy: manager._id, validatedBy: manager._id, validatedAt: new Date() }
    ]);

    // INTERNAL TRANSFERS
    await InternalTransfer.insertMany([
      { transferNumber: 'TRN-3001', sourceWarehouse: whMain._id, sourceLocation: locRackA._id, destinationWarehouse: whProd._id, destinationLocation: locProdStorage._id, status: 'DRAFT', items: [{ product: prodMap['Steel Rods']._id, quantity: 20 }], createdBy: manager._id },
      { transferNumber: 'TRN-3002', sourceWarehouse: whProd._id, sourceLocation: locFGArea._id, destinationWarehouse: whDist._id, destinationLocation: locDistStorage._id, status: 'SCHEDULED', scheduledDate: new Date(), items: [{ product: prodMap['Office Chairs']._id, quantity: 15 }], createdBy: manager._id },
      { transferNumber: 'TRN-3003', sourceWarehouse: whMain._id, sourceLocation: locMainStorage._id, destinationWarehouse: whDist._id, destinationLocation: locDistStorage._id, status: 'IN_TRANSIT', items: [{ product: prodMap['Printer Paper']._id, quantity: 5 }], createdBy: manager._id }
    ]);

    // STOCK ADJUSTMENTS
    await StockAdjustment.insertMany([
      { adjustmentNumber: 'ADJ-4001', warehouse: whMain._id, location: locRackB._id, status: 'DRAFT', items: [{ product: prodMap['Steel Sheets']._id, systemQuantity: 80, countedQuantity: 78, difference: -2, reason: 'Damaged' }], createdBy: manager._id },
      { adjustmentNumber: 'ADJ-4002', warehouse: whDist._id, location: locDistStorage._id, status: 'PENDING', items: [{ product: prodMap['Cardboard Boxes']._id, systemQuantity: 200, countedQuantity: 205, difference: 5, reason: 'Found extra' }], createdBy: manager._id }
    ]);

    console.log('\nStockSense database seeded successfully.\n');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Warehouses: ${await Warehouse.countDocuments()}`);
    console.log(`Locations: ${await Location.countDocuments()}`);
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Stock balances: ${await StockBalance.countDocuments()}`);
    console.log(`Ledger entries: ${await StockLedger.countDocuments()}`);
    console.log(`Receipts: ${await Receipt.countDocuments()}`);
    console.log(`Deliveries: ${await DeliveryOrder.countDocuments()}`);
    console.log(`Transfers: ${await InternalTransfer.countDocuments()}`);
    console.log(`Adjustments: ${await StockAdjustment.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
