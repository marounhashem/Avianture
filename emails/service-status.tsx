import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type ServiceStatusEmailProps = {
  handlerName: string;
  airport: string;
  serviceType: string;
  oldStatus: string;
  newStatus: string;
  note?: string | null;
  flight: {
    tailNumber: string;
    originIcao: string;
    destIcao: string;
    etdUtc: Date;
  };
  flightUrl: string;
};

const statusColor: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "#94A3B8/10", text: "#94A3B8", border: "#64748B" },
  ACKNOWLEDGED: { bg: "#3B82F6/10", text: "#93C5FD", border: "#3B82F6" },
  IN_PROGRESS: { bg: "#F59E0B/10", text: "#FBBF24", border: "#F59E0B" },
  COMPLETED: { bg: "#10B981/10", text: "#6EE7B7", border: "#10B981" },
  NOT_REQUIRED: { bg: "#0F172A", text: "#64748B", border: "#334155" },
};

function pretty(status: string) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ServiceStatusEmail({
  handlerName,
  airport,
  serviceType,
  oldStatus,
  newStatus,
  note,
  flight,
  flightUrl,
}: ServiceStatusEmailProps) {
  const tone = statusColor[newStatus] ?? statusColor.PENDING;
  return (
    <EmailLayout
      preview={`${serviceType} ${pretty(newStatus)} on ${flight.tailNumber}`}
    >
      <Heading className="m-0 mb-3 text-lg font-semibold text-[#F8FAFC]">
        Service update
      </Heading>
      <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
        <strong className="text-[#F8FAFC]">{handlerName}</strong>{" "}
        <span className="text-[#94A3B8]">at {airport}</span> updated a service
        on this flight.
      </Text>

      <Section
        className="my-4 rounded-md border p-4"
        style={{
          backgroundColor: "#0A1628",
          borderColor: tone.border,
        }}
      >
        <Text className="m-0 text-sm">
          <span className="font-mono text-[#F59E0B]">{serviceType}</span>{" "}
          <span className="text-[#94A3B8]">
            {pretty(oldStatus)} → {pretty(newStatus)}
          </span>
        </Text>
        {note && (
          <Text className="m-0 mt-2 text-xs text-[#94A3B8]">
            Note: <span className="text-[#CBD5E1]">{note}</span>
          </Text>
        )}
      </Section>

      <Section className="my-4 rounded-md border border-[#243856] bg-[#0A1628] p-4">
        <Text className="m-0 text-xs text-[#94A3B8]">
          <span className="font-mono text-[#F59E0B]">
            {flight.tailNumber}
          </span>{" "}
          <span className="font-mono">
            {flight.originIcao} → {flight.destIcao}
          </span>{" "}
          · ETD {new Date(flight.etdUtc).toUTCString()}
        </Text>
      </Section>

      <Section className="my-6 text-center">
        <Button
          href={flightUrl}
          className="rounded-md bg-[#F59E0B] px-5 py-3 text-sm font-medium text-[#0A1628]"
        >
          Open flight
        </Button>
      </Section>
    </EmailLayout>
  );
}
