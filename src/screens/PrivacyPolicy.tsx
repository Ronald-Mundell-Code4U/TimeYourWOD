import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'calc(72px + var(--safe-t))',
        paddingBottom: 'calc(72px + var(--safe-b))',
        paddingLeft: 'calc(1rem + var(--safe-l))',
        paddingRight: 'calc(1rem + var(--safe-r))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <article style={{ width: '100%', maxWidth: 720, lineHeight: 1.7 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(2rem, 7vw, 3.5rem)',
            letterSpacing: '-0.04em',
            fontWeight: 800,
            lineHeight: 0.95,
            marginBottom: '0.5rem',
          }}
        >
          PRIVACY POLICY
        </h1>
        <p
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--fg-dim)',
            marginBottom: '2rem',
          }}
        >
          Effective date: July 13, 2024
        </p>

        <Section title="1. Introduction">
          <p>
            Welcome to TimeYourWOD ("we", "our", "us"). We are committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit{' '}
            <a href="https://timeyourwod.code4u.app" style={linkStyle}>
              timeyourwod.code4u.app
            </a>
            , and your rights in relation to your data.
          </p>
        </Section>

        <Section title="2. Information we collect">
          <p>We collect information from you when you visit our site. This may include:</p>
          <ul style={listStyle}>
            <li>
              <strong style={strongStyle}>Cookies.</strong> We use cookies to store settings and
              preferences to improve your browsing experience. These cookies are non-confidential
              and non-personal.
            </li>
            <li>
              <strong style={strongStyle}>Google AdSense.</strong> We use Google AdSense to
              display advertisements. Google may use cookies to serve ads based on your previous
              visits to our site or other websites. For more information on how Google uses
              data, please visit the Google AdSense Privacy Policy.
            </li>
          </ul>
        </Section>

        <Section title="3. How we use your information">
          <ul style={listStyle}>
            <li>To save your settings and preferences for a better user experience.</li>
            <li>To display personalized advertisements through Google AdSense.</li>
          </ul>
        </Section>

        <Section title="4. Data sharing and disclosure">
          <p>
            We do not sell, trade, or otherwise transfer your information to outside parties
            except as described below:
          </p>
          <ul style={listStyle}>
            <li>
              <strong style={strongStyle}>Service providers.</strong> We may share your
              information with third-party service providers who perform services on our behalf.
            </li>
            <li>
              <strong style={strongStyle}>Legal requirements.</strong> We may disclose your
              information if required to do so by law or in response to valid requests by public
              authorities.
            </li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>Cookies are small data files stored on your browser or device. We use:</p>
          <ul style={listStyle}>
            <li>
              <strong style={strongStyle}>Settings cookies</strong> — store your settings and
              preferences.
            </li>
            <li>
              <strong style={strongStyle}>Advertising cookies</strong> — used by Google AdSense
              to display relevant advertisements.
            </li>
          </ul>
          <p>
            You can control and manage cookies through your browser settings. For more
            information on how to manage cookies, please visit All About Cookies.
          </p>
        </Section>

        <Section title="6. Data protection and security">
          <p>
            We implement appropriate technical and organizational measures to protect your data
            from unauthorized access, disclosure, alteration, and destruction.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>Depending on your location, you may have the following rights regarding your data:</p>
          <ul style={listStyle}>
            <li>
              <strong style={strongStyle}>Access.</strong> Request access to the information we
              hold about you.
            </li>
            <li>
              <strong style={strongStyle}>Correction.</strong> Request correction of inaccurate
              or incomplete information.
            </li>
            <li>
              <strong style={strongStyle}>Deletion.</strong> Request deletion of your data.
            </li>
            <li>
              <strong style={strongStyle}>Objection.</strong> Object to the processing of your
              data.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:Ronald@code4u.app" style={linkStyle}>
              Ronald@code4u.app
            </a>
            .
          </p>
        </Section>

        <Section title="8. International transfers">
          <p>
            Your information may be transferred to and processed in countries other than your
            own. We ensure that any data transferred outside of your country is adequately
            protected as required by applicable law.
          </p>
        </Section>

        <Section title="9. Children's privacy">
          <p>
            Our website is not intended for children under the age of 13. We do not knowingly
            collect or solicit information from anyone under the age of 13.
          </p>
        </Section>

        <Section title="10. Changes to this Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new policy on this page. Please review periodically for
            updates.
          </p>
        </Section>

        <Section title="11. Contact us">
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us:
          </p>
          <p style={{ color: 'var(--fg)' }}>
            Code4U
            <br />
            Vancouver, BC, Canada
            <br />
            <a href="mailto:Ronald@Code4u.app" style={linkStyle}>
              Ronald@Code4u.app
            </a>
          </p>
        </Section>

        <p
          style={{
            marginTop: '2.5rem',
            fontSize: '0.85rem',
            color: 'var(--fg-dim)',
            fontStyle: 'italic',
          }}
        >
          TimeYourWOD is a timer web application built to provide new and improved features to
          standard WOD timers, based on gym owner and member feedback.
        </p>
      </article>
    </div>
  );
};

const linkStyle: React.CSSProperties = {
  color: 'var(--fg)',
  textDecoration: 'underline',
};

const strongStyle: React.CSSProperties = {
  color: 'var(--fg)',
  fontWeight: 700,
};

const listStyle: React.CSSProperties = {
  paddingLeft: '1.25rem',
  marginTop: '0.5rem',
  marginBottom: '1rem',
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section style={{ marginBottom: '1.75rem' }}>
    <h2
      style={{
        margin: 0,
        marginBottom: '0.6rem',
        fontSize: '0.85rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        fontWeight: 700,
        color: 'var(--fg)',
      }}
    >
      {title}
    </h2>
    <div style={{ color: 'var(--fg-dim)', fontSize: '0.95rem' }}>{children}</div>
  </section>
);

export default PrivacyPolicy;
