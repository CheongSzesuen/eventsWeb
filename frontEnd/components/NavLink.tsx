// frontEnd/components/NavLink.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  name: string;
  count?: number;
}

export function NavLink({ href, name, count }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  const formatName = (rawName: string) => {
    return rawName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <li>
      <Link
        href={href}
        className={`block px-3 py-2 rounded-md transition-all duration-200 ${
          isActive
            ? 'bg-blue-100 text-blue-400 font-medium shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        {formatName(name)}
        {count !== undefined && count > 0 && (
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}