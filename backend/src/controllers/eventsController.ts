import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.date(),
  registrationDeadline: z.date(),
  facilityId: z.number().int().positive("ID da instalação é obrigatório"),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").optional(),
  description: z.string().min(1, "Descrição é obrigatória").optional(),
  date: z.date().optional(),
  registrationDeadline: z.date().optional(),
  facilityId: z
    .number()
    .int()
    .positive("ID da instalação é obrigatório")
    .optional(),
});

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(id) } });
    if (!event) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const validationResult = createEventSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  const { title, description, date, registrationDeadline, facilityId } =
    validationResult.data;

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date,
        registrationDeadline,
        facilityId,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar evento" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = updateEventSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  try {
    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: validationResult.data,
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar evento" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar evento" });
  }
};
