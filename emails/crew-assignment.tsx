import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type CrewAssignmentEmailProps = {
  crewName: string;
  crewRole: "PIC" | "SIC" | "FA";
  operatorName: string;
  flight: {
    tailNumber: string;
    originIcao: string;
    destIcao: string;
    etdUtc: Date;
  };
  scheduleUrl: string;
};

const ROLE_LABEL: Record<CrewAssignmentEmailProps["crewRole"], string> = {
  PIC: "Pilot in Command",
  SIC: "Second in Command",
  FA: "Flight Attendant",
};

export function CrewAssignmentEmail({
  crewName,
  crewRole,
  operatorName,
  flight,
  scheduleUrl,
}: CrewAssignmentEmailProps) {
  const isPic = crewRole === "PIC";
  return (
    <EmailLayout
      preview={`You're assigned ${ROLE_LABEL[crewRole]} on ${flight.tailNumber}`}
    >
      <Section>
        <Heading className="m-0 mb-4 text-2xl font-semibold text-[#F8FAFC]">
          New flight assignment
        </Heading>
        <Text className="m-0 mb-2 text-sm text-[#CBD5E1]">
          Hi {crewName.split(" ")[0]},
        </Text>
        <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
          {operatorName} has appointed you as <strong>{ROLE_LABEL[crewRole]}</strong>{" "}
          on flight <strong>{flight.tailNumber}</strong>{" "}
          ({flight.originIcao} → {flight.destIcao}), departing{" "}
          {flight.etdUtc.toUTCString().slice(5, 22)} UTC.
        </Text>

        {isPic && (
          <Section className="mb-4 rounded-md border border-[#F59E0B]/40 bg-[#F59E0B]/5 p-4">
            <Text className="m-0 text-sm text-[#FBBF24]">
              <strong>PIC privileges.</strong> Once you acknowledge this
              assignment, you&apos;ll be able to update handler service requests
              for this flight (mark services Not required, change status, add
              notes). Acknowledge from the link below.
            </Text>
          </Section>
        )}

        <Section className="text-center">
          <Button
            href={scheduleUrl}
            className="rounded-md bg-[#F59E0B] px-6 py-3 text-sm font-medium text-[#0A1628]"
          >
            Open flight & acknowledge
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}
