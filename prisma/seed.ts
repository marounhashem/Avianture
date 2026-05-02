import { PrismaClient, CrewRole, ServiceType, ServiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const db = new PrismaClient();

const SERVICES: ServiceType[] = ["FUEL", "GPU", "CATERING", "TRANSPORT", "PARKING", "CUSTOMS"];

async function hash(p: string) { return bcrypt.hash(p, 10); }
function token() { return randomBytes(32).toString("base64url"); }
function addDays(d: Date, n: number) { return new Date(d.getTime() + n * 86400000); }

async function main() {
  console.log("Seeding database...");

  await db.serviceStatusLog.deleteMany();
  await db.serviceRequest.deleteMany();
  await db.handlerRequest.deleteMany();
  await db.crewAssignment.deleteMany();
  await db.crewMember.deleteMany();
  await db.handler.deleteMany();
  await db.flight.deleteMany();
  await db.user.deleteMany();
  await db.operator.deleteMany();

  const pw = await hash("Avianture2026!");

  const operator = await db.operator.create({ data: { name: "Maroun Private Aviation" } });

  await db.user.create({
    data: {
      email: "marounhashem@gmail.com",
      name: "Maroun Hashem",
      passwordHash: pw,
      role: "OPERATOR",
      operatorId: operator.id,
    },
  });

  const crewData: { name: string; role: CrewRole }[] = [
    { name: "John Smith", role: "PIC" },
    { name: "Sarah Khan", role: "SIC" },
    { name: "Nadia Chen", role: "FA" },
  ];
  const crew = await Promise.all(
    crewData.map((c) => db.crewMember.create({ data: { ...c, operatorId: operator.id } })),
  );

  await db.user.create({
    data: {
      email: "pilot@avianture.demo",
      name: "John Smith",
      passwordHash: pw,
      role: "CREW",
      crewMemberId: crew[0].id,
    },
  });

  const handlerA = await db.handler.create({
    data: { operatorId: operator.id, name: "DXB FBO Dubai", company: "Dubai Ground Services", email: "dxb@avianture.demo" },
  });
  const handlerB = await db.handler.create({
    data: { operatorId: operator.id, name: "LCLK FBO Larnaca", company: "Cyprus Handling", email: "lclk@avianture.demo" },
  });

  await db.user.create({
    data: { email: "handler.dxb@avianture.demo", name: "Ahmad Al Ali", passwordHash: pw, role: "HANDLER", handlerId: handlerA.id },
  });
  const handlerUserB = await db.user.create({
    data: { email: "handler.lclk@avianture.demo", name: "Andreas Pavlou", passwordHash: pw, role: "HANDLER", handlerId: handlerB.id },
  });

  const now = new Date();

  // Flight A: Draft, no crew/handler
  await db.flight.create({
    data: {
      operatorId: operator.id,
      tailNumber: "A6-AVN",
      aircraftType: "Gulfstream G650",
      originIcao: "OMDB",
      destIcao: "LCLK",
      etdUtc: addDays(now, 3),
      etaUtc: addDays(now, 3.2),
      pax: 8,
      purpose: "VIP Charter",
      status: "DRAFT",
    },
  });

  // Flight B: crew appointed, handler invited (not accepted)
  const flightB = await db.flight.create({
    data: {
      operatorId: operator.id,
      tailNumber: "A6-AVB",
      aircraftType: "Bombardier Global 7500",
      originIcao: "OMDB",
      destIcao: "LFPB",
      etdUtc: addDays(now, 5),
      etaUtc: addDays(now, 5.3),
      pax: 12,
      purpose: "Corporate",
      status: "ACTIVE",
      crewAssignments: { create: [{ crewMemberId: crew[0].id }, { crewMemberId: crew[1].id }, { crewMemberId: crew[2].id }] },
    },
  });
  const flightBInviteToken = token();
  await db.handlerRequest.create({
    data: {
      flightId: flightB.id,
      handlerId: handlerA.id,
      airport: "OMDB",
      inviteToken: flightBInviteToken,
      inviteExpiresAt: addDays(now, 14),
      services: { create: SERVICES.map((t) => ({ type: t })) },
    },
  });

  // Flight C: fully live, services at various stages
  const flightC = await db.flight.create({
    data: {
      operatorId: operator.id,
      tailNumber: "A6-AVC",
      aircraftType: "Dassault Falcon 8X",
      originIcao: "OMDB",
      destIcao: "EGLL",
      etdUtc: addDays(now, 1),
      etaUtc: addDays(now, 1.3),
      pax: 6,
      purpose: "Charter",
      status: "ACTIVE",
      crewAssignments: { create: [{ crewMemberId: crew[0].id }, { crewMemberId: crew[2].id }] },
    },
  });
  const reqC = await db.handlerRequest.create({
    data: {
      flightId: flightC.id,
      handlerId: handlerB.id,
      airport: "OMDB",
      inviteToken: token(),
      inviteExpiresAt: addDays(now, 14),
      inviteAcceptedAt: now,
      services: {
        create: [
          { type: "FUEL",      status: "COMPLETED",   note: "Refueled 12,500L JET-A1" },
          { type: "GPU",       status: "COMPLETED" },
          { type: "CATERING",  status: "IN_PROGRESS" },
          { type: "TRANSPORT", status: "IN_PROGRESS" },
          { type: "PARKING",   status: "ACKNOWLEDGED" },
          { type: "CUSTOMS",   status: "PENDING" },
        ],
      },
    },
    include: { services: true },
  });

  const logs: { serviceRequestId: string; fromStatus: ServiceStatus; toStatus: ServiceStatus; changedByUserId: string }[] = [];
  for (const s of reqC.services) {
    if (s.status === "COMPLETED") {
      logs.push({ serviceRequestId: s.id, fromStatus: "PENDING",       toStatus: "ACKNOWLEDGED", changedByUserId: handlerUserB.id });
      logs.push({ serviceRequestId: s.id, fromStatus: "ACKNOWLEDGED",  toStatus: "IN_PROGRESS",  changedByUserId: handlerUserB.id });
      logs.push({ serviceRequestId: s.id, fromStatus: "IN_PROGRESS",   toStatus: "COMPLETED",    changedByUserId: handlerUserB.id });
    } else if (s.status === "IN_PROGRESS") {
      logs.push({ serviceRequestId: s.id, fromStatus: "PENDING",       toStatus: "ACKNOWLEDGED", changedByUserId: handlerUserB.id });
      logs.push({ serviceRequestId: s.id, fromStatus: "ACKNOWLEDGED",  toStatus: "IN_PROGRESS",  changedByUserId: handlerUserB.id });
    } else if (s.status === "ACKNOWLEDGED") {
      logs.push({ serviceRequestId: s.id, fromStatus: "PENDING",       toStatus: "ACKNOWLEDGED", changedByUserId: handlerUserB.id });
    }
  }
  if (logs.length) await db.serviceStatusLog.createMany({ data: logs });

  console.log("✅ Seed complete.");
  console.log(`Flight B invite link: /invite/${flightBInviteToken}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
