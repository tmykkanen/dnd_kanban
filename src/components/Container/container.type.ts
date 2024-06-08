import { UniqueIdentifier } from '@dnd-kit/core';
import { ReactNode } from 'react';

export default interface ContainerProps {
  id: UniqueIdentifier;
  children: ReactNode;
  title?: string;
  description?: string;
  onAddItem?: () => void;
}