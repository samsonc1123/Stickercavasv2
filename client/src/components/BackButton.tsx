import { Link } from 'wouter';

export default function BackButton() {
  return (
    <Link href="/">
      <button
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 mx-1 hover:scale-105 transition-transform"
        style={{ color: 'white' }}
        data-testid="button-back"
      >
        ←
      </button>
    </Link>
  );
}
