import { z } from 'zod';

export const AlertLabelSchema = z.record(z.string().optional());

export const AlertAnnotationSchema = z.record(z.string().optional());

export const PrometheusAlertSchema = z.object({
    status: z.string(),
    labels: AlertLabelSchema,
    annotations: AlertAnnotationSchema,
    startsAt: z.string(),
    endsAt: z.string(),
    generatorURL: z.string()
});

export const AlertManagerPayloadSchema = z.object({
    alerts: z.array(PrometheusAlertSchema),
    commonLabels: AlertLabelSchema.optional(),
    commonAnnotations: AlertAnnotationSchema.optional(),
    externalURL: z.string().optional(),
    version: z.string().optional(),
    groupKey: z.string().optional()
});

export type AlertLabel = z.infer<typeof AlertLabelSchema>;
export type AlertAnnotation = z.infer<typeof AlertAnnotationSchema>;
export type PrometheusAlert = z.infer<typeof PrometheusAlertSchema>;
export type AlertManagerPayload = z.infer<typeof AlertManagerPayloadSchema>;