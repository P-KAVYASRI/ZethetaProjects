import { z } from "zod";

export const step6Schema =
  z.object({

    coName:
      z.string().optional(),

    coRelation:
      z.string().optional(),

    coPhone:
      z.string().optional(),

  });