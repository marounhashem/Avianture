import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type NewMessageEmailProps = {
  authorName: string;
  authorRole: string;
  body: string; // already truncated by caller
  flight: {
    tailNumber: string;
    originIcao: string;
    destIcao: string;
    etdUtc: Date;
  };
  flightUrl: string;
};

export function NewMessageEmail({
  authorName,
  authorRole,
  body,
  flight,
  flightUrl,
}: NewMessageEmailProps) {
  return (
    <EmailLayout
      preview={`${authorName}: ${body.slice(0, 80)}`}
    >
      <Heading className="m-0 mb-3 text-lg font-semibold text-[#F8FAFC]">
        New message on flight {flight.tailNumber}
      </Heading>
      <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
        <strong className="text-[#F8FAFC]">{authorName}</strong>{" "}
        <span className="text-[#94A3B8]">({authorRole})</span> posted:
      </Text>

      <Section className="my-4 rounded-md border border-[#243856] bg-[#0A1628] p-4">
        <Text className="m-0 whitespace-pre-wrap text-sm text-[#F8FAFC]">
          {body}
        </Text>
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
          Open thread
        </Button>
      </Section>
    </EmailLayout>
  );
}
