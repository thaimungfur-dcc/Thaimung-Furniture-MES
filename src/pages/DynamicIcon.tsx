import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps extends LucideIcons.LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Convert kebab-case or snake_case to PascalCase
  const pascalName = name
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const IconComponent = (LucideIcons as any)[pascalName] || LucideIcons.HelpCircle;
  return <IconComponent {...props} />;
};
