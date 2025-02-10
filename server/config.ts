import { z } from "zod";

const envSchema = z.object({
  SMTP_HOST: z.string({
    required_error: "SMTP_HOST is required in .env file",
    invalid_type_error: "SMTP_HOST must be a string",
  }),
  SMTP_PORT: z.string({
    required_error: "SMTP_PORT is required in .env file",
  }).transform(Number),
  SMTP_SECURE: z.string({
    required_error: "SMTP_SECURE is required in .env file",
  }).transform((v) => v === "true"),
  SMTP_USER: z.string({
    required_error: "SMTP_USER is required in .env file",
  }),
  SMTP_PASS: z.string({
    required_error: "SMTP_PASS is required in .env file",
  }),
  CONTACT_EMAIL: z.string().email().optional().default("contact@openresin.org"),
});

let config: z.infer<typeof envSchema>;
try {
  config = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Environment variable validation failed:");
    error.errors.forEach(err => {
      console.error(`- ${err.message}`);
    });
  throw error;
  }
}

export { config };

// Type for environment variables
// Type for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}