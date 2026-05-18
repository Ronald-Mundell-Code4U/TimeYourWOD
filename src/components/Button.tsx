import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  text: string;
  link: string;
}

export const Button: React.FC<Props> = ({ text, link }) => {
  return (
    <Link to={link} className="btn" aria-label={text}>
      <span>{text}</span>
    </Link>
  );
};
