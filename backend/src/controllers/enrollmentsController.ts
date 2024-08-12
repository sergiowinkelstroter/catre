import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { z } from "zod";

export const createEnrollmentSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  idade: z.number().min(1, "Idade é obrigatória"),
  igreja: z.string().min(1, "Nome da igreja é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  eventoId: z.number().int().min(1, "ID do evento é obrigatório"),
  userId: z.number().int().optional(),
});

export const updateEnrollmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  age: z.number().int().positive("Idade é obrigatória").optional(),
  church: z.string().min(1, "Nome da igreja é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  eventId: z.number().int().positive("ID do evento é obrigatório").optional(),
  userId: z.number().int().optional(),
  enrollmentType: z.enum(["FREE", "PAID"]).optional(),
});

export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany();
    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar inscrições" });
  }
};

export const getEnrollmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: Number(id) },
    });
    if (!enrollment) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar inscrição" });
  }
};

export const createEnrollment = async (req: Request, res: Response) => {
  const validationResult = createEnrollmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  const { nome, idade, igreja, email, eventoId, userId } =
    validationResult.data;

  try {
    const user = userId
      ? await prisma.user.findUnique({ where: { id: userId } })
      : null;

    let tipoInscricao = "PAGA"; // Padrão para não-sócios
    if (user?.membershipType === "FAMILY") {
      const freeInscricoesCount = await prisma.enrollment.count({
        where: { userId, eventId: eventoId, enrollmentType: "FREE" },
      });

      if (freeInscricoesCount < 5) {
        tipoInscricao = "FREE";
      }
    }

    const inscricao = await prisma.enrollment.create({
      data: {
        name: nome,
        age: idade,
        church: igreja,
        email: email || null,
        eventId: eventoId,
        userId: userId || null,
        enrollmentType: tipoInscricao,
      },
    });

    res.status(201).json(inscricao);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar inscrição" });
  }
};

export const updateEnrollment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = updateEnrollmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: Number(id) },
      data: validationResult.data,
    });
    res.status(200).json(enrollment);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar inscrição" });
  }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.enrollment.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar inscrição" });
  }
};
