const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@thecarefirst.com";
  const password = "password123";
  
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin already exists! You can log in with:", email);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      name: "Super Admin",
      email: email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Admin successfully created!");
  console.log("Email:", admin.email);
  console.log("Password:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
