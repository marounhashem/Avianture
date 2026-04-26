import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type HandlerInviteEmailProps = {
  handlerName: string;
  operatorName: string;
  flight: {
    tailNumber: string;
    originIcao: string;
    destIcao: string;
    etdUtc: Date;
    aircraftType: string;
    pax: number;
  };
  airport: string;
  services: string[];
  inviteUrl: string;
};

export function HandlerInviteEmail({
  handlerName,
  operatorName,
  flight,
  airport,
  services,
  inviteUrl,
}: HandlerInviteEmailProps) {
  return (
    <EmailLayout preview={`New flight request from ${operatorName} — ${flight.tailNumber}`}>
      <Heading className="m-0 mb-3 text-lg font-semibold text-[#F8FAFC]">
        New flight request
      </Heading>
      <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
        Hi {handlerName}, {operatorName} is requesting your services for the flight below.
      </Text>

      <Section className="my-4 rounded-md border border-[#243856] bg-[#0A1628] p-4">
        <Text className="m-0 text-sm">
          <strong className="font-mono text-[#F59E0B]">{flight.tailNumber}</strong>{" "}
          <span className="font-mono">
            {flight.originIcao} → {flight.destIcao}
          </span>
        </Text>
        <Text className="m-0 mt-1 text-xs text-[#94A3B8]">
          {flight.aircraftType} · PAX {flight.pax}
        </Text>
        <Text className="m-0 mt-1 text-xs text-[#94A3B8]">
          ETD {new Date(flight.etdUtc).toUTCString()}
        </Text>
        <Text className="m-0 mt-3 text-xs text-[#94A3B8]">
          Airport: <span className="font-mono text-[#F59E0B]">{airport}</span>
        </Text>
        <Text className="m-0 mt-1 text-xs text-[#94A3B8]">
          Services: {services.join(", ")}
        </Text>
      </Section>

      <Section className="my-6 text-center">
        <Button
          href={inviteUrl}
          className="rounded-md bg-[#F59E0B] px-5 py-3 text-sm font-medium text-[#0A1628]"
        >
          Accept invite
        </Button>
      </Section>

      <Text className="m-0 text-xs text-[#94A3B8]">
        Or copy this link:{" "}
        <span className="break-all text-[#94A3B8]">{inviteUrl}</span>
      </Text>
      <Text className="m-0 mt-2 text-xs text-[#94A3B8]">
        This invite expires in 14 days.
      </Text>
    </EmailLayout>
  );
}
