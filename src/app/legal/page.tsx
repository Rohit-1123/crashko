import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Crashko",
  description: "Crashko privacy policy and terms of use.",
};

const SECTION_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
};

export default function LegalPage() {
  return (
    <div className="flex-1">
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #06d6d0, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Effective date: March 14, 2026
        </p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
          <section className="rounded-2xl p-5" style={SECTION_STYLE}>
            <h2 className="mb-2 text-base font-semibold text-white">
              Privacy: What We Collect
            </h2>
            <p>
              Crashko collects your check-in metrics: sleep hours, study hours,
              stress level, pending tasks, and deadlines within 48 hours. If you
              sign in with Google, we also receive your account identifier,
              email, name, and profile image.
            </p>
          </section>

          <section className="rounded-2xl p-5" style={SECTION_STYLE}>
            <h2 className="mb-2 text-base font-semibold text-white">
              Privacy: How We Use Data
            </h2>
            <p>
              We use your metrics to compute a burnout score and risk level. If
              you provide consent, we send your check-in context and computed
              result to our AI provider (Groq) to generate a recovery plan.
            </p>
          </section>

          <section className="rounded-2xl p-5" style={SECTION_STYLE}>
            <h2 className="mb-2 text-base font-semibold text-white">
              Privacy: Storage and Retention
            </h2>
            <p>
              Burnout logs are stored in MongoDB and linked to your account.
              Logs are configured to expire after 365 days by default. You can
              delete all burnout logs at any time from Settings.
            </p>
          </section>

          <section className="rounded-2xl p-5" style={SECTION_STYLE}>
            <h2 className="mb-2 text-base font-semibold text-white">
              Privacy: Analytics and Controls
            </h2>
            <p>
              Crashko uses Vercel Analytics and Speed Insights only if you opt
              in. You can choose analytics consent and AI processing consent,
              and you can delete logs or your full account from Settings.
            </p>
          </section>

          <section className="rounded-2xl p-5" style={SECTION_STYLE}>
            <h2 className="mb-2 text-base font-semibold text-white">
              Terms: Service Scope
            </h2>
            <p>
              Crashko provides burnout scoring and AI-generated recovery
              suggestions for educational and informational purposes. It is not
              medical advice and does not replace professional care.
            </p>
          </section>

          <section className="rounded-2xl p-5" style={SECTION_STYLE}>
            <h2 className="mb-2 text-base font-semibold text-white">
              Terms: Responsibilities and Liability
            </h2>
            <p>
              You are responsible for accurate data and account security. We aim
              for reliable service but cannot guarantee uninterrupted operation.
              To the maximum extent permitted by law, Crashko is not liable for
              indirect or consequential damages from service use.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
