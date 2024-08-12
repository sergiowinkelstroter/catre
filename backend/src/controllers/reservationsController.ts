import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { z } from "zod";

export const createReservationSchema = z.object({
  date: z.string().datetime(),
  facilityId: z.number().int().min(1, "ID da instalação é obrigatório"),
  userId: z.number().int().min(1, "ID do usuário é obrigatório"),
});

export const updateReservationSchema = z.object({
  date: z.string().datetime().optional(),
  facilityId: z.number().int().optional(),
  userId: z.number().int().optional(),
});

export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
};

export const getReservationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: Number(id) },
    });
    if (!reservation) {
      return res.status(404).json({ error: "Reserva não encontrada" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar reserva" });
  }
};

export const createReservation = async (req: Request, res: Response) => {
  const validationResult = createReservationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  const { date, facilityId, userId } = validationResult.data;

  try {
    const reservation = await prisma.reservation.create({
      data: {
        date: new Date(date),
        facilityId,
        userId,
      },
    });
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar reserva" });
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = updateReservationSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  try {
    const reservation = await prisma.reservation.update({
      where: { id: Number(id) },
      data: validationResult.data,
    });
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar reserva" });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.reservation.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar reserva" });
  }
};
