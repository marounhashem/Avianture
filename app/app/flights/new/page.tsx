import { NewFlightForm } from "@/components/flights/new-flight-form";

export default function NewFlightPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:px-8 md:py-10">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">New flight</h1>
      <NewFlightForm />
    </div>
  );
}
