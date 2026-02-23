import { db } from '../db';
import { orders, orderItems, users, stickers } from '@shared/schema';
import { eq, gte, lte, and, desc } from 'drizzle-orm';

export class OrderService {
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `STA-${timestamp}-${random}`;
  }

  async createOrder(orderData: any) {
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of orderData.items) {
      const [sticker] = await db
        .select()
        .from(stickers)
        .where(eq(stickers.id, item.stickerId));

      if (!sticker) {
        throw new Error(`Sticker not found: ${item.stickerId}`);
      }

      const unitPrice = parseFloat(sticker.price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        stickerId: item.stickerId,
        quantity: item.quantity,
        unitPrice: sticker.price,
        totalPrice: totalPrice.toString(),
        stickerName: sticker.name,
        stickerType: sticker.stickerType,
        imageFileName: sticker.imageFileName,
      });
    }

    const tax = subtotal * 0.08;
    const shipping = subtotal > 25 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: orderData.userId,
        orderNumber: this.generateOrderNumber(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress: orderData.shippingAddress,
        notes: orderData.notes,
      })
      .returning();

    const orderItemsWithOrderId = orderItemsData.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    await db.insert(orderItems).values(orderItemsWithOrderId);

    return newOrder;
  }

  async getDailyOrders(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyOrders = await db
      .select({
        order: orders,
        user: users,
        items: orderItems,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(and(
        gte(orders.createdAt, startOfDay),
        lte(orders.createdAt, endOfDay)
      ))
      .orderBy(desc(orders.createdAt));

    return this.groupOrdersByOrderId(dailyOrders);
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date) {
    const ordersData = await db
      .select({
        order: orders,
        user: users,
        items: orderItems,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(and(
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      ))
      .orderBy(desc(orders.createdAt));

    return this.groupOrdersByOrderId(ordersData);
  }

  async getDailyRegistrations(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(users)
      .where(and(
        gte(users.createdAt, startOfDay),
        lte(users.createdAt, endOfDay)
      ))
      .orderBy(desc(users.createdAt));
  }

  private groupOrdersByOrderId(orderData: any[]) {
    const groupedOrders = new Map();

    orderData.forEach(row => {
      const orderId = row.order.id;
      
      if (!groupedOrders.has(orderId)) {
        groupedOrders.set(orderId, {
          order: row.order,
          user: row.user,
          items: []
        });
      }
      
      groupedOrders.get(orderId).items.push(row.items);
    });

    return Array.from(groupedOrders.values());
  }

  async generateDailyReport(date: Date = new Date()) {
    const dailyOrders = await this.getDailyOrders(date);
    const dailyRegistrations = await this.getDailyRegistrations(date);
    
    const totalRevenue = dailyOrders.reduce((sum, orderGroup) => 
      sum + parseFloat(orderGroup.order.total), 0
    );

    const totalOrders = dailyOrders.length;
    const totalNewCustomers = dailyRegistrations.length;
    
    const stickersToprint: any[] = [];
    dailyOrders.forEach(orderGroup => {
      orderGroup.items.forEach((item: any) => {
        stickersToprint.push({
          orderNumber: orderGroup.order.orderNumber,
          customerName: `${orderGroup.user.firstName} ${orderGroup.user.lastName}`,
          customerEmail: orderGroup.user.email,
          stickerName: item.stickerName,
          stickerType: item.stickerType,
          imageFileName: item.imageFileName,
          quantity: item.quantity,
          shippingAddress: orderGroup.order.shippingAddress,
        });
      });
    });

    return {
      date: date.toISOString().split('T')[0],
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalNewCustomers,
        totalStickersToprint: stickersToprint.reduce((sum, item) => sum + item.quantity, 0)
      },
      orders: dailyOrders,
      newCustomers: dailyRegistrations,
      stickersToprint
    };
  }
}

export const orderService = new OrderService();
