import { z } from 'zod';

export const prioritySchema = z.enum(['cheapest', 'closest', 'balanced', 'stress_free']);

export const vehicleTypeSchema = z.enum(['city_car', 'sedan', 'suv', 'van', 'electric']);

/** Converte stringhe vuote (es. opzione "Non specificato") in undefined. */
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const searchPreferencesSchema = z.object({
  destination: z.string().min(2, 'Inserisci una destinazione valida.').max(120),
  destinationLatitude: z.number().optional(),
  destinationLongitude: z.number().optional(),
  origin: z.string().max(120).optional(),
  originLatitude: z.number().optional(),
  originLongitude: z.number().optional(),
  arrivalDate: z.string().min(1, 'Scegli una data.'),
  arrivalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Orario non valido.'),
  durationMinutes: z
    .number()
    .int()
    .min(15)
    .max(24 * 60),
  priority: prioritySchema,
  maxPrice: z.number().positive().optional(),
  maxWalkingDistanceMeters: z.number().positive().optional(),
  vehicleType: emptyToUndefined(vehicleTypeSchema),
  vehicleHeightCm: z.number().positive().max(500).optional(),
  needsAccessibility: z.boolean().optional(),
  needsEvCharging: z.boolean().optional(),
});

export type SearchFormValues = z.infer<typeof searchPreferencesSchema>;

export const profileSchema = z.object({
  name: z.string().max(80).optional(),
  email: z.string().email('Email non valida.').optional().or(z.literal('')),
  vehicle: z
    .object({
      type: vehicleTypeSchema.optional(),
      heightCm: z.number().positive().max(500).optional(),
      lengthCm: z.number().positive().max(2000).optional(),
    })
    .optional(),
  needsAccessibility: z.boolean().optional(),
  defaultPriority: prioritySchema.optional(),
  maxWalkingDistanceMeters: z.number().positive().optional(),
  maxBudget: z.number().positive().optional(),
});
