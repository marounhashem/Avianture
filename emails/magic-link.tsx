import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type MagicLinkEmailProps = {
  magicUrl: string;
};

export function MagicLinkEmail({ magicUrl }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your Avianture sign-in link">
      <Heading className="m-0 mb-3 text-lg font-semibold text-[#F8FAFC]">
        Sign in to Avianture
      </Heading>
      <Text className="m-0 mb-4 text-sm text-[#CBD5E1]">
        Click the button below to sign in. This link expires in 30 minutes and can only be used once.
      </Text>

      <Section className="my-6 text-center">
        <Button
          href={magicUrl}
          className="rounded-md bg-[#F59E0B] px-5 py-3 text-sm font-medium text-[#0A1628]"
        >
          Sign in
        </Button>
      </Section>

      <Text className="m-0 text-xs text-[#94A3B8]">
        Or copy this link:{" "}
        <span className="break-all text-[#94A3B8]">{magicUrl}</span>
      </Text>
      <Text className="m-0 mt-3 text-xs text-[#94A3B8]">
        Didn&apos;t request this? You can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
