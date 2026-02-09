import { db } from './db';
import { sampleVendors, sampleProducts, sampleCustomers, sampleInventoryItems } from './sampleData';

export const seedDatabase = async () => {
    try {
        // Check if database is already seeded
        const vendorCount = await db.vendors.count();
        if (vendorCount > 0) {
            console.log('Database already seeded');
            return;
        }

        console.log('Seeding database with sample data...');

        // Add vendors
        const vendorIds = await db.vendors.bulkAdd(sampleVendors, { allKeys: true });
        console.log(`Added ${vendorIds.length} vendors`);

        // Add products
        const productsWithIds = await db.products.bulkAdd(sampleProducts, { allKeys: true });
        console.log(`Added ${productsWithIds.length} products`);

        // Add customers
        await db.customers.bulkAdd(sampleCustomers);
        console.log(`Added ${sampleCustomers.length} customers`);

        // Add inventory items only if products were created
        if (productsWithIds.length > 0) {
            const inventoryToAdd = sampleInventoryItems.map((item, index) => ({
                ...item,
                productId: Math.ceil((index % productsWithIds.length) + 1),
                vendorId: Math.ceil((Math.random() * vendorIds.length)),
            }));
            await db.inventory.bulkAdd(inventoryToAdd);
            console.log(`Added ${inventoryToAdd.length} inventory items`);
        }

        console.log('Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
