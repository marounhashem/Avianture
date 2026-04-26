import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type IssueRaisedEmailProps = {
  raisedByName: string;
  raisedByRole: string;
  issue: string;
  flight: {
    tailNumber: string;
    originIcao: string;
    destIcao: string;
    etdUtc: Date;
  };
  flightUrl: string;
};

export function IssueRaisedEmail({
  raisedByName,
  raisedByRole,
  issue,
  flight,
  flightUrl,
}: IssueRaisedEmailProps) {
  return (
    <EmailLayout
      preview={`Crew issue on ${flight.tailNumber} — ${raisedByName}`}
    >
      <Heading className="m-0 mb-3 text-lg font-semibold text-[#F8FAFC]">
        Crew flagged an issue
      </Heading>
      <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
        <strong className="text-[#F8FAFC]">{raisedByName}</strong>{" "}
        <span className="text-[#94A3B8]">({raisedByRole})</span> raised an issue
        on this flight:
      </Text>

      <Section className="my-4 rounded-md border border-[#F59E0B] bg-[#F59E0B]/10 p-4">
        <Text className="m-0 whitespace-pre-wrap text-sm text-[#FBBF24]">
          {issue}
        </Text>
      </Section>

      <Section className="my-4 rounded-md border border-[#243856] bg-[#0A1628] p-4">
        <Text className="m-0 text-sm">
          <strong className="font-mono text-[#F59E0B]">
            {flight.tailNumber}
          </strong>{" "}
          <span className="font-mono">
            {flight.originIcao} → {flight.destIcao}
          </span>
        </Text>
        <Text className="m-0 mt-1 text-xs text-[#94A3B8]">
          ETD {new Date(flight.etdUtc).toUTCString()}
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
