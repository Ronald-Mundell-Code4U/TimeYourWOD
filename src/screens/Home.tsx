import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import UpdatePopUp from '../components/UpdatePopUp';

const Home: React.FC = () => {
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
          margin: '2rem 0 3rem',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 11vw, 5.5rem)',
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
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <Button text="CLOCK" link="/clock" />
        <Button text="TABATA" link="/tabata" />
        <Button text="FOR TIME" link="/for-time" />
        <Button text="EMOM" link="/emom" />
        <Button text="AMRAP" link="/amrap" />
        <Button text="COMPLEX" link="/complex" />
      </nav>

      <div
        style={{
          marginTop: '2.5rem',
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
