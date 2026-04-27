export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: April 27, 2026</p>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Overview</h2>
        <p>
          This is a personal journaling application. Your data belongs to you. This policy explains
          what information is collected and how it is used.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Account information:</strong> When you sign in with Google, we receive your
            email address and name to identify your account.
          </li>
          <li>
            <strong>Journal entries:</strong> The text, tags, and metadata you create within the
            app.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To authenticate you and associate your data with your account.</li>
          <li>To store and display your journal entries to you.</li>
          <li>Your data is never sold or shared with third parties.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Data Storage</h2>
        <p>Your data is stored securely on encrypted servers and is accessible only to you.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Google OAuth Scopes</h2>
        <p>
          We request only the minimum Google account scopes required to sign you in (email and
          basic profile). We do not access your Google Drive, Gmail, or any other Google services.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Your Rights</h2>
        <p>
          You may delete your account and all associated data at any time by contacting{' '}
          <a href="mailto:jasonmora88j@gmail.com" className="underline">
            jasonmora88j@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Contact</h2>
        <p>
          Questions? Email{' '}
          <a href="mailto:jasonmora88j@gmail.com" className="underline">
            jasonmora88j@gmail.com
          </a>
          .
        </p>
      </section>
    </main>
  )
}
