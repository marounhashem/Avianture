import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-[#0A1628] py-10 font-sans text-[#F8FAFC]">
          <Container className="mx-auto max-w-[560px] rounded-xl border border-[#243856] bg-[#0F1D33] p-8">
            <Section>
              <Text className="m-0 text-xl font-semibold tracking-tight text-[#F8FAFC]">
                Avianture<span className="text-[#F59E0B]">.</span>
              </Text>
            </Section>
            <Hr className="border-[#243856] my-6" />
            {children}
            <Hr className="border-[#243856] my-6" />
            <Text className="m-0 text-xs text-[#94A3B8]">
              Avianture · Private aviation operations · Sent automatically — please don&apos;t reply.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
