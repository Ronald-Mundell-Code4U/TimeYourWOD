import React from 'react';

const KOFI_URL = 'https://ko-fi.com/code4u';

const About: React.FC = () => {
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
            marginBottom: '2rem',
          }}
        >
          ABOUT US
        </h1>

        <Section title="Why we built the TimeYourWOD web app">
          <p>
            To create a tool to help fitness enthusiasts and athletes make the most of their
            workout. As a passionate athlete and coach, I understood the importance of precise
            timing and structure during workouts. So I decided to build a solution that had
            every feature I could imagine — and the TimeYourWOD web app was born.
          </p>
        </Section>

        <Section title="Our story">
          <p>
            I was diagnosed with autism as an adult — a revelation that came after years of
            struggling to understand why certain aspects of life seemed more challenging for me.
            Growing up undiagnosed meant missing out on crucial support and resources that could
            have made a significant difference in my experiences in school and with my peers. In
            many cases, people in similar situations can get through school and manage well
            enough, but end up quite isolated and misunderstood.
          </p>
          <p>
            The process for getting diagnosed can be quite complex and is filled with obstacles,
            like finding the right specialists and navigating the high evaluation costs. This
            experience opened my eyes to the struggles many others face, especially those who,
            like me, were not diagnosed early and therefore did not receive the support they
            needed in their youth — and may not even realize they need it.
          </p>
        </Section>

        <Section title="Our mission">
          <p>
            Driven by these personal experiences, I am committed to making a positive impact
            beyond the fitness community. I recognize the importance of early diagnosis and
            support for individuals with autism, and I am dedicating a portion of any platform
            proceeds to raise awareness and support for those with autism.
          </p>
        </Section>

        <Section title="Donate">
          <p>
            I invite you to join in supporting those who face the challenges of autism. You can
            make a donation directly, or simply share the app with your friends.
          </p>
        </Section>

        <Section title="How you can help">
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: 'var(--fg)' }}>Donate directly.</strong>
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.5rem',
                border: '2px solid var(--fg)',
                borderRadius: 2,
                color: 'var(--fg)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                minHeight: 48,
              }}
            >
              Donate
            </a>
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--fg)' }}>Spread the word.</strong>
          </p>
          <p>
            Share my story and the importance of early autism diagnosis and support with your
            network.
          </p>
        </Section>

        <p style={{ color: 'var(--fg)', marginTop: '2rem' }}>
          Thank you for being a part of our journey and helping us make a difference.
        </p>
        <p style={{ marginTop: '1rem' }}>
          Warm regards,
          <br />
          Ronald Mundell
        </p>

        <Section title="Final notes">
          <p>
            If you have any useful suggestions for the timer, please email me at{' '}
            <a href="mailto:Ronald@Code4u.app" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>
              Ronald@Code4u.app
            </a>{' '}
            or reach out through{' '}
            <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>
              Ko-Fi
            </a>
            , where I post updates on planned features.
          </p>
        </Section>
      </article>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section style={{ marginBottom: '2rem' }}>
    <h2
      style={{
        margin: 0,
        marginBottom: '0.85rem',
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

export default About;
