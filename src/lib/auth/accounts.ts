import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const PASSWORD_MIN_LENGTH = 12;
const accountSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().max(100).optional(),
  passwordSalt: z.string().regex(/^[a-f0-9]{32}$/),
  passwordHash: z.string().regex(/^[a-f0-9]{128}$/),
  createdAt: z.string().datetime(),
});
const accountsSchema = z.array(accountSchema);

export type Account = {
  id: string;
  email: string;
  name?: string;
};

type StoredAccount = z.infer<typeof accountSchema>;

const ACCOUNT_FILE = "accounts.json";
const globalAccounts = globalThis as typeof globalThis & {
  wayroAccountMutationQueue?: Promise<void>;
};

function dataDirectory(): string {
  return process.env.WAYRO_DATA_DIR || path.join(process.cwd(), ".data");
}

function passwordDigest(password: string, salt: string): Buffer {
  return scryptSync(password, Buffer.from(salt, "hex"), 64);
}

async function readAccounts(): Promise<StoredAccount[]> {
  let raw: string;
  try {
    raw = await readFile(path.join(dataDirectory(), ACCOUNT_FILE), "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw new Error(`Unable to read student accounts: ${error instanceof Error ? error.message : "unknown filesystem error"}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Student account data is not valid JSON: ${error instanceof Error ? error.message : "invalid file"}`);
  }
  const result = accountsSchema.safeParse(parsed);
  if (!result.success) throw new Error("Student account data has an invalid format.");
  return result.data;
}

async function writeAccounts(accounts: StoredAccount[]): Promise<void> {
  const directory = dataDirectory();
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, ACCOUNT_FILE);
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(accounts, null, 2), { encoding: "utf8", flag: "wx" });
    await rename(temporary, target);
  } catch (error) {
    throw new Error(`Unable to save student accounts: ${error instanceof Error ? error.message : "unknown filesystem error"}`);
  }
}

function publicAccount(account: StoredAccount): Account {
  return { id: account.id, email: account.email, ...(account.name ? { name: account.name } : {}) };
}

export class AccountAlreadyExistsError extends Error {}

export async function createAccount(email: string, password: string, name?: string): Promise<Account> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!z.string().email().max(254).safeParse(normalizedEmail).success) {
    throw new Error("Enter a valid email address.");
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > 128) {
    throw new Error(`Password must be between ${PASSWORD_MIN_LENGTH} and 128 characters.`);
  }
  const cleanName = name?.trim();
  if (cleanName && cleanName.length > 100) throw new Error("Name must be 100 characters or fewer.");

  const passwordSalt = randomBytes(16).toString("hex");
  const stored: StoredAccount = {
    id: randomUUID(),
    email: normalizedEmail,
    ...(cleanName ? { name: cleanName } : {}),
    passwordSalt,
    passwordHash: passwordDigest(password, passwordSalt).toString("hex"),
    createdAt: new Date().toISOString(),
  };

  const previous = globalAccounts.wayroAccountMutationQueue ?? Promise.resolve();
  const operation = previous.then(async () => {
    const accounts = await readAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new AccountAlreadyExistsError("An account with this email already exists.");
    }
    await writeAccounts([...accounts, stored]);
    return publicAccount(stored);
  });
  globalAccounts.wayroAccountMutationQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function authenticateAccount(email: string, password: string): Promise<Account | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = await readAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);
  if (!account) return null;

  const candidate = passwordDigest(password, account.passwordSalt);
  const expected = Buffer.from(account.passwordHash, "hex");
  return timingSafeEqual(candidate, expected) ? publicAccount(account) : null;
}
