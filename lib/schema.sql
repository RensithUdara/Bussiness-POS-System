-- POS System Database Schema

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  unit VARCHAR(50),
  costPrice DECIMAL(10, 2),
  retailPrice DECIMAL(10, 2),
  wholesalePrice DECIMAL(10, 2),
  minWholesaleQty INT DEFAULT 1,
  stockLevel INT DEFAULT 0,
  alertLevel INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  contactPerson VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  type ENUM('retail', 'wholesale') DEFAULT 'retail',
  totalSpent DECIMAL(15, 2) DEFAULT 0,
  creditLimit DECIMAL(15, 2) DEFAULT 0,
  outstandingBalance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Sales table
CREATE TABLE IF NOT EXISTS sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customerId INT,
  type ENUM('retail', 'wholesale') DEFAULT 'retail',
  status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
  totalAmount DECIMAL(15, 2),
  discountAmount DECIMAL(10, 2) DEFAULT 0,
  taxAmount DECIMAL(10, 2) DEFAULT 0,
  paymentMethod VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  vendorId INT,
  batchNumber VARCHAR(100),
  quantity INT DEFAULT 0,
  expiryDate DATE,
  receivedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  storeName VARCHAR(255) DEFAULT 'My Store',
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  receiptHeader TEXT,
  receiptFooter TEXT,
  currency VARCHAR(10) DEFAULT 'USD',
  currencySymbol VARCHAR(5) DEFAULT '$',
  currencyPosition ENUM('before', 'after') DEFAULT 'before',
  taxRate DECIMAL(5, 2) DEFAULT 10,
  theme ENUM('light', 'dark') DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Sale Items table for tracking individual products in a sale
CREATE TABLE IF NOT EXISTS sale_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  saleId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT,
  unitPrice DECIMAL(10, 2),
  subtotal DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_customers_type ON customers(type);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_customer ON sales(customerId);
CREATE INDEX idx_inventory_product ON inventory(productId);
CREATE INDEX idx_inventory_vendor ON inventory(vendorId);
CREATE INDEX idx_inventory_expiry ON inventory(expiryDate);
CREATE INDEX idx_sale_items_sale ON sale_items(saleId);
CREATE INDEX idx_sale_items_product ON sale_items(productId);
