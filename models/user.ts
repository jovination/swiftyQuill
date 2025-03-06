import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export type UserCreateInput = {
  username: string;
  email: string;
  password: string;
  image?: string;
};

export type UserUpdateInput = {
  username?: string;
  email?: string;
  password?: string;
  image?: string;
};

export const userModel = {
  async create(data: UserCreateInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async update(id: string, data: UserUpdateInput) {
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },

  async getUserWithSubscription(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });
  },
};