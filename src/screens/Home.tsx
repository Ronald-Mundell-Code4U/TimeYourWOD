import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import UpdatePopUp from '../components/UpdatePopUp';
import { useViewport } from '../hooks/useViewport';

const MODES = [
  { text: 'CLOCK', link: '/clock' },
  { text: 'TABATA', link: '/tabata' },
  { text: 'FOR TIME', link: '/for-time' },
  { text: 'EMOM', link: '/emom' },
  { text: 'AMRAP', link: '/amrap' },
  { text: 'COMPLEX', link: '/complex' },
] as const;

const Home: React.FC = () => {
  const { orientation, height } = useViewport();
  // when we'd otherwise overflow vertically — short landscape viewports — switch
  // to a 2-column wrap so all six buttons fit without scrolling. ~700px is the
  // threshold below which six stacked 56px buttons + title + footer overflow.
  const grid = orientation === 'landscape' && height < 700;

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'calc(56px + var(--safe-t))',
        paddingBottom: 'calc(56px + var(--safe-b))',
        paddingLeft: 'calc(1rem + var(--safe-l))',
        paddingRight: 'calc(1rem + var(--safe-r))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <UpdatePopUp
        storageKey="updatePopupExited_v1"
        title="STARTER BUILD"
        body={
          'Six timer modes are wired and ready.\n' +
          'Tap the cog (top-right) to set heats, overtime, theme, and beeps.\n' +
          'Tap the timer during a workout to pause — top-left hot-corner resets.'
        }
      />

      <header
        style={{
          width: '100%',
          maxWidth: 720,
          textAlign: 'center',
          margin: grid ? '1rem 0 1.5rem' : '2rem 0 3rem',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: grid
              ? 'clamp(1.8rem, 6vh, 3rem)'
              : 'clamp(2.4rem, 11vw, 5.5rem)',
            letterSpacing: '-0.035em',
            lineHeight: 0.95,
            fontWeight: 800,
          }}
        >
          TIMEYOURWOD
        </h1>
      </header>

      <nav
        aria-label="timer modes"
        style={{
          width: '100%',
          maxWidth: grid ? 720 : 420,
          display: 'grid',
          gridTemplateColumns: grid ? 'repeat(2, minmax(0, 1fr))' : '1fr',
          gap: '0.75rem',
          justifyItems: 'center',
        }}
      >
        {MODES.map((m) => (
          <Button key={m.link} text={m.text} link={m.link} />
        ))}
      </nav>

      <div
        style={{
          marginTop: grid ? '1.25rem' : '2.5rem',
          display: 'flex',
          gap: '1.5rem',
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--fg-dim)',
        }}
      >
        <Link to="/about">About</Link>
        <span aria-hidden>·</span>
        <Link to="/privacy-policy">Privacy</Link>
      </div>
    </div>
  );
};

export default Home;
