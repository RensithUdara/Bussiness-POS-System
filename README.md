# 🧾 POS System

Modern Point of Sale (POS) system for **Retail** and **Wholesale** operations with a clean dashboard, MySQL persistence, and RESTful API routes. Built with Next.js App Router for fast UI and scalable data handling. 🚀

## ✨ Highlights

- 🛒 Dual-mode sales (Retail + Wholesale)
- 📦 Inventory tracking with batch/expiry support
- 👥 Customer and vendor management
- 🧾 POS interface with cart, discounts, and quick search
- 📊 Reports dashboard with charts
- 🔐 Server-side MySQL persistence via API routes

## 🧩 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, clsx, tailwind-merge
- **Data & Validation:** MySQL (mysql2), zod
- **Forms & UI:** react-hook-form, lucide-react
- **Charts:** recharts

## ✅ Key Features

- **Inventory & Products**: stock tracking, pricing, and vendor sourcing
- **Sales (POS)**: retail/wholesale modes, cart operations, and totals
- **Customers**: profile management and purchase history
- **Vendors**: supplier profiles and inventory sourcing
- **Reports**: sales and inventory insights
- **Settings**: centralized configuration for the app

## 🧭 Pages & Routes

- `/` Dashboard
- `/products` Product management
- `/inventory` Inventory control
- `/pos` POS screen
- `/customers` Customer management
- `/vendors` Vendor management
- `/reports` Reporting dashboard
- `/settings` App settings

## 🔌 API Endpoints (REST)

- `GET /api/products` | `POST /api/products`
- `GET /api/products/[id]` | `PUT /api/products/[id]` | `DELETE /api/products/[id]`
- `GET /api/sales` | `POST /api/sales`
- `GET /api/customers` | `POST /api/customers`
- `PUT /api/customers/[id]` | `DELETE /api/customers/[id]`
- `GET /api/vendors` | `POST /api/vendors`
- `GET /api/inventory` | `POST /api/inventory`
- `GET /api/settings` | `POST /api/settings`

## 🗄️ Database Setup (MySQL)

Create a database and apply the schema:

```sql
CREATE DATABASE pos_system;
```

```bash
mysql -u root -p pos_system < lib/schema.sql
```

### Environment Variables

Create a `.env.local` file in the project root:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pos_system
```

## 🚀 Getting Started

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. 🎉

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run lint checks

## 🧱 Project Structure

```
POS-System/
├── app/
│   ├── api/
│   ├── customers/
│   ├── inventory/
│   ├── pos/
│   ├── products/
│   ├── reports/
│   ├── settings/
│   └── vendors/
├── components/
│   ├── ui/
│   └── ProductForm.tsx
├── lib/
│   ├── db.ts
│   ├── schema.sql
│   ├── types.ts
│   └── utils.ts
└── public/
```

## 🔁 Data Flow

UI → Next.js API Routes → MySQL Database → Persistent Data

## 🧪 Tips for Validation

- Add products, customers, and vendors
- Create a sale in POS
- Refresh the page to verify persistence

## 📌 Notes

- MySQL is required for full functionality
- API routes are designed for server-side operations
- Project is production-ready with persistent storage

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

MIT
