import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type IssueResolvedEmailProps = {
  resolvedByName: string;
  resolution?: string | null;
  originalIssue: string;
  flight: {
    tailNumber: string;
    originIcao: string;
    destIcao: string;
    etdUtc: Date;
  };
  flightUrl: string;
};

export function IssueResolvedEmail({
  resolvedByName,
  resolution,
  originalIssue,
  flight,
  flightUrl,
}: IssueResolvedEmailProps) {
  return (
    <EmailLayout
      preview={`Your issue on ${flight.tailNumber} was resolved`}
    >
      <Heading className="m-0 mb-3 text-lg font-semibold text-[#F8FAFC]">
        Your issue was resolved
      </Heading>
      <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
        <strong className="text-[#F8FAFC]">{resolvedByName}</strong> marked your
        issue on flight{" "}
        <span className="font-mono text-[#F59E0B]">{flight.tailNumber}</span>{" "}
        as resolved.
      </Text>

      {resolution && (
        <Section className="my-4 rounded-md border border-[#10B981] bg-[#10B981]/10 p-4">
          <Text className="m-0 text-xs font-medium text-[#6EE7B7]">
            Operator response
          </Text>
          <Text className="m-0 mt-1 whitespace-pre-wrap text-sm text-[#A7F3D0]">
            {resolution}
          </Text>
        </Section>
      )}

      <Section className="my-4 rounded-md border border-[#243856] bg-[#0A1628] p-4">
        <Text className="m-0 text-xs text-[#94A3B8]">Your original issue</Text>
        <Text className="m-0 mt-1 whitespace-pre-wrap text-sm text-[#CBD5E1]">
          {originalIssue}
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
          Open flight
        </Button>
      </Section>
    </EmailLayout>
  );
}
