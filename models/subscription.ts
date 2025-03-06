import { prisma } from "@/lib/prisma";

export type SubscriptionCreateInput = {
  userId: string;
  plan: string;
  status: string;
  endDate: Date;
  paymentMethod?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type SubscriptionUpdateInput = {
  plan?: string;
  status?: string;
  endDate?: Date;
  paymentMethod?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export const subscriptionModel = {
  async create(data: SubscriptionCreateInput) {
    return prisma.subscription.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.subscription.findUnique({
      where: { userId },
    });
  },

  async update(userId: string, data: SubscriptionUpdateInput) {
    return prisma.subscription.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  async cancel(userId: string) {
    return prisma.subscription.update({
      where: { userId },
      data: {
        status: "canceled",
        updatedAt: new Date(),
      },
    });
  },

  async createPayment(data: {
    userId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    status: string;
  }) {
    return prisma.userPayment.create({
      data: {
        ...data,
        paymentDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async getUserPayments(userId: string) {
    return prisma.userPayment.findMany({
      where: { userId },
      orderBy: { paymentDate: "desc" },
    });
  },

  async isSubscriptionActive(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) return false;

    return (
      subscription.status === "active" && new Date(subscription.endDate) > new Date()
    );
  },
};