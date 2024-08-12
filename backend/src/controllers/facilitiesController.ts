import { Request, Response } from "express";
import { prisma } from "../libs/prisma";
import { z } from "zod";

export const createFacilitySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"]),
});

export const updateFacilitySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"]).optional(),
});

export const getAllFacilities = async (req: Request, res: Response) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.status(200).json(facilities);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar instalações" });
  }
};

export const getFacilityById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: Number(id) },
    });
    if (!facility) {
      return res.status(404).json({ error: "Instalação não encontrada" });
    }
    res.status(200).json(facility);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar instalação" });
  }
};

export const createFacility = async (req: Request, res: Response) => {
  const validationResult = createFacilitySchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  const { name, description, status } = validationResult.data;

  try {
    const facility = await prisma.facility.create({
      data: {
        name,
        description: description,
        status,
      },
    });
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar instalação" });
  }
};

export const updateFacility = async (req: Request, res: Response) => {
  const { id } = req.params;

  const validationResult = updateFacilitySchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error.errors });
  }

  try {
    const facility = await prisma.facility.update({
      where: { id: Number(id) },
      data: validationResult.data,
    });
    res.status(200).json(facility);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar instalação" });
  }
};

export const deleteFacility = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.facility.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar instalação" });
  }
};
