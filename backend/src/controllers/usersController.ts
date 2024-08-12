import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string(),
  membershipType: z.enum(["INDIVIDUAL", "FAMILY"]).optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  phone: z.string().optional(),
  membershipType: z.enum(["INDIVIDUAL", "FAMILY"]).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const validationResult = createUserSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  const { name, email, phone, membershipType, password } =
    validationResult.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        membershipType: membershipType || "INDIVIDUAL",
        password: hashedPassword,
        role: "MEMBER",
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = updateUserSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: validationResult.data,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = updatePasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  const { currentPassword, newPassword } = validationResult.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Senha atual incorreta" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar senha" });
  }
};
